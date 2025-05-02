import React, { useState } from 'react';
import ChatWindow from './components/ChatWindow'
import './App.css';

const App: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  return (
    <div className="App">
      {isChatOpen && <ChatWindow onClose={() => setIsChatOpen(false)} />}
      <button className="chat-button" onClick={() => setIsChatOpen(!isChatOpen)}>
        <span>💬</span>
      </button>
    </div>
  );
};

export default App;
