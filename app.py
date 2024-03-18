from flask import Flask, flash , make_response, render_template, request, jsonify, session, Response, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import FlaskForm
from flask_login import UserMixin, login_user, LoginManager, login_required, logout_user, current_user
from sqlalchemy import text
from dotenv import load_dotenv
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Length, ValidationError
from flask_bcrypt import Bcrypt
import os
from wtforms import SubmitField
from mira import MIRA

load_dotenv()

app = Flask(__name__, template_folder='templates')
app.secret_key = os.getenv("SECRET_KEY")  # Secret key for session management

bcrypt = Bcrypt(app)

# Set the SQLAlchemy database URI
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///C:/Users/User/.vscode/near_east_internship/instance/database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
app.app_context().push()

mira = MIRA()

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), nullable=False, unique=True)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password = db.Column(db.String(80), nullable=False)

# Create all tables
with app.app_context():
    db.create_all()



    def validate_username(self, username):
        existing_user_username = User.query.filter_by(
            username=username.data).first()
        if existing_user_username:
            raise ValidationError(
                'That username already exists. Please choose a different one.')

@app.route('/')
def index():
    if 'first_message' in session:
        first_message = session.pop('first_message')
        chat_form = {'message': first_message}
        return redirect(url_for('chat', **chat_form))
    else:
        summary_form = SummaryForm()
        questions_form = QuestionsForm()
        feedback_form = FeedbackForm()
        return render_template('index.html', summary_form=summary_form, questions_form=questions_form, feedback_form=feedback_form)


@app.route('/chat', methods=['GET', 'POST'])
def chat():
    if request.method == 'GET':
        # Render the chat.html template without waiting for a user message
        headers = {'Access-Control-Allow-Origin': 'http://127.0.0.1:5001'}
        return render_template('chat.html', response="Hi " + current_user.username + ", what can I do for you?", headers=headers)

    elif request.method == 'POST':
        input_text = request.form.get('message')
        input_method = request.form.get('input_method')

        # Handle the user's input message and generate a response using MIRA
        if input_method == 'speak':
            user_input = mira.get_user_input()
        else:
            user_input = input_text

        if not user_input:
            return make_response(jsonify(error='Missing message'), 400)
        
        response = mira.generate_response(input_text)
        headers = {'Access-Control-Allow-Origin': 'http://127.0.0.1:5001'}
        # Pass the response and headers to the chat.html template
        return render_template('chat.html', response=response, headers=headers)

@app.route('/upload', methods=['POST'])
def upload():
    # Check if a file was uploaded
    if 'file' not in request.files:
        return "No file uploaded", 400

    file = request.files['file']

    # Save the uploaded file on the server
    file_path = 'uploaded_files/' + file.filename
    file.save(file_path)

    # Process the uploaded file with MIRA to generate a summary
    summary = mira.generate_response(file_path)

    # Respond with the summary
    return summary
@app.route('/login', methods=['GET','POST'])
def login():
    # Get the submitted values from the form
    email = request.form.get('email')
    password = request.form.get('password')

    # Find the user by email
    user = User.query.filter_by(email=email).first()

    # Check if the user exists and the password is correct
    if user and bcrypt.check_password_hash(user.password, password):
        login_user(user)
        return redirect(url_for('index'))
    else:
        flash('Invalid email or password')
    return render_template('loginRegister.html')

@app.route('/new_chat', methods=['GET','POST'])
def new_chat():
    return redirect(url_for('chat'))

@app.route('/send', methods=['POST'])
def send():
    data = request.get_json()  # Get JSON data from the request
    message = data['message']  # Extract the message from the JSON data

    # Generate a response to the user's message here
    response = mira.generate_response(message)
    
    # Return the response as JSON
    return jsonify({'response': response})

@app.route('/logout', methods=['GET', 'POST'])
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    # Get the submitted values from the form
    username = request.form.get('name')
    email = request.form.get('email')
    password = request.form.get('password')

    # Check if the username already exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        flash('That username already exists. Please choose a different one.')
        return redirect(url_for('login'))

    # Check if the email already exists
    existing_email = User.query.filter_by(email=email).first()
    if existing_email:
        flash('That email address is already registered.')
        return redirect(url_for('login'))

    # Hash the password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # Create a new user instance
    new_user = User(username=username, email=email, password=hashed_password)

    # Add the new user to the database
    db.session.add(new_user)
    db.session.commit()

    flash('User registered successfully. Please log in.')

    return render_template('loginRegister.html')



class SummaryForm(FlaskForm):
    submit = SubmitField('Summarize')

class QuestionsForm(FlaskForm):
    submit = SubmitField('Generate Questions')

class FeedbackForm(FlaskForm):
    submit = SubmitField('Provide Feedback')

@app.route('/generate_summary', methods=['GET','POST'])
def generate_summary():
    # Get the text input from the request
    text = request.form.get('text')

    # Process the text and generate a summary
    summary = mira.generate_summary(text)

    # Return the summary as JSON response
    return jsonify({'summary': summary})

# Route for generating questions
@app.route('/generate_questions', methods=['GET','POST'])
def generate_questions():
    # Get the text input from the request
    text = request.form.get('text')

    # Process the text and generate questions
    questions = mira.generate_questions(text)

    # Return the questions as JSON response
    return jsonify({'questions': questions})

# Route for providing feedback
@app.route('/provide_feedback', methods=['GET','POST'])
def provide_feedback():
    # Get the feedback from the request
    feedback = request.form.get('feedback')

    # Process the feedback and provide a response
    response = mira.provide_feedback(feedback)

    # Return the response as JSON response
    return jsonify({'response': response})

@app.route('/check_db')
def check_db():
    try:
        db.session.execute(text('SELECT 1'))
        return jsonify(message='Database connected successfully'), 200
    except Exception as e:
        return jsonify(message=f'Error connecting to database: {str(e)}'), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)


