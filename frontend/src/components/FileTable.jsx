import { Download, Loader2, Trash2 } from "lucide-react";
import { formatBytes, formatDate, getFileTypeLabel } from "../utils/formatters.js";

function EmptyState() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-4 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center bg-slate-100 text-slate-500" style={{ borderRadius: 8 }}>
        <Download className="h-6 w-6" aria-hidden="true" />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-950">No files uploaded</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">Uploaded files will appear here.</p>
    </div>
  );
}

function FileTable({
  files,
  isLoading,
  actionState,
  onDownload,
  onDelete,
}) {
  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-950">Files</h2>
          <p className="text-sm text-slate-500">{files.length} object{files.length === 1 ? "" : "s"}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-sky-700" aria-hidden="true" />
          <span className="text-sm font-semibold text-slate-600">Loading files</span>
        </div>
      ) : files.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-5 py-3 text-left text-xs font-bold uppercase tracking-normal text-slate-500">
                  File Name
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-bold uppercase tracking-normal text-slate-500">
                  File Type
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-bold uppercase tracking-normal text-slate-500">
                  Size
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-bold uppercase tracking-normal text-slate-500">
                  Upload Date
                </th>
                <th scope="col" className="px-5 py-3 text-right text-xs font-bold uppercase tracking-normal text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {files.map((file) => {
                const busy = actionState?.fileId === file.file_id;
                const downloading = busy && actionState?.type === "download";
                const deleting = busy && actionState?.type === "delete";

                return (
                  <tr key={file.file_id} className="transition hover:bg-slate-50">
                    <td className="max-w-xs px-5 py-4">
                      <div className="truncate text-sm font-semibold text-slate-950">{file.file_name}</div>
                      <div className="mt-1 truncate text-xs text-slate-500">{file.file_id}</div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                      {getFileTypeLabel(file.file_type)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                      {formatBytes(file.file_size)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                      {formatDate(file.upload_time)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => onDownload(file)}
                          disabled={busy}
                          title="Download"
                          aria-label={`Download ${file.file_name}`}
                        >
                          {downloading ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          ) : (
                            <Download className="h-4 w-4" aria-hidden="true" />
                          )}
                        </button>
                        <button
                          type="button"
                          className="icon-button hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                          onClick={() => onDelete(file)}
                          disabled={busy}
                          title="Delete"
                          aria-label={`Delete ${file.file_name}`}
                        >
                          {deleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          ) : (
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default FileTable;
