import React, { useState, useEffect, useRef } from 'react';
import { FiMessageCircle, FiX, FiSend, FiCpu, FiZap, FiAlertTriangle, FiShield, FiBriefcase, FiDollarSign, FiFileText } from 'react-icons/fi';
import api from '../../services/api';
import { showToast } from '../common/Toast';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickActions, setQuickActions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 1,
        type: 'bot',
        text: "Hi! I'm JobShield AI Assistant. I can help you:\n\n- Detect job scams\n- Verify companies\n- Check suspicious emails\n- Understand red flags\n\nAsk me anything!",
        timestamp: new Date()
      }]);
    }
    if (isOpen) {
      fetchQuickActions();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchQuickActions = async () => {
    try {
      const res = await api.get('/api/chatbot/quick-actions');
      if (res.data.success) setQuickActions(res.data.data);
    } catch (err) {}
  };

  const handleSend = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMsg = {
      id: Date.now(),
      type: 'user',
      text: msg,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/api/chatbot/chat', { message: msg });
      if (res.data.success) {
        const botMsg = {
          id: Date.now() + 1,
          type: 'bot',
          text: res.data.data.reply,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickIcons = {
    1: <FiFileText />, 2: <FiAlertTriangle />, 3: <FiBriefcase />,
    4: <FiDollarSign />, 5: <FiShield />, 6: <FiZap />
  };

  return (
    <>
      <button className="chatbot-fab" onClick={() => setIsOpen(!isOpen)} title="AI Assistant">
        {isOpen ? <FiX size={24} /> : <FiMessageCircle size={24} />}
      </button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="chatbot-avatar"><FiCpu size={20} /></div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>JobShield AI</h3>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Always here to help</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="chatbot-close"><FiX size={18} /></button>
          </div>

          <div className="chatbot-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`chatbot-msg chatbot-msg-${msg.type}`}>
                {msg.type === 'bot' && <div className="chatbot-msg-avatar"><FiCpu size={14} /></div>}
                <div className={`chatbot-bubble chatbot-bubble-${msg.type}`}>
                  {msg.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line.split('**').map((part, j) =>
                        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                      )}
                      {i < msg.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chatbot-msg chatbot-msg-bot">
                <div className="chatbot-msg-avatar"><FiCpu size={14} /></div>
                <div className="chatbot-bubble chatbot-bubble-bot typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && quickActions.length > 0 && (
            <div className="chatbot-quick-actions">
              {quickActions.map(action => (
                <button key={action.id} onClick={() => handleSend(action.message)} className="quick-action-btn">
                  {quickIcons[action.id] || <FiZap size={14} />}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          )}

          <div className="chatbot-input-area">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about job scams..."
              disabled={loading}
              className="chatbot-input"
            />
            <button onClick={() => handleSend()} disabled={!input.trim() || loading} className="chatbot-send">
              <FiSend size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
