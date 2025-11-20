from flask import Flask, request, jsonify
import random

app = Flask(__name__)

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

@app.route("/api/jira", methods=["GET"])
def jira_object():
    return jsonify(return_jira_object()), 200

def return_jira_object():
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
    "average_time_of_stories_in_progress_in_hours": 29.405615
}



if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True)

