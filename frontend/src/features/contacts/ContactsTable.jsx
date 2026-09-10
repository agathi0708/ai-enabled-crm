import { useState } from "react";
import { updateContact } from "../../api/contacts";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "hot", label: "Hot" },
  { value: "warm", label: "Warm" },
  { value: "cold", label: "Cold" },
  { value: "converted", label: "Converted" },
];

function getStatusClass(status) {
  return `status-badge status-${status}`;
}

function ContactsTable({
  contacts,
  onRowClick,
  onContactUpdated,
  onError,
}) {
  const [updatingId, setUpdatingId] = useState(null);

  async function handleStatusChange(event, contact) {
    event.stopPropagation();

    const newStatus = event.target.value;
    const previousStatus = contact.status;

    if (newStatus === previousStatus) {
      return;
    }

    // Optimistic update:
    // update the UI immediately before the API call completes.
    onContactUpdated?.({
      ...contact,
      status: newStatus,
    });

    setUpdatingId(contact.id);

    try {
      const result = await updateContact(contact.id, {
        status: newStatus,
      });

      const updatedContact = result.data;

      // Replace the optimistic value with the
      // authoritative response from the backend.
      onContactUpdated?.(updatedContact);
    } catch (error) {
      // Roll back to the previous status if the API fails.
      onContactUpdated?.({
        ...contact,
        status: previousStatus,
      });

      onError?.(
        error.message || "Failed to update contact status"
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (!contacts.length) {
    return (
      <div className="contacts-empty">
        <div className="contacts-empty-icon">👥</div>

        <h3>No contacts found</h3>

        <p>
          Try changing your search or filters, or add a new
          contact.
        </p>
      </div>
    );
  }

  return (
    <div className="contacts-table-wrapper">
      <table className="contacts-table">
        <thead>
          <tr>
            <th>Contact</th>
            <th>Company</th>
            <th>Status</th>
            <th>Tags</th>
            <th>Phone</th>
            <th>Source</th>
          </tr>
        </thead>

        <tbody>
          {contacts.map((contact) => (
            <tr
              key={contact.id}
              onClick={() => onRowClick?.(contact)}
              className="contacts-row"
            >
              {/* Contact */}
              <td>
                <div className="contact-primary">
                  <div className="contact-avatar">
                    {contact.name
                      ?.charAt(0)
                      ?.toUpperCase() || "?"}
                  </div>

                  <div>
                    <div className="contact-name">
                      {contact.name}
                    </div>

                    <div className="contact-email">
                      {contact.email || "No email"}
                    </div>
                  </div>
                </div>
              </td>

              {/* Company */}
              <td>
                <span className="company-name">
                  {contact.company || "—"}
                </span>
              </td>

              {/* Status */}
              <td onClick={(event) => event.stopPropagation()}>
                <select
                  value={contact.status || "new"}
                  onChange={(event) =>
                    handleStatusChange(event, contact)
                  }
                  disabled={updatingId === contact.id}
                  aria-label={`Change status for ${contact.name}`}
                  className={`${getStatusClass(
                    contact.status
                  )} cursor-pointer border-0 outline-none`}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>

                {updatingId === contact.id && (
                  <span className="ml-2 text-xs text-slate-400">
                    Saving...
                  </span>
                )}
              </td>

              {/* Tags */}
              <td>
                <div className="contact-tags">
                  {contact.tags?.length ? (
                    contact.tags.map((tag) => (
                      <span
                        className="tag-badge"
                        key={tag}
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="muted-text">
                      —
                    </span>
                  )}
                </div>
              </td>

              {/* Phone */}
              <td>
                <span className="contact-phone">
                  {contact.phone || "—"}
                </span>
              </td>

              {/* Source */}
              <td>
                <span className="source-text">
                  {contact.source || "—"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ContactsTable;