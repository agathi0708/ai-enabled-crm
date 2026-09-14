import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestPasswordReset } from "../features/auth/authApi";
import Button from "../components/Button";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setResetToken("");
    setIsLoading(true);

    try {
      const response = await requestPasswordReset(email);

      setMessage(response.data.message);

      if (response.data.resetToken) {
        setResetToken(response.data.resetToken);
      }
    } catch (error) {
      setError(
        error.response?.data?.error?.message ||
          error.response?.data?.detail ||
          "Unable to process password reset request."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetLink = resetToken
    ? `${window.location.origin}/reset-password?token=${encodeURIComponent(
        resetToken
      )}`
    : "";

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <p className="auth-eyebrow">
            ACCOUNT RECOVERY
          </p>

          <h1>Forgot Password?</h1>

          <p>
            Enter your email address to reset your password.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >
          <div className="form-field">
            <label htmlFor="email">
              Email address
            </label>

            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />
          </div>

          {error && (
            <p className="field-error">
              {error}
            </p>
          )}

          {message && (
            <p>
              {message}
            </p>
          )}

          {resetLink && (
            <div className="form-field">
              <label htmlFor="reset-link">
                Development Reset Link
              </label>

              <input
                id="reset-link"
                type="text"
                value={resetLink}
                readOnly
              />

              <button
                type="button"
                className="auth-link"
                onClick={() =>
                  navigate(
                    `/reset-password?token=${encodeURIComponent(
                      resetToken
                    )}`
                  )
                }
                style={{
                  border: "none",
                  background: "none",
                  padding: 0,
                  cursor: "pointer",
                  marginTop: "8px",
                }}
              >
                Open Reset Password
              </button>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
          >
            {isLoading
              ? "Sending..."
              : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;