namespace backend.Models
{
    public class User 
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Email { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "User";  // "User" or "Admin"
        public bool IsOnline { get; set; } = false; // for presence indicator
        public ICollection<GroupMember> Groups { get; set; } = new List<GroupMember>();
        public ICollection<Message> Messages { get; set; } = new List<Message>();
    }
} 