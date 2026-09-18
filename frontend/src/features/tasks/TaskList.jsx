import { useEffect, useMemo, useState } from "react";
import { getTasks, createTask, updateTask, deleteTask } from "../../api/tasks";

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const STATUS_OPTIONS = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

function formatDueDate(value) {
  if (!value) return "No due date";

  try {
    return new Date(value).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "No due date";
  }
}

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [form, setForm] = useState({
    title: "",
    contact_id: "",
    description: "",
    priority: "medium",
    status: "todo",
    due_date: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function loadTasks() {
    try {
      setLoading(true);
      setError("");

      const result = await getTasks({
        page: 1,
        limit: 50,
        status: statusFilter,
        priority: priorityFilter,
        search,
      });

      setTasks(result.data || []);
    } catch (err) {
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [search, statusFilter, priorityFilter]);

  const summary = useMemo(() => {
    const total = tasks.length;
    const overdue = tasks.filter((task) => task.status !== "completed" && task.due_date).length;
    const next = tasks.filter((task) => task.status !== "completed").sort((a, b) => new Date(a.due_date || "9999-12-31") - new Date(b.due_date || "9999-12-31"))[0];

    return { total, overdue, next };
  }, [tasks]);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setFormError("");

      await createTask(form);
      setForm({
        title: "",
        contact_id: "",
        description: "",
        priority: "medium",
        status: "todo",
        due_date: "",
      });
      await loadTasks();
    } catch (err) {
      setFormError(err.message || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleComplete(task) {
    try {
      await updateTask(task.id, {
        status: task.status === "completed" ? "todo" : "completed",
      });
      await loadTasks();
    } catch (err) {
      setError(err.message || "Unable to update task");
    }
  }

  async function handleDelete(taskId) {
    try {
      await deleteTask(taskId);
      await loadTasks();
    } catch (err) {
      setError(err.message || "Unable to delete task");
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">Athim</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Tasks</h1>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-slate-500">Total</div>
              <div className="mt-1 text-xl font-bold text-slate-900">{summary.total}</div>
            </div>
            <div className="rounded-2xl bg-amber-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-amber-600">Due soon</div>
              <div className="mt-1 text-xl font-bold text-slate-900">{summary.overdue}</div>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-emerald-600">Next</div>
              <div className="mt-1 text-sm font-bold text-slate-900">{summary.next ? summary.next.title : "None"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Add task</h2>

        <form className="mt-4 grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
          <label className="lg:col-span-2">
            <span className="mb-1 block text-sm font-medium text-slate-700">Title</span>
            <input
              type="text"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
              placeholder="Follow up with the lead"
              required
            />
          </label>

          <label>
            <span className="mb-1 block text-sm font-medium text-slate-700">Contact ID</span>
            <input
              type="text"
              value={form.contact_id}
              onChange={(event) => setForm((current) => ({ ...current, contact_id: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
              placeholder="UUID of related contact"
              required
            />
          </label>

          <label>
            <span className="mb-1 block text-sm font-medium text-slate-700">Due date</span>
            <input
              type="datetime-local"
              value={form.due_date}
              onChange={(event) => setForm((current) => ({ ...current, due_date: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
            />
          </label>

          <label>
            <span className="mb-1 block text-sm font-medium text-slate-700">Priority</span>
            <select
              value={form.priority}
              onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1 block text-sm font-medium text-slate-700">Status</span>
            <select
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="lg:col-span-2">
            <span className="mb-1 block text-sm font-medium text-slate-700">Description</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="min-h-[110px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
              placeholder="Add the context, next steps, or notes."
            />
          </label>

          {formError && (
            <div className="lg:col-span-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div className="lg:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
            >
              {submitting ? "Saving task..." : "Create task"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-lg font-bold text-slate-900">Task list</h2>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-violet-400"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-violet-400"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-violet-400"
            >
              <option value="">All priorities</option>
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">Loading tasks...</div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            No tasks found for this workspace.
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={task.status === "completed"}
                      onChange={() => handleToggleComplete(task)}
                      className="mt-1 h-4 w-4 rounded border-slate-300"
                    />

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`text-base font-semibold ${task.status === "completed" ? "text-slate-400 line-through" : "text-slate-900"}`}>
                          {task.title}
                        </h3>
                        <span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
                          {task.priority}
                        </span>
                        <span className="rounded-full bg-slate-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                          {task.status}
                        </span>
                      </div>

                      {task.description && <p className="mt-2 text-sm text-slate-600">{task.description}</p>}
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
                        <span>Contact: {task.contact_name || task.contact_id}</span>
                        <span>Due: {formatDueDate(task.due_date)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(task.id)}
                    className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskList;
