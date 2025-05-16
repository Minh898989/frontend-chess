// src/components/ChatButton.jsx
import React from 'react';
import { FloatButton, Badge } from 'antd';
import { MessageOutlined } from '@ant-design/icons';

const ChatButton = ({ hasNewMessage, isChatOpen, onClick }) => {
  return (
    <FloatButton.Group shape="circle" style={{ right: 24, bottom: 24, zIndex: 1000 }}>
      <Badge dot={hasNewMessage}>
        <FloatButton
          icon={<MessageOutlined />}
          type={isChatOpen ? "primary" : "default"}
          onClick={onClick}
          tooltip="Open Chat"
        />
      </Badge>
    </FloatButton.Group>
  );
};

export default ChatButton;
