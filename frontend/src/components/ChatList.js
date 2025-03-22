import { useState } from 'react';

function ChatList({ chats, activeChat, onSelectChat, onNewChat }) {
  const [searchText, setSearchText] = useState('');
  
  const filteredChats = searchText
    ? chats.filter(chat => chat.name.toLowerCase().includes(searchText.toLowerCase()))
    : chats;
    
  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h3>Chats</h3>
        <button className="new-chat-btn" onClick={onNewChat}>+</button>
      </div>
      
      <div className="chat-search">
        <input
          type="text"
          placeholder="Search chats..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      
      <div className="chat-items">
        {filteredChats.length > 0 ? (
          filteredChats.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => onSelectChat(chat)}
            >
              <div className="chat-item-name">
                {chat.name || "Private Chat"}
              </div>
            </div>
          ))
        ) : (
          <div className="no-chats">
            {searchText ? "No chats found" : "No chats yet"}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatList; 