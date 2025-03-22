using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        
        public DbSet<User> Users => Set<User>();
        public DbSet<ChatGroup> ChatGroups => Set<ChatGroup>();
        public DbSet<GroupMember> GroupMembers => Set<GroupMember>();
        public DbSet<Message> Messages => Set<Message>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Configure composite key for GroupMember
            modelBuilder.Entity<GroupMember>()
                .HasKey(gm => new { gm.UserId, gm.ChatGroupId });
                
            // Relationships
            modelBuilder.Entity<GroupMember>()
                .HasOne(gm => gm.User)
                .WithMany(u => u.Groups)
                .HasForeignKey(gm => gm.UserId);
                
            modelBuilder.Entity<GroupMember>()
                .HasOne(gm => gm.ChatGroup)
                .WithMany(c => c.Members)
                .HasForeignKey(gm => gm.ChatGroupId);
                
            modelBuilder.Entity<Message>()
                .HasOne(m => m.ChatGroup)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.ChatGroupId);
                
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany(u => u.Messages)
                .HasForeignKey(m => m.SenderId);
        }
    }
} 