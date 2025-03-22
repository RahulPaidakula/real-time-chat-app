import { useState } from 'react';

function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const handleSend = () => {
    if (text.trim() === "" || disabled) return;
    onSend(text.trim());
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="message-input">
      <textarea 
        value={text}
        onChange={e => {
          setText(e.target.value);
          if (!isTyping) {
            setIsTyping(true);
          }
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => setIsTyping(false)}
        placeholder="Type a message..."
        disabled={disabled}
      />
      <button onClick={handleSend} disabled={disabled || text.trim() === ""}>Send</button>
    </div>
  );
}

export default MessageInput; 