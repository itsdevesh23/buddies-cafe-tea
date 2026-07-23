import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, Bot, Loader2, Sparkles } from 'lucide-react';
import './ChatWidget.css';

// Simple UUID generator for the session
const generateSessionId = () => {
  return 'user-' + Math.random().toString(36).substring(2, 15);
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Vanakkam! Welcome to Buddies Cafe. I am your Virtual Tea Sommelier. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Generate a unique session ID when the widget mounts
    setSessionId(generateSessionId());
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to UI immediately
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sessionId
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      console.log("Raw n8n Response:", data); // Added for debugging
      
      // Handle different n8n response structures
      let aiResponse = "Sorry, I couldn't process that response.";
      
      if (data.output) {
        aiResponse = data.output;
      } else if (data.text) {
        aiResponse = data.text;
      } else if (Array.isArray(data) && data.length > 0 && data[0].output) {
        aiResponse = data[0].output;
      } else if (data.message) {
        // Fallback for generic n8n messages like "Workflow was started"
        aiResponse = data.message;
      } else {
        // If it's completely unknown, stringify it so we can see what it is in the chat
        aiResponse = "Debug: " + JSON.stringify(data);
      }

      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    } catch (error) {
      console.error('Error communicating with n8n:', error);
      setMessages(prev => [...prev, { role: 'ai', content: 'Oops! I am having trouble connecting to my brain right now. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-widget-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="chat-window glass-panel"
          >
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="chat-avatar">
                  <Bot size={20} />
                </div>
                <div>
                  <h3>Virtual Sommelier</h3>
                  <span className="online-status">Online</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="chat-messages">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`message-wrapper ${msg.role}`}
                >
                  <div className="message-bubble">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="message-wrapper ai">
                  <div className="message-bubble loading">
                    <Loader2 className="spinner" size={16} />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="chat-input-area">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about our teas..."
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading || !input.trim()} className="send-btn">
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className={`chat-toggle-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <>
            <Bot size={24} className="ai-icon" />
            <span className="ai-text">Ask AI</span>
            <Sparkles size={16} className="sparkle-icon" />
          </>
        )}
      </motion.button>
    </div>
  );
};

export default ChatWidget;
