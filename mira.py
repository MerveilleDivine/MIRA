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
        # Check if a file was uploaded
        if not file:
            return "No file uploaded"

        # Save the uploaded file on the server
        file_path = 'uploaded_files/' + file.filename
        file.save(file_path)

        # Add file content to the input text
        input_text = "Summary for the uploaded file: " + file_path

        # Append input text to messages
        if self.context:
            self.messages.append({"role": "user", "content": input_text, "context": self.context})
        else:
            self.messages.append({"role": "user", "content": input_text})

        # Call the OpenAI API to generate a response
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo-1106",
            messages=self.messages,
            temperature=0,
        )
        self.context = response.choices[0].message.context  # Update context for next response
        summary = response.choices[0].message.content

        # Process the generated summary here if needed

        return summary

    def generate_questions(self, input_text):
        if self.context:
            self.messages.append({"role": "user", "content": input_text, "context": self.context})
        else:
            self.messages.append({"role": "user", "content": input_text})
        
        response =openai.chat.completions.create(
            model="gpt-3.5-turbo-1106",
            messages=self.messages,
            temperature=0,
        )
        self.context = response.choices[0].message.context  # Update context for next response
        questions = response.choices[0].message.content
        # Process the generated questions here
        return questions

    def provide_feedback(self, input_text):
        if self.context:
            self.messages.append({"role": "user", "content": input_text, "context": self.context})
        else:
            self.messages.append({"role": "user", "content": input_text})
        
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo-1106",
            messages=self.messages,
            temperature=0,
        )
        self.context = response.choices[0].message.context  # Update context for next response
        feedback = response.choices[0].message.content
        # Process the feedback here
        return feedback
    def start_conversation(self):
        while True:
            # Get user input from speech recognition
            speech_input = self.get_user_input()
            if speech_input:
                # Process speech input
                print("Speech input:", speech_input)
                self.messages.append({"role": "user", "content": speech_input})
                response = self.generate_response(speech_input)
                print("Response:", response)
                self.speak(response)
                if "exit" in speech_input.lower():
                    break
            else:
                # Get user input from text input
                text_input = input("Enter your message: ")
                if text_input:
                    # Process text input
                    print("Text input:", text_input)
                    self.messages.append({"role": "user", "content": text_input})
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
        2. Question Generation: Automatically generate interactive exam-style questions based on user preferences, covering various topics and difficulty levels. This includes an interactive mode where you prompt the user to select a difficulty level and also provide a specific question type (multiple choice or conventional writing-type). Generate questions based on these preferences and wait for the user's responses before proceeding to the next question. after five questions and answers, ask the user if they want to continue, if yes, add 5 more questions until the user ask to stop. keep the score of good answers and wrong ones and at the end give a feedback to the user about they strength and weakness areas.
        3. Personalized Feedback: Provide tailored feedback to students based on their performance in practice exams and quizzes. Help them identify areas of strength and weakness.

        Best regards,
        Mervine, your programmer.
        """
        # Set the role to MIRA
        initial_instruction_with_role = {"role": "MIRA", "content": initial_instruction}
        
        # Send initial instruction when MIRA is loaded
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo-1106",
            messages=[initial_instruction_with_role],
            temperature=0,
        )
        
        return response.choices[0].message.content

# Instantiate MIRA
mira = MIRA()
mira.start_conversation_thread()  # or mira.start_conversation()
