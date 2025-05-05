import React, { useState, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import Lottie from 'react-lottie';
import Arrow from './assets/arrow.json';
import './App.css';

const App: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [showPrompt, setShowPrompt] = useState<boolean>(true);

  // Lottie animation options
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: {}, // You'll need to import the Lottie JSON here
    // rendererSettings: {
    //   preserveAspectRatio: 'xMidYMid slice'
    // }
  };

  // Hide the prompt when chat is opened
  useEffect(() => {
    if (isChatOpen) {
      setShowPrompt(false);
    }
  }, [isChatOpen]);

  // Function to handle starting the chat
  const handleStartChat = () => {
    setIsChatOpen(true);
    setShowPrompt(false);
  };

  return (
    <div className="App">
      {isChatOpen && <ChatWindow onClose={() => setIsChatOpen(false)} />}

      {showPrompt && !isChatOpen && (
        <div className="chat-prompt-container">
          <div className="glassmorphism-card">
            <h1 className="chat-prompt-text">Click Here to Start Chat</h1>


          </div>
          <div className="arrow-animation">
            {/* <Lottie options={{ ...defaultOptions, animationData: Arrow }} height={450} width={50} /> */}
            <div style={{ transform: 'rotate(-40deg)', width: 140, height: 400 }}>
              <Lottie
                options={{
                  ...defaultOptions,
                  animationData: Arrow,
                  loop: true,
                  autoplay: true,
                  
                }}
              />
            </div>
          </div>
        </div>
      )}


      <button
        className="chat-button"
        onClick={() => {
          setIsChatOpen(!isChatOpen);
          setShowPrompt(false);
        }}
      >
        <span>💬</span>
      </button>
    </div>
  );
};

export default App;