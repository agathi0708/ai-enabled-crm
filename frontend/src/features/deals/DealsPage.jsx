import { useEffect, useMemo, useState } from "react";

import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors,
} from "@dnd-kit/core";

import { CSS } from "@dnd-kit/utilities";

import {
    Calendar,
    DollarSign,
    GripVertical,
    Loader2,
    Plus,
    RefreshCw,
    X,
} from "lucide-react";

import {
    createDeal,
    deleteDeal,
    getDeals,
    updateDealStage,
} from "../../api/deals";

import { getContacts } from "../../api/contacts";

const STAGES = [
    { key: "new", label: "New" },
    { key: "qualified", label: "Qualified" },
    { key: "proposal", label: "Proposal" },
    { key: "negotiation", label: "Negotiation" },
    { key: "won", label: "Won" },
    { key: "lost", label: "Lost" },
];

function formatAmount(value) {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(value) {
    if (!value) return "No close date";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "No close date";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function normalizeDeals(body) {
    if (Array.isArray(body?.data)) {
        return body.data;
    }

    if (Array.isArray(body?.data?.deals)) {
        return body.data.deals;
    }

    if (Array.isArray(body?.deals)) {
        return body.deals;
    }

    return [];
}

function normalizeContacts(body) {
    if (Array.isArray(body?.data)) {
        return body.data;
    }

    if (Array.isArray(body?.data?.contacts)) {
        return body.data.contacts;
    }

    if (Array.isArray(body?.contacts)) {
        return body.contacts;
    }

    return [];
}

function DealCard({ deal, onClick }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id: deal.id,
        data: {
            deal,
        },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`cursor-grab rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition ${isDragging
                ? "opacity-40 shadow-lg cursor-grabbing"
                : "hover:border-slate-300 hover:shadow-md"
                }`}
        >
            <div className="flex items-start gap-2">
                <button
                    type="button"
                    className="mt-0.5 text-slate-400"
                    title="Drag deal"
                >
                    <GripVertical size={18} />
                </button>

                <button
                    type="button"
                    onClick={() => onClick(deal)}
                    className="min-w-0 flex-1 text-left"
                >
                    <h3 className="truncate font-semibold text-slate-900">
                        {deal.name || "Unnamed Deal"}
                    </h3>

                    {deal.contact_name && (
                        <p className="mt-1 truncate text-xs text-slate-500">
                            {deal.contact_name}
                        </p>
                    )}
                </button>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-700">
                <DollarSign size={15} />
                {formatAmount(deal.amount)}
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <Calendar size={14} />
                {formatDate(deal.close_date)}
            </div>
        </div>
    );
}

