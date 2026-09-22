import { useEffect, useState } from "react";
import { getContacts } from "../../api/contacts";
import {
    askAssistant,
    scoreLead,
    getNextBestAction,
    getActivitySummary,
} from "../../api/ai";

function renderFormattedText(text) {
    const lines = String(text || "").split("\n");

    return (
        <div className="space-y-1">
            {lines.map((line, index) => {
                const trimmedLine = line.trim();

                if (!trimmedLine) {
                    return (
                        <div
                            key={`empty-${index}`}
                            className="h-2"
                        />
                    );
                }

                const isBullet = trimmedLine.startsWith("- ");
                const content = isBullet
                    ? trimmedLine.slice(2)
                    : trimmedLine;

                const parts = content.split(
                    /(\*\*[^*]+\*\*)/g
                );

                const formattedContent = parts.map(
                    (part, partIndex) => {
                        if (
                            part.startsWith("**") &&
                            part.endsWith("**")
                        ) {
                            return (
                                <strong
                                    key={`bold-${partIndex}`}
                                    className="font-semibold"
                                >
                                    {part.slice(2, -2)}
                                </strong>
                            );
                        }

                        return (
                            <span key={`text-${partIndex}`}>
                                {part}
                            </span>
                        );
                    }
                );

                if (isBullet) {
                    return (
                        <div
                            key={`line-${index}`}
                            className="flex gap-2"
                        >
                            <span>•</span>
                            <span>{formattedContent}</span>
                        </div>
                    );
                }

                return (
                    <div key={`line-${index}`}>
                        {formattedContent}
                    </div>
                );
            })}
        </div>
    );
}

