import { useState } from "react";
import { Link } from "react-router-dom";

import { requestPasswordReset } from "../services/authService";


function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [message, setMessage] = useState("");
  const [resetToken, setResetToken] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setResetToken("");
    setError("");
    setLoading(true);

    try {
      const data = await requestPasswordReset(email);

      setMessage(data.message);

      // Development/testing only.
      // Production should send this token by email.
      if (data.reset_token) {
        setResetToken(data.reset_token);
      }

    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Unable to process password reset request.";

      setError(message);

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-container">
      <div className="auth-card">

        <h1>AI CRM</h1>

        <h2>Forgot Password</h2>


        {error && (
          <p className="error-message">
            {error}
          </p>
        )}


        {message && (
          <p className="success-message">
            {message}
          </p>
        )}


        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your registered email"
              required
            />

          </div>


          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Generating..."
              : "Reset Password"}
          </button>

        </form>


        {resetToken && (
          <div>
            <p>
              <strong>
                Development Reset Token:
              </strong>
            </p>

            <textarea
              value={resetToken}
              readOnly
              rows="5"
              style={{
                width: "100%",
                wordBreak: "break-all",
              }}
            />

            <p>
              Copy this token and use it on the
              Reset Password page.
            </p>

            <Link to="/reset-password">
              Go to Reset Password
            </Link>
          </div>
        )}


        <p>
          Remember your password?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}


export default ForgotPassword;