import { Message } from '../models/message.model.js';

const saveMessage = async (req, res) => {
  try {
    const { sender, receiver, message, timestamp } = req.body;
    const newMessage = new Message({ sender, receiver, message, timestamp });
    await newMessage.save();
    res
      .status(201)
      .json({ success: true, message: 'Message saved successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const saveBuddyMessage = async (req, res) => {
  try {
    const { sender, receiver, message, timestamp } = req.body;
    const newMessage = new Message({ sender, receiver, message, timestamp });
    await newMessage.save();
    res
      .status(201)
      .json({ success: true, message: 'Message saved successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const fetchMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: +1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const fetchBuddyMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
export { saveMessage, fetchMessages, saveBuddyMessage, fetchBuddyMessages };
