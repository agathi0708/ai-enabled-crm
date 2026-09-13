import { useState } from "react";

import {
  inviteUser,
  deactivateUser,
} from "../services/authService";

import { useAuth } from "../context/AuthContext";


function AdminUsers() {
  const {
    accessToken,
  } = useAuth();


  // =========================
  // INVITE USER FORM
  // =========================

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "rep",
  });


  // =========================
  // UI STATES
  // =========================

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  // =========================
  // DEACTIVATE USER
  // =========================

  const [userId, setUserId] = useState("");
  const [deactivateLoading, setDeactivateLoading] =
    useState(false);


  // =========================
  // FORM INPUT CHANGE
  // =========================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // =========================
  // INVITE USER
  // =========================

  const handleInvite = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const data = await inviteUser(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
        accessToken
      );

      setMessage(
        `User "${data.name}" was created successfully.`
      );

      // Clear form after successful invitation
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "rep",
      });

    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        "Unable to invite user.";

      setError(errorMessage);

    } finally {
      setLoading(false);
    }
  };


  // =========================
  // DEACTIVATE USER
  // =========================

  const handleDeactivate = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");


    if (!userId) {
      setError("Please enter a user ID.");
      return;
    }


    setDeactivateLoading(true);

    try {
      const data = await deactivateUser(
        userId,
        accessToken
      );

      setMessage(
        data.message ||
        `User ${userId} was deactivated successfully.`
      );

      setUserId("");

    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        "Unable to deactivate user.";

      setError(errorMessage);

    } finally {
      setDeactivateLoading(false);
    }
  };


  return (
    <div className="auth-container">

      <div
        className="auth-card"
        style={{
          maxWidth: "500px",
        }}
      >

        <h1>
          AI CRM
        </h1>

        <h2>
          Admin User Management
        </h2>


        {/* =========================
            SUCCESS MESSAGE
        ========================= */}

        {message && (
          <p className="success-message">
            {message}
          </p>
        )}


        {/* =========================
            ERROR MESSAGE
        ========================= */}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}


        {/* =========================
            INVITE USER
        ========================= */}

        <h3>
          Invite User
        </h3>


        <form onSubmit={handleInvite}>

          <div className="form-group">

            <label htmlFor="name">
              Name
            </label>

            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter user name"
              minLength={2}
              required
            />

          </div>


          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter user email"
              required
            />

          </div>


          <div className="form-group">

            <label htmlFor="password">
              Temporary Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              minLength={8}
              required
            />

          </div>


          <div className="form-group">

            <label htmlFor="role">
              Role
            </label>

            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                fontSize: "15px",
              }}
            >

              <option value="rep">
                Rep
              </option>

              <option value="manager">
                Manager
              </option>

              <option value="admin">
                Admin
              </option>

              <option value="viewer">
                Viewer
              </option>

            </select>

          </div>


          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating User..."
              : "Invite User"}
          </button>

        </form>


        {/* =========================
            SEPARATOR
        ========================= */}

        <hr
          style={{
            margin: "30px 0",
          }}
        />


        {/* =========================
            DEACTIVATE USER
        ========================= */}

        <h3>
          Deactivate User
        </h3>


        <form onSubmit={handleDeactivate}>

          <div className="form-group">

            <label htmlFor="userId">
              User ID
            </label>

            <input
              id="userId"
              type="number"
              value={userId}
              onChange={(event) =>
                setUserId(event.target.value)
              }
              placeholder="Enter user ID"
              min="1"
              required
            />

          </div>


          <button
            type="submit"
            disabled={deactivateLoading}
          >
            {deactivateLoading
              ? "Deactivating..."
              : "Deactivate User"}
          </button>

        </form>


        {/* =========================
            BACK TO DASHBOARD
        ========================= */}

        <p>
          <a href="/dashboard">
            Back to Dashboard
          </a>
        </p>

      </div>

    </div>
  );
}


export default AdminUsers;