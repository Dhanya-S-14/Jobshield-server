const { generateResponse } = require('../services/chatbotService');

const chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const response = generateResponse(message);

    res.status(200).json({
      success: true,
      data: {
        reply: response,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Chatbot error', error: error.message });
  }
};

const getQuickActions = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: [
        { id: 1, label: 'How to scan a job?', message: 'How do I scan a job?' },
        { id: 2, label: 'Signs of a scam', message: 'What are signs of a job scam?' },
        { id: 3, label: 'Check a company', message: 'How to verify a company?' },
        { id: 4, label: 'Salary scam tips', message: 'How to spot a salary scam?' },
        { id: 5, label: 'Safety tips', message: 'How to stay safe in my job search?' },
        { id: 6, label: 'Report a scam', message: 'I found a scam, what should I do?' }
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { chat, getQuickActions };
