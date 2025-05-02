import React, { useState, useEffect, useRef } from 'react';
import chatFlow from '../data/chatFlow.json';
import indiaStates from '../data/indiaStates.json';
import countries from '../data/countries.json';
import './ChatWindow.css';

type ChatWindowProps = {
  onClose?: () => void;
};

type Step = {
  id: string;
  message: string;
  inputType?: 'text' | 'options';
  options?: string[] | string;
  key?: string;
  next?: string;
  nextByOption?: { [key: string]: string };
};

type Country = {
  name: string;
  key: string;
  temperatureUnit: string;
  defaultWeather: string;
};

const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<{ sender: 'bot' | 'user'; text: string }[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [currentStepId, setCurrentStepId] = useState('1');
  const [userInput, setUserInput] = useState('');
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentCountries, setCurrentCountries] = useState<Country[]>([]);
  
  // Reference to messages container for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getStep = (id: string): Step | undefined => {
    return chatFlow.find(step => step.id === id) as Step | undefined;
  };

  // Load data from sessionStorage on initial render
  useEffect(() => {
    try {
      const savedData = sessionStorage.getItem('userData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
        console.log('Loaded user data from sessionStorage:', parsedData);
      }
    } catch (error) {
      console.error('Error loading from sessionStorage:', error);
    }
  }, []);

  // Initialize chat on first load only
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      renderStep(currentStepId);
    }
  }, [isInitialized]); 

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Save formData to sessionStorage whenever it changes
  useEffect(() => {
    try {
      if (Object.keys(formData).length > 0) {
        sessionStorage.setItem('userData', JSON.stringify(formData));
        console.log('Saved user data to sessionStorage:', formData);
      }
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
  }, [formData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderStep = (stepId: string) => {
    const step = getStep(stepId);
    if (!step) return;
    
    // Show typing indicator
    setIsTyping(true);
    
    // Use setTimeout to simulate bot typing
    setTimeout(() => {
      setIsTyping(false);
      
      const getWeatherMessage = (country: Country, city: string, state?: string) => {
        const temp = country.name === 'USA' ? '75' : country.name === 'Canada' ? '20' : '32';
        return `Thanks! Fetching weather for ${city}${state ? `, ${state}` : ''}, ${country.name}... Today's weather: ${temp}°${country.temperatureUnit}, ${country.defaultWeather}.`;
      };
      // Replace placeholders in message
      let message = step.message;
      if (stepId === '6' && typeof step.options === 'string' && step.options === 'countries.json') {
        setCurrentCountries(countries);
        setCurrentOptions(countries.map(c => c.name));
      }
      else if (stepId === '9A') {
        message = `Thanks, ${formData.name}! Here's your summary:\n` +
          `- Phone: ${formData.phone}\n` +
          `- Email: ${formData.email}\n` +
          `- Country: ${formData.country}\n` +
          `${formData.country === 'India' || formData.country === 'USA' ? `- State: ${formData.state}\n` : ''}` +
          `${formData.country === 'Canada' ? `- Province: ${formData.province}\n` : ''}` +
          `We've saved your preferences. Have a great day!`;
      }
        
      else if (stepId === '8A') {
        message = message
          .replace('{city}', formData.city || '')
          .replace('{state}', formData.state || '')
          .replace('{country}', formData.country || '');
      }
      else if(stepId === '10') {
        const country = countries.find(c => c.name === formData.country);
        if (country) {
          if (formData.country === 'India' || formData.country === 'USA') {
            message = getWeatherMessage(country, formData.city, formData.state);
          } else if (formData.country === 'Canada') {
            message = getWeatherMessage(country, formData.city, formData.province);
          } else {
            message = getWeatherMessage(country, formData.city);
          }
        }
        
        
      }
      
      // Add bot message
      setMessages(prev => [...prev, { sender: 'bot', text: message }]);
      
      // Setup options or proceed to next step if automatic
      if (step.inputType === 'options') {
        if (typeof step.options === 'string' && step.options === 'indiaStates.json') {
          setCurrentOptions(indiaStates);
        } else if (Array.isArray(step.options)) {
          setCurrentOptions(step.options);
        }
      } else if (!step.inputType && step.next) {
        // If no input required and has next step, proceed automatically
        setTimeout(() => {
          setCurrentStepId(step.next!);
        }, 1000);
      }
    }, 1000); // 1 second delay to simulate typing
  };

  // Watch for currentStepId changes and render the new step
  useEffect(() => {
    if (isInitialized && currentStepId !== '1') {
      const step = getStep(currentStepId);
      if (step) {
        renderStep(currentStepId);
      }
    }
  }, [currentStepId]);

  const handleSubmit = (input: string) => {
    if (!input.trim()) return; // Don't submit empty inputs
    
    const step = getStep(currentStepId);
    if (!step) return;
    
    // Add user message to chat
    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    
    // Store input in formData if step has a key
    if (step.key) {
      // Update formData with the new input
      setFormData(prev => {
        const updatedData = { ...prev, [step.key!]: input };
        return updatedData;
      });
    }

    // Determine next step
    const nextStepId = step.nextByOption?.[input] || step.next;
    if (nextStepId) {
      setUserInput(''); // Clear input field
      setCurrentOptions([]); // Clear options
      setCurrentStepId(nextStepId); // This will trigger the useEffect to render the next step
    }
  };

  const handleOptionClick = (option: string) => {
    handleSubmit(option);
  };

  // For debugging - add a button to clear sessionStorage
  const clearStorage = () => {
    sessionStorage.removeItem('userData');
    setFormData({});
    console.log('Session storage cleared');
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        Weather Bot
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        )}
        {/* Uncomment for debugging
        <button className="debug-btn" onClick={clearStorage} title="Clear Storage">
          🗑️
        </button>
        */}
      </div>
      
      <div className="messages">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`message ${msg.sender}`}
            data-summary={msg.text.includes("Here's your summary:") ? "true" : "false"}
          >
            {msg.text}
          </div>
        ))}
        
        {isTyping && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Section */}
      <div className="input-section">
        {(() => {
          const step = getStep(currentStepId);
          if (!step) return null;
          
          if (step.inputType === 'text') {
            return (
              <div className="input-container">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(userInput)}
                  placeholder="Type your answer..."
                  className="chat-input"
                  autoFocus
                  disabled={isTyping}
                />
                <button 
                  onClick={() => handleSubmit(userInput)}
                  className="send-button"
                  disabled={isTyping}
                >
                  Send
                </button>
              </div>
            );
          }

          if (step.inputType === 'options' && currentOptions.length > 0) {
            return (
              <div className="options">
                {currentOptions.map(option => (
                  <button 
                    key={option} 
                    onClick={() => handleOptionClick(option)}
                    disabled={isTyping}
                  >
                    {option}
                  </button>
                ))}
              </div>
            );
          }
          
          return null;
        })()}
      </div>
    </div>
  );
};

export default ChatWindow;