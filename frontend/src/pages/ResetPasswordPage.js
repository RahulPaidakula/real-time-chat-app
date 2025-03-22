import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isResetRequest, setIsResetRequest] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      setIsResetRequest(false);
    }
  }, [location]);

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/Auth/reset-password-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSuccess("If an account exists with that email, a password reset link has been sent.");
      } else {
        const msg = await res.text();
        setError(msg || "Request failed");
      }
    } catch (err) {
      console.error("Reset request error:", err);
      setError("Network error");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/Auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      if (res.ok) {
        setSuccess("Password has been reset successfully!");
        setTimeout(() => navigate('/login'), 2000);
      } else {
        const msg = await res.text();
        setError(msg || "Password reset failed");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError("Network error");
    }
  };

  return (
    <div className="reset-password-page">
      <h2>{isResetRequest ? "Reset Password Request" : "Set New Password"}</h2>
      
      {isResetRequest ? (
        <form onSubmit={handleResetRequest}>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit">Send Reset Link</button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <div>
            <label>New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Reset Password</button>
        </form>
      )}
      
      <p>Remember your password? <a href="/login">Login</a></p>
    </div>
  );
}

export default ResetPasswordPage; 