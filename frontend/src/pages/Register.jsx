import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (formData) => {
    try {
      await registerUser(formData);

      alert("Registration successful. Please login.");
      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);

      alert(
        error.response?.data?.error?.message ||
          "Registration failed"
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-icon">
            C
          </div>

          <div className="auth-brand-name">
            AI-Enabled CRM
          </div>
        </div>

        {/* Heading */}
        <h1 className="auth-title">
          Create your account
        </h1>

        <p className="auth-subtitle">
          Get started with your CRM workspace and
          manage your customer relationships.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Name */}
          <div className="form-group">
            <label className="form-label">
              Full name
            </label>

            <input
              type="text"
              className="form-input"
              placeholder="Enter your full name"
              {...register("name", {
                required: "Name is required",
              })}
            />

            {errors.name && (
              <p className="form-error">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">
              Email address
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

          {/* Password */}
          <div className="form-group">
            <label className="form-label">
              Password
            </label>

            <input
              type="password"
              className="form-input"
              placeholder="Create a strong password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message:
                    "Password must be at least 8 characters",
                },
              })}
            />

            {errors.password && (
              <p className="form-error">
                {errors.password.message}
              </p>
            )}

            <p
              style={{
                marginTop: "7px",
                marginBottom: 0,
                fontSize: "12px",
                color: "#98a2b3",
              }}
            >
              Use at least 8 characters.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="primary-button"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Creating account..."
              : "Create account"}
          </button>

        </form>

        {/* Login link */}
        <div className="auth-footer">
          Already have an account?

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
            Sign in
          </button>
        </div>

      </div>
    </div>
  );
};

export default Register;