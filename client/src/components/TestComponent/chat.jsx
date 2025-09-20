import { useState, useEffect, useRef } from 'react';
import { authStore } from '../../store/authStore';

const Chat = ({ socket, roomId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const { username } = authStore();

  useEffect(() => {
    if (!socket) return;

    // Listen for chat messages
    const handleReceiveMessage = (data) => {
      setMessages(prev => [...prev, { 
        text: data.message, 
        senderId: data.senderId, 
        senderName: data.username || `User-${data.senderId.substring(0, 6)}`,
        isMe: data.senderId === userId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    };

    socket.on('receive-chat-message', handleReceiveMessage);

    return () => {
      socket.off('receive-chat-message', handleReceiveMessage);
    };
  }, [socket, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (inputMessage.trim() && socket) {
      // Send message with username
      socket.emit('send-chat-message', { 
        message: inputMessage, 
        roomId: roomId, 
        userId: userId,
        username: username
      });
      
      // Add message to local state immediately
      setMessages(prev => [...prev, { 
        text: inputMessage, 
        senderId: userId, 
        senderName: username || 'You',
        isMe: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="chat-container">
      <h3>Chat</h3>
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet</p>
            <p>Start a conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.isMe ? 'my-message' : 'other-message'}`}>
              <div className="message-header">
                <span className="message-sender">
                  {msg.isMe ? 'You' : msg.senderName}
                </span>
                <span className="message-time">{msg.timestamp}</span>
              </div>
              <div className="message-text">{msg.text}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} disabled={!inputMessage.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;