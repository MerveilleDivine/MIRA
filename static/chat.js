document.addEventListener("DOMContentLoaded", function() {
    const messageInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");
    const chatMessages = document.getElementById("chat-messages");

    sendBtn.addEventListener("click", function() {
        const messageText = messageInput.value.trim();
        if (messageText !== "") {
            // Send the message to your Flask backend
            sendMessage(messageText);
            messageInput.value = "";
        }
    });

    const sendMessage = function(message) {
        // Create a new XMLHttpRequest object
        const xhr = new XMLHttpRequest();
        
        // Define the endpoint URL for sending messages to your Flask app
        const url = "/send";
        
        // Define the HTTP method and endpoint URL
        xhr.open("POST", url, true);

        // Set the Content-Type header
        xhr.setRequestHeader("Content-Type", "application/json");

        // Define the callback function to handle the response from the server
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    // Handle the response from the server
                    const response = xhr.responseText;
                    // Append the response to the chat interface, specifying the sender as "MIRA"
                    appendMessage(response, "MIRA");
                } else {
                    // Handle errors or display an error message
                    console.error("Error:", xhr.statusText);
                }
            }
        };

        // Create a JSON object with the message data
        const messageData = JSON.stringify({ message: message });

        // Send the request with the message data
        xhr.send(messageData);
    };

    const appendMessage = function(message, sender) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", sender);
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to bottom
    };
});

document.addEventListener("DOMContentLoaded", function() {
    const reloadLink = document.getElementById("reload-link");
    reloadLink.addEventListener("click", function(event) {
        // Prevent the default behavior of following the link
        event.preventDefault();
        
        // Reload the page
        location.reload();
    });
});
