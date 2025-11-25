

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
// kon se user ki chat h 
  user: {
    type: mongoose.Schema.Types.ObjectId,  
    ref: "user"
  },
  //     // kon se chat ki message h
  chat: {
    type: mongoose.Schema.Types.ObjectId,  
    ref: "chat"
  },
  content: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'model', 'system'],
    default: 'user'
  }
},{
   timestamps:true,
});

const messageModel = mongoose.model('message', messageSchema);
module.exports = messageModel;