function AIAssistantPanel({
    contactId: initialContactId = "",
}) {
    const [contacts, setContacts] = useState([]);
    const [selectedContactId, setSelectedContactId] =
        useState(initialContactId || "");

    const [contactsLoading, setContactsLoading] =
        useState(true);

    const [contactsError, setContactsError] =
        useState("");

    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [leadScore, setLeadScore] = useState(null);
    const [leadScoreLoading, setLeadScoreLoading] =
        useState(false);
    const [leadScoreError, setLeadScoreError] =
        useState("");

    const [nextBestAction, setNextBestAction] =
        useState(null);
    const [nextBestActionLoading, setNextBestActionLoading] =
        useState(false);
    const [nextBestActionError, setNextBestActionError] =
        useState("");

    const [activitySummary, setActivitySummary] =
        useState(null);
    const [activitySummaryLoading, setActivitySummaryLoading] =
        useState(false);
    const [activitySummaryError, setActivitySummaryError] =
        useState("");

    /**
     * Load contacts for the AI Assistant selector.
     */
    useEffect(() => {
        let cancelled = false;

        async function loadContacts() {
            try {
                setContactsLoading(true);
                setContactsError("");

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

                if (
                    initialContactId &&
                    loadedContacts.some(
                        (contact) =>
                            contact.id === initialContactId
                    )
                ) {
                    setSelectedContactId(
                        initialContactId
                    );
                } else if (
                    loadedContacts.length === 1
                ) {
                    setSelectedContactId(
                        loadedContacts[0].id
                    );
                }
            } catch (err) {
                if (!cancelled) {
                    setContactsError(
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
    }, [initialContactId]);

    async function handleSubmit(event) {
        event.preventDefault();

        if (!query.trim()) {
            return;
        }

        if (!selectedContactId) {
            setError(
                "Please select a contact first."
            );
            return;
        }

        const userMessage = {
            role: "user",
            content: query.trim(),
        };

        setMessages((previous) => [
            ...previous,
            userMessage,
        ]);

        setQuery("");
        setError("");
        setLoading(true);

        try {
            const result = await askAssistant({
                query: userMessage.content,
                contactId: selectedContactId,
            });

            const assistantMessage = {
                role: "assistant",
                content:
                    result?.data?.answer ||
                    "No answer was returned by the AI assistant.",
            };

            setMessages((previous) => [
                ...previous,
                assistantMessage,
            ]);
        } catch (err) {
            setError(
                err.message ||
                "Failed to contact AI assistant."
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleLeadScore() {
        if (!selectedContactId) {
            setLeadScoreError(
                "Please select a contact first."
            );
            return;
        }

        setLeadScoreLoading(true);
        setLeadScoreError("");

        try {
            const result = await scoreLead({
                contactId: selectedContactId,
            });

            setLeadScore(
                result?.data || null
            );
        } catch (err) {
            setLeadScore(null);
            setLeadScoreError(
                err.message ||
                "Failed to generate lead score."
            );
        } finally {
            setLeadScoreLoading(false);
        }
    }

    async function handleNextBestAction() {
        if (!selectedContactId) {
            setNextBestActionError(
                "Please select a contact first."
            );
            return;
        }

        setNextBestActionLoading(true);
        setNextBestActionError("");

        try {
            const result =
                await getNextBestAction({
                    contactId: selectedContactId,
                });

            setNextBestAction(
                result?.data || null
            );
        } catch (err) {
            setNextBestAction(null);
            setNextBestActionError(
                err.message ||
                "Failed to generate next best action."
            );
        } finally {
            setNextBestActionLoading(false);
        }
    }

    async function handleActivitySummary() {
        if (!selectedContactId) {
            setActivitySummaryError(
                "Please select a contact first."
            );
            return;
        }

        setActivitySummaryLoading(true);
        setActivitySummaryError("");

        try {
            const result =
                await getActivitySummary({
                    contactId: selectedContactId,
                });

            setActivitySummary(
                result?.data || null
            );
        } catch (err) {
            setActivitySummary(null);
            setActivitySummaryError(
                err.message ||
                "Failed to generate activity summary."
            );
        } finally {
            setActivitySummaryLoading(false);
        }
    }

    function handleContactChange(event) {
        const nextContactId =
            event.target.value;

        setSelectedContactId(
            nextContactId
        );

        setMessages([]);
        setError("");

        setLeadScore(null);
        setLeadScoreError("");

        setNextBestAction(null);
        setNextBestActionError("");

        setActivitySummary(null);
        setActivitySummaryError("");
    }

    const selectedContact = contacts.find(
        (contact) =>
            contact.id === selectedContactId
    );

    const anyAIActionLoading =
        loading ||
        leadScoreLoading ||
        nextBestActionLoading ||
        activitySummaryLoading;

    return (
        <section className="space-y-6">
            {/* Page Header */}
            <div>
                <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                        Intelligence
                    </span>

                    <span className="text-sm text-slate-400">
                        AI Assistant
                    </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    AI Assistant
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Ask questions about contacts, deals,
                    activities, and tasks.
                </p>
            </div>

            {/* Contact Selector */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <label
                    htmlFor="ai-contact"
                    className="block text-sm font-semibold text-slate-700"
                >
                    Select Contact
                </label>

                <div className="mt-2">
                    {contactsLoading ? (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                            Loading contacts...
                        </div>
                    ) : contactsError ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {contactsError}
                        </div>
                    ) : contacts.length === 0 ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                            No contacts are available.
                        </div>
                    ) : (
                        <select
                            id="ai-contact"
                            value={selectedContactId}
                            onChange={handleContactChange}
                            disabled={anyAIActionLoading}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                        >
                            <option value="">
                                Select a contact...
                            </option>

                            {contacts.map((contact) => (
                                <option
                                    key={contact.id}
                                    value={contact.id}
                                >
                                    {contact.name}
                                    {contact.company
                                        ? ` — ${contact.company}`
                                        : ""}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {selectedContact && (
                    <p className="mt-2 text-xs text-slate-400">
                        AI questions and analysis will use
                        CRM data associated with{" "}
                        {selectedContact.name}.
                    </p>
                )}
            </div>

            {/* Lead Scoring */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            AI Lead Score
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Analyze CRM data and generate an
                            AI-powered lead score.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleLeadScore}
                        disabled={
                            !selectedContactId ||
                            anyAIActionLoading ||
                            contactsLoading
                        }
                        className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {leadScoreLoading
                            ? "Scoring..."
                            : "Generate Score"}
                    </button>
                </div>

                <div className="p-5">
                    {!leadScore &&
                        !leadScoreLoading &&
                        !leadScoreError && (
                            <div className="rounded-xl bg-slate-50 px-4 py-6 text-center">
                                <p className="font-medium text-slate-700">
                                    No lead score generated yet.
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Select a contact and click
                                    "Generate Score".
                                </p>
                            </div>
                        )}

                    {leadScoreLoading && (
                        <div className="rounded-xl bg-indigo-50 px-4 py-6 text-center">
                            <p className="font-medium text-indigo-700">
                                AI is analyzing the lead...
                            </p>

                            <p className="mt-1 text-sm text-indigo-600">
                                Reviewing contact, deal,
                                activity, and task data.
                            </p>
                        </div>
                    )}

                    {leadScoreError && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {leadScoreError}
                        </div>
                    )}

                    {leadScore && (
                        <div className="space-y-5">
                            {/* Score */}
                            <div className="flex flex-col gap-4 rounded-xl bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Lead Score
                                    </p>

                                    <div className="mt-1 flex items-baseline gap-2">
                                        <span className="text-4xl font-bold text-slate-900">
                                            {leadScore.score}
                                        </span>

                                        <span className="text-sm text-slate-400">
                                            / 100
                                        </span>
                                    </div>
                                </div>

                                <span
                                    className={`inline-flex w-fit rounded-full px-3 py-1.5 text-sm font-semibold uppercase ${leadScore.category ===
                                            "high"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : leadScore.category ===
                                                "medium"
                                                ? "bg-amber-100 text-amber-700"
                                                : "bg-slate-200 text-slate-600"
                                        }`}
                                >
                                    {leadScore.category}
                                </span>
                            </div>

                            {/* Reasons */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">
                                    Why this score?
                                </h3>

                                <div className="mt-3 space-y-2">
                                    {leadScore.reasons?.map(
                                        (reason, index) => (
                                            <div
                                                key={`reason-${index}`}
                                                className="flex gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-600"
                                            >
                                                <span className="mt-0.5 font-semibold text-indigo-600">
                                                    {index + 1}.
                                                </span>

                                                <span>
                                                    {reason}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Recommendations */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">
                                    Recommended next actions
                                </h3>

                                <div className="mt-3 space-y-2">
                                    {leadScore.recommendations?.map(
                                        (
                                            recommendation,
                                            index
                                        ) => (
                                            <div
                                                key={`recommendation-${index}`}
                                                className="flex gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-sm text-slate-700"
                                            >
                                                <span className="mt-0.5 text-indigo-600">
                                                    →
                                                </span>

                                                <span>
                                                    {recommendation}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            <p className="text-xs text-slate-400">
                                Generated by{" "}
                                {leadScore.provider ||
                                    "AI"}
                                .
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Next Best Action */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Next Best Action
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Get an AI-generated action based on
                            the current CRM data.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleNextBestAction}
                        disabled={
                            !selectedContactId ||
                            anyAIActionLoading ||
                            contactsLoading
                        }
                        className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {nextBestActionLoading
                            ? "Generating..."
                            : "Get Next Action"}
                    </button>
                </div>

                <div className="p-5">
                    {!nextBestAction &&
                        !nextBestActionLoading &&
                        !nextBestActionError && (
                            <div className="rounded-xl bg-slate-50 px-4 py-6 text-center">
                                <p className="font-medium text-slate-700">
                                    No next action generated yet.
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Click "Get Next Action" to
                                    analyze the selected contact.
                                </p>
                            </div>
                        )}

                    {nextBestActionLoading && (
                        <div className="rounded-xl bg-indigo-50 px-4 py-6 text-center">
                            <p className="font-medium text-indigo-700">
                                AI is determining the next best
                                action...
                            </p>

                            <p className="mt-1 text-sm text-indigo-600">
                                Reviewing the current CRM data.
                            </p>
                        </div>
                    )}

                    {nextBestActionError && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {nextBestActionError}
                        </div>
                    )}

                    {nextBestAction && (
                        <div className="rounded-xl bg-slate-50 p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                                        Recommended Action
                                    </p>

                                    <h3 className="mt-1 text-xl font-bold text-slate-900">
                                        {nextBestAction.action}
                                    </h3>
                                </div>

                                <span
                                    className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold uppercase ${nextBestAction.priority ===
                                            "high"
                                            ? "bg-red-100 text-red-700"
                                            : nextBestAction.priority ===
                                                "medium"
                                                ? "bg-amber-100 text-amber-700"
                                                : "bg-slate-200 text-slate-600"
                                        }`}
                                >
                                    {nextBestAction.priority} priority
                                </span>
                            </div>

                            <div className="mt-5">
                                <p className="text-sm font-semibold text-slate-900">
                                    Why?
                                </p>

                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {nextBestAction.reason}
                                </p>
                            </div>

                            <p className="mt-5 text-xs text-slate-400">
                                Generated by{" "}
                                {nextBestAction.provider ||
                                    "AI"}
                                .
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Activity Summary */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Activity Summary
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Get an AI-generated summary of the
                            contact's recent CRM activity.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleActivitySummary}
                        disabled={
                            !selectedContactId ||
                            anyAIActionLoading ||
                            contactsLoading
                        }
                        className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {activitySummaryLoading
                            ? "Summarizing..."
                            : "Generate Summary"}
                    </button>
                </div>

                <div className="p-5">
                    {!activitySummary &&
                        !activitySummaryLoading &&
                        !activitySummaryError && (
                            <div className="rounded-xl bg-slate-50 px-4 py-6 text-center">
                                <p className="font-medium text-slate-700">
                                    No activity summary generated
                                    yet.
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Click "Generate Summary" to
                                    analyze the contact's activity
                                    history.
                                </p>
                            </div>
                        )}

                    {activitySummaryLoading && (
                        <div className="rounded-xl bg-indigo-50 px-4 py-6 text-center">
                            <p className="font-medium text-indigo-700">
                                AI is summarizing activities...
                            </p>

                            <p className="mt-1 text-sm text-indigo-600">
                                Reviewing the contact's recent
                                activity history.
                            </p>
                        </div>
                    )}

                    {activitySummaryError && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {activitySummaryError}
                        </div>
                    )}

                    {activitySummary && (
                        <div className="space-y-5">
                            {/* Summary */}
                            <div className="rounded-xl bg-slate-50 p-5">
                                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                                    Summary
                                </p>

                                <p className="mt-2 text-sm leading-6 text-slate-700">
                                    {activitySummary.summary}
                                </p>
                            </div>

                            {/* Key Points */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">
                                    Key Points
                                </h3>

                                <div className="mt-3 space-y-2">
                                    {activitySummary.key_points?.map(
                                        (
                                            point,
                                            index
                                        ) => (
                                            <div
                                                key={`activity-point-${index}`}
                                                className="flex gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-600"
                                            >
                                                <span className="mt-0.5 font-semibold text-indigo-600">
                                                    {index + 1}.
                                                </span>

                                                <span>
                                                    {point}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Follow Up */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">
                                    Follow-up
                                </h3>

                                <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-slate-700">
                                    {activitySummary.follow_up}
                                </div>
                            </div>

                            <p className="text-xs text-slate-400">
                                Generated by{" "}
                                {activitySummary.provider ||
                                    "AI"}
                                .
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* AI Chat */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Ask AI
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Ask about this contact, their deals,
                        activities, or tasks.
                    </p>
                </div>

                <div className="min-h-[280px] max-h-[420px] space-y-4 overflow-y-auto p-5">
                    {messages.length === 0 && (
                        <div className="flex min-h-[220px] items-center justify-center text-center">
                            <div>
                                <p className="font-medium text-slate-700">
                                    How can I help?
                                </p>

                                <p className="mt-2 text-sm text-slate-500">
                                    Try asking:
                                </p>

                                <div className="mt-3 space-y-1 text-sm text-slate-500">
                                    <p>
                                        "What deals are associated
                                        with this contact?"
                                    </p>

                                    <p>
                                        "What activities are
                                        associated with this
                                        contact?"
                                    </p>

                                    <p>
                                        "What tasks are associated
                                        with this contact?"
                                    </p>

                                    <p>
                                        "What information do you
                                        have about this contact?"
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {messages.map((message, index) => (
                        <div
                            key={`${message.role}-${index}`}
                            className={`flex ${message.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${message.role === "user"
                                        ? "bg-slate-900 text-white"
                                        : "bg-slate-100 text-slate-800"
                                    }`}
                            >
                                {message.role === "assistant" ? (
                                    renderFormattedText(
                                        message.content
                                    )
                                ) : (
                                    <p className="whitespace-pre-wrap">
                                        {message.content}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
                                AI is thinking...
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="border-t border-slate-200 p-4"
                >
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={query}
                            onChange={(event) =>
                                setQuery(event.target.value)
                            }
                            placeholder={
                                selectedContactId
                                    ? "Ask about this contact..."
                                    : "Select a contact first..."
                            }
                            disabled={
                                loading ||
                                contactsLoading ||
                                !selectedContactId
                            }
                            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                        />

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                !query.trim() ||
                                !selectedContactId
                            }
                            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? "Thinking..."
                                : "Ask AI"}
                        </button>
                    </div>
                </form>
            </section>
        </section>
    );
}

export default AIAssistantPanel;