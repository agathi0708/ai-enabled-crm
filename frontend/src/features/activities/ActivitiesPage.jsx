import { useEffect, useState } from "react";

import { getContacts } from "../../api/contacts";

import {
    getContactActivities,
    createActivity,
    deleteActivity,
} from "../../api/activities";

const ACTIVITY_TYPES = [
    {
        value: "note",
        label: "Note",
        icon: "📝",
    },
    {
        value: "call",
        label: "Call",
        icon: "📞",
    },
    {
        value: "email",
        label: "Email",
        icon: "✉",
    },
    {
        value: "meeting",
        label: "Meeting",
        icon: "📅",
    },
];

function formatDateTime(dateValue) {
    if (!dateValue) {
        return "—";
    }

    return new Date(dateValue).toLocaleString(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }
    );
}

function getActivityMeta(type) {
    return (
        ACTIVITY_TYPES.find(
            (item) => item.value === type
        ) || {
            value: type,
            label: type,
            icon: "•",
        }
    );
}

function ActivitiesPage() {
    const [contacts, setContacts] = useState([]);
    const [selectedContactId, setSelectedContactId] =
        useState("");

    const [activities, setActivities] =
        useState([]);

    const [contactsLoading, setContactsLoading] =
        useState(true);

    const [activitiesLoading, setActivitiesLoading] =
        useState(false);

    const [error, setError] = useState("");

    const [activityType, setActivityType] =
        useState("note");

    const [activityNotes, setActivityNotes] =
        useState("");

    const [creating, setCreating] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState("");

    const [formError, setFormError] =
        useState("");

    const [expandedActivityId, setExpandedActivityId] =
        useState(null);

    /*
     * Load contacts.
     */
    useEffect(() => {
        let cancelled = false;

        async function loadContacts() {
            try {
                setContactsLoading(true);
                setError("");

                const result = await getContacts({
                    page: 1,
                    limit: 100,
                });

                if (cancelled) {
                    return;
                }

                const loadedContacts =
                    result?.data || [];

                setContacts(loadedContacts);

                if (loadedContacts.length > 0) {
                    setSelectedContactId(
                        loadedContacts[0].id
                    );
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.message ||
                        "Failed to load contacts."
                    );
                }
            } finally {
                if (!cancelled) {
                    setContactsLoading(false);
                }
            }
        }

        loadContacts();

        return () => {
            cancelled = true;
        };
    }, []);

    /*
     * Load activities whenever the
     * selected contact changes.
     */
    useEffect(() => {
        let cancelled = false;

        async function loadActivities() {
            if (!selectedContactId) {
                setActivities([]);
                return;
            }

            try {
                setActivitiesLoading(true);
                setError("");

                const result =
                    await getContactActivities(
                        selectedContactId,
                        {
                            page: 1,
                            limit: 100,
                        }
                    );

                if (!cancelled) {
                    setActivities(
                        result?.data || []
                    );
                }
            } catch (err) {
                if (!cancelled) {
                    setActivities([]);
                    setError(
                        err.message ||
                        "Failed to load activities."
                    );
                }
            } finally {
                if (!cancelled) {
                    setActivitiesLoading(false);
                }
            }
        }

        loadActivities();

        return () => {
            cancelled = true;
        };
    }, [selectedContactId]);

    async function handleCreateActivity(event) {
        event.preventDefault();

        const notes =
            activityNotes.trim();

        if (!selectedContactId) {
            setFormError(
                "Please select a contact."
            );
            return;
        }

        if (!notes) {
            setFormError(
                "Please enter activity notes."
            );
            return;
        }

        try {
            setCreating(true);
            setFormError("");

            const result =
                await createActivity({
                    contact_id:
                        selectedContactId,
                    type: activityType,
                    notes,
                });

            const createdActivity =
                result?.data;

            if (createdActivity) {
                setActivities(
                    (current) => [
                        createdActivity,
                        ...current,
                    ]
                );
            }

            setActivityNotes("");
            setActivityType("note");
        } catch (err) {
            setFormError(
                err.message ||
                "Failed to create activity."
            );
        } finally {
            setCreating(false);
        }
    }

    async function handleDeleteActivity(
        activityId
    ) {
        if (!activityId) {
            return;
        }

        const confirmed =
            window.confirm(
                "Delete this activity?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(activityId);
            setError("");

            await deleteActivity(
                activityId
            );

            setActivities(
                (current) =>
                    current.filter(
                        (activity) =>
                            activity.id !==
                            activityId
                    )
            );

            if (
                expandedActivityId ===
                activityId
            ) {
                setExpandedActivityId(null);
            }
        } catch (err) {
            setError(
                err.message ||
                "Failed to delete activity."
            );
        } finally {
            setDeletingId("");
        }
    }

    const selectedContact =
        contacts.find(
            (contact) =>
                contact.id ===
                selectedContactId
        );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                        Workspace
                    </span>

                    <span className="text-sm text-slate-400">
                        CRM Activity
                    </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Activities
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Track calls, emails, meetings,
                    and notes for your contacts.
                </p>
            </div>

            {/* Contact selector */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <label
                    htmlFor="activity-contact"
                    className="block text-sm font-semibold text-slate-700"
                >
                    Select Contact
                </label>

                <div className="mt-2">
                    {contactsLoading ? (
                        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                            Loading contacts...
                        </div>
                    ) : contacts.length === 0 ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                            No contacts are available.
                        </div>
                    ) : (
                        <select
                            id="activity-contact"
                            value={selectedContactId}
                            onChange={(event) =>
                                setSelectedContactId(
                                    event.target.value
                                )
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        >
                            {contacts.map(
                                (contact) => (
                                    <option
                                        key={
                                            contact.id
                                        }
                                        value={
                                            contact.id
                                        }
                                    >
                                        {
                                            contact.name
                                        }
                                        {contact.company
                                            ? ` — ${contact.company}`
                                            : ""}
                                    </option>
                                )
                            )}
                        </select>
                    )}
                </div>

                {selectedContact && (
                    <p className="mt-2 text-xs text-slate-400">
                        Showing activity history for{" "}
                        <span className="font-medium text-slate-600">
                            {selectedContact.name}
                        </span>
                        .
                    </p>
                )}
            </section>

            {/* Add Activity */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        Add Activity
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Record a new interaction with the
                        selected contact.
                    </p>
                </div>

                <form
                    onSubmit={
                        handleCreateActivity
                    }
                    className="mt-5 space-y-4"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label>
                            <span className="mb-1 block text-sm font-medium text-slate-700">
                                Activity Type
                            </span>

                            <select
                                value={activityType}
                                onChange={(event) =>
                                    setActivityType(
                                        event.target
                                            .value
                                    )
                                }
                                disabled={
                                    creating ||
                                    !selectedContactId
                                }
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                            >
                                {ACTIVITY_TYPES.map(
                                    (type) => (
                                        <option
                                            key={
                                                type.value
                                            }
                                            value={
                                                type.value
                                            }
                                        >
                                            {type.icon}{" "}
                                            {type.label}
                                        </option>
                                    )
                                )}
                            </select>
                        </label>

                        <div className="rounded-xl bg-slate-50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Contact
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-800">
                                {selectedContact
                                    ?.name ||
                                    "Select a contact"}
                            </p>
                        </div>
                    </div>

                    <label>
                        <span className="mb-1 block text-sm font-medium text-slate-700">
                            Notes
                        </span>

                        <textarea
                            value={activityNotes}
                            onChange={(event) =>
                                setActivityNotes(
                                    event.target.value
                                )
                            }
                            disabled={
                                creating ||
                                !selectedContactId
                            }
                            placeholder="Describe the interaction or add an important note..."
                            className="min-h-[120px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                        />
                    </label>

                    {formError && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {formError}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={
                                creating ||
                                !selectedContactId ||
                                !activityNotes.trim()
                            }
                            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {creating
                                ? "Saving..."
                                : "Add Activity"}
                        </button>
                    </div>
                </form>
            </section>

            {/* Activity History */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Activity History
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {activities.length}{" "}
                            recorded{" "}
                            {activities.length ===
                                1
                                ? "activity"
                                : "activities"}
                        </p>
                    </div>
                </div>

                <div className="mt-5">
                    {error && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {activitiesLoading ? (
                        <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                            Loading activity history...
                        </div>
                    ) : activities.length ===
                        0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
                            <div className="text-3xl">
                                ◷
                            </div>

                            <p className="mt-3 font-medium text-slate-700">
                                No activities yet
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Add a call, email,
                                meeting, or note above.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activities.map(
                                (activity) => {
                                    const meta =
                                        getActivityMeta(
                                            activity.type
                                        );

                                    const expanded =
                                        expandedActivityId ===
                                        activity.id;

                                    return (
                                        <div
                                            key={
                                                activity.id
                                            }
                                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-lg shadow-sm">
                                                    {
                                                        meta.icon
                                                    }
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h3 className="font-semibold capitalize text-slate-900">
                                                                    {
                                                                        meta.label
                                                                    }
                                                                </h3>

                                                                <span className="rounded-full bg-indigo-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                                                                    {
                                                                        activity.type
                                                                    }
                                                                </span>
                                                            </div>

                                                            <p className="mt-1 text-xs text-slate-400">
                                                                {formatDateTime(
                                                                    activity.created_at
                                                                )}
                                                            </p>
                                                        </div>

                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setExpandedActivityId(
                                                                        expanded
                                                                            ? null
                                                                            : activity.id
                                                                    )
                                                                }
                                                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                                            >
                                                                {expanded
                                                                    ? "Hide Details"
                                                                    : "View Details"}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDeleteActivity(
                                                                        activity.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    deletingId ===
                                                                    activity.id
                                                                }
                                                                className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                            >
                                                                {deletingId ===
                                                                    activity.id
                                                                    ? "Deleting..."
                                                                    : "Delete"}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="mt-3 text-sm leading-6 text-slate-700">
                                                        {
                                                            activity.notes
                                                        }
                                                    </p>

                                                    {expanded && (
                                                        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                                                            <div className="grid gap-3 text-sm sm:grid-cols-2">
                                                                <div>
                                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                        Activity ID
                                                                    </p>

                                                                    <p className="mt-1 break-all text-slate-700">
                                                                        {
                                                                            activity.id
                                                                        }
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                        Contact ID
                                                                    </p>

                                                                    <p className="mt-1 break-all text-slate-700">
                                                                        {
                                                                            activity.contact_id
                                                                        }
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                        Type
                                                                    </p>

                                                                    <p className="mt-1 capitalize text-slate-700">
                                                                        {
                                                                            activity.type
                                                                        }
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                        Created
                                                                    </p>

                                                                    <p className="mt-1 text-slate-700">
                                                                        {formatDateTime(
                                                                            activity.created_at
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default ActivitiesPage;