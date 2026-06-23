import {
  Activity,
  AlertCircle,
  Clock3,
  Database,
  FileText,
  HardDrive,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchFiles, getApiBaseUrl, getApiErrorMessage } from "../services/api.js";
import { formatBytes, formatDate, getTotalStorage } from "../utils/formatters.js";

function MetricCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-normal text-slate-950">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center ${accent}`} style={{ borderRadius: 8 }}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadFiles() {
      try {
        setError(null);
        setIsLoading(true);
        const result = await fetchFiles();
        if (!ignore) {
          setFiles(result);
        }
      } catch (err) {
        if (!ignore) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadFiles();
    return () => {
      ignore = true;
    };
  }, []);

  const totalStorage = useMemo(() => getTotalStorage(files), [files]);
  const recentUploads = useMemo(
    () =>
      [...files]
        .sort((a, b) => new Date(b.upload_time || 0) - new Date(a.upload_time || 0))
        .slice(0, 5),
    [files],
  );

  const apiBaseUrl = getApiBaseUrl();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1fr_420px] lg:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-800" style={{ borderRadius: 8 }}>
            <Activity className="h-4 w-4" aria-hidden="true" />
            AWS Serverless Storage
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl">CloudVault Dashboard</h1>
              <p className="mt-2 text-sm text-slate-500">Object storage overview</p>
            </div>
            <Link to="/files" className="primary-button w-full sm:w-auto">
              <FileText className="h-4 w-4" aria-hidden="true" />
              Manage Files
            </Link>
          </div>
        </div>

        <div className="panel p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-emerald-50 text-emerald-700" style={{ borderRadius: 8 }}>
              <Activity className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">API Gateway</p>
              <p className="mt-1 break-all text-sm text-slate-500">{apiBaseUrl || "VITE_API_URL not set"}</p>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" style={{ borderRadius: 8 }}>
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Total Uploaded Files"
          value={isLoading ? "..." : files.length}
          icon={FileText}
          accent="bg-sky-50 text-sky-700"
        />
        <MetricCard
          label="Total Storage Used"
          value={isLoading ? "..." : formatBytes(totalStorage)}
          icon={HardDrive}
          accent="bg-emerald-50 text-emerald-700"
        />
        <MetricCard
          label="Metadata Records"
          value={isLoading ? "..." : files.length}
          icon={Database}
          accent="bg-amber-50 text-amber-700"
        />
      </section>

      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-950">Recent Uploads</h2>
            <p className="text-sm text-slate-500">Latest objects stored in CloudVault</p>
          </div>
          <Clock3 className="h-5 w-5 text-slate-400" aria-hidden="true" />
        </div>

        {isLoading ? (
          <div className="flex min-h-52 items-center justify-center">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-sky-700" aria-hidden="true" />
            <span className="text-sm font-semibold text-slate-600">Loading dashboard</span>
          </div>
        ) : recentUploads.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">No recent uploads.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentUploads.map((file) => (
              <div key={file.file_id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">{file.file_name}</p>
                  <p className="mt-1 text-xs text-slate-500">{file.file_type}</p>
                </div>
                <p className="text-sm font-semibold text-slate-600">{formatBytes(file.file_size)}</p>
                <p className="text-sm text-slate-500">{formatDate(file.upload_time)}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
