namespace backend.Models
{
    public class ChatGroup 
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;  // group name or empty for private chats
        public bool IsPrivate { get; set; } // true if one-on-one chat
        public ICollection<GroupMember> Members { get; set; } = new List<GroupMember>();
        public ICollection<Message> Messages { get; set; } = new List<Message>();
    }
} 