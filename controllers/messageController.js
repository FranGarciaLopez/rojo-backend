const express = require('express');
const Message = require('./models/Message'); 
const User = require('./models/User'); 


const messageController ={

    async getMessages(req, res) {
        try {
          const groupId = req.params.groupId; 
    
     
          const messages = await Message.find({ group: groupId })
            .populate('author', 'firstname') 
            .populate('group'); 
    
       
          res.status(200).json(messages);
        } catch (error) {
          console.error('Error getting messages:', error);
          res.status(500).json({ message: 'Error getting messages', error });
        }
      },
      async createMessage(req, res, io) {
        try {
          const { content, authorId, groupId } = req.body;
    
          const newMessage = new Message({
            content,
            author: authorId,
            group: groupId,
          });
    
          await newMessage.save();
    
    
          io.to(groupId).emit('newMessage', {
            content: newMessage.content,
            author: newMessage.author, 
            groupId: newMessage.group,
          });
    
          res.status(201).json(newMessage);
        } catch (error) {
          console.error('Error creating message:', error);
          res.status(500).json({ message: 'Error creating message', error });
        }
      }


};

module.exports = new messageController();