from flask import Flask, jsonify
from flask_cors import CORS
from mock_data import mock_conversations

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})


@app.route("/api/messages", methods=["GET"])
def get_messages():
    try:
        return jsonify(mock_conversations)
    except Exception as e:
        print(f"Error in get_messages: {str(e)}")  # Debug print
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=3001, debug=True)
