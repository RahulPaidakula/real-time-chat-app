import { useEffect, useRef } from 'react';

function MessageList({ messages, currentUserId }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const groupedMessages = messages.reduce((acc, message, index) => {
    if (index === 0 || message.senderId !== messages[index - 1].senderId) {
      acc.push({
        senderId: message.senderId,
        senderName: message.senderName,
        messages: [{ id: message.id, content: message.content, timestamp: message.timestamp }]
      });
    } else {
      acc[acc.length - 1].messages.push({
        id: message.id,
        content: message.content,
        timestamp: message.timestamp
      });
    }
    return acc;
  }, []);

  return (
    <div className="message-list">
      {groupedMessages.map((group, index) => (
        <div 
          key={group.messages[0].id || index} 
          className={`message-group ${group.senderId === currentUserId ? 'sent' : 'received'}`}
        >
          {group.senderId !== currentUserId && (
            <div className="message-sender">{group.senderName}</div>
          )}
          <div className="message-bubble-container">
            {group.messages.map((msg, msgIndex) => (
              <div key={msg.id || msgIndex} className="message-bubble">
                <div className="message-content">{msg.content}</div>
                <div className="message-time">{formatTime(msg.timestamp)}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList; 
