import { useEffect, useState, useCallback } from "react";
import { getAllTasks, deleteTask, shareTask } from "../services/api";
import TaskForm from "./TaskForm";

import SearchBar from "./SearchBar";
import ProgressBar from "./ProgressBar";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  // ================= FETCH TASKS =================
  const fetchTasks = useCallback(async () => {
    const { data } = await getAllTasks({
      search,
      status,
    });
    setTasks(data);
  }, [search, status]); // ✅ dependencies

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]); // ✅ clean

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (window.confirm("Delete this task?")) {
      await deleteTask(id);
      fetchTasks();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between mb-4 gap-3 items-center flex-wrap">
        
        <SearchBar
          onSearch={setSearch}
          onFilter={setStatus}
        />

        <ProgressBar tasks={tasks} />

        <h1 className="text-xl font-bold">Tasks</h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>

        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          + New
        </button>
      </div>

      {showForm && (
        <TaskForm
          task={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            fetchTasks();
          }}
        />
      )}

      {tasks.map((task) => (
        <div
          key={task._id}
          className="border p-3 mb-2 rounded flex justify-between"
        >
          <div>
            <h3 className="font-semibold">{task.title}</h3>
            <p className="text-sm text-gray-500">{task.description}</p>
            <span className="text-xs">{task.status}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditing(task);
                setShowForm(true);
              }}
              className="text-blue-500"
            >
              Edit
            </button>

            <button
              onClick={async () => {
                const userIds = prompt("Enter user IDs to share with (comma separated):");
                if (userIds) {
                  const ids = userIds.split(',').map(id => id.trim()).filter(id => id);
                  await shareTask(task._id, ids);
                  alert("Task shared!");
                }
              }}
              className="text-green-500"
            >
              Share
            </button>

            <button
              onClick={() => handleDelete(task._id)}
              className="text-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}