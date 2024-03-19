document.addEventListener("DOMContentLoaded", function () {
    const messageInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");
    const chatMessages = document.getElementById("chat-messages");

    sendBtn.addEventListener("click", function () {
        const messageText = messageInput.value.trim();
        if (messageText !== "") {
            // Send the message to your Flask backend
            sendMessage(messageText);
            messageInput.value = "";
        }
    });

    const sendMessage = function (message) {
        // Create a new XMLHttpRequest object
        const xhr = new XMLHttpRequest();

        // Define the endpoint URL for sending messages to your Flask app
        const url = "/send";

        // Define the HTTP method and endpoint URL
        xhr.open("POST", url, true);

        // Set the Content-Type header
        xhr.setRequestHeader("Content-Type", "application/json");

        // Define the callback function to handle the response from the server
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    // Parse the JSON response
                    const responseData = JSON.parse(xhr.responseText);
                    // Extract user's message and MIRA's response
                    const userMessage = responseData.user_message;
                    const miraResponse = responseData.mira_response;
                    // Append both messages to the chat interface with appropriate sender tags
                    appendMessage(userMessage);
                    appendMessage(miraResponse);
                } else {
                    // Handle errors or display an error message
                    console.error("Error:", xhr.statusText);
                }
            }
        };

        // Event listener for pressing enter
        messageInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault(); // Prevent newline on enter
                const messageText = messageInput.value.trim();
                if (messageText !== "") {
                    // Send the message to your Flask backend
                    sendMessage(messageText);
                    messageInput.value = "";
                }
            }
        });

        // Event listener for pressing shift+enter
        messageInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter" && event.shiftKey) {
                // Add newline character
                messageInput.value += "\n";
            }
        });

        // Event listener for clicking send button
        sendBtn.addEventListener("click", function () {
            const messageText = messageInput.value.trim();
            if (messageText !== "") {
                // Send the message to your Flask backend
                sendMessage(messageText);
                messageInput.value = "";
            }
        });

        // Create a JSON object with the message data
        const messageData = JSON.stringify({ message: message });

        // Send the request with the message data
        xhr.send(messageData);
    };

    const appendMessage = function (message) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message");
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to bottom
    };

});

document.addEventListener("DOMContentLoaded", function () {
    const reloadLink = document.getElementById("reload-link");
    reloadLink.addEventListener("click", function (event) {
        // Prevent the default behavior of following the link
        event.preventDefault();

        // Reload the page
        location.reload();
    });
});
