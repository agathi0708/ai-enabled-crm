import { useEffect, useState } from "react";
import { updateContact } from "../../api/contacts";

const STATUS_OPTIONS = [
  {
    value: "new",
    label: "New",
  },
  {
    value: "hot",
    label: "Hot",
  },
  {
    value: "warm",
    label: "Warm",
  },
  {
    value: "cold",
    label: "Cold",
  },
  {
    value: "converted",
    label: "Converted",
  },
];

function EditContactForm({
  contact,
  onCancel,
  onUpdated,
}) {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    status: "new",
    tags: "",
    source: "",
    notes: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!contact) {
      return;
    }

    setForm({
      name: contact.name || "",
      company: contact.company || "",
      email: contact.email || "",
      phone: contact.phone || "",
      status: contact.status || "new",
      tags: (contact.tags || []).join(", "),
      source: contact.source || "",
      notes: contact.notes || "",
    });

    setError("");
  }, [contact]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!contact?.id) {
      setError("Contact ID is missing.");
      return;
    }

    const name = form.name.trim();

    if (!name) {
      setError("Contact name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      /*
       * ownerId is intentionally not included.
       *
       * Ownership is controlled by the backend using
       * the authenticated user's JWT.
       */
      const result = await updateContact(
        contact.id,
        {
          name,
          company:
            form.company.trim() || null,
          email:
            form.email.trim() || null,
          phone:
            form.phone.trim() || null,
          status: form.status,

          tags: form.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),

          source:
            form.source.trim() || null,

          notes:
            form.notes.trim() || null,
        }
      );

      onUpdated?.(result.data);
    } catch (err) {
      setError(
        err.message ||
          "Failed to update contact"
      );
    } finally {
      setSaving(false);
    }
  }

  if (!contact) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

        {/* Header */}
        <div className="shrink-0 border-b border-slate-200 px-6 py-5 lg:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                Contact Profile
              </div>

              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Edit Contact
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Update the information for{" "}
                <span className="font-medium text-slate-700">
                  {contact.name}
                </span>
                .
              </p>
            </div>

            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              aria-label="Close edit form"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 lg:px-7">
            <div className="grid gap-5 md:grid-cols-2">

              {/* Name */}
              <div>
                <label
                  htmlFor="edit-name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Name *
                </label>

                <input
                  id="edit-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  maxLength={120}
                  placeholder="Enter contact name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              {/* Company */}
              <div>
                <label
                  htmlFor="edit-company"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Company
                </label>

                <input
                  id="edit-company"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Company name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="edit-email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email
                </label>

                <input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="edit-phone"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Phone
                </label>

                <input
                  id="edit-phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="edit-status"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Status
                </label>

                <select
                  id="edit-status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                >
                  {STATUS_OPTIONS.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Source */}
              <div>
                <label
                  htmlFor="edit-source"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Source
                </label>

                <input
                  id="edit-source"
                  name="source"
                  value={form.source}
                  onChange={handleChange}
                  placeholder="Website, referral..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              {/* Tags */}
              <div className="md:col-span-2">
                <label
                  htmlFor="edit-tags"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Tags
                </label>

                <input
                  id="edit-tags"
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="enterprise, priority"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Separate multiple tags with commas.
                </p>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label
                  htmlFor="edit-notes"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Notes
                </label>

                <textarea
                  id="edit-notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Add useful notes..."
                  className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                />
              </div>
            </div>

            {/* Security note */}
            <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
              <div className="flex gap-3">
                <div className="mt-0.5 text-indigo-600">
                  ✓
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                    Secure update
                  </p>

                  <p className="mt-1 text-xs leading-5 text-indigo-700/80">
                    This contact remains owned by the
                    currently authenticated CRM user.
                  </p>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                <div className="flex gap-3">
                  <span className="text-red-500">
                    ⚠
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      Unable to update contact
                    </p>

                    <p className="mt-1 text-sm leading-6 text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-slate-50/70 px-6 py-4 lg:px-7">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditContactForm;