namespace backend.Models
{
    public class Message 
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ChatGroupId { get; set; }
        public ChatGroup ChatGroup { get; set; } = default!;
        public Guid SenderId { get; set; }
        public User Sender { get; set; } = default!;
        public string Content { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? AttachmentUrl { get; set; }  // for file attachments (optional)
    }
} 