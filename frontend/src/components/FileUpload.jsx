import { AlertCircle, CheckCircle2, Loader2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { getApiErrorMessage, uploadFile } from "../services/api.js";

const MAX_CLIENT_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "text/plain",
]);

function FileUpload({ onUploadComplete }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(null);

  const validateFile = (file) => {
    if (!file) {
      return "Select a file to upload.";
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return "Supported file types: PDF, JPG, PNG, TXT.";
    }

    if (file.size > MAX_CLIENT_UPLOAD_BYTES) {
      return "Maximum file size is 10 MB.";
    }

    return null;
  };

  const handleFile = async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setMessage(null);

    try {
      const uploadedFile = await uploadFile(file, setProgress);
      setMessage({ type: "success", text: `${uploadedFile?.file_name || file.name} uploaded successfully.` });
      onUploadComplete?.(uploadedFile);
    } catch (error) {
      setMessage({ type: "error", text: getApiErrorMessage(error) });
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setIsUploading(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  return (
    <section className="panel p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-950">Upload File</h2>
          <p className="mt-1 text-sm text-slate-500">PDF, JPG, PNG, TXT up to 10 MB</p>
        </div>
        <UploadCloud className="h-5 w-5 text-sky-700" aria-hidden="true" />
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        disabled={isUploading}
        className={[
          "flex w-full flex-col items-center justify-center border border-dashed px-5 py-10 text-center transition",
          isDragging
            ? "border-sky-400 bg-sky-50"
            : "border-slate-300 bg-slate-50 hover:border-sky-300 hover:bg-sky-50",
          isUploading ? "cursor-not-allowed opacity-80" : "cursor-pointer",
        ].join(" ")}
        style={{ borderRadius: 8 }}
      >
        <span className="mb-3 flex h-12 w-12 items-center justify-center bg-white text-sky-700 shadow-sm" style={{ borderRadius: 8 }}>
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
          ) : (
            <UploadCloud className="h-6 w-6" aria-hidden="true" />
          )}
        </span>
        <span className="text-sm font-semibold text-slate-950">
          {isUploading ? "Uploading..." : "Drop a file here or browse"}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.txt,application/pdf,image/jpeg,image/png,text/plain"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      {isUploading && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden bg-slate-100" style={{ borderRadius: 999 }}>
            <div
              className="h-full bg-sky-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {message && (
        <div
          className={[
            "mt-4 flex items-start gap-2 border px-3 py-2 text-sm",
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800",
          ].join(" ")}
          style={{ borderRadius: 8 }}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </section>
  );
}

export default FileUpload;
