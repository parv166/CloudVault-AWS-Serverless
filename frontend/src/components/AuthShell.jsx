import { Cloud, ShieldCheck } from "lucide-react";

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-2 lg:px-10">
        <section className="hidden text-white lg:block">
          <div className="mb-16 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500 text-white">
              <Cloud className="h-7 w-7" />
            </div>
            <span className="text-2xl font-bold">CloudVault</span>
          </div>

          <div className="max-w-lg">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm text-sky-300">
              <ShieldCheck className="h-4 w-4" />
              Secure cloud file storage
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight">
              Your files.
              <span className="block text-sky-400">Your control.</span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-400">
              Store, manage and access your files through a secure,
              serverless cloud storage platform.
            </p>
          </div>

          <p className="mt-24 text-sm text-slate-500">
            Built with AWS serverless technologies.
          </p>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="mb-6 flex items-center gap-3 text-white lg:hidden">
            <Cloud className="h-8 w-8 text-sky-400" />
            <span className="text-xl font-bold">CloudVault</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-2xl sm:p-9">
            <p className="text-sm font-semibold uppercase tracking-wider text-sky-700">
              {eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {description}
            </p>

            <div className="mt-8">{children}</div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            CloudVault · Serverless File Management
          </p>
        </section>
      </div>
    </div>
  );
}
