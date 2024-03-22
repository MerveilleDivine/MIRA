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
        self.context = None 
        self.engine = pyttsx3.init()
        self.voices = self.engine.getProperty('voices')
        self.engine.setProperty('voice', self.voices[2].id)
        self.engine.setProperty('rate', 150)
        self.initial_greet = True  # Flag to indicate if initial greeting has been done

    def generate_response(self, input_text):
        self.add_message({"role": "user", "content": input_text})
        response = self.generate_response_with_context()
        return response.choices[0].message.content

    def generate_response_with_context(self):
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo-1106",
            messages=self.messages,
            temperature=0,
        )
        return response

    def add_message(self, message):
        self.messages.append(message)

    def speak(self, text):
        self.engine.say(text)
        self.engine.runAndWait()

    def get_user_input(self):
        recognizer = sr.Recognizer()
        with sr.Microphone() as mic:
            print("MIRA Connected...")
            try:
                audio = recognizer.listen(mic, timeout=20)
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

    def generate_summary(self, file):
        if not file:
            return "No file uploaded"

        file_path = 'uploaded_files/' + file.filename
        file.save(file_path)

        input_text = "Summary for the uploaded file: " + file_path
        self.add_message({"role": "user", "content": input_text})
        response = self.generate_response_with_context()
        self.context = response.choices[0].message.context
        summary = response.choices[0].message.content

        return summary

    def generate_questions(self, input_text):
        self.add_message({"role": "user", "content": input_text})
        response = self.generate_response_with_context()
        self.context = response.choices[0].message.context
        questions = response.choices[0].message.content
        return questions

    def start_conversation(self):
        while True:
            speech_input = self.get_user_input()
            if speech_input:
                print("Speech input:", speech_input)
                self.add_message({"role": "user", "content": speech_input})
                response = self.generate_response(speech_input)
                print("Response:", response)
                self.speak(response)
                if "exit" in speech_input.lower():
                    break
            else:
                text_input = input("Enter your message: ")
                if text_input:
                    print("Text input:", text_input)
                    self.add_message({"role": "user", "content": text_input})
                    response = self.generate_response(text_input)
                    print("Response:", response)
                    self.speak(response)
                    if "exit" in text_input.lower():
                        break

    def start_conversation_thread(self):
        conversation_thread = Thread(target=self.start_conversation)
        conversation_thread.daemon = True
        conversation_thread.start()

    def send_initial_instruction(self):
        initial_instruction = """
         You are an Exam Preparation Assistant, designed to help students at all levels prepare for exams and improve their academic performance. Your primary functions include providing access to a wide range of resources, generating practice questions, and offering constructive feedback. You are equipped with a vast knowledge base, covering various subjects, topics, and academic levels. Your goal is to help students identify their weaknesses, strengthen their knowledge, and build confidence as they prepare for exams. You are also capable of adjusting your responses and resources to cater to the individual needs of each student, making learning a personalized and effective experience
         your name is called MIRA for Mervine's intelligence ressource assistant. Your primary task is to assist students in optimizing their exam preparation efforts. Here's a summary of your key features:

        1. Text Summarization: Condense lengthy study materials into concise summaries, focusing on essential points and key concepts.
        2. Question Generation: Automatically generate interactive exam-style questions based on user preferences, covering various topics and difficulty levels.
        Best regards,
        Mervine, your programmer.
        """
        self.add_message({"role": "MIRA", "content": initial_instruction})
        response = self.generate_response_with_context()
        return response.choices[0].message.content
    
mira = MIRA()
