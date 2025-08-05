from flask import Flask, request, jsonify
from groq import Groq
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

@app.route('/')
def home():
    return "Welcome to the Personalized Learning Path Recommender API!"

@app.route('/recommend', methods=['POST'])
def recommend_learning_path():
    data = request.json
    student_background = data.get('background')
    current_skills = data.get('skills')
    career_aspirations = data.get('career_aspirations')

    if not all([student_background, current_skills, career_aspirations]):
        return jsonify({"error": "Missing required fields: background, skills, career_aspirations"}), 400

    prompt = f"""
    As an AI-powered educational platform, recommend a personalized learning path for a student with the following profile:
    Background: {student_background}
    Current Skills: {current_skills}
    Career Aspirations: {career_aspirations}

    Please suggest specific courses, learning materials, and skill development priorities. Structure your response clearly with sections for 'Courses', 'Learning Materials', and 'Skill Development Priorities'.
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama3-8b-8192", # You can choose a different model if needed
        )
        recommendation = chat_completion.choices[0].message.content
        return jsonify({"recommendation": recommendation})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)