import { useState } from "react";
import { uploadAttachment, removeAttachment, downloadAttachment, previewAttachment } from "../../services/api";

export default function FileUpload({ taskId, attachments: initialAttachments = [], onUpdate, showToast }) {
  const [attachments, setAttachments] = useState(initialAttachments);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const exists = attachments.some(a => a.filename === file.name);
    if (exists) {
      showToast(`File "${file.name}" already exists. Rename and try again.`, "error");
      e.target.value = "";
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await uploadAttachment(taskId, formData);
      const updated = [...attachments, data.data];
      setAttachments(updated);
      onUpdate(updated);
      showToast("File uploaded", "success");
    } catch (err) {
      const msg = err.response?.data?.message || "Upload failed";
      showToast(msg, "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = async (attachmentId) => {
    try {
      await removeAttachment(taskId, attachmentId);
      const updated = attachments.filter(a => a.id !== attachmentId);
      setAttachments(updated);
      onUpdate(updated);
      showToast("File removed", "success");
    } catch {
      showToast("Failed to remove file", "error");
    }
  };

  const isImage = (filename) => /\.(jpe?g|png|gif|bmp|webp)$/i.test(filename);
  const formatSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-2">
        <label className={`cursor-pointer text-xs px-3 py-1.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/70 ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
          {uploading ? "Uploading..." : "+ Add File"}
          <input type="file" onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
      </div>
      {attachments.length > 0 && (
        <div className="space-y-1">
          {attachments.map((att) => (
            <div key={att.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded px-2 py-1.5 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                {isImage(att.filename) ? (
                  <img src={previewAttachment(taskId, att.id)} alt={att.filename}
                    className="w-8 h-8 object-cover rounded cursor-pointer"
                    onClick={() => window.open(previewAttachment(taskId, att.id), "_blank")} />
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 text-base">📄</span>
                )}
                <div className="min-w-0">
                  <p className="truncate max-w-[150px] dark:text-gray-200">{att.filename}</p>
                  {att.size && <p className="text-gray-400 dark:text-gray-500">{formatSize(att.size)}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <a href={downloadAttachment(taskId, att.id)} download
                  className="text-blue-500 dark:text-blue-400 hover:underline">Download</a>
                <button onClick={() => handleRemove(att.id)}
                  className="text-red-500 dark:text-red-400 hover:underline ml-2">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
