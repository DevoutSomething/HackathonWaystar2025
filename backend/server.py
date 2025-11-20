from flask import Flask, request, jsonify
import random

app = Flask(__name__)

def generate_nn_output(neural_network_input):
    """
    Generate sample NNOutput data based on the neural network input.
    This is a placeholder function that returns sample data.
    """
    # Generate sample probabilities
    mean_prob = random.uniform(0.5, 0.95)
    std_dev = random.uniform(0.05, 0.15)
    ci_5 = max(0.0, mean_prob - 1.645 * std_dev)
    ci_95 = min(1.0, mean_prob + 1.645 * std_dev)
    
    # Generate sample data array (could be based on input parameters)
    num_samples = 100
    all_samples = [random.gauss(mean_prob, std_dev) for _ in range(num_samples)]
    all_samples = [max(0.0, min(1.0, s)) for s in all_samples]  # Clamp between 0 and 1
    
    return {
        "mean_probability": round(mean_prob, 4),
        "standard_deviation_of_probability": round(std_dev, 4),
        "ci_5": round(ci_5, 4),
        "ci_95": round(ci_95, 4),
        "all_samples": all_samples
    }

@app.route("/")
def home():
    return "Route up"

@app.route("/api/endpoint", methods=["POST"])
def predict():
    try:
        neural_network_input = request.get_json()
        
        if not neural_network_input:
            return jsonify({"error": "No input data provided"}), 400
        
        nn_output = generate_nn_output(neural_network_input)
        
        return jsonify(nn_output), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True)