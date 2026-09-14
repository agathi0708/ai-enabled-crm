import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (formData) => {
    try {
      await login(formData);

      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);

      alert(
        error.response?.data?.error?.message ||
          "Invalid email or password"
      );
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
          Welcome back
        </h1>

        <p className="auth-subtitle">
          Sign in to manage your contacts, deals,
          tasks and CRM activities.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>

          <div className="form-group">
            <label className="form-label">
              Email
            </label>

            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
              })}
            />

            {errors.email && (
              <p className="form-error">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Password
            </label>

            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              {...register("password", {
                required: "Password is required",
              })}
            />

            {errors.password && (
              <p className="form-error">
                {errors.password.message}
              </p>
            )}
          </div>

          <div
            style={{
              textAlign: "right",
              marginBottom: "16px",
            }}
          >
            <button
              type="button"
              className="auth-link"
              onClick={() =>
                navigate("/forgot-password")
              }
              style={{
                border: "none",
                background: "none",
                padding: 0,
                cursor: "pointer",
              }}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Signing in..."
              : "Sign in"}
          </button>

        </form>

        <div className="auth-footer">
          Don't have an account?

          <button
            type="button"
            className="auth-link"
            onClick={() =>
              navigate("/register")
            }
            style={{
              border: "none",
              background: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            Create an account
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;