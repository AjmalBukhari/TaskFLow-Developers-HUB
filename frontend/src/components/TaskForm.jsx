import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { createTask, updateTask, uploadTempFile } from '../services/api';

const initialState = {
  title: '', description: '', status: 'Pending',
  priority: 'Low', dueDate: '', pinned: false
};

export default function TaskForm({ task, onClose, onSaved, showToast }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const fileRef = useRef(null);
  const isEdit = !!task;

  const hasPending = pendingFiles.length > 0;

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '', description: task.description || '',
        status: task.status || 'Pending', priority: task.priority || 'Low',
        dueDate: task.dueDate?.slice(0, 10) || '', pinned: task.pinned || false
      });
    } else setForm(initialState);
  }, [task]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files).filter(f => {
      const exists = [...pendingFiles, ...uploadedFiles].some(item => item.name === f.name);
      if (exists) showToast(`"${f.name}" already added`, 'warning');
      return !exists;
    });
    setPendingFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removePending = (index) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeUploaded = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadSingle = async (index) => {
    const file = pendingFiles[index];
    setUploadingIdx(index);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await uploadTempFile(fd);
      const record = res.data.data;
      setUploadedFiles(prev => [...prev, { name: file.name, size: file.size, record }]);
      setPendingFiles(prev => prev.filter((_, i) => i !== index));
      showToast(`"${file.name}" uploaded`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || `Upload failed: ${file.name}`, 'error');
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return showToast('Title is required', 'warning');
    try {
      setLoading(true);
      if (task) {
        await updateTask(task.id, form);
        showToast(`Task "${task.title}" updated`, 'info');
        if (onSaved) onSaved(task.id);
      } else {
        const attachmentIds = uploadedFiles.map(f => f.record.id);
        const res = await createTask({ ...form, attachmentIds });
        showToast(attachmentIds.length > 0 ? `Task created with ${attachmentIds.length} file(s)` : 'Task created', 'success');
        setForm(initialState);
        setPendingFiles([]);
        setUploadedFiles([]);
        if (onSaved) onSaved(res?.data?.data?.id);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving task', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const canCreate = !hasPending && !loading;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm dark:shadow-gray-900/50 border dark:border-gray-700 max-w-xl mx-auto">
      <h2 className="text-lg font-semibold dark:text-gray-100 mb-4">{isEdit ? 'Edit Task' : 'Add New Task'}</h2>
      <div className="space-y-3">
        <input name="title" placeholder="Task title" value={form.title} onChange={handleChange}
          className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 p-2 rounded focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400" />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange}
          className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 p-2 rounded focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400" />
        <div className="grid grid-cols-2 gap-3">
          <select name="status" value={form.status} onChange={handleChange}
            className="border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 p-2 rounded">
            <option>Pending</option><option>In Progress</option><option>Completed</option>
          </select>
          <select name="priority" value={form.priority} onChange={handleChange}
            className="border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 p-2 rounded">
            <option>Low</option><option>Medium</option><option>High</option>
          </select>
        </div>
        <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange}
          className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 p-2 rounded" />
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <input type="checkbox" name="pinned" checked={form.pinned} onChange={handleChange} /> Pin this task
        </label>

        {!isEdit && (
          <div className="border-t dark:border-gray-700 pt-3">
            <div className="flex items-center gap-2 mb-2">
              <label className="cursor-pointer text-xs px-3 py-1.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/60 transition">
                + Attach Files
                <input ref={fileRef} type="file" multiple onChange={handleFileSelect} className="hidden" />
              </label>
            </div>

            {(pendingFiles.length > 0 || uploadedFiles.length > 0) && (
              <div className="space-y-1 mb-2 max-h-40 overflow-y-auto">
                {pendingFiles.map((f, i) => (
                  <div key={'p' + i} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-700/50 px-2 py-1.5 rounded">
                    <div className="flex-1 truncate mr-2 text-gray-700 dark:text-gray-300">{f.name}</div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-gray-400 dark:text-gray-500">{formatSize(f.size)}</span>
                      <button onClick={() => uploadSingle(i)} disabled={uploadingIdx !== null}
                        className="text-indigo-500 dark:text-indigo-400 hover:underline disabled:opacity-40">
                        {uploadingIdx === i ? 'Uploading...' : 'Upload'}
                      </button>
                      <button onClick={() => removePending(i)} className="text-red-400 hover:text-red-600">&times;</button>
                    </div>
                  </div>
                ))}
                {uploadedFiles.map((f, i) => (
                  <div key={'u' + i} className="flex items-center justify-between text-xs bg-green-50 dark:bg-green-900/20 px-2 py-1.5 rounded">
                    <div className="flex-1 truncate mr-2 text-green-700 dark:text-green-300">{f.name}</div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-gray-400 dark:text-gray-500">{formatSize(f.size)}</span>
                      <span className="text-green-500 dark:text-green-400">&#10003;</span>
                      <button onClick={() => removeUploaded(i)} className="text-red-400 hover:text-red-600">&times;</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button onClick={handleSubmit} disabled={!canCreate}
            className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded disabled:opacity-50">
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
          <button onClick={onClose} className="border dark:border-gray-600 dark:text-gray-300 px-4 py-2 rounded">Cancel</button>
        </div>
      </div>
    </motion.div>
  );
}
