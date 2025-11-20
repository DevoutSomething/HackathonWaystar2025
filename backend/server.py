# from flask import Flask, request, jsonify
# import random

# app = Flask(__name__)

# @app.route("/")
# def home():
#     return "Route up"

# @app.route("/api/endpoint", methods=["POST"])
# def predict():
#     try:
#         neural_network_input = request.get_json()
        
#         if not neural_network_input:
#             return jsonify({"error": "No input data provided"}), 400
        
#         nn_output = generate_nn_output(neural_network_input)
        
#         return jsonify(nn_output), 200
    
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# @app.route("/api/jira", methods=["GET"])
# def jira_object():
#     return jsonify(return_jira_object()), 200

# def return_jira_object():
#     return {
#     "project_name": "Test JSON Tatum Project",
#     "total_project_members": 17,
#     "total_project_stories": 180,
#     "total_story_points": 1075,
#     "number_of_low_priority_stories": 63,
#     "number_of_medium_priority_stories": 55,
#     "number_of_high_priority_stories": 62,
#     "number_of_stories_in_progress": 36,
#     "number_of_stories_completed": 19,
#     "number_of_stories_todo": 0,
#     "number_of_stories_in_review": 0,
#     "number_of_different_teams": 3,
#     "number_of_testing_stories": 34,
#     "estimated_project_duration_in_days": 65.633579,
#     "number_of_epics": 4,
#     "average_seniority_level_per_engineer_in_years": 3.573164,
#     "average_time_of_story_completion_in_hours": 51.243507,
#     "average_time_of_stories_in_progress_in_hours": 29.405615
# }



# if __name__ == "__main__":
#     app.run(host="localhost", port=5000, debug=True)




# backend/server.py

from flask import Flask, request, jsonify
import os
import pandas as pd
import torch

from risk_engine_core import (
    RiskEngine,
    RiskEngineConfig,
    TrainingConfig,
    NUMERIC_FEATURES,
)

app = Flask(__name__)

# ================================
# 1) Train RiskEngine at startup
# ================================

engine_config = RiskEngineConfig(
    hidden_dims=[128, 64],
    dropout_p=0.2,
    batch_size=128,
    val_size=0.2,
    training=TrainingConfig(
        n_epochs=40,
        lr=5e-4,
        weight_decay=1e-4,
        device="cuda" if torch.cuda.is_available() else "cpu",
        print_every=5,
    ),
    n_mc_samples=500,
)

engine = RiskEngine(config=engine_config)

print("[Flask] Loading data and training RiskEngine...")

# Load CSV relative to this file
DATA_PATH = os.path.join(os.path.dirname(__file__), "jira_synthetic_projects.csv")
df = pd.read_csv(DATA_PATH)

engine.fit(df)
print("[Flask] RiskEngine ready.")


# ================================
# 2) Helper: map frontend JSON → model row
# ================================

def prepare_feature_row(json_data: dict) -> dict:
    """
    Take raw JSON from the frontend and produce a dict with exactly the
    NUMERIC_FEATURES the RiskEngine expects. Computes missing derived
    features and fixes units where needed.
    """
    data = dict(json_data)  # shallow copy

    # ---- Fix units / naming ----
    # Convert years -> days if only 'years' is provided
    if "average_seniority_level_per_engineer_in_days" not in data:
        if "average_seniority_level_per_engineer_in_years" in data:
            years = data.pop("average_seniority_level_per_engineer_in_years")
            data["average_seniority_level_per_engineer_in_days"] = float(years) * 365.0
        else:
            # default if totally missing
            data["average_seniority_level_per_engineer_in_days"] = 3.0 * 365.0

    # ---- Derived features if missing ----
    # average_members_per_team
    if "average_members_per_team" not in data:
        total_members = data["total_project_members"]
        num_teams = max(data.get("number_of_different_teams", 1), 1)
        data["average_members_per_team"] = total_members / num_teams

    # average_story_points
    if "average_story_points" not in data:
        data["average_story_points"] = (
            data["total_story_points"] / max(data["total_project_stories"], 1)
        )

    # average_story_points_per_epic
    if "average_story_points_per_epic" not in data:
        data["average_story_points_per_epic"] = (
            data["total_story_points"] / max(data["number_of_epics"], 1)
        )

    # average_story_points_per_engineer
    if "average_story_points_per_engineer" not in data:
        data["average_story_points_per_engineer"] = (
            data["total_story_points"] / max(data["total_project_members"], 1)
        )

    # Keep only the features the model knows about, in the right order
    row = {name: data[name] for name in NUMERIC_FEATURES}
    return row


def generate_nn_output(neural_network_input: dict) -> dict:
    """
    Wraps RiskEngine.predict_row() to return a clean JSON for the frontend.
    """
    row_dict = prepare_feature_row(neural_network_input)
    row_df = pd.DataFrame([row_dict])

    result = engine.predict_row(row_df.iloc[0])

    return {
        "mean_prob": result["mean_prob"],
        "std": result["std"],
        "ci_5": result["ci_5"],
        "ci_95": result["ci_95"],
        "risk_category": result["risk_category"],
        # Uncomment if your frontend wants the raw MC samples:
        # "samples": result["all_samples"].tolist(),
    }


# ================================
# 3) Routes
# ================================

@app.route("/")
def home():
    print("working")
    return "Route up"


@app.route("/api/endpoint", methods=["POST"])
def predict():
    """
    Main endpoint the frontend will call with project features.
    """
    try:
        neural_network_input = request.get_json()

        if not neural_network_input:
            return jsonify({"error": "No input data provided"}), 400

        nn_output = generate_nn_output(neural_network_input)
        return jsonify(nn_output), 200

    except Exception as e:
        # In production you'd log this instead of exposing the error string
        return jsonify({"error": str(e)}), 500


@app.route("/api/jira", methods=["GET"])
def jira_object():
    """
    Example payload the frontend can use as a template for the input form.
    """
    return jsonify(return_jira_object()), 200


def return_jira_object():
    # NOTE: we keep the 'years' field for humans; backend converts to days.
    return {
        "project_name": "Test JSON Tatum Project",
        "total_project_members": 17,
        "total_project_stories": 180,
        "total_story_points": 1075,
        "number_of_low_priority_stories": 63,
        "number_of_medium_priority_stories": 55,
        "number_of_high_priority_stories": 62,
        "number_of_stories_in_progress": 36,
        "number_of_stories_completed": 19,
        "number_of_stories_todo": 0,
        "number_of_stories_in_review": 0,
        "number_of_different_teams": 3,
        "number_of_testing_stories": 34,
        "estimated_project_duration_in_days": 65.633579,
        "number_of_epics": 4,
        "average_seniority_level_per_engineer_in_years": 3.573164,
        "average_time_of_story_completion_in_hours": 51.243507,
        "average_time_of_stories_in_progress_in_hours": 29.405615,
    }


if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True)
