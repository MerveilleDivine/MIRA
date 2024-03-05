const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#send-btn");
const micButton = document.querySelector("#mic-btn");

let userText = null;
const API_KEY = "PASTE-YOUR-API-KEY-HERE"; // Paste your API key here

function loadDataFromLocalstorage() {
  const themeColor = localStorage.getItem("themeColor");

  document.body.classList.toggle("light-mode", themeColor === "light_mode");
  themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

  const allChats = localStorage.getItem("all-chats");
  if (allChats) {
    chatContainer.innerHTML = allChats;
  } else {
    // Display tiles when the chat container is empty
    const clickableTiles = document.querySelector(".clickable-tiles");
    if (clickableTiles) {
      clickableTiles.style.display = "flex";
    }
  }

  chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

const createChatElement = (content, role) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat");
  
    if (role === "user") {
      chatDiv.classList.add("outgoing");
    } else if (role === "bot") {
      chatDiv.classList.add("incoming");
    }
  
    chatDiv.innerHTML = `
      <div class="chat-content">
        <div class="chat-details">
          ${content}
        </div>
      </div>
    `;
  
    return chatDiv;
  }

const getChatResponse = async (incomingChatDiv) => {
    const API_URL = "https://api.openai.com/v1/completions";
    const pElement = document.createElement("p");

    // Define the properties and data for the API request
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "text-davinci-003",
            prompt: userText,
            max_tokens: 2048,
            temperature: 0.2,
            n: 1,
            stop: null
        })
    }

    // Send POST request to API, get response and set the reponse as paragraph element text
    try {
        const response = await (await fetch(API_URL, requestOptions)).json();
        pElement.textContent = response.choices[0].text.trim();
    } catch (error) { // Add error class to the paragraph element and set error text
        pElement.classList.add("error");
        pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
    }

    // Remove the typing animation, append the paragraph element and save the chats to local storage
    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    localStorage.setItem("all-chats", chatContainer.innerHTML);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

const copyResponse = (copyBtn) => {
    // Copy the text content of the response to the clipboard
    const reponseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(reponseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000);
}

const showTypingAnimation = () => {
    // Display the typing animation and call the getChatResponse function
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="images/chatbot.jpg" alt="chatbot-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                </div>`;
    // Create an incoming chat div with typing animation and append it to chat container
    const incomingChatDiv = createChatElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);
}

const handleInputKeyDown = (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleOutgoingChat();
  } else if (event.key === " ") {
    if (event.target.id === "mic-btn") {
      event.preventDefault();
      startRecognition();
    }
  }
};

const startRecognition = () => {
  recognition.start();
  sendButton.setAttribute("disabled", true);
  sendButton.classList.add("disabled");
  sendButton.innerHTML = `<div class="spinner-border" role="status">
                            <span class="visually-hidden">Loading...</span>
                          </div>`;
  recognition.addEventListener("result", handleRecognitionResult);
  recognition.addEventListener("end", handleRecognitionEnd);
};

const handleRecognitionResult = (event) => {
  const transcript = event.results[0][0].transcript;
  chatInput.value = transcript;
  chatInput.dispatchEvent(new Event("input", { bubbles: true }));
};

const handleRecognitionEnd = () => {
  sendButton.removeAttribute("disabled");
  sendButton.classList.remove("disabled");
  sendButton.innerHTML = `Send`;
};

// Add event listeners to the mic button
micButton.addEventListener("click", startRecognition);
chatInput.addEventListener("keydown", handleInputKeyDown);

chatInput.addEventListener("keydown", handleInputKeyDown);

