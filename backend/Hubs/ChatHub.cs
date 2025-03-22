using Microsoft.AspNetCore.SignalR;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace backend.Hubs
{
    [Authorize]  // require authentication for connecting to the hub
    public class ChatHub : Hub
    {
        private readonly AppDbContext _db;
        
        public ChatHub(AppDbContext db)
        {
            _db = db;
        }

        // Called when a client joins a group (chat room)
        public async Task JoinGroup(string groupId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
            
            // Mark user online in DB and notify others (presence)
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId != null)
            {
                var user = _db.Users.Find(Guid.Parse(userId));
                if (user != null)
                {
                    user.IsOnline = true;
                    await _db.SaveChangesAsync();
                    
                    // Broadcast to all clients (or group members) that this user is online
                    await Clients.All.SendAsync("UserOnline", user.Id, user.DisplayName);
                }
            }
        }

        public async Task LeaveGroup(string groupId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId);
            
            // Mark user offline and notify others
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId != null)
            {
                var user = _db.Users.Find(Guid.Parse(userId));
                if (user != null)
                {
                    user.IsOnline = false;
                    await _db.SaveChangesAsync();
                    await Clients.All.SendAsync("UserOffline", user.Id);
                }
            }
        }

        // Send a message to a specific group
        public async Task SendMessage(string groupId, string messageText)
        {
            var userName = Context.User?.Identity?.Name ?? "Unknown";
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return;
            
            // Save message in DB
            var message = new Message
            {
                ChatGroupId = Guid.Parse(groupId),
                SenderId = Guid.Parse(userId),
                Content = messageText,
                Timestamp = DateTime.UtcNow
            };
            
            _db.Messages.Add(message);
            await _db.SaveChangesAsync();
            
            // Broadcast to all clients in the group
            await Clients.Group(groupId).SendAsync("ReceiveMessage", new
            {
                GroupId = groupId,
                SenderId = message.SenderId,
                SenderName = userName,
                Content = messageText,
                Timestamp = message.Timestamp
            });
        }

        // Override OnDisconnected to handle when a user closes app
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Mark user offline
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId != null)
            {
                var user = _db.Users.Find(Guid.Parse(userId));
                if (user != null)
                {
                    user.IsOnline = false;
                    await _db.SaveChangesAsync();
                    await Clients.All.SendAsync("UserOffline", user.Id);
                }
            }
            
            await base.OnDisconnectedAsync(exception);
        }
    }
} 