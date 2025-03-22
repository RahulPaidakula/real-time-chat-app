namespace backend.Models
{
    public class GroupMember 
    {
        public Guid UserId { get; set; }
        public User User { get; set; } = default!;
        public Guid ChatGroupId { get; set; }
        public ChatGroup ChatGroup { get; set; } = default!;
        // Optional: Add JoinedDate if needed
        // public DateTime JoinedDate { get; set; } = DateTime.UtcNow;
    }
} 