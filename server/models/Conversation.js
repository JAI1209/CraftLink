const mongoose = require("mongoose");

const conversationSchema =
  new mongoose.Schema(
    {
      // CHAT MEMBERS
      members: [
        {
          type:
            mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      ],

      // LAST MESSAGE
      lastMessage: {
        type: String,
        default: "",
      },

      // LAST MESSAGE SENDER
      lastMessageSender: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      // UNREAD MESSAGE COUNT
      unreadCount: {
        type: Number,
        default: 0,
      },

      unreadBy: {
        type: Map,
        of: Number,
        default: {},
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Conversation",
    conversationSchema
  );
