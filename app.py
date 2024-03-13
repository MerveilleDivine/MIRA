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
    password = db.Column(db.String(80), nullable=False)

# Create all tables
with app.app_context():
    db.create_all()

class RegisterForm(FlaskForm):
    username = StringField(validators=[
                           InputRequired(), Length(min=4, max=20)], render_kw={"placeholder": "Username"})
    password = PasswordField(validators=[
                             InputRequired(), Length(min=8, max=20)], render_kw={"placeholder": "Password"})
    submit = SubmitField('Register')

    def validate_username(self, username):
        existing_user_username = User.query.filter_by(
            username=username.data).first()
        if existing_user_username:
            raise ValidationError(
                'That username already exists. Please choose a different one.')

class LoginForm(FlaskForm):
    username = StringField(validators=[InputRequired(), Length(min=4, max=20)], render_kw={"placeholder": "Username"})
    password = PasswordField(validators=[InputRequired(), Length(min=8, max=20)], render_kw={"placeholder": "Password"})
    submit = SubmitField('Login')

@app.route('/')
def index():
    if 'first_message' in session:
        first_message = session.pop('first_message')
        chat_form = {'message': first_message}
        return redirect(url_for('chat', **chat_form))
    else:
        return render_template('index.html')


@app.route('/chat', methods=['POST'])
def chat():
    input_text = request.form.get('message')
    if not input_text:
        return make_response(jsonify(error='Missing message'), 400)
    if 'first_message' in session:
        session.pop('first_message')
        response = mira.generate_response(input_text)
    else:
        session['first_message'] = input_text
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
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user:
            if bcrypt.check_password_hash(user.password, form.password.data):
                login_user(user)
                return redirect(url_for('index'))
        else:
            flash('Invalid username or password')
    return render_template('login.html', form=form)

@app.route('/start_conversation', methods=['POST'])
def start_conversation():
    return redirect(url_for('chat'))

@app.route('/send', methods=['POST'])
def send():
    message = request.form['message']
    # Generate a response to the user's message here
    response = mira.generate_response(message)
    return response

@app.route('/logout', methods=['GET', 'POST'])
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()

    if form.validate_on_submit():
        hashed_password = bcrypt.generate_password_hash(form.password.data)
        new_user = User(username=form.username.data, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        # Check if the user was successfully added to the database
        if User.query.filter_by(username=form.username.data).first():
            flash('User registered successfully. Please log in.')
            return redirect(url_for('login'))
        else:
            flash('Failed to register user.')

    return render_template('register.html', form=form)

@app.route('/check_db')
def check_db():
    try:
        db.session.execute(text('SELECT 1'))
        return jsonify(message='Database connected successfully'), 200
    except Exception as e:
        return jsonify(message=f'Error connecting to database: {str(e)}'), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)


