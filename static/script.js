
  // Get DOM elements
  const userInput = document.getElementById('user-input');
  const chatHistory = document.querySelector('.chat-history');
  const chatInput = document.querySelector("#chat-input");
  const sendButton = document.querySelector("#send-btn");
  const chatContainer = document.querySelector(".chat-container");
  const themeButton = document.querySelector("#theme-btn");
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
  // Function to send user message to the server
  function sendMessage() {
    const inputText = chatInput.value.trim();
    if (!inputText) {
      alert('Please enter a message');
      return;
    }

    // Clear the input field
    chatInput.value = '';

    // Send the user's input to the server
    fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ message: inputText }),
    })
    .then(response => response.text())
    .then(data => {
      // Display the server's response in the chat area
      const chatArea = document.querySelector('.chat-history');
      const chatDiv = document.createElement('div');
      chatDiv.classList.add('chat', 'incoming');
      chatDiv.innerHTML = `<div class="chat-content"><div class="chat-details">${data}</div></div>`;
      chatArea.appendChild(chatDiv);

      // Scroll to the bottom of the chat area
      chatArea.scrollTop = chatArea.scrollHeight;
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

  const sendBtn = document.getElementById('send-btn');
 

  sendBtn.addEventListener('click', () => {
    
     sendMessage();

    // Add the rest of your send button logic here
});

  const saveMessagesToLocalStorage = (messages) => {
    localStorage.setItem('messages', JSON.stringify(messages));
  };

  // Load messages when the chat.html page is loaded:
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

  document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission
   
    
    // Get form data
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Prepare form data for sending to Flask
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    if (username.trim() === '' || password.trim() === '') {
      alert('Please enter both username and password.');
      return; // Exit the function if validation fails
  }
});

document.getElementById('upload-button').addEventListener('change', function(event) {
  var file = event.target.files[0];

  // Send the file to the server for processing
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/upload', true);
  xhr.upload.onprogress = function(e) {
    if (e.lengthComputable) {
      var percentComplete = (e.loaded / e.total) * 100;
      console.log('Uploaded: ' + percentComplete + '%');
    }
  };
  xhr.onload = function() {
    if (xhr.status === 200) {
      console.log('File uploaded successfully');
    } else {
      console.log('File upload failed');
    }
  };
  xhr.send(file);
});


