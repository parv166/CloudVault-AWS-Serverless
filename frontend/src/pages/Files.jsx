import { AlertCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import FileTable from "../components/FileTable.jsx";
import FileUpload from "../components/FileUpload.jsx";
import {
  deleteFile,
  fetchFiles,
  getApiErrorMessage,
  getDownloadUrl,
} from "../services/api.js";
import { formatBytes, getTotalStorage } from "../utils/formatters.js";

function Files() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionState, setActionState] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const loadFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setFiles(await fetchFiles());
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleUploadComplete = () => {
    loadFiles();
  };

  const handleDownload = async (file) => {
    try {
      setActionState({ fileId: file.file_id, type: "download" });
      setError(null);
      const url = await getDownloadUrl(file.file_id);
      if (!url) {
        throw new Error("Download URL was not returned by the API.");
      }
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionState(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    const file = pendingDelete;
    try {
      setActionState({ fileId: file.file_id, type: "delete" });
      setError(null);
      await deleteFile(file.file_id);
      setFiles((currentFiles) =>
        currentFiles.filter((currentFile) => currentFile.file_id !== file.file_id),
      );
      setPendingDelete(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionState(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-normal text-slate-950">File Manager</h1>
          <p className="mt-2 text-sm text-slate-500">
            {files.length} files using {formatBytes(getTotalStorage(files))}
          </p>
        </div>
        <button
          type="button"
          className="primary-button bg-slate-900 hover:bg-slate-800"
          onClick={loadFiles}
          disabled={isLoading}
        >
          <RefreshCw className={["h-4 w-4", isLoading ? "animate-spin" : ""].join(" ")} aria-hidden="true" />
          Refresh
        </button>
      </section>

      {error && (
        <div className="flex items-start gap-2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" style={{ borderRadius: 8 }}>
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <FileUpload onUploadComplete={handleUploadComplete} />
        <FileTable
          files={files}
          isLoading={isLoading}
          actionState={actionState}
          onDownload={handleDownload}
          onDelete={setPendingDelete}
        />
      </div>

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-md border border-slate-200 bg-white p-5 shadow-panel" style={{ borderRadius: 8 }}>
            <h2 className="text-lg font-bold text-slate-950">Delete File</h2>
            <p className="mt-2 break-words text-sm text-slate-600">{pendingDelete.file_name}</p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="inline-flex items-center justify-center border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                style={{ borderRadius: 8 }}
                onClick={() => setPendingDelete(null)}
                disabled={actionState?.type === "delete"}
              >
                Cancel
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={confirmDelete}
                disabled={actionState?.type === "delete"}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Files;
