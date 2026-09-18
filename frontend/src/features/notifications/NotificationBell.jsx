import { useEffect, useState } from "react";
import { getTaskNotifications } from "../../api/tasks";

function NotificationBell() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const result = await getTaskNotifications(7);
        setTasks(result.data || []);
      } catch {
        setTasks([]);
      }
    }

    load();
  }, []);

  return (
    <button
      type="button"
      aria-label="Notifications"
      className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-lg text-slate-600 transition hover:bg-slate-50"
    >
      🔔
      {tasks.length > 0 && (
        <span className="absolute right-2 top-2 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500" />
      )}
    </button>
  );
}

export default NotificationBell;
