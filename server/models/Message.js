const mongoose = require("mongoose");

const messageSchema =
  new mongoose.Schema(
    {
      // CONVERSATION ID
      conversationId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
      },

      // MESSAGE SENDER
      sender: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      // MESSAGE RECEIVER
      receiver: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      // MESSAGE TEXT
      text: {
        type: String,
        required: true,
        trim: true,
      },

      // READ STATUS
      isRead: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Message",
    messageSchema
  );