import React, { useEffect, useState } from "react";
import type { School } from "../types/school";
import { getSchools } from "../api/schools";

/* Soft tile palettes. Full class names are written out so Tailwind keeps them. */
const TILES = [
  { bg: "bg-emerald-50", icon: "text-emerald-600", pill: "text-emerald-700" },
  { bg: "bg-sky-50", icon: "text-sky-600", pill: "text-sky-700" },
  { bg: "bg-amber-50", icon: "text-amber-600", pill: "text-amber-700" },
  { bg: "bg-violet-50", icon: "text-violet-600", pill: "text-violet-700" },
  { bg: "bg-rose-50", icon: "text-rose-600", pill: "text-rose-700" },
  { bg: "bg-teal-50", icon: "text-teal-600", pill: "text-teal-700" },
];

/* Same school always gets the same color. */
const tileFor = (id: string | number) => {
  const key = String(id);
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash += key.charCodeAt(i);
  return TILES[hash % TILES.length];
};

const SchoolIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M3 10.5 12 4l9 6.5" />
    <path d="M5 10v9h14v-9" />
    <path d="M9.5 19v-5h5v5" />
    <path d="M12 4V2.5" />
  </svg>
);

const SkeletonCard: React.FC = () => (
  <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
    <div className="h-40 animate-pulse bg-slate-100" />
    <div className="space-y-2 px-5 py-5">
      <div className="mx-auto h-4 w-2/3 animate-pulse rounded bg-slate-100" />
      <div className="mx-auto h-3 w-1/2 animate-pulse rounded bg-slate-100" />
    </div>
  </div>
);

export const Schools: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSchools = async () => {
      try {
        const data = await getSchools();
        setSchools(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load schools.");
      } finally {
        setLoading(false);
      }
    };

    loadSchools();
  }, []);

  return (
    <div className="min-h-full bg-slate-50 px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-baseline justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Schools
          </h1>
          {!loading && !error && (
            <p className="text-sm text-slate-500">
              {schools.length} {schools.length === 1 ? "school" : "schools"}
            </p>
          )}
        </header>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && !error && schools.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <SchoolIcon className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-medium text-slate-700">No schools yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Schools you add will show up here.
            </p>
          </div>
        )}

        {!loading && !error && schools.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {schools.map((school) => {
              const tile = tileFor(school.id);

              return (
                <article
                  key={school.id}
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70"
                >
                  {/* Colored tile instead of an image */}
                  <div
                    className={`relative flex h-40 items-center justify-center ${tile.bg}`}
                  >
                    <span
                      className={`absolute right-3 top-3 rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-medium ${tile.pill}`}
                    >
                      ID {school.id}
                    </span>

                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/80 shadow-sm">
                      <SchoolIcon className={`h-8 w-8 ${tile.icon}`} />
                    </div>
                  </div>

                  {/* Footer, centered like the reference */}
                  <div className="px-5 py-5 text-center">
                    <h2 className="truncate text-base font-semibold text-slate-900">
                      {school.name}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {school.address || "No address provided"}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};