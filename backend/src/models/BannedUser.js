const mongoose = require('mongoose');

const bannedUserSchema = mongoose.Schema(
  {
    identifier: {
      type: String, // Can be username or email
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const BannedUser = mongoose.model('BannedUser', bannedUserSchema);
module.exports = BannedUser;
