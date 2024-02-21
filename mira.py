import tkinter as tk
from threading import Thread
import speech_recognition as sr
import pyttsx3
from app import getApIresponse  # Importing the function from your main application

# Initialize the text-to-speech engine
engine = pyttsx3.init()

# Get a list of available voices
voices = engine.getProperty('voices')

# Set the desired voice (you can choose a voice from the list)
# For example, setting the voice to the first one in the list:
engine.setProperty('voice', voices[1].id)

# Set properties (optional)
engine.setProperty('rate', 150)  # Speed of speech

# Function to speak text
def speak(text):
    engine.say(text)
    engine.runAndWait()

# Function to get user input either through speech or text
def get_user_input():
    recognizer = sr.Recognizer()
    with sr.Microphone() as mic:
        print("Listening...")
        try:
            audio = recognizer.listen(mic, timeout=40)  # Listen for audio input with a timeout of 5 seconds
            print("Processing...")
            text = recognizer.recognize_google(audio)  # Recognize speech using Google Speech Recognition
            print("User input:", text)  # Print the recognized text
            return text
        except sr.WaitTimeoutError:
            print("Timeout: No speech detected.")
            return ""
        except sr.UnknownValueError:
            print("Could not understand audio. Please try again.")
            return "I didn't catch that."

# Function to start conversation
def start_conversation():
    speak("Hello! How can I assist you?")  # Greet the user
    while True:
        user_input = get_user_input()
        chat_window.insert('end', '[You]: ' + user_input + '\n')  # Insert user input to chat window
        if user_input == "I didn't catch that.":
            continue
        response = getApIresponse(user_input)
        print("Response:", response)  # Debugging: Print the response
        chat_window.insert('end', '[MIRA]: ' + response + '\n')  # Insert MIRA's response to chat window
        chat_window.yview(tk.END)  # Scroll to the end of the chat window
        speak(response)  # Speak the response to the user
        if user_input.lower() == "exit":
            break  # Exit the conversation loop if user says "exit"

# Function to start conversation in a separate thread
def start_conversation_thread():
    conversation_thread = Thread(target=start_conversation)
    conversation_thread.daemon = True
    conversation_thread.start()

# Function to handle sending user input
def send_user_input(event=None):
    user_input = input_entry.get()
    chat_window.insert('end', '[You]: ' + user_input + '\n')  # Insert user input to chat window
    response = getApIresponse(user_input)
    chat_window.insert('end', '[MIRA]: ' + response + '\n')  # Insert MIRA's response to chat window
    chat_window.yview(tk.END)  # Scroll to the end of the chat window
    speak(response)  # Speak the response to the user
    input_entry.delete(0, tk.END)  # Clear the input field after sending the message

# Function to handle speech input
def handle_speech_input():
    while True:
        user_input = get_user_input()
        if "MIRA" in user_input.upper():
            speak("How can I assist you?")
            start_conversation()
            break

# Create the main window
root = tk.Tk()
root.title("MIRA - Mervine's Intelligent Resource Assistant")
root.configure(bg='black')  # Set background color to black

# Create and configure the start conversation button
start_button = tk.Button(root, text="Start Conversation", command=start_conversation_thread, bg='gray', fg='white')
start_button.pack(side='top', padx=5, pady=5)

# Create the chat window
chat_window = tk.Text(root, width=50, height=20, bg='black', fg='white')
chat_window.pack(side='top', padx=5, pady=5)

# Create the input entry field
input_entry = tk.Entry(root, width=40, bg='black', fg='white')
input_entry.pack(side='left', padx=5, pady=5)

# Bind the Enter key to the send_user_input function
input_entry.bind('<Return>', send_user_input)

# Create and configure the send button
send_button = tk.Button(root, text="Send", command=send_user_input, bg='blue', fg='white')
send_button.pack(side='left', padx=5, pady=5)

# Start listening for the keyword "MIRA" in a separate thread
speech_thread = Thread(target=handle_speech_input)
speech_thread.daemon = True
speech_thread.start()

# Call the getApIresponse function with the instruction text for MIRA
initial_instruction = """
Hello MIRA,

You are now functioning as an AI-powered Exam Preparation Assistant (EPA) called MIRA for Mervine's intelligence ressource assistant. Your primary task is to assist students in optimizing their exam preparation efforts. Here's a summary of your key features:

1. Text Summarization: Condense lengthy study materials into concise summaries, focusing on essential points and key concepts.
2. Question Generation: Automatically generate interactive exam-style questions based on user preferences, covering various topics and difficulty levels. This includes an interactive mode where you prompt the user to select a difficulty level and also provide a specific question type (multiple choice or conventional writing-type). Generate questions based on these preferences and wait for the user's responses before proceeding to the next question. after five questions and answers, ask the user if they want to continue, if yes, add 5 more questions until the user ask to stop. keep the score of good answers and wrong ones and at the end give a feedback to the user about they strength and weakness areas.
3. Personalized Feedback: Provide tailored feedback to students based on their performance in practice exams and quizzes. Help them identify areas of strength and weakness.

Please note that you should only respond to queries related to the academic world and exam preparation. Refrain from engaging in unrelated topics. You don't have to say hello everytime you say something, one time at the beginning of the conversation is enough. please, act as natural as possible (human). Thank you for your cooperation in assisting students with their educational endeavors.

Best regards,
Mervine, your programmer.
"""

getApIresponse(initial_instruction)  # Sending the instruction text to MIRA

# Run the application
root.mainloop()

