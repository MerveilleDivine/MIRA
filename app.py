from flask import Flask, make_response, render_template, request, jsonify, session, Response, redirect, url_for
import openai
from dotenv import load_dotenv
import os
import speech_recognition as sr
import pyttsx3
from threading import Thread

from mira import MIRA

load_dotenv()

app = Flask(__name__, template_folder='templates')
app.secret_key = os.getenv("SECRET_KEY")  # Secret key for session management

# Dummy user data (replace with your database)
users = {
    'user1': {
        'password': 'password',
        'name': 'mervine'
    },
    'user2': {
        'password': 'password2',
        'name': 'User 2'
    }
}

mira = MIRA()

@app.route('/')
def index():
    if 'user_id' in session:
        return render_template('index.html')
    else:
        return redirect(url_for('login'))

@app.route('/chat', methods=['POST'])
def chat():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    input_text = request.form.get('message')
    if not input_text:
        return make_response(jsonify(error='Missing message'), 400)
    response = mira.generate_response(input_text)
    headers = {'Access-Control-Allow-Origin': 'http://127.0.0.1:5001'}
    return Response(response, headers=headers, mimetype='text/plain')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        # Check if the username and password are valid
        if username in users and users[username]['password'] == password:
            # Store user ID in session to indicate they are logged in
            session['username'] = username
            return redirect(url_for('index'))
        else:
            return render_template('login.html', error='Invalid credentials')
    else:
        return render_template('login.html')

@app.route('/start_conversation', methods=['POST'])
def start_conversation():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    return redirect(url_for('chat'))

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify(success=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
