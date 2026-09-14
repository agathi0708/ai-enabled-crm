import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmPasswordReset } from "../features/auth/authApi";
import Button from "../components/Button";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [token, setToken] = useState(
    searchParams.get("token") || ""
  );

  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await confirmPasswordReset(
        token,
        newPassword
      );

      setMessage(response.data.message);

      setToken("");
      setNewPassword("");
    } catch (error) {
      setError(
        error.response?.data?.error?.message ||
          error.response?.data?.detail ||
          "Unable to reset password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-brand">
          <div className="auth-brand-icon">
            C
          </div>

          <div className="auth-brand-name">
            AI-Enabled CRM
          </div>
        </div>

        <h1 className="auth-title">
          Reset Password
        </h1>

        <p className="auth-subtitle">
          Enter your reset token and choose a new password.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label className="form-label">
              Reset Token
            </label>

            <textarea
              className="form-input"
              placeholder="Paste your reset token"
              value={token}
              onChange={(event) =>
                setToken(event.target.value)
              }
              required
              rows={4}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              New Password
            </label>

            <input
              type="password"
              className="form-input"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              required
              minLength={8}
            />
          </div>

          {error && (
            <p className="form-error">
              {error}
            </p>
          )}

          {message && (
            <p>
              {message}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
          >
            {isLoading
              ? "Resetting..."
              : "Reset Password"}
          </Button>

        </form>

        <div className="auth-footer">
          Remember your password?

          <button
            type="button"
            className="auth-link"
            onClick={() => navigate("/login")}
            style={{
              border: "none",
              background: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            Back to Login
          </button>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;