function StageColumn({ stage, deals, onDealClick }) {
    const { setNodeRef, isOver } = useDroppable({
        id: stage.key,
    });

    return (
        <div className="flex min-w-[270px] flex-1 flex-col">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-slate-800">
                    {stage.label}
                </h2>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {deals.length}
                </span>
            </div>

            <div
                ref={setNodeRef}
                className={`min-h-[420px] flex-1 rounded-2xl border p-3 transition ${isOver
                    ? "border-slate-400 bg-slate-100"
                    : "border-slate-200 bg-slate-50"
                    }`}
            >
                <div className="space-y-3">
                    {deals.map((deal) => (
                        <DealCard
                            key={deal.id}
                            deal={deal}
                            onClick={onDealClick}
                        />
                    ))}

                    {deals.length === 0 && (
                        <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-400">
                            Drop deals here
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DealDetails({ deal, onClose, onDelete }) {
    if (!deal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            {deal.name || "Deal Details"}
                        </h2>

                        <p className="text-sm text-slate-500">
                            {deal.contact_name || "No linked contact"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => onDelete(deal)}
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                            Delete
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
                        >
                            Close
                        </button>
                    </div>
                </div>

                <div className="space-y-4 p-6">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Stage
                        </p>

                        <p className="mt-1 font-medium text-slate-800">
                            {deal.stage || "Unknown"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Deal Value
                        </p>

                        <p className="mt-1 font-medium text-slate-800">
                            {formatAmount(deal.amount)}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Close Date
                        </p>

                        <p className="mt-1 font-medium text-slate-800">
                            {formatDate(deal.close_date)}
                        </p>
                    </div>

                    {deal.description && (
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Description
                            </p>

                            <p className="mt-1 text-sm text-slate-700">
                                {deal.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DeleteDealModal({
    deal,
    onClose,
    onConfirm,
    deleting,
    error,
}) {
    if (!deal) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
                <div className="border-b border-slate-200 px-6 py-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Delete Deal
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        This action cannot be undone.
                    </p>
                </div>

                <div className="space-y-4 p-6">
                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <p className="text-sm text-slate-700">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold">
                            {deal.name || "this deal"}
                        </span>
                        ?
                    </p>

                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={deleting}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={deleting}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {deleting ? "Deleting..." : "Delete Deal"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CreateDealModal({
    contacts,
    form,
    setForm,
    onClose,
    onSubmit,
    creating,
    error,
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Create Deal
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Add a new deal to the sales pipeline.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form
                    onSubmit={onSubmit}
                    className="space-y-5 p-6"
                >
                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Contact
                        </label>

                        <select
                            value={form.contactId}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    contactId: event.target.value,
                                }))
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-500"
                            required
                        >
                            <option value="">
                                Select a contact
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
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Deal Name
                        </label>

                        <input
                            type="text"
                            value={form.name}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    name: event.target.value,
                                }))
                            }
                            placeholder="e.g. Enterprise Software Deal"
                            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Deal Amount
                        </label>

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.amount}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    amount: event.target.value,
                                }))
                            }
                            placeholder="250000"
                            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Stage
                        </label>

                        <select
                            value={form.stage}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    stage: event.target.value,
                                }))
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-500"
                        >
                            {STAGES.map((stage) => (
                                <option
                                    key={stage.key}
                                    value={stage.key}
                                >
                                    {stage.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={creating}
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={creating}
                            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {creating && (
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                />
                            )}

                            {creating
                                ? "Creating..."
                                : "Create Deal"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function DealsPage() {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeDeal, setActiveDeal] = useState(null);
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [showDeleteDeal, setShowDeleteDeal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [showCreateDeal, setShowCreateDeal] =
        useState(false);

    const [contacts, setContacts] = useState([]);

    const [createForm, setCreateForm] = useState({
        contactId: "",
        name: "",
        amount: "",
        stage: "new",
    });

    const [creating, setCreating] =
        useState(false);

    const [createError, setCreateError] =
        useState("");

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 6,
            },
        })
    );

    async function loadDeals() {
        try {
            setLoading(true);
            setError("");

            const response = await getDeals();

            setDeals(normalizeDeals(response));
        } catch (err) {
            setError(
                err.message ||
                "Failed to load deals."
            );
        } finally {
            setLoading(false);
        }
    }

    async function loadContacts() {
        try {
            const response = await getContacts({
                page: 1,
                limit: 100,
            });

            setContacts(
                normalizeContacts(response)
            );
        } catch (err) {
            setCreateError(
                err.message ||
                "Failed to load contacts."
            );
        }
    }

    useEffect(() => {
        loadDeals();
    }, []);

    async function handleOpenCreateDeal() {
        setCreateError("");

        setCreateForm({
            contactId: "",
            name: "",
            amount: "",
            stage: "new",
        });

        setShowCreateDeal(true);

        await loadContacts();
    }

    function handleCloseCreateDeal() {
        if (creating) return;

        setShowCreateDeal(false);
        setCreateError("");
    }

    async function handleCreateDeal(event) {
        event.preventDefault();

        try {
            setCreating(true);
            setCreateError("");

            await createDeal({
                contactId: createForm.contactId,
                name: createForm.name.trim(),
                amount: Number(createForm.amount),
                stage: createForm.stage,
            });

            setShowCreateDeal(false);

            setCreateForm({
                contactId: "",
                name: "",
                amount: "",
                stage: "new",
            });

            await loadDeals();
        } catch (err) {
            setCreateError(
                err.message ||
                "Failed to create deal."
            );
        } finally {
            setCreating(false);
        }
    }

    function handleOpenDeleteDeal(deal) {
        setDeleteTarget(deal);
        setDeleteError("");
        setSelectedDeal(null);
        setShowDeleteDeal(true);
    }

    function handleCloseDeleteDeal() {
        if (deleting) return;

        setShowDeleteDeal(false);
        setDeleteTarget(null);
        setDeleteError("");
    }

    async function handleDeleteDeal() {
        if (!deleteTarget) return;

        try {
            setDeleting(true);
            setDeleteError("");

            await deleteDeal(deleteTarget.id);

            setDeals((current) =>
                current.filter((item) => item.id !== deleteTarget.id)
            );

            setShowDeleteDeal(false);
            setDeleteTarget(null);
        } catch (err) {
            setDeleteError(
                err.message || "Failed to delete deal."
            );
        } finally {
            setDeleting(false);
        }
    }

    const dealsByStage = useMemo(() => {
        const grouped = {};

        for (const stage of STAGES) {
            grouped[stage.key] = [];
        }

        for (const deal of deals) {
            const stage = String(
                deal.stage || "new"
            ).toLowerCase();

            if (!grouped[stage]) {
                grouped.new.push(deal);
            } else {
                grouped[stage].push(deal);
            }
        }

        return grouped;
    }, [deals]);

    function handleDragStart(event) {
        const deal = deals.find(
            (item) => item.id === event.active.id
        );

        setActiveDeal(deal || null);
    }

    async function handleDragEnd(event) {
        setActiveDeal(null);

        const { active, over } = event;

        if (!over) return;

        const deal = deals.find(
            (item) => item.id === active.id
        );

        if (!deal) return;

        const currentStage = String(
            deal.stage || "new"
        ).toLowerCase();

        const nextStage = String(
            over.id
        ).toLowerCase();

        if (currentStage === nextStage) return;

        const previousDeals = deals;

        setDeals((current) =>
            current.map((item) =>
                item.id === deal.id
                    ? {
                        ...item,
                        stage: nextStage,
                    }
                    : item
            )
        );

        try {
            await updateDealStage(
                deal.id,
                nextStage
            );
        } catch (err) {
            setDeals(previousDeals);

            setError(
                err.message ||
                "Unable to update deal stage."
            );
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="flex items-center gap-2 text-slate-500">
                    <Loader2
                        size={20}
                        className="animate-spin"
                    />

                    Loading deals...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Deals & Pipeline
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage deals and move them through the sales pipeline.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleOpenCreateDeal}
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                    >
                        <Plus size={16} />
                        Create Deal
                    </button>

                    <button
                        type="button"
                        onClick={loadDeals}
                        className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {deals.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <p className="font-medium text-slate-700">
                        No deals found.
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                        Create a deal to see it here.
                    </p>

                    <button
                        type="button"
                        onClick={handleOpenCreateDeal}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                    >
                        <Plus size={16} />
                        Create Deal
                    </button>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {STAGES.map((stage) => (
                            <StageColumn
                                key={stage.key}
                                stage={stage}
                                deals={
                                    dealsByStage[
                                    stage.key
                                    ]
                                }
                                onDealClick={
                                    setSelectedDeal
                                }
                            />
                        ))}
                    </div>

                    <DragOverlay>
                        {activeDeal ? (
                            <div className="w-[270px] rotate-2 rounded-xl border border-slate-300 bg-white p-4 shadow-xl">
                                <div className="flex items-center gap-2 font-semibold text-slate-900">
                                    <GripVertical
                                        size={18}
                                        className="text-slate-400"
                                    />

                                    {activeDeal.name ||
                                        "Unnamed Deal"}
                                </div>

                                <p className="mt-2 text-sm text-slate-600">
                                    {formatAmount(
                                        activeDeal.amount
                                    )}
                                </p>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}

            <DealDetails
                deal={selectedDeal}
                onClose={() =>
                    setSelectedDeal(null)
                }
                onDelete={handleOpenDeleteDeal}
            />

            {showDeleteDeal && (
                <DeleteDealModal
                    deal={deleteTarget}
                    onClose={handleCloseDeleteDeal}
                    onConfirm={handleDeleteDeal}
                    deleting={deleting}
                    error={deleteError}
                />
            )}

            {showCreateDeal && (
                <CreateDealModal
                    contacts={contacts}
                    form={createForm}
                    setForm={setCreateForm}
                    onClose={handleCloseCreateDeal}
                    onSubmit={handleCreateDeal}
                    creating={creating}
                    error={createError}
                />
            )}
        </div>
    );
}