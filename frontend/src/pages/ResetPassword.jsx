import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { resetPassword } from "../services/authService";


function ResetPassword() {
  const navigate = useNavigate();

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");


    // Check passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }


    // Check password length
    if (newPassword.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }


    setLoading(true);


    try {
      const data = await resetPassword(
        token,
        newPassword
      );

      setSuccess(data.message);

      setToken("");
      setNewPassword("");
      setConfirmPassword("");


      // Redirect to login after successful reset
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Password reset failed.";

      setError(message);

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-container">
      <div className="auth-card">

        <h1>AI CRM</h1>

        <h2>Reset Password</h2>


        {error && (
          <p className="error-message">
            {error}
          </p>
        )}


        {success && (
          <p className="success-message">
            {success}
          </p>
        )}


        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label htmlFor="token">
              Reset Token
            </label>

            <textarea
              id="token"
              value={token}
              onChange={(event) =>
                setToken(event.target.value)
              }
              placeholder="Paste your reset token"
              rows="5"
              required
              style={{
                width: "100%",
                wordBreak: "break-all",
              }}
            />

          </div>


          <div className="form-group">

            <label htmlFor="newPassword">
              New Password
            </label>

            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              placeholder="Enter new password"
              minLength={8}
              required
            />

          </div>


          <div className="form-group">

            <label htmlFor="confirmPassword">
              Confirm New Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Confirm new password"
              minLength={8}
              required
            />

          </div>


          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}
          </button>

        </form>


        <p>
          <Link to="/login">
            Back to Login
          </Link>
        </p>

      </div>
    </div>
  );
}


export default ResetPassword;