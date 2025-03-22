using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController, Authorize]  // require login for all these
    public class ChatController : ControllerBase
    {
        private readonly AppDbContext _db;
        
        public ChatController(AppDbContext db)
        {
            _db = db;
        }

        [HttpPost("create-group")]
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupDto dto)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            
            // Create group
            var group = new ChatGroup { Name = dto.Name, IsPrivate = false };
            
            // Add creator to group
            group.Members.Add(new GroupMember { UserId = userId, ChatGroup = group });
            
            // Add other members
            foreach (var memberId in dto.MemberIds)
            {
                group.Members.Add(new GroupMember { UserId = memberId, ChatGroup = group });
            }
            
            _db.ChatGroups.Add(group);
            await _db.SaveChangesAsync();
            
            return Ok(new { groupId = group.Id });
        }

        [HttpGet("groups")]
        public IActionResult GetMyGroups()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            
            var groups = _db.ChatGroups
                            .Where(g => g.Members.Any(m => m.UserId == userId))
                            .Select(g => new { g.Id, g.Name, g.IsPrivate })
                            .ToList();
                            
            return Ok(groups);
        }

        [HttpGet("messages/{groupId}")]
        public IActionResult GetMessages(Guid groupId, [FromQuery] int take = 50)
        {
            // Ensure user is member of group
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            bool isMember = _db.GroupMembers.Any(m => m.ChatGroupId == groupId && m.UserId == userId);
            
            if (!isMember) return Forbid();
            
            var messages = _db.Messages
                              .Where(m => m.ChatGroupId == groupId)
                              .OrderByDescending(m => m.Timestamp)
                              .Take(take)
                              .OrderBy(m => m.Timestamp)  // sort ascending after take
                              .Include(m => m.Sender)
                              .Select(m => new {
                                  m.Id, 
                                  m.Content, 
                                  m.Timestamp,
                                  SenderId = m.SenderId,
                                  SenderName = m.Sender.DisplayName
                              })
                              .ToList();
                              
            return Ok(messages);
        }
    }
} 