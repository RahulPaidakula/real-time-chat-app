import { useState, useEffect } from 'react';

function NewChatModal({ onClose, onCreateGroup }) {
  const [name, setName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!searchTerm.trim()) {
      setUsers([]);
      return;
    }

    const searchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/Users/search?q=${encodeURIComponent(searchTerm)}`, 
          { credentials: 'include' }
        );
        
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          console.error('Error searching users');
        }
      } catch (err) {
        console.error('Error searching users:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(searchUsers, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCreateGroup = (e) => {
    e.preventDefault();
    
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }

    const memberIds = selectedUsers.map(user => user.id);
    onCreateGroup(name, memberIds);
  };

  const toggleUserSelection = (user) => {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3>New Chat</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleCreateGroup}>
          <div className="form-group">
            <label>Group Name (optional for one-on-one)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name..."
            />
          </div>
          
          <div className="form-group">
            <label>Search Users</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search users..."
            />
          </div>
          
          <div className="search-results">
            {isLoading ? (
              <div className="loading">Searching...</div>
            ) : (
              <>
                {users.length > 0 ? (
                  <div className="user-list">
                    {users.map(user => (
                      <div 
                        key={user.id} 
                        className={`user-item ${selectedUsers.some(u => u.id === user.id) ? 'selected' : ''}`}
                        onClick={() => toggleUserSelection(user)}
                      >
                        <div className="user-name">
                          {user.displayName}
                        </div>
                        <div className="user-status">
                          {user.isOnline ? 'Online' : 'Offline'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  searchTerm.trim() && <div className="no-results">No users found</div>
                )}
              </>
            )}
          </div>
          
          <div className="selected-users">
            {selectedUsers.length > 0 && (
              <>
                <label>Selected Users ({selectedUsers.length})</label>
                <div className="user-chips">
                  {selectedUsers.map(user => (
                    <div key={user.id} className="user-chip">
                      {user.displayName}
                      <button 
                        type="button" 
                        className="remove-user" 
                        onClick={() => toggleUserSelection(user)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          
          {error && <div className="error">{error}</div>}
          
          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn">
              Create Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewChatModal; 