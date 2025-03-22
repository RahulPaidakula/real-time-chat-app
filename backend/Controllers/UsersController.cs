using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Data;
using backend.Models;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController, Authorize]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _db;
        
        public UsersController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet("me")]
        public IActionResult GetProfile()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var user = _db.Users.Find(userId);
            
            if (user == null) return NotFound();
            
            return Ok(new { user.Id, user.Email, user.DisplayName, user.Role, user.IsOnline });
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin")]  // only admin can list all users
        public IActionResult GetAllUsers()
        {
            var users = _db.Users
                           .Select(u => new { u.Id, u.Email, u.DisplayName, u.Role, u.IsOnline })
                           .ToList();
                           
            return Ok(users);
        }

        [HttpGet("search")]
        public IActionResult SearchUsers([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q)) return Ok(new List<object>());
            
            var users = _db.Users
                           .Where(u => u.DisplayName.Contains(q) || u.Email.Contains(q))
                           .Select(u => new { u.Id, u.DisplayName, u.IsOnline })
                           .ToList();
                           
            return Ok(users);
        }
    }
} 