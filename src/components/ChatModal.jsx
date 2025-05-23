// src/components/ChatModal.jsx
import React, { useEffect, useState, useRef } from 'react';
import "../styles/chatmodal.css";

const ChatModal = ({
  socket,
  roomCode,
  isOpen,
  onClose,
  myUserId,
  setHasNewMessage,
  isChatOpen
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (msg.user !== myUserId && !isChatOpen) {
        setHasNewMessage(true);
      }
    };

    const handleUnread = ({ from, roomCode: incomingRoom }) => {
      if (incomingRoom === roomCode && from !== myUserId && !isChatOpen) {
        setHasNewMessage(true);
      }
    };

    socket.on('chatMessage', handleMessage);
    socket.on('unreadMessage', handleUnread);

    return () => {
      socket.off('chatMessage', handleMessage);
      socket.off('unreadMessage', handleUnread);
    };
  }, [socket, isChatOpen, myUserId, roomCode, setHasNewMessage]);

  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false);
    }
  }, [isOpen, setHasNewMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() === '' || !socket) return;
    const msg = { user: myUserId, text: input };
    socket.emit('chatMessage', { roomCode, msg });
    setMessages((prev) => [...prev, msg]);
    setInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay">
      <div className="chat-modal">
        <div className="chat-header">
          <h4>💬 Chat Room</h4>
          <button onClick={onClose}>✖</button>
        </div>
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.user === myUserId ? 'mine' : 'theirs'}`}>
              <strong>{msg.user}:</strong> {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
