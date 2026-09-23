const mongoose = require('mongoose');

const chatSessionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
      default: 'New Chat',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    messages: [
      {
        role: { type: String, required: true },
        content: { type: String, default: "" },
        feedback: { type: String, enum: ['up', 'down', null], default: null },
        attachments: [
          {
            data: { type: String },
            mimeType: { type: String },
            name: { type: String }
          }
        ]
      }
    ]
  },
  {
    timestamps: true,
  }
);

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
module.exports = ChatSession;
