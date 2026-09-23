const aiService = require('../services/aiService');
const ChatSession = require('../models/ChatSession');

exports.handleChat = async (req, res) => {
  try {
    const { message, history, attachments, isThinkingMode } = req.body;
    
    if (!message && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ error: "Message or attachment is required." });
    }

    const response = await aiService.chatMessage(history || [], message || "", attachments || [], isThinkingMode);
    
    res.json({ response });
  } catch (error) {
    console.error('Chat Controller Error:', error);
    res.status(500).json({ error: "Failed to process chat message." });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(sessions);
  } catch (error) {
    console.error('getSessions Error:', error);
    res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (error) {
    console.error('getSessionById Error:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
};

exports.createSession = async (req, res) => {
  try {
    const { title, messages } = req.body;
    const session = await ChatSession.create({
      user: req.user._id,
      title: title || 'New Chat',
      messages: messages || []
    });
    res.status(201).json(session);
  } catch (error) {
    console.error('createSession Error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const { title, messages, isPinned, isArchived } = req.body;
    
    // Build update object dynamically
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (messages !== undefined) updateFields.messages = messages;
    if (isPinned !== undefined) updateFields.isPinned = isPinned;
    if (isArchived !== undefined) updateFields.isArchived = isArchived;

    const session = await ChatSession.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: updateFields },
      { new: true }
    );
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (error) {
    console.error('updateSession Error:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const session = await ChatSession.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ message: 'Session deleted' });
  } catch (error) {
    console.error('deleteSession Error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
};
