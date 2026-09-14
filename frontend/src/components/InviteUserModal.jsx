import { useForm } from "react-hook-form";
import Button from "./Button";

const InviteUserModal = ({
  isOpen,
  onClose,
  onInvite,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      role: "rep",
    },
  });

  if (!isOpen) {
    return null;
  }

  const submitForm = async (data) => {
    const success = await onInvite(data);

    if (success) {
      reset();
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <p className="modal-eyebrow">
              USER MANAGEMENT
            </p>

            <h2>Invite User</h2>

            <p>
              Add a new member to your CRM workspace.
            </p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit(submitForm)}
          className="modal-form"
        >
          <div className="form-field">
            <label htmlFor="invite-name">
              Full name
            </label>

            <input
              id="invite-name"
              type="text"
              placeholder="Enter full name"
              {...register("name", {
                required: "Name is required",
              })}
            />

            {errors.name && (
              <span className="field-error">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="invite-email">
              Email address
            </label>

            <input
              id="invite-email"
              type="email"
              placeholder="name@company.com"
              {...register("email", {
                required: "Email is required",
              })}
            />

            {errors.email && (
              <span className="field-error">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="invite-role">
              Role
            </label>

            <select
              id="invite-role"
              {...register("role")}
            >
              <option value="rep">
                Sales Rep
              </option>

              <option value="manager">
                Sales Manager
              </option>

              <option value="admin">
                Admin
              </option>

              <option value="viewer">
                Viewer
              </option>
            </select>
          </div>

          <div className="modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
            >
              {isLoading
                ? "Inviting..."
                : "Send Invitation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteUserModal;