from flask import Flask, render_template, request, jsonify, session, Response
import openai
from dotenv import load_dotenv
import speech_recognition as sr
from mira import MIRA
import os

load_dotenv()
mira = MIRA()

messages = []

user_profiles = {}
app = Flask(__name__, template_folder='templates')
app.secret_key = os.getenv("SECRET_KEY")  # Secret key for session management
openai.api_key = os.getenv("OPEN_API_KEY")

def getApIresponse(input_text):
    openai.api_key = os.getenv("OPEN_API_KEY")
    messages.append({"role": "user", "content": input_text})
    response =openai.chat.completions.create(
        model="gpt-3.5-turbo-1106",
        messages=messages,
        temperature=0,
    )
    return response.choices[0].message.content

class Chatbot:
    def generate_response(self, input_text):
        try:
            response = openai.Completion.create(
                engine="davinci",
                prompt=input_text,
                max_tokens=50
            )
            return response.choices[0].text.strip()
        except Exception as e:
            return f"Error: {str(e)}"

    def process_user_input(self, input_text, user_id):
        # You can implement any processing logic here if needed
        pass


@app.route('/')
def index():
    return render_template('index.html')


# Error Handling
@app.errorhandler(500)
def internal_server_error(e):
    return jsonify(error="Internal Server Error miraaa"), 500


# User Authentication
@app.route('/login', methods=['POST'])
def login():
    user_id = request.form.get('user_id')
    # Perform user authentication here (e.g., check credentials against a database)
    # For simplicity, we're just setting the user_id in the session
    session['user_id'] = user_id
    return jsonify(success=True)


# Logout Route
@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify(success=True)


# Chatbot Route
@app.route('/chatbot', methods=['POST'])
def chat():
    input_text = request.form['message']
    user_id = session.get('user_id')

    # Pass the user input to the chatbot to generate a response
    response = mira.generate_response(input_text)

    # Set the Access-Control-Allow-Origin header
    headers = {'Access-Control-Allow-Origin': 'http://127.0.0.1:5001'}

    # Return the response with the headers
    return Response(response=jsonify(output=response), headers=headers)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
