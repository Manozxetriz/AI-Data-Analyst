import React, { useEffect, useMemo, useState } from "react";
import type { School, SchoolCreate } from "../types/school";
import {
  getSchools,
  createSchool,
  updateSchool,
  deleteSchool,
} from "../api/schools";

/* ---------- Icons ---------- */
const Icon: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = "h-4 w-4",
  children,
}) => (
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
    {children}
  </svg>
);

const SchoolIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M3 10.5 12 4l9 6.5" />
    <path d="M5 10v9h14v-9" />
    <path d="M9.5 19v-5h5v5" />
    <path d="M12 4V2.5" />
  </Icon>
);

const PinIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </Icon>
);

const PulseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M3 12h4l3-8 4 16 3-8h4" />
  </Icon>
);

const FilterIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M3 5h18l-7 8v6l-4-2v-4L3 5Z" />
  </Icon>
);

const SortIcon: React.FC = () => (
  <Icon className="h-3 w-3 text-slate-300">
    <path d="m8 9 4-4 4 4" />
    <path d="m8 15 4 4 4-4" />
  </Icon>
);

/* ---------- Small building blocks ---------- */
const StatCard: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  foot: string;
  footRight?: string;
}> = ({ label, value, icon, foot, footRight }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5">
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-600">{label}</span>
      <span className="text-slate-400">{icon}</span>
    </div>

    <div className="mt-3 font-mono text-2xl font-bold tracking-tight text-slate-900">
      {value}
    </div>

    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
      <span className="font-mono text-slate-600">{foot}</span>
      {footRight && <span className="text-slate-400">{footRight}</span>}
    </div>
  </div>
);

const SkeletonRow: React.FC = () => (
  <tr className="border-t border-slate-100">
    <td className="px-5 py-4">
      <div className="h-3 w-12 animate-pulse rounded bg-slate-100" />
    </td>
    <td className="px-5 py-4">
      <div className="h-3 w-40 animate-pulse rounded bg-slate-100" />
    </td>
    <td className="px-5 py-4">
      <div className="h-3 w-56 animate-pulse rounded bg-slate-100" />
    </td>
    <td className="px-5 py-4" />
  </tr>
);

const outlineBtn =
  "inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

const darkBtn =
  "inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50";

const dangerBtn =
  "inline-flex items-center gap-2 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50";

const inputCls =
  "w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100";

/* ---------- Page ---------- */
export const Schools: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [form, setForm] = useState<SchoolCreate>({ name: "", address: "" });

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadSchools = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getSchools();
      setSchools(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load schools.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return schools;
    return schools.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.address || "").toLowerCase().includes(q) ||
        String(s.id).includes(q)
    );
  }, [schools, query]);

  const withAddress = schools.filter((s) => s.address?.trim()).length;
  const missingAddress = schools.length - withAddress;

  const openAddModal = () => {
    setEditingSchool(null);
    setForm({ name: "", address: "" });
    setShowModal(true);
  };

  const openEditModal = (school: School) => {
    setEditingSchool(school);
    setForm({ name: school.name, address: school.address || "" });
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditingSchool(null);
    setForm({ name: "", address: "" });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    try {
      setSaving(true);
      setError("");

      if (editingSchool) {
        const updated = await updateSchool(editingSchool.id, form);
        setSchools((current) =>
          current.map((s) => (s.id === updated.id ? updated : s))
        );
      } else {
        const created = await createSchool(form);
        setSchools((current) => [...current, created]);
      }

      closeModal();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (school: School) => {
    if (!window.confirm(`Are you sure you want to delete "${school.name}"?`)) {
      return;
    }

    try {
      setDeletingId(school.id);
      setError("");
      await deleteSchool(school.id);
      setSchools((current) => current.filter((s) => s.id !== school.id));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to delete school.");
    } finally {
      setDeletingId(null);
    }
  };

  const th =
    "px-5 py-3 text-left text-[11px] font-semibold tracking-wide text-slate-700";

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Institutional Schools Registry
          </h1>
          <p className="text-xs text-slate-500">
            Manage registered schools, addresses, and institution records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={loadSchools}
            disabled={loading}
            className={outlineBtn}
          >
            Refresh
          </button>
          <button type="button" onClick={openAddModal} className={darkBtn}>
            <span className="text-sm leading-none">+</span>
            Add School
          </button>
        </div>
      </header>

      {/* Stat cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Registered Schools"
          value={loading ? "—" : String(schools.length)}
          icon={<SchoolIcon />}
          foot={error ? "Error" : "Real-time"}
          footRight={`Showing: ${filtered.length}`}
        />
        <StatCard
          label="Address on File"
          value={loading ? "—" : `${withAddress} Complete`}
          icon={<PinIcon />}
          foot={`${missingAddress} Missing`}
          footRight="Address records"
        />
        <StatCard
          label="Registry Status"
          value={error ? "Error" : loading ? "Syncing" : "Online"}
          icon={<PulseIcon />}
          foot={error ? "Request failed" : "Connected API"}
          footRight={`State: ${error ? "Fault" : "Nominal"}`}
        />
      </section>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Table panel */}
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Registered School Records
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              All institutions currently stored in the system.
            </p>
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter records..."
            className={`${inputCls} sm:w-72`}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className={th}>
                  <span className="inline-flex items-center gap-1.5">
                    School ID <SortIcon />
                  </span>
                </th>
                <th className={th}>
                  <span className="inline-flex items-center gap-1.5">
                    Institution <SortIcon />
                  </span>
                </th>
                <th className={th}>
                  <span className="inline-flex items-center gap-1.5">
                    Address <SortIcon />
                  </span>
                </th>
                <th className={`${th} text-right`}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}

              {!loading &&
                filtered.map((school) => (
                  <tr
                    key={school.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                      #{school.id}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500">
                          <SchoolIcon className="h-4 w-4" />
                        </span>
                        <span className="truncate font-medium text-slate-900">
                          {school.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {school.address || (
                        <span className="text-slate-400">
                          No address provided
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(school)}
                          className={outlineBtn}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(school)}
                          disabled={deletingId === school.id}
                          className={dangerBtn}
                        >
                          {deletingId === school.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Empty states */}
          {!loading && !error && schools.length === 0 && (
            <div className="border-t border-slate-100 px-6 py-14 text-center">
              <FilterIcon className="mx-auto h-6 w-6 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-700">
                No schools loaded from backend
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Schools you add will show up here.
              </p>
              <button
                type="button"
                onClick={openAddModal}
                className={`${darkBtn} mt-5`}
              >
                Add First School
              </button>
            </div>
          )}

          {!loading && schools.length > 0 && filtered.length === 0 && (
            <div className="border-t border-slate-100 px-6 py-14 text-center">
              <FilterIcon className="mx-auto h-6 w-6 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-700">
                No matching records
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Try a different name, address, or ID.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-[11px]">
          
          <span className="font-mono text-slate-400">
            Status: {loading ? "Syncing" : error ? "Fault" : "Connected"}
          </span>
        </div>
      </section>


      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {editingSchool ? "Edit School" : "Add School"}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {editingSchool
                    ? "Update school information."
                    : "Enter the new school information."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close"
                className="rounded-md px-2 py-0.5 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                  School Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter school name"
                  className={inputCls}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                  Address
                </label>
                <input
                  type="text"
                  value={form.address || ""}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="Enter school address"
                  className={inputCls}
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className={outlineBtn}
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className={darkBtn}>
                  {saving
                    ? "Saving..."
                    : editingSchool
                    ? "Update School"
                    : "Add School"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};