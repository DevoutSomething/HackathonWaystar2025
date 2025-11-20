# risk_engine_core.py

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional, Any

import numpy as np
import pandas as pd
import torch
from torch import nn
from torch.utils.data import Dataset, DataLoader

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.metrics import roc_auc_score, confusion_matrix, classification_report

import matplotlib.pyplot as plt


# ============================================================
# Data schema
# ============================================================

NUMERIC_FEATURES: List[str] = [
    "total_project_members",
    "average_members_per_team",
    "total_project_stories",
    "total_story_points",
    "average_story_points",
    "number_of_low_priority_stories",
    "number_of_medium_priority_stories",
    "number_of_high_priority_stories",
    "number_of_stories_in_progress",
    "number_of_stories_completed",
    "number_of_stories_todo",
    "number_of_stories_in_review",
    "number_of_different_teams",
    "number_of_testing_stories",
    "estimated_project_duration_in_days",
    "number_of_epics",
    "average_story_points_per_epic",
    "average_story_points_per_engineer",
    "average_seniority_level_per_engineer_in_days",
    "average_time_of_story_completion_in_hours",
    "average_time_of_stories_in_progress_in_hours",
]

CATEGORICAL_FEATURES: List[str] = []  # none in the synthetic data right now
LABEL_COL: str = "is_delayed"

ALL_FEATURES: List[str] = NUMERIC_FEATURES


def validate_schema(df: pd.DataFrame) -> None:
    """
    Validate that the incoming DataFrame has the expected columns.
    """
    missing = [col for col in ALL_FEATURES + [LABEL_COL] if col not in df.columns]
    if missing:
        raise ValueError(f"DataFrame is missing required columns: {missing}")


# ============================================================
# Preprocessing
# ============================================================

