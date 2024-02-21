document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('user-input-form');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');

    // Smooth scroll to the bottom of the chat window
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Append a message to the chat window
    function appendMessage(message, isUserMessage) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.classList.add('message');
        if (isUserMessage) {
            messageElement.classList.add('user-message');
        } else {
            messageElement.classList.add('mira-message');
        }
        chatMessages.appendChild(messageElement);
        scrollToBottom();
    }

    // Function to handle user input submission
    function handleUserInput() {
        const message = userInput.value.trim();
        if (message === '') return;

        appendMessage('[You]: ' + message, true);
        userInput.value = ''; // Clear input field

        // Send user input to server
        fetch('/chatbot', {
            method: 'POST',
            body: JSON.stringify({ message }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            appendMessage('[MIRA]: ' + data.output, false);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    // Event listener for form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        handleUserInput();
    });

    // Event listener for speech input button
    const speechButton = document.getElementById('speech-button');
    speechButton.addEventListener('click', function () {
        // Functionality for speech input can be added here
        console.log('Speech input functionality');
    });

    // Function to handle speech input
    function handleSpeechInput() {
        // Functionality for speech input can be added here
        console.log('Speech input functionality');
    }

    // Initial greeting message
    appendMessage('[MIRA]: Hello! How can I assist you?', false);
});
