namespace backend.Models
{
    public class RegisterDto 
    { 
        public string Email { get; set; } = string.Empty; 
        public string Password { get; set; } = string.Empty; 
        public string DisplayName { get; set; } = string.Empty; 
    }
    
    public class LoginDto 
    { 
        public string Email { get; set; } = string.Empty; 
        public string Password { get; set; } = string.Empty; 
    }
    
    public class ResetRequestDto 
    { 
        public string Email { get; set; } = string.Empty; 
    }
    
    public class ResetPasswordDto 
    { 
        public string Token { get; set; } = string.Empty; 
        public string NewPassword { get; set; } = string.Empty; 
    }

    public class CreateGroupDto
    {
        public string Name { get; set; } = string.Empty;
        public List<Guid> MemberIds { get; set; } = new List<Guid>();
    }
} 