const handleOutgoingChat = () => {
  const userText = chatInput.value.trim();
  if (!userText) return;

  const outgoingChatDiv = createChatElement(userText, "user");
  chatContainer.appendChild(outgoingChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);

  sendButton.setAttribute("disabled", true);
  sendButton.classList.add("disabled");
  sendButton.innerHTML = `<div class="spinner-border" role="status">
                          <span class="visually-hidden">Loading...</span>
                        </div>`;

  $.ajax({
    url: 'http://127.0.0.1:5001/',
    type: 'POST',
    data: { message: userText },
    success: function(response) {
      const responseData = JSON.parse(response);
      const incomingChatDiv = createChatElement(responseData.output, 'incoming');
      chatContainer.appendChild(incomingChatDiv);
      chatContainer.scrollTo(0, chatContainer.scrollHeight);

      sendButton.removeAttribute("disabled");
      sendButton.classList.remove("disabled");
      sendButton.innerHTML = `Send`;
    },
    error: function(xhr, status, error) {
      console.error('Error:', error);
      sendButton.removeAttribute("disabled");
      sendButton.classList.remove("disabled");
      sendButton.innerHTML = `Send`;
      // Handle error (e.g., display error message to the user)
    }
  });

  chatInput.value = "";
  chatInput.style.height = "auto";
};
/*deleteButton.addEventListener("click", () => {
    // Remove the chats from local storage and call loadDataFromLocalstorage function
    if(confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalstorage();
    }
})*/

sendButton.addEventListener("click", handleOutgoingChat);
// Function to handle speech recognition
const handleSpeechRecognition = () => {
    const recognition = new window.webkitSpeechRecognition(); // Create a new SpeechRecognition object

    // Start speech recognition
    recognition.start();

    // Event listener to capture speech recognition results
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript; // Get the recognized transcript
        chatInput.value = transcript; // Set the chat input value to the recognized transcript
    };

    // Event listener to handle speech recognition errors
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        // Handle error (e.g., display error message to the user)
    };
};

micButton.addEventListener("click", handleSpeechRecognition);

const appendChatMessage = (message, role) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", role === 'user' ? 'outgoing' : 'incoming');
    chatDiv.innerHTML = `
        <div class="chat-content">
            <div class="chat-details">
                <img src="${role === 'user' ? 'images/user.jpg' : 'images/chatbot.jpg'}" alt="${role === 'user' ? 'user-img' : 'chatbot-img'}">
                <p>${message}</p>
            </div>
        </div>`;
    chatContainer.appendChild(chatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

sendButton.addEventListener("click", handleOutgoingChat);

const toggleTheme = () => {
    document.body.classList.toggle('dark-theme')
  }

themeButton.addEventListener("click", () => {
    toggleTheme()
    localStorage.setItem("themeColor", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("dark-theme") ? "light_mode" : "dark_mode"
    // Toggle body's class for the theme mode and save the updated theme to the local storage 
    document.body.classList.toggle("light-mode");
});

const initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {
    // Adjust the height of the input field dynamically based on its content
    chatInput.style.height = `${chatInput.scrollHeight}px`;
  });

chatInput.addEventListener("keydown", (e) => {
    // If the Enter key is pressed without Shift and the window width is larger 
    // than 800 pixels, handle the outgoing chat
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleOutgoingChat();
    }
});


loadDataFromLocalstorage();
sendButton.addEventListener("click", handleOutgoingChat);

// Initialize the SpeechRecognition API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;

// Select the voice button
const voiceButton = document.getElementById('mic-button');

// Add a click event listener to the voice button
voiceButton.addEventListener('click', () => {
  // Start the speech recognition
  recognition.start();

  // Add a result event listener to the recognition object
  recognition.addEventListener('result', (e) => {
    // Get the transcript from the speech recognition result
    const transcript = e.results[0][0].transcript;

    // Send the transcript to the Flask app using a fetch request
    fetch('/speech-recognition', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ transcript })
    })
    .then(response => response.json())
    .then(data => {
      // Handle the response from the Flask app
      console.log(data);
    })
    .catch(error => {
      // Handle any errors
      console.error(error);
    });
  });
});
const conversation = document.querySelector('.conversation');

