import { useEffect, useMemo, useState } from "react";
import { getContacts } from "../../api/contacts";
import ContactsTable from "./ContactsTable";
import ContactForm from "./ContactForm";
import ContactDetail from "./ContactDetail";
import ImportContacts from "./ImportContacts";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "new", label: "New" },
  { value: "hot", label: "Hot" },
  { value: "warm", label: "Warm" },
  { value: "cold", label: "Cold" },
  { value: "converted", label: "Converted" },
];

function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [status, setStatus] = useState("");
  const [tag, setTag] = useState("");

  const [showContactForm, setShowContactForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    async function loadContacts() {
      try {
        setLoading(true);
        setError("");

        const result = await getContacts({
          page,
          limit: PAGE_SIZE,
          status,
          tag: tag.trim(),
          search: debouncedSearch,
        });

        if (cancelled) {
          return;
        }

        setContacts(result.data || []);
        setTotal(result.meta?.total || 0);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Failed to load contacts"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadContacts();

    return () => {
      cancelled = true;
    };
  }, [page, status, tag, debouncedSearch, refreshKey]);

  const totalPages = Math.max(
    Math.ceil(total / PAGE_SIZE),
    1
  );

  const visibleTags = useMemo(() => {
    const tags = new Set();

    contacts.forEach((contact) => {
      (contact.tags || []).forEach((contactTag) => {
        tags.add(contactTag);
      });
    });

    return Array.from(tags).sort();
  }, [contacts]);

  function handleStatusChange(event) {
    setStatus(event.target.value);
    setPage(1);
  }

  function handleTagChange(event) {
    setTag(event.target.value);
    setPage(1);
  }

  function goToPreviousPage() {
    setPage((currentPage) =>
      Math.max(currentPage - 1, 1)
    );
  }

  function goToNextPage() {
    setPage((currentPage) =>
      Math.min(currentPage + 1, totalPages)
    );
  }

  function clearFilters() {
    setSearch("");
    setStatus("");
    setTag("");
    setPage(1);
  }

  function handleContactCreated(contact) {
    setShowContactForm(false);

    clearFilters();

    setContacts((currentContacts) => [
      contact,
      ...currentContacts,
    ]);

    setTotal((currentTotal) => currentTotal + 1);
  }

  function handleContactSelect(contact) {
    setSelectedContact(contact);
  }

  function handleBackToContacts() {
    setSelectedContact(null);
  }

  function handleImportFinished() {
    clearFilters();

    setRefreshKey((currentKey) => currentKey + 1);
  }

  if (selectedContact) {
    return (
      <ContactDetail
        contact={selectedContact}
        onBack={handleBackToContacts}
        onUpdated={(updatedContact) => {
          setSelectedContact(updatedContact);

          setContacts((currentContacts) =>
            currentContacts.map((contact) =>
              contact.id === updatedContact.id
                ? updatedContact
                : contact
            )
          );
        }}
        onDeleted={(deletedContact) => {
          setContacts((currentContacts) =>
            currentContacts.filter(
              (contact) =>
                contact.id !== deletedContact.id
            )
          );

          setTotal((currentTotal) =>
            Math.max(currentTotal - 1, 0)
          );

          setSelectedContact(null);
        }}
      />
    );
  }

  return (
    <section className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
              Contacts
            </span>

            <span className="text-sm text-slate-400">
              {total} total
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Contacts
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your customers and leads from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowContactForm(true)}
          className="add-contact-button"
        >
          + Add Contact
        </button>
      </div>

      {/* Toolbar */}
      <div className="contacts-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="contacts-search relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by contact or company..."
              className="pl-11"
            />
          </div>

          <select
            value={status}
            onChange={handleStatusChange}
            aria-label="Filter by status"
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

          <select
            value={tag}
            onChange={handleTagChange}
            aria-label="Filter by tag"
          >
            <option value="">All Tags</option>

            {visibleTags.map((tagOption) => (
              <option
                key={tagOption}
                value={tagOption}
              >
                {tagOption}
              </option>
            ))}
          </select>

          {(search || status || tag) && (
            <button
              type="button"
              onClick={clearFilters}
              className="h-11 rounded-xl px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowImportForm(true)}
            className="import-button"
          >
            Import CSV
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="contacts-error">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="contacts-card">
        {loading ? (
          <div className="contacts-state">
            <div className="text-sm font-medium text-slate-600">
              Loading contacts...
            </div>

            <div className="mt-1 text-sm text-slate-400">
              Getting the latest CRM records.
            </div>
          </div>
        ) : (
          <ContactsTable
  contacts={contacts}
  onRowClick={handleContactSelect}
  onContactUpdated={(updatedContact) => {
    setContacts((currentContacts) =>
      currentContacts.map((contact) =>
        contact.id === updatedContact.id
          ? updatedContact
          : contact
      )
    );

    if (
      selectedContact?.id === updatedContact.id
    ) {
      setSelectedContact(updatedContact);
    }
  }}
  onError={(message) => {
    setError(message);

    setTimeout(() => {
      setError("");
    }, 4000);
  }}
/>
        )}

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {(page - 1) * PAGE_SIZE + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-700">
                {Math.min(page * PAGE_SIZE, total)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {total}
              </span>{" "}
              contacts
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPreviousPage}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              <div className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700">
                {page}
              </div>

              <button
                type="button"
                onClick={goToNextPage}
                disabled={page >= totalPages}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showContactForm && (
        <ContactForm
          onCancel={() => setShowContactForm(false)}
          onCreated={handleContactCreated}
        />
      )}

      {/* Import Contacts Modal */}
      {showImportForm && (
        <ImportContacts
          onClose={() => setShowImportForm(false)}
          onImported={handleImportFinished}
        />
      )}
    </section>
  );
}

export default ContactsPage;