import openai
from dotenv import load_dotenv
import os
import speech_recognition as sr
import pyttsx3
from threading import Thread

load_dotenv()

class MIRA:
    def __init__(self):
        openai.api_key = os.getenv("OPEN_API_KEY")
        self.messages = []
        self.engine = pyttsx3.init()
        self.voices = self.engine.getProperty('voices')
        self.engine.setProperty('voice', self.voices[1].id)
        self.engine.setProperty('rate', 150)
        self.initial_greet = True  # Flag to indicate if initial greeting has been done

    def generate_response(self, input_text):
        self.messages.append({"role": "user", "content": input_text})
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo-1106",
            messages=self.messages,
            temperature=0,
        )
        return response.choices[0].message.content

    def speak(self, text):
        self.engine.say(text)
        self.engine.runAndWait()

    def get_user_input(self):
        recognizer = sr.Recognizer()
        with sr.Microphone() as mic:
            print("Listening...")
            try:
                audio = recognizer.listen(mic, timeout=40)
                print("Processing...")
                text = recognizer.recognize_google(audio)
                print("User input:", text)
                return text
            except sr.WaitTimeoutError:
                print("Timeout: No speech detected.")
                return ""
            except sr.UnknownValueError:
                print("Could not understand audio. Please try again.")
                return "I didn't catch that."

    def start_conversation(self):
        while True:
            user_input = self.get_user_input()
            if "MIRA" in user_input.upper():
                if self.initial_greet:
                    self.speak("Hello! How can I assist you?")
                    self.initial_greet = False  # Update flag
                else:
                    response = self.generate_response(user_input)
                    print("Response:", response)
                    self.speak(response)
                if user_input.lower() == "exit":
                    break

    def start_conversation_thread(self):
        conversation_thread = Thread(target=self.start_conversation)
        conversation_thread.daemon = True
        conversation_thread.start()

    def send_initial_instruction(self):  # Corrected indentation here
        initial_instruction = """
        Hello MIRA,

        You are now functioning as an AI-powered Exam Preparation Assistant (EPA) called MIRA for Mervine's intelligence ressource assistant. Your primary task is to assist students in optimizing their exam preparation efforts. Here's a summary of your key features:

        1. Text Summarization: Condense lengthy study materials into concise summaries, focusing on essential points and key concepts.
        2. Question Generation: Automatically generate interactive exam-style questions based on user preferences, covering various topics and difficulty levels. This includes an interactive mode where you prompt the user to select a difficulty level and also provide a specific question type (multiple choice or conventional writing-type). Generate questions based on these preferences and wait for the user's responses before proceeding to the next question. after five questions and answers, ask the user if they want to continue, if yes, add 5 more questions until the user ask to stop. keep the score of good answers and wrong ones and at the end give a feedback to the user about they strength and weakness areas.
        3. Personalized Feedback: Provide tailored feedback to students based on their performance in practice exams and quizzes. Help them identify areas of strength and weakness.

        Please note that you should only respond to queries related to the academic world and exam preparation. Refrain from engaging in unrelated topics. Thank you for your cooperation in assisting students with their educational endeavors.

        Best regards,
        Mervine, your programmer.
        """
       
        # Send initial instruction when MIRA is loaded
        mira.generate_response(initial_instruction)

# Instantiate MIRA
mira = MIRA()
