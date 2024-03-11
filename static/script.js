const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#send-btn");
const micButton = document.querySelector("#mic-btn");

let userText = null;
const API_KEY = "PASTE-YOUR-API-KEY-HERE"; // Paste your API key here

function loadDataFromLocalstorage() {
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


const copyResponse = (copyBtn) => {
  // Copy the text content of the response to the clipboard
  const reponseTextElement = copyBtn.parentElement.querySelector("p");
  navigator.clipboard.writeText(reponseTextElement.textContent);
  copyBtn.textContent = "done";
  setTimeout(() => copyBtn.textContent = "content_copy", 1000);
}

// Get the user's input from the input field and submit it to the server
function sendMessage() {
  const inputElement = document.getElementById('userInput');
  const inputText = inputElement.value;
  if (!inputText) {
      alert('Please enter a message');
      return;
  }

  // Clear the input field
  inputElement.value = '';

  // Send the user's input to the server
  fetch('/chat', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({message: inputText}),
  })
  .then(response => response.text())
  .then(data => {
      // Display the server's response in the chat area
      const chatArea = document.getElementById('chatArea');
      chatArea.innerHTML += `<p>Server: ${data}</p>`;

      // If this is the first message, start a new conversation
      if (chatArea.childElementCount === 1) {
          fetch('/start_conversation', {method: 'POST'});
      }
  })
  .catch(error => {
      console.error('Error:', error);
  });
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


  userMessage.value = userText;
  // Send the user's message using AJAX
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '{{ http://127.0.0.1:5001/}}', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onload = function () {
    if (xhr.status === 200) {
      // Redirect the user to the chat.html page after sending the message
      window.location.href = '{{ http://127.0.0.1:5001/ }}';
    } else {
      console.log('Error:', xhr.statusText);
      sendBtn.removeAttribute("disabled");
      sendBtn.classList.remove("disabled");
      sendBtn.innerHTML = `Send`;
    }
  };
  xhr.send(`user-message=${userText}`);
}
chatInput.value = "";



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


const sendBtn = document.getElementById('send-btn');
let isFirstPress = true;

sendBtn.addEventListener('click', () => {
  if (isFirstPress) {
    window.location.href = 'chat.html';
  }
  isFirstPress = false;

  // Add the rest of your send button logic here
});

const saveMessagesToLocalStorage = (messages) => {
  localStorage.setItem('messages', JSON.stringify(messages));
};

// In your send button event listener, add the following line:
saveMessagesToLocalStorage(messages);

const loadMessagesFromLocalStorage = () => {
  const messages = JSON.parse(localStorage.getItem('messages')) || [];
  return messages;
};

// Load messages when the chat.html page is loaded:
const messages = loadMessagesFromLocalStorage();
// Add the messages to the chat container

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


document.addEventListener('DOMContentLoaded', function () {
  let logoFadedOut = false;

  setTimeout(function () {
    // Add the fade-out class to the logo
    document.querySelector('.mira-logo').classList.add('fade-out');
  }, 2000);

  // Check if the logo has faded out
  const checkLogoFadeOut = setInterval(function () {
    if (document.querySelector('.mira-logo').classList.contains('fade-out')) {
      if (!logoFadedOut) {
        logoFadedOut = true;
        document.querySelector('.mira-logo').remove();
        document.querySelector('.login-container').style.display = 'block';
      }
    }
  }, 100);

  // Remove the logo if it has already faded out
  if (logoFadedOut) {
    document.querySelector('.mira-logo').remove();
    document.querySelector('.login-container').style.display = 'block';
  }
});

const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const body = document.querySelector('body');

if (isDarkMode) {
  body.classList.add('dark-mode');
} else {
  body.classList.add('light-mode');
}

// Select the mode toggle button
// Toggle the classes on button click
modeToggle.addEventListener('click', () => {
  body.classList.toggle('light-mode');
  body.classList.toggle('dark-mode');
});

const toggleSwitch = document.querySelector('.toggle-switch');
const modeLabel = document.querySelector('.mode-label');

toggleSwitch.addEventListener('click', () => {
  toggleSwitch.classList.toggle('dark-mode');
  if (toggleSwitch.classList.contains('dark-mode')) {
    document.body.classList.add('dark-mode');
    modeLabel.textContent = 'Light mode';
  } else {
    document.body.classList.remove('dark-mode');
    modeLabel.textContent = 'Dark mode';
  }
});

const menuButton = document.querySelector('.menu-icon');
const menuWindow = document.querySelector('.menu-window');

menuButton.addEventListener('click', () => {
  menuWindow.classList.toggle('open');
});



/*
  Slidemenu
*/
(function () {
  var $body = document.body,
    $menu_trigger = $body.querySelector('.menu-trigger'); // Changed from getElementsByClassName to querySelector

  if ($menu_trigger !== null) { // Check if menu_trigger exists
    $menu_trigger.addEventListener('click', function () {
      $body.classList.toggle('menu-active'); // Toggle the menu-active class on the body
    });
  }
})();