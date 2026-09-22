import { useEffect, useState } from "react";

import {
  convertContactToDeal,
  deleteContact,
  getContactById,
} from "../../api/contacts";

import {
  createActivity,
  getContactActivities,
  deleteActivity,
} from "../../api/activities";

import EditContactForm from "./EditContactForm";
import AIAssistantPanel from "../ai-assistant/AIAssistantPanel";

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

function formatDate(dateValue) {
  if (!dateValue) {
    return "—";
  }

  return new Date(dateValue).toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

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

function ContactDetail({
  contact,
  onBack,
  onUpdated,
  onDeleted,
}) {
  const [fullContact, setFullContact] =
    useState(contact);

  const [activitySummary, setActivitySummary] =
    useState({
      total: Number(
        contact?.activity_summary?.total || 0
      ),
      calls: Number(
        contact?.activity_summary?.calls || 0
      ),
      emails: Number(
        contact?.activity_summary?.emails || 0
      ),
      meetings: Number(
        contact?.activity_summary?.meetings || 0
      ),
      notes: Number(
        contact?.activity_summary?.notes || 0
      ),
      lastActivityAt:
        contact?.activity_summary
          ?.last_activity_at || null,
    });

  const [showEditForm, setShowEditForm] =
    useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [detailsLoading, setDetailsLoading] =
    useState(true);

  const [detailsError, setDetailsError] =
    useState("");

  const [activities, setActivities] =
    useState([]);

  const [activitiesLoading, setActivitiesLoading] =
    useState(true);

  const [activitiesError, setActivitiesError] =
    useState("");

  const [showActivityForm, setShowActivityForm] =
    useState(false);

  const [activityType, setActivityType] =
    useState("note");

  const [activityNotes, setActivityNotes] =
    useState("");

  const [creatingActivity, setCreatingActivity] =
    useState(false);

  const [activityFormError, setActivityFormError] =
    useState("");

  /*
   * Activity deletion state.
   */
  const [activityToDelete, setActivityToDelete] =
    useState(null);

  const [deletingActivity, setDeletingActivity] =
    useState(false);

  /*
   * Lead → Deal conversion state.
   */
  const [
    showConvertConfirm,
    setShowConvertConfirm,
  ] = useState(false);

  const [
    converting,
    setConverting,
  ] = useState(false);

  const [
    conversionError,
    setConversionError,
  ] = useState("");

  const [
    convertedDeal,
    setConvertedDeal,
  ] = useState(null);

  /*
   * Load the complete contact detail so that
   * activity_summary is always authoritative.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadContactDetail() {
      if (!contact?.id) {
        return;
      }

      try {
        setDetailsLoading(true);
        setDetailsError("");

        const result =
          await getContactById(
            contact.id
          );

        if (cancelled) {
          return;
        }

        const detailedContact =
          result.data || contact;

        setFullContact(
          detailedContact
        );

        const summary =
          detailedContact.activity_summary;

        setActivitySummary({
          total: Number(
            summary?.total || 0
          ),
          calls: Number(
            summary?.calls || 0
          ),
          emails: Number(
            summary?.emails || 0
          ),
          meetings: Number(
            summary?.meetings || 0
          ),
          notes: Number(
            summary?.notes || 0
          ),
          lastActivityAt:
            summary?.last_activity_at ||
            null,
        });

        onUpdated?.(
          detailedContact
        );
      } catch (err) {
        if (!cancelled) {
          setFullContact(contact);

          setDetailsError(
            err.message ||
            "Failed to load contact details"
          );
        }
      } finally {
        if (!cancelled) {
          setDetailsLoading(false);
        }
      }
    }

    loadContactDetail();

    return () => {
      cancelled = true;
    };
  }, [contact?.id]);

  /*
   * Load activity timeline.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadActivities() {
      if (!contact?.id) {
        return;
      }

      try {
        setActivitiesLoading(true);
        setActivitiesError("");

        const result =
          await getContactActivities(
            contact.id,
            {
              page: 1,
              limit: 100,
            }
          );

        if (!cancelled) {
          setActivities(
            result.data || []
          );
        }
      } catch (err) {
        if (!cancelled) {
          setActivitiesError(
            err.message ||
            "Failed to load activities"
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
  }, [contact?.id]);

  if (!contact) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-2xl">
          👤
        </div>

        <h2 className="mt-4 text-xl font-bold text-slate-900">
          Contact not found
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          The contact you're looking for is no
          longer available.
        </p>

        <button
          type="button"
          onClick={onBack}
          className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Back to Contacts
        </button>
      </div>
    );
  }

  const displayedContact =
    fullContact || contact;

  const initial =
    displayedContact.name
      ?.charAt(0)
      ?.toUpperCase() || "?";

  /*
   * Create activity.
   */
  async function handleCreateActivity(event) {
    event.preventDefault();

    const notes = activityNotes.trim();

    if (!notes) {
      setActivityFormError(
        "Please enter activity notes."
      );
      return;
    }

    try {
      setCreatingActivity(true);
      setActivityFormError("");

      const result =
        await createActivity({
          contact_id:
            displayedContact.id,
          type: activityType,
          notes,
        });

      const createdActivity =
        result.data;

      setActivities(
        (currentActivities) => [
          createdActivity,
          ...currentActivities,
        ]
      );

      setActivitySummary(
        (currentSummary) => {
          const nextSummary = {
            ...currentSummary,

            total:
              currentSummary.total + 1,

            calls:
              currentSummary.calls +
              (activityType === "call"
                ? 1
                : 0),

            emails:
              currentSummary.emails +
              (activityType === "email"
                ? 1
                : 0),

            meetings:
              currentSummary.meetings +
              (activityType === "meeting"
                ? 1
                : 0),

            notes:
              currentSummary.notes +
              (activityType === "note"
                ? 1
                : 0),

            lastActivityAt:
              createdActivity.created_at,
          };

          const updatedContact = {
            ...displayedContact,
            activity_summary: {
              total:
                nextSummary.total,
              calls:
                nextSummary.calls,
              emails:
                nextSummary.emails,
              meetings:
                nextSummary.meetings,
              notes:
                nextSummary.notes,
              last_activity_at:
                nextSummary.lastActivityAt,
            },
          };

          setFullContact(
            updatedContact
          );

          onUpdated?.(
            updatedContact
          );

          return nextSummary;
        }
      );

      setActivityNotes("");
      setActivityType("note");
      setShowActivityForm(false);
    } catch (err) {
      setActivityFormError(
        err.message ||
        "Failed to create activity"
      );
    } finally {
      setCreatingActivity(false);
    }
  }

  /*
   * Delete activity.
   */
  async function handleDeleteActivity() {
    if (!activityToDelete?.id) {
      return;
    }

    try {
      setDeletingActivity(true);
      setActivitiesError("");

      await deleteActivity(
        activityToDelete.id
      );

      /*
       * Remove deleted activity locally.
       */
      const remainingActivities =
        activities.filter(
          (activity) =>
            activity.id !==
            activityToDelete.id
        );

      setActivities(
        remainingActivities
      );

      /*
       * Recalculate activity summary.
       */
      const lastActivity =
        remainingActivities.length > 0
          ? remainingActivities.reduce(
            (latest, current) => {
              const latestTime =
                new Date(
                  latest.created_at
                ).getTime();

              const currentTime =
                new Date(
                  current.created_at
                ).getTime();

              return currentTime >
                latestTime
                ? current
                : latest;
            }
          )
          : null;

      const nextSummary = {
        total:
          remainingActivities.length,

        calls:
          remainingActivities.filter(
            (activity) =>
              activity.type === "call"
          ).length,

        emails:
          remainingActivities.filter(
            (activity) =>
              activity.type === "email"
          ).length,

        meetings:
          remainingActivities.filter(
            (activity) =>
              activity.type === "meeting"
          ).length,

        notes:
          remainingActivities.filter(
            (activity) =>
              activity.type === "note"
          ).length,

        lastActivityAt:
          lastActivity?.created_at ||
          null,
      };

      setActivitySummary(
        nextSummary
      );

      /*
       * Keep the contact detail summary
       * synchronized.
       */
      const updatedContact = {
        ...displayedContact,
        activity_summary: {
          total:
            nextSummary.total,
          calls:
            nextSummary.calls,
          emails:
            nextSummary.emails,
          meetings:
            nextSummary.meetings,
          notes:
            nextSummary.notes,
          last_activity_at:
            nextSummary.lastActivityAt,
        },
      };

      setFullContact(
        updatedContact
      );

      onUpdated?.(
        updatedContact
      );

      setActivityToDelete(null);
    } catch (err) {
      setActivitiesError(
        err.message ||
        "Failed to delete activity"
      );
    } finally {
      setDeletingActivity(false);
    }
  }

  /*
   * Delete contact.
   */
  async function handleDelete() {
    try {
      setDeleting(true);
      setDetailsError("");

      await deleteContact(
        displayedContact.id
      );

      setShowDeleteConfirm(false);

      onDeleted?.(
        displayedContact
      );
    } catch (err) {
      setDetailsError(
        err.message ||
        "Failed to delete contact"
      );

      setDeleting(false);
    }
  }

  /*
   * Update local state after contact edit.
   */
  function handleUpdated(
    updatedContact
  ) {
    const mergedContact = {
      ...displayedContact,
      ...updatedContact,
      activity_summary:
        updatedContact.activity_summary ||
        displayedContact.activity_summary,
    };

    setFullContact(
      mergedContact
    );

    setShowEditForm(false);

    onUpdated?.(
      mergedContact
    );
  }

  /*
   * Lead → Deal conversion.
   */
  async function handleConvertToDeal() {
    if (!displayedContact?.id) {
      return;
    }

    try {
      setConverting(true);
      setConversionError("");

      const result =
        await convertContactToDeal(
          displayedContact.id
        );

      const deal =
        result.data;

      setConvertedDeal(deal);

      /*
       * Update contact status locally.
       */
      const updatedContact = {
        ...displayedContact,
        status: "converted",
      };

      setFullContact(
        updatedContact
      );

      onUpdated?.(
        updatedContact
      );

      setShowConvertConfirm(false);
    } catch (err) {
      setConversionError(
        err.message ||
        "Failed to convert this contact into a deal."
      );
    } finally {
      setConverting(false);
    }
  }

  return (
    <>
      <section className="space-y-6">

        {/* Back */}
        <button
          type="button"
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <span className="transition group-hover:-translate-x-1">
            ←
          </span>

          Back to Contacts
        </button>

        {/* Loading */}
        {detailsLoading && (
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700">
            Loading latest contact details...
          </div>
        )}

        {/* Error */}
        {detailsError && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {detailsError}
          </div>
        )}

        {/* Premium Contact Header */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

          <div className="p-6 lg:p-8">
            <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-center">

              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100 text-3xl font-bold text-indigo-600 ring-8 ring-indigo-50/50">
                    {initial}
                  </div>

                  <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full border-4 border-white bg-emerald-500" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                      {displayedContact.name}
                    </h1>

                    <span
                      className={`status-badge status-${displayedContact.status}`}
                    >
                      {displayedContact.status}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                    <span>
                      {displayedContact.company ||
                        "Independent contact"}
                    </span>

                    {displayedContact.email && (
                      <>
                        <span className="text-slate-300">
                          •
                        </span>

                        <span>
                          {displayedContact.email}
                        </span>
                      </>
                    )}
                  </div>

                  <div
                    className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${displayedContact.status ===
                        "converted"
                        ? "bg-violet-50 text-violet-700"
                        : "bg-emerald-50 text-emerald-700"
                      }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${displayedContact.status ===
                          "converted"
                          ? "bg-violet-500"
                          : "bg-emerald-500"
                        }`}
                    />

                    {displayedContact.status ===
                      "converted"
                      ? "Converted to deal"
                      : "Active contact"}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setShowEditForm(true)
                  }
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Edit Contact
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowDeleteConfirm(true)
                  }
                  className="rounded-xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="grid gap-6 xl:grid-cols-3">

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2 lg:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">
                  Profile
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Contact Information
                </h2>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 text-slate-500">
                ◉
              </div>
            </div>

            <div className="mt-7 grid gap-x-8 gap-y-7 sm:grid-cols-2">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Email
                </p>

                <p className="mt-2 break-all text-sm font-semibold text-slate-800">
                  {displayedContact.email ||
                    "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Phone
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {displayedContact.phone ||
                    "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Company
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {displayedContact.company ||
                    "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Source
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {displayedContact.source ||
                    "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Created
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {formatDate(
                    displayedContact.created_at
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Last Updated
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {formatDate(
                    displayedContact.updated_at
                  )}
                </p>
              </div>

            </div>
          </div>

          {/* Tags */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">
              Classification
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Tags
            </h2>

            <div className="mt-6 flex flex-wrap gap-2">
              {displayedContact.tags?.length ? (
                displayedContact.tags.map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      {tag}
                    </span>
                  )
                )
              ) : (
                <div className="rounded-xl bg-slate-50 px-4 py-4 text-sm text-slate-400">
                  No tags assigned.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Insights */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">
                Engagement
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Activity Insights
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                A quick overview of this contact's
                engagement.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-500">
              Last activity{" "}
              <span className="font-semibold text-slate-800">
                {formatDateTime(
                  activitySummary.lastActivityAt
                )}
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

            {/* Total */}
            <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Total
                </span>

                <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100">
                  ◷
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold text-slate-950">
                {activitySummary.total}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                interactions
              </p>
            </div>

            {/* Calls */}
            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Calls
                </span>

                <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100">
                  📞
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold text-slate-950">
                {activitySummary.calls}
              </p>
            </div>

            {/* Emails */}
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Emails
                </span>

                <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-100">
                  ✉
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold text-slate-950">
                {activitySummary.emails}
              </p>
            </div>

            {/* Meetings */}
            <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                  Meetings
                </span>

                <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-100">
                  📅
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold text-slate-950">
                {activitySummary.meetings}
              </p>
            </div>

            {/* Notes */}
            <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Notes
                </span>

                <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100">
                  📝
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold text-slate-950">
                {activitySummary.notes}
              </p>
            </div>

          </div>
        </div>

        {/* Activity Timeline */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">
                Timeline
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Recent Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Keep every customer interaction
                organized.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowActivityForm(
                  (current) => !current
                );

                setActivityFormError("");
              }}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              {showActivityForm
                ? "Close Form"
                : "+ Add Activity"}
            </button>
          </div>

          {/* Add Activity form */}
          {showActivityForm && (
            <form
              onSubmit={
                handleCreateActivity
              }
              className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-white p-5"
            >
              <div className="grid gap-5 lg:grid-cols-3">

                <div>
                  <label
                    htmlFor="activity-type"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Activity Type
                  </label>

                  <select
                    id="activity-type"
                    value={activityType}
                    onChange={(event) =>
                      setActivityType(
                        event.target.value
                      )
                    }
                    disabled={
                      creatingActivity
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  >
                    {ACTIVITY_TYPES.map(
                      (activity) => (
                        <option
                          key={activity.value}
                          value={activity.value}
                        >
                          {activity.label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <label
                    htmlFor="activity-notes"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Activity Notes
                  </label>

                  <textarea
                    id="activity-notes"
                    value={activityNotes}
                    onChange={(event) =>
                      setActivityNotes(
                        event.target.value
                      )
                    }
                    disabled={
                      creatingActivity
                    }
                    rows={3}
                    maxLength={2000}
                    placeholder="Write a short summary of this interaction..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>

              </div>

              {activityFormError && (
                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {activityFormError}
                </div>
              )}

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowActivityForm(
                      false
                    );

                    setActivityFormError("");
                  }}
                  disabled={
                    creatingActivity
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    creatingActivity
                  }
                  className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingActivity
                    ? "Saving..."
                    : "Save Activity"}
                </button>
              </div>
            </form>
          )}

          {/* Timeline */}
          {activitiesLoading ? (
            <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

              <p className="mt-4 text-sm font-medium text-slate-600">
                Loading activity history...
              </p>
            </div>
          ) : activitiesError ? (
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5">
              <p className="text-sm font-semibold text-red-800">
                Unable to load activity history
              </p>

              <p className="mt-1 text-sm text-red-700">
                {activitiesError}
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-inset ring-red-200"
              >
                Refresh
              </button>
            </div>
          ) : activities.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-xl shadow-sm">
                ◷
              </div>

              <h3 className="mt-4 text-base font-bold text-slate-800">
                No activity recorded
              </h3>

              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                Start tracking communication by
                adding a call, email, meeting, or note.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowActivityForm(true)
                }
                className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Add First Activity
              </button>
            </div>
          ) : (
            <div className="mt-7">
              <div className="relative">
                {activities.map(
                  (activity, index) => {
                    const meta =
                      getActivityMeta(
                        activity.type
                      );

                    const isLast =
                      index ===
                      activities.length - 1;

                    return (
                      <div
                        key={activity.id}
                        className="relative flex gap-4 pb-7"
                      >
                        {!isLast && (
                          <div className="absolute left-5 top-11 h-[calc(100%-1.5rem)] w-px bg-slate-200" />
                        )}

                        <div className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-indigo-100 bg-indigo-50 text-base">
                          {meta.icon}
                        </div>

                        <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm">
                          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900">
                                  {meta.label}
                                </h3>

                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold lowercase text-slate-500">
                                  {activity.type}
                                </span>
                              </div>

                              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                {activity.notes}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                              <time className="text-xs font-medium text-slate-400">
                                {formatDateTime(
                                  activity.created_at
                                )}
                              </time>

                              <button
                                type="button"
                                onClick={() =>
                                  setActivityToDelete(activity)
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow"
                                aria-label={`Delete ${meta.label}`}
                              >
                                <span className="text-sm leading-none">
                                  🗑
                                </span>

                                <span>
                                  Delete
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </div>

        {/* AI Assistant */}
        <AIAssistantPanel
          contactId={displayedContact.id}
        />

        {/* Internal Notes */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50">
              📝
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-500">
                Internal
              </p>

              <h2 className="text-xl font-bold text-slate-900">
                Contact Notes
              </h2>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {displayedContact.notes ||
                "No internal notes have been added for this contact."}
            </p>
          </div>
        </div>

        {/* Conversion CTA */}
        {displayedContact.status !==
          "converted" && (
            <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl lg:p-8">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />

              <div className="absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-violet-500/10 blur-3xl" />

              <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Opportunity ready
                  </div>

                  <h2 className="text-2xl font-bold tracking-tight">
                    Ready to move this lead forward?
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                    Convert this qualified contact into a
                    deal when the opportunity is ready.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setConversionError("");
                    setShowConvertConfirm(true);
                  }}
                  disabled={converting}
                  className="shrink-0 rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {converting
                    ? "Converting..."
                    : "Convert to Deal →"}
                </button>
              </div>

              {conversionError && (
                <div className="relative mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {conversionError}
                </div>
              )}
            </div>
          )}

        {/* Converted Deal Success */}
        {convertedDeal && (
          <div className="rounded-3xl border border-violet-200 bg-violet-50 p-6 shadow-sm lg:p-7">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  Deal created
                </div>

                <h2 className="text-xl font-bold text-slate-900">
                  {convertedDeal.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  This contact has been successfully
                  converted into a deal.
                </p>
              </div>

              <div className="rounded-2xl border border-violet-100 bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Deal Stage
                </p>

                <p className="mt-1 text-sm font-bold capitalize text-violet-700">
                  {convertedDeal.stage ||
                    "new"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Edit */}
        {showEditForm && (
          <EditContactForm
            contact={displayedContact}
            onCancel={() =>
              setShowEditForm(false)
            }
            onUpdated={handleUpdated}
          />
        )}

        {/* Convert confirmation */}
        {showConvertConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
              <div className="p-6 lg:p-7">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-xl text-indigo-600">
                  ↗
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  Convert to Deal?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This will create a new deal for{" "}
                  <span className="font-semibold text-slate-800">
                    {displayedContact.name}
                  </span>{" "}
                  and mark this contact as{" "}
                  <span className="font-semibold text-violet-700">
                    converted
                  </span>
                  .
                </p>

                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Deal name
                    </span>

                    <span className="text-right text-sm font-semibold text-slate-800">
                      {displayedContact.company
                        ? `${displayedContact.name} - ${displayedContact.company}`
                        : displayedContact.name}
                    </span>
                  </div>
                </div>

                {conversionError && (
                  <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {conversionError}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() => {
                    if (!converting) {
                      setShowConvertConfirm(false);
                      setConversionError("");
                    }
                  }}
                  disabled={converting}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConvertToDeal}
                  disabled={converting}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {converting
                    ? "Converting..."
                    : "Yes, Convert"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Contact confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="p-6 lg:p-7">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-xl">
                  ⚠
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  Delete Contact?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  You're about to permanently delete{" "}
                  <span className="font-semibold text-slate-800">
                    {displayedContact.name}
                  </span>
                  . This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() =>
                    setShowDeleteConfirm(false)
                  }
                  disabled={deleting}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting
                    ? "Deleting..."
                    : "Delete Contact"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Activity confirmation */}
        {activityToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

              <div className="p-6 lg:p-7">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-xl">
                  ⚠
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  Delete Activity?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Are you sure you want to delete this
                  activity? This action cannot be undone.
                </p>

                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {
                        getActivityMeta(
                          activityToDelete.type
                        ).icon
                      }
                    </span>

                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {
                        getActivityMeta(
                          activityToDelete.type
                        ).label
                      }
                    </span>
                  </div>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {activityToDelete.notes}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {formatDateTime(
                      activityToDelete.created_at
                    )}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() => {
                    if (!deletingActivity) {
                      setActivityToDelete(null);
                    }
                  }}
                  disabled={deletingActivity}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleDeleteActivity
                  }
                  disabled={deletingActivity}
                  className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingActivity
                    ? "Deleting..."
                    : "Delete Activity"}
                </button>
              </div>
            </div>
          </div>
        )}

      </section>
    </>
  );
}

export default ContactDetail;