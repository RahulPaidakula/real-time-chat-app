import { useEffect, useState, useCallback } from 'react';
import { startSignalR, joinGroup, sendMessage, setMessageCallback, setUserOnlineCallback, setUserOfflineCallback } from '../services/signalrService';
import ChatList from '../components/ChatList';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import NewChatModal from '../components/NewChatModal';

function ChatPage({ user }) {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const loadMessages = useCallback(async (chat) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/Chat/messages/${chat.id}`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const messageData = await res.json();
        setMessages(messageData);
      } else {
        console.error("Failed to load messages");
      }
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  }, []);

  const handleNewMessage = useCallback((message) => {
    if (activeChat && message.groupId === activeChat.id) {
      setMessages(prevMessages => {
        const isDuplicate = prevMessages.some(m => 
          (m.id && m.id === message.id) || 
          (m.content === message.content && 
           m.senderId === message.senderId && 
           Math.abs(new Date(m.timestamp) - new Date(message.timestamp)) < 2000)
        );
        
        if (isDuplicate) {
          return prevMessages;
        }
        
        return [...prevMessages, message];
      });
    }
  }, [activeChat]);

  const handleUserOnline = useCallback((userId, displayName) => {
    setOnlineUsers(prev => new Set(prev).add(userId));
  }, []);

  const handleUserOffline = useCallback((userId) => {
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  }, []);

  useEffect(() => {
    document.title = `Chat - ${user.displayName}`;
    
    setMessageCallback(handleNewMessage);
    setUserOnlineCallback(handleUserOnline);
    setUserOfflineCallback(handleUserOffline);
    
    const fetchChatsAndConnect = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/Chat/groups`, {
          credentials: 'include'
        });
        
        if (res.ok) {
          const chatData = await res.json();
          setChats(chatData);
          
          await startSignalR();
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
          if (chatData.length > 0) {
            for (const chat of chatData) {
              try {
                await joinGroup(chat.id);
                console.log(`Successfully joined group: ${chat.id}`);
              } catch (err) {
                console.warn(`Failed to join group ${chat.id}:`, err);
              }
            }
            
            if (!activeChat) {
              setActiveChat(chatData[0]);
              loadMessages(chatData[0]);
            }
          }
        } else {
          setError('Failed to load chats');
        }
      } catch (err) {
        console.error("Error initializing chat:", err);
        setError('Failed to connect to chat server');
      } finally {
        setIsConnecting(false);
      }
    };
    
    fetchChatsAndConnect();
    
    return () => {
      setMessageCallback(null);
      setUserOnlineCallback(null);
      setUserOfflineCallback(null);
    };
  }, [user.displayName, activeChat, handleNewMessage, handleUserOnline, handleUserOffline, loadMessages]);

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    loadMessages(chat);
  };

  const handleSendMessage = async (text) => {
    if (!activeChat) return;
    
    try {
      const tempMessage = {
        id: `temp-${Date.now()}`,
        groupId: activeChat.id,
        senderId: user.id,
        senderName: user.displayName,
        content: text,
        timestamp: new Date().toISOString(),
        isLocal: true
      };
      
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      
      await sendMessage(activeChat.id, text);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleCreateGroup = async (name, memberIds) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/Chat/create-group`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, memberIds }),
        credentials: 'include'
      });
      
      if (res.ok) {
        const { groupId } = await res.json();
        
        const chatsRes = await fetch(`${process.env.REACT_APP_API_URL}/api/Chat/groups`, {
          credentials: 'include'
        });
        
        if (chatsRes.ok) {
          const updatedChats = await chatsRes.json();
          setChats(updatedChats);
          
          const newChat = updatedChats.find(c => c.id === groupId);
          if (newChat) {
            await joinGroup(newChat.id);
            setActiveChat(newChat);
            loadMessages(newChat);
          }
        }
        
        setShowNewChatModal(false);
      }
    } catch (err) {
      console.error("Error creating group:", err);
    }
  };

  if (isConnecting) {
    return <div className="loading-container">Connecting to chat server...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        <ChatList 
          chats={chats}
          activeChat={activeChat}
          onSelectChat={handleSelectChat}
          onNewChat={() => setShowNewChatModal(true)}
        />
        
        <div className="chat-main">
          {activeChat ? (
            <>
              <div className="chat-header">
                <h2>{activeChat.name || "Private Chat"}</h2>
              </div>
              
              <MessageList 
                messages={messages}
                currentUserId={user.id}
              />
              
              <MessageInput 
                onSend={handleSendMessage}
                disabled={!activeChat}
              />
            </>
          ) : (
            <div className="no-chat-selected">
              <p>Select a chat or create a new one to start messaging</p>
            </div>
          )}
        </div>
      </div>
      
      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onCreateGroup={handleCreateGroup}
        />
      )}
    </div>
  );
}

export default ChatPage; 