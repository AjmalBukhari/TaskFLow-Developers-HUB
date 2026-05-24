import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAllTasks, deleteTask, shareTask } from "../../services/api";
import SearchBar from "../SearchBar";
import TaskForm from "../TaskForm";
import ConfirmModal from "../ui/ConfirmModal";
import ShareModal from "../ui/ShareModal";
import FileUpload from "../ui/FileUpload";

export default function AllTasks({ showToast }) {
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, type: "default", title: "", message: "", onConfirm: () => {}
  });
  const [shareModal, setShareModal] = useState({ isOpen: false, taskId: null });

  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 7;

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getAllTasks({ search, status });
      setTasks(data.data);
    } catch {
      showToast("Failed to load tasks", "error");
    } finally {
      setLoading(false);
    }
  }, [search, status, showToast]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { setCurrentPage(1); }, [search, status]);

  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selected.length === currentTasks.length) setSelected([]);
    else setSelected(currentTasks.map((t) => t.id));
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true, type: "danger", title: "Delete Task",
      message: "Are you sure you want to delete this task? It will be moved to the bin.",
      onConfirm: async () => {
        try { await deleteTask(id); showToast("Task deleted", "error"); fetchTasks(); }
        catch { showToast("Delete failed", "error"); }
      }
    });
  };

  const handleBulkDelete = () => {
    setConfirmModal({
      isOpen: true, type: "danger", title: "Delete Selected Tasks",
      message: `Are you sure you want to delete ${selected.length} task(s)? They will be moved to the bin.`,
      onConfirm: async () => {
        await Promise.all(selected.map((id) => deleteTask(id)));
        showToast("Selected tasks deleted", "error");
        setSelected([]);
        fetchTasks();
      }
    });
  };

  const sortedTasks = [...tasks].sort((a, b) => b.pinned - a.pinned);
  const indexOfLast = currentPage * tasksPerPage;
  const indexOfFirst = indexOfLast - tasksPerPage;
  const currentTasks = sortedTasks.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(tasks.length / tasksPerPage);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <SearchBar onSearch={setSearch} onFilter={setStatus} />
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold dark:text-gray-100">All Tasks</h2>
          {selected.length > 0 && (
            <button onClick={handleBulkDelete}
              className="text-sm bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 px-3 py-1 rounded">Delete Selected ({selected.length})</button>
          )}
        </div>
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No tasks found</p>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input type="checkbox" checked={currentTasks.length > 0 && selected.length === currentTasks.length}
                onChange={selectAll} /> Select Page
            </div>
            {currentTasks.map((task) => (
              <div key={task.id}>
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex justify-between items-center border border-b-0 dark:border-gray-700 p-3 rounded-t-lg ${task.pinned ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700" : ""}`}>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={selected.includes(task.id)} onChange={() => toggleSelect(task.id)} />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        {task.pinned && <span className="text-yellow-500">📌</span>}
                        <h4 onClick={() => setEditingTask(task)}
                          className={`font-medium dark:text-gray-100 ${task.pinned ? "text-indigo-600 dark:text-indigo-400" : ""}`}>{task.title}</h4>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{task.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.status === "Completed"
                        ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400"
                        : task.status === "In Progress"
                        ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400"
                        : "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400"
                    }`}>{task.status}</span>
                    <button onClick={() => setEditingTask(task)} className="text-blue-500 dark:text-blue-400 text-sm">Edit</button>
                    <button onClick={() => setShareModal({ isOpen: true, taskId: task.id })}
                      className="text-green-500 dark:text-green-400 text-sm">Share</button>
                    <button onClick={() => handleDelete(task.id)} className="text-red-500 dark:text-red-400 text-sm">Delete</button>
                  </div>
                </motion.div>
                <div className="border-x border-b dark:border-gray-700 rounded-b-lg px-3 pb-3">
                  <FileUpload taskId={task.id} showToast={showToast} />
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center mt-4">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 border dark:border-gray-700 rounded disabled:opacity-50">Prev</button>
              <span className="text-sm text-gray-500 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 border dark:border-gray-700 rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
      <ConfirmModal isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm} title={confirmModal.title}
        message={confirmModal.message} type={confirmModal.type}
        confirmText={confirmModal.type === "danger" ? "Delete" : "Confirm"} />
      <ShareModal isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, taskId: null })}
        onShare={async (ids) => {
          try { await shareTask(shareModal.taskId, ids); showToast("Task shared!", "success"); }
          catch { showToast("Failed to share task", "error"); }
        }} />
      {editingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div onClick={() => setEditingTask(null)} className="absolute inset-0" />
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 w-full max-w-xl z-10">
            <TaskForm task={editingTask} onClose={() => setEditingTask(null)}
              onSaved={() => { setEditingTask(null); fetchTasks(); }} showToast={showToast} />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