class JiraPreprocessor:
    """
    Handles preprocessing of raw JIRA-like data:
      - imputes missing values
      - scales numeric features
      - one-hot encodes categorical features

    Produces a dense numpy feature matrix suitable for feeding into PyTorch.
    """

    def __init__(
        self,
        numeric_features: List[str],
        categorical_features: List[str],
        label_col: str,
    ) -> None:
        self.numeric_features = numeric_features
        self.categorical_features = categorical_features
        self.label_col = label_col

        numeric_transformer = Pipeline(
            steps=[
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler()),
            ]
        )

        categorical_transformer = Pipeline(
            steps=[
                ("imputer", SimpleImputer(strategy="most_frequent")),
                ("onehot", OneHotEncoder(handle_unknown="ignore")),
            ]
        )

        self.column_transformer: ColumnTransformer = ColumnTransformer(
            transformers=[
                ("num", numeric_transformer, self.numeric_features),
                ("cat", categorical_transformer, self.categorical_features),
            ]
        )
        self._fitted: bool = False

    def fit(self, df: pd.DataFrame) -> "JiraPreprocessor":
        X = df[self.numeric_features + self.categorical_features]
        self.column_transformer.fit(X)
        self._fitted = True
        return self

    def transform(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Transform the DataFrame into (X, y).
        """
        if not self._fitted:
            raise RuntimeError("JiraPreprocessor must be fitted before calling transform().")

        X_raw = df[self.numeric_features + self.categorical_features]
        X = self.column_transformer.transform(X_raw)
        if not isinstance(X, np.ndarray):
            X = X.toarray()

        y = df[self.label_col].astype(float).to_numpy()
        return X, y

    def fit_transform(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        return self.fit(df).transform(df)


# ============================================================
# Dataset + DataLoaders
# ============================================================

class RiskDataset(Dataset):
    """
    Simple PyTorch Dataset wrapper for supervised binary classification.
    """

    def __init__(self, X: np.ndarray, y: np.ndarray) -> None:
        assert len(X) == len(y), "X and y must have the same number of samples."
        self.X = torch.tensor(X, dtype=torch.float32)
        self.y = torch.tensor(y, dtype=torch.float32).view(-1, 1)

    def __len__(self) -> int:
        return self.X.shape[0]

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
        return self.X[idx], self.y[idx]


def build_dataloaders(
    X: np.ndarray,
    y: np.ndarray,
    batch_size: int = 64,
    val_size: float = 0.2,
    random_state: int = 42,
) -> Tuple[DataLoader, DataLoader]:
    """
    Split data into train/val and return DataLoaders.
    """
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=val_size, random_state=random_state, stratify=y
    )

    train_dataset = RiskDataset(X_train, y_train)
    val_dataset = RiskDataset(X_val, y_val)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

    return train_loader, val_loader


# ============================================================
# Bayesian-style MLP with Dropout
# ============================================================

class BayesianDropoutMLP(nn.Module):
    """
    Feedforward neural network with Dropout layers, usable as a
    Bayesian approximation via Monte Carlo dropout.
    """

    def __init__(
        self,
        input_dim: int,
        hidden_dims: List[int] = None,
        dropout_p: float = 0.2,
    ) -> None:
        super().__init__()
        if hidden_dims is None:
            hidden_dims = [64, 64]

        layers: List[nn.Module] = []
        prev_dim = input_dim

        for h in hidden_dims:
            layers.append(nn.Linear(prev_dim, h))
            layers.append(nn.ReLU())
            layers.append(nn.Dropout(p=dropout_p))
            prev_dim = h

        self.feature_extractor = nn.Sequential(*layers)
        self.output_layer = nn.Linear(prev_dim, 1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        h = self.feature_extractor(x)
        logits = self.output_layer(h)
        return logits


# ============================================================
# Training utilities
# ============================================================

@dataclass
class TrainingConfig:
    n_epochs: int = 50
    lr: float = 1e-3
    weight_decay: float = 1e-4
    device: str = "cuda" if torch.cuda.is_available() else "cpu"
    print_every: int = 5


def train_one_epoch(
    model: nn.Module,
    dataloader: DataLoader,
    optimizer: torch.optim.Optimizer,
    criterion: nn.Module,
    device: str,
) -> float:
    model.train()
    running_loss = 0.0
    n_batches = 0

    for X_batch, y_batch in dataloader:
        X_batch = X_batch.to(device)
        y_batch = y_batch.to(device)

        optimizer.zero_grad()
        logits = model(X_batch)
        loss = criterion(logits, y_batch)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()
        n_batches += 1

    return running_loss / max(n_batches, 1)


def evaluate(
    model: nn.Module,
    dataloader: DataLoader,
    criterion: nn.Module,
    device: str,
) -> Tuple[float, float]:
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    n_batches = 0

    with torch.no_grad():
        for X_batch, y_batch in dataloader:
            X_batch = X_batch.to(device)
            y_batch = y_batch.to(device)

            logits = model(X_batch)
            loss = criterion(logits, y_batch)
            probs = torch.sigmoid(logits)
            preds = (probs >= 0.5).float()

            running_loss += loss.item()
            n_batches += 1

            correct += (preds == y_batch).sum().item()
            total += y_batch.numel()

    avg_loss = running_loss / max(n_batches, 1)
    accuracy = correct / max(total, 1)
    return avg_loss, accuracy


def train_model(
    model: nn.Module,
    train_loader: DataLoader,
    val_loader: DataLoader,
    config: TrainingConfig,
) -> Dict[str, List[float]]:
    """
    Full training loop with validation tracking.
    """
    device = config.device
    model.to(device)

    criterion = nn.BCEWithLogitsLoss()
    optimizer = torch.optim.Adam(
        model.parameters(), lr=config.lr, weight_decay=config.weight_decay
    )

    history = {
        "train_loss": [],
        "val_loss": [],
        "val_acc": [],
    }

    for epoch in range(1, config.n_epochs + 1):
        train_loss = train_one_epoch(model, train_loader, optimizer, criterion, device)
        val_loss, val_acc = evaluate(model, val_loader, criterion, device)

        history["train_loss"].append(train_loss)
        history["val_loss"].append(val_loss)
        history["val_acc"].append(val_acc)

        if epoch % config.print_every == 0 or epoch == 1 or epoch == config.n_epochs:
            print(
                f"Epoch {epoch:03d} | "
                f"Train Loss: {train_loss:.4f} | "
                f"Val Loss: {val_loss:.4f} | "
                f"Val Acc: {val_acc:.4f}"
            )

    return history


# ============================================================
# Monte Carlo Dropout prediction
# ============================================================

def mc_predict_proba(
    model: nn.Module,
    x: np.ndarray,
    n_samples: int = 1000,
    device: str = "cuda" if torch.cuda.is_available() else "cpu",
) -> Dict[str, Any]:
    """
    Monte Carlo dropout prediction for a single example.
    """
    model.to(device)

    if x.ndim == 1:
        x = x.reshape(1, -1)

    x_tensor = torch.tensor(x, dtype=torch.float32).to(device)

    model.train()  # keep dropout active
    probs_list = []

    with torch.no_grad():
        for _ in range(n_samples):
            logits = model(x_tensor)
            prob = torch.sigmoid(logits).cpu().numpy().flatten()[0]
            probs_list.append(prob)

    probs = np.array(probs_list)
    mean = float(probs.mean())
    std = float(probs.std())
    ci_5 = float(np.percentile(probs, 5))
    ci_95 = float(np.percentile(probs, 95))

    return {
        "probs": probs,
        "mean": mean,
        "std": std,
        "ci_5": ci_5,
        "ci_95": ci_95,
    }


def categorize_risk(mean_prob: float) -> str:
    """
    Map the mean probability to a discrete risk category.
    """
    if mean_prob < 0.33:
        return "Low"
    elif mean_prob < 0.66:
        return "Medium"
    else:
        return "High"


# ============================================================
# RiskEngine wrapper
# ============================================================

@dataclass
class RiskEngineConfig:
    hidden_dims: List[int] = field(default_factory=lambda: [64, 64])
    dropout_p: float = 0.2
    batch_size: int = 64
    val_size: float = 0.2
    training: TrainingConfig = field(default_factory=TrainingConfig)
    n_mc_samples: int = 1000


class RiskEngine:
    """
    End-to-end risk engine:
      - preprocesses JIRA-like data
      - trains BayesianDropoutMLP
      - provides MC dropout-based predictions with uncertainty
    """

    def __init__(self, config: Optional[RiskEngineConfig] = None) -> None:
        self.config = config or RiskEngineConfig()
        self.preprocessor = JiraPreprocessor(
            numeric_features=NUMERIC_FEATURES,
            categorical_features=CATEGORICAL_FEATURES,
            label_col=LABEL_COL,
        )
        self.model: Optional[BayesianDropoutMLP] = None

    # -----------------------------
    # Training
    # -----------------------------
    def fit(self, df: pd.DataFrame) -> Dict[str, List[float]]:
        """
        Fit the engine on a labeled DataFrame.
        """
        print("=== [RiskEngine.fit] Starting training ===")
        print(f"[RiskEngine.fit] Incoming df shape: {df.shape}")
        print(f"[RiskEngine.fit] Columns: {list(df.columns)}")

        validate_schema(df)
        pos_rate = df[LABEL_COL].mean()
        print(f"[RiskEngine.fit] Positive rate ({LABEL_COL}==1): {pos_rate:.3f}")

        X, y = self.preprocessor.fit_transform(df)
        print(f"[RiskEngine.fit] Transformed X shape: {X.shape}, y shape: {y.shape}")

        train_loader, val_loader = build_dataloaders(
            X,
            y,
            batch_size=self.config.batch_size,
            val_size=self.config.val_size,
        )

        print(
            "[RiskEngine.fit] "
            f"Train batches: {len(train_loader)}, "
            f"Val batches: {len(val_loader)}"
        )

        input_dim = X.shape[1]
        print(f"[RiskEngine.fit] Input dimension after encoding: {input_dim}")

        self.model = BayesianDropoutMLP(
            input_dim=input_dim,
            hidden_dims=list(self.config.hidden_dims),
            dropout_p=self.config.dropout_p,
        )

        history = train_model(
            model=self.model,
            train_loader=train_loader,
            val_loader=val_loader,
            config=self.config.training,
        )

        print("=== [RiskEngine.fit] Training complete ===")
        return history

    # -----------------------------
    # Prediction helpers
    # -----------------------------
    def _check_model_ready(self) -> None:
        if self.model is None:
            raise RuntimeError("RiskEngine model is not trained yet. Call fit() first.")

    def predict_row(self, row: pd.Series) -> Dict[str, Any]:
        """
        Run the full MC dropout prediction for a single row (pd.Series).
        """
        self._check_model_ready()

        df_row = row.to_frame().T

        if LABEL_COL not in df_row.columns:
            df_row[LABEL_COL] = 0  # dummy label

        X_row, _ = self.preprocessor.transform(df_row)
        mc_result = mc_predict_proba(
            model=self.model,
            x=X_row[0],
            n_samples=self.config.n_mc_samples,
            device=self.config.training.device,
        )

        risk_category = categorize_risk(mc_result["mean"])

        return {
            "mean_prob": mc_result["mean"],
            "std": mc_result["std"],
            "ci_5": mc_result["ci_5"],
            "ci_95": mc_result["ci_95"],
            "risk_category": risk_category,
            "all_samples": mc_result["probs"],
        }

    def predict_dataframe(self, df_new: pd.DataFrame) -> pd.DataFrame:
        """
        Run MC predictions for every row in a new DataFrame.
        """
        self._check_model_ready()

        df_work = df_new.copy()
        if LABEL_COL not in df_work.columns:
            df_work[LABEL_COL] = 0

        X_all, _ = self.preprocessor.transform(df_work)

        records = []
        for i in range(len(df_work)):
            mc_result = mc_predict_proba(
                model=self.model,
                x=X_all[i],
                n_samples=self.config.n_mc_samples,
                device=self.config.training.device,
            )
            records.append(
                {
                    "pred_mean_prob": mc_result["mean"],
                    "pred_std": mc_result["std"],
                    "pred_ci_5": mc_result["ci_5"],
                    "pred_ci_95": mc_result["ci_95"],
                    "pred_risk_category": categorize_risk(mc_result["mean"]),
                }
            )

        preds_df = pd.DataFrame.from_records(records, index=df_work.index)
        return pd.concat(
            [df_new.reset_index(drop=True), preds_df.reset_index(drop=True)], axis=1
        )


# ============================================================
# Diagnostics / plotting (for notebooks & dev, not used by Flask)
# ============================================================

def describe_dataset(df: pd.DataFrame) -> None:
    """
    Print basic diagnostics about the dataset.
    """
    print("=== Dataset Overview ===")
    print(f"Shape: {df.shape}")
    print("\nDtypes:")
    print(df.dtypes)
    if LABEL_COL in df.columns:
        print(f"\nLabel column: {LABEL_COL}")
        print(df[LABEL_COL].value_counts(normalize=True).rename("proportion"))
    print("\nHead:")
    print(df.head())


def evaluate_engine_on_full_df(engine: RiskEngine, df: pd.DataFrame) -> Dict[str, float]:
    """
    Evaluate a trained engine on a labeled DataFrame (full set).
    """
    engine._check_model_ready()

    X, y = engine.preprocessor.transform(df)
    y_true = y.astype(int)

    device = engine.config.training.device
    model = engine.model.to(device)
    model.eval()

    with torch.no_grad():
        X_t = torch.tensor(X, dtype=torch.float32).to(device)
        logits = model(X_t)
        probs = torch.sigmoid(logits).cpu().numpy().flatten()

    preds = (probs >= 0.5).astype(int)

    acc = float((preds == y_true).mean())
    try:
        auc = float(roc_auc_score(y_true, probs))
    except ValueError:
        auc = float("nan")

    print("=== Evaluation on Full Dataset ===")
    print(f"Accuracy: {acc:.3f}")
    print(f"ROC AUC : {auc:.3f}")
    print("\nConfusion matrix:")
    print(confusion_matrix(y_true, preds))
    print("\nClassification report:")
    print(classification_report(y_true, preds, digits=3))

    return {"accuracy": acc, "auc": auc}


def plot_training_history(history: Dict[str, List[float]]) -> None:
    """
    Plot training/validation loss and validation accuracy over epochs.
    """
    epochs = range(1, len(history["train_loss"]) + 1)

    plt.figure(figsize=(10, 4))

    plt.subplot(1, 2, 1)
    plt.plot(epochs, history["train_loss"], label="Train loss")
    plt.plot(epochs, history["val_loss"], label="Val loss")
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.title("Training vs Validation Loss")
    plt.legend()

    plt.subplot(1, 2, 2)
    plt.plot(epochs, history["val_acc"], label="Val accuracy")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy")
    plt.title("Validation Accuracy")
    plt.legend()

    plt.tight_layout()
    plt.show()


def plot_mc_distribution(result: Dict[str, Any]) -> None:
    """
    Visualize the Monte Carlo probability distribution for a single prediction.
    """
    probs = result["all_samples"]

    plt.figure(figsize=(6, 4))
    plt.hist(probs, bins=30, density=True)
    plt.axvline(result["mean_prob"], linestyle="--", label=f"mean={result['mean_prob']:.2f}")
    plt.axvline(result["ci_5"], linestyle=":", label=f"5%={result['ci_5']:.2f}")
    plt.axvline(result["ci_95"], linestyle=":", label=f"95%={result['ci_95']:.2f}")
    plt.xlabel("Predicted probability")
    plt.ylabel("Density")
    plt.title(f"MC Dropout Distribution (risk={result['risk_category']})")
    plt.legend()
    plt.show()
