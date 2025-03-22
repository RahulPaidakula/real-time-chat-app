using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _config;
        
        public AuthController(AppDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (_db.Users.Any(u => u.Email == dto.Email))
            {
                return BadRequest("Email already in use.");
            }
            
            // Hash password
            string hashed = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            
            var user = new User
            {
                Email = dto.Email,
                DisplayName = dto.DisplayName,
                PasswordHash = hashed,
                Role = "User"
            };
            
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
            
            return Ok("Registration successful");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _db.Users.SingleOrDefaultAsync(u => u.Email == dto.Email);
            
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                return Unauthorized("Invalid credentials");
            }
            
            // Generate JWT
            var token = GenerateJwtToken(user);
            
            // Set HttpOnly cookie
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddMinutes(int.Parse(_config["JwtSettings:ExpireMinutes"] ?? "60"))
            };
            
            Response.Cookies.Append("AuthToken", token, cookieOptions);
            
            // Also return token and user info in response body (optional)
            return Ok(new { token, user = new { user.Id, user.DisplayName, user.Email, user.Role } });
        }

        [HttpPost("reset-password-request")]
        public async Task<IActionResult> ResetPasswordRequest([FromBody] ResetRequestDto dto)
        {
            var user = _db.Users.SingleOrDefault(u => u.Email == dto.Email);
            if (user == null) return Ok(); // do not reveal non-existence
            
            // Generate a password reset token (GUID)
            string resetToken = Guid.NewGuid().ToString();
            user.PasswordHash = $"RESET:{resetToken}"; // store temporarily, prefixed to identify
            await _db.SaveChangesAsync();
            
            // TODO: send email via SES or SMTP containing a link with the token
            // e.g., link: https://myapp.com/reset-password?token=<resetToken>
            
            return Ok("Password reset email sent if account exists.");
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            var user = _db.Users.SingleOrDefault(u => u.PasswordHash.StartsWith("RESET:") && u.PasswordHash.EndsWith(dto.Token));
            
            if (user == null) return BadRequest("Invalid or expired token");
            
            // Set new password
            string newHashed = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.PasswordHash = newHashed;
            await _db.SaveChangesAsync();
            
            return Ok("Password reset successful.");
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _config.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key not configured")));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Name, user.DisplayName),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(int.Parse(jwtSettings["ExpireMinutes"] ?? "60")),
                signingCredentials: creds
            );
            
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
} 