import React, { useEffect, useState } from "react";
import type { School, SchoolCreate } from "../types/school";
import {
  getSchools,
  createSchool,
  updateSchool,
  deleteSchool,
} from "../api/schools";
import { DataTable, type ColumnDef } from "../components/DataTable.tsx";

/* ---------- Icons ---------- */

const Icon: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = "h-4 w-4", children }) => (
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

      {footRight && (
        <span className="text-slate-400">{footRight}</span>
      )}
    </div>
  </div>
);

/* ---------- Button styles ---------- */

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

  const [showModal, setShowModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);

  const [form, setForm] = useState<SchoolCreate>({
    name: "",
    address: "",
  });

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  /* ---------- Load Schools ---------- */

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

  /* ---------- Stats ---------- */

  const withAddress = schools.filter(
    (school) => school.address?.trim()
  ).length;

  const missingAddress = schools.length - withAddress;

  /* ---------- Modal ---------- */

  const openAddModal = () => {
    setEditingSchool(null);

    setForm({
      name: "",
      address: "",
    });

    setShowModal(true);
  };

  const openEditModal = (school: School) => {
    setEditingSchool(school);

    setForm({
      name: school.name,
      address: school.address || "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingSchool(null);

    setForm({
      name: "",
      address: "",
    });
  };

  /* ---------- Create / Update ---------- */

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name.trim()) return;

    try {
      setSaving(true);
      setError("");

      if (editingSchool) {
        const updated = await updateSchool(
          editingSchool.id,
          form
        );

        setSchools((current) =>
          current.map((school) =>
            school.id === updated.id ? updated : school
          )
        );
      } else {
        const created = await createSchool(form);

        setSchools((current) => [
          ...current,
          created,
        ]);
      }

      closeModal();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Delete ---------- */

  const handleDelete = async (school: School) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${school.name}"?`
      )
    ) {
      return;
    }

    try {
      setDeletingId(school.id);
      setError("");

      await deleteSchool(school.id);

      setSchools((current) =>
        current.filter(
          (item) => item.id !== school.id
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete school."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------- DataTable Columns ---------- */

  const columns: ColumnDef<School>[] = [
    {
      key: "id",
      header: "School ID",
      sortable: true,
      accessor: (school) => (
        <span className="font-mono text-xs text-slate-500">
          #{school.id}
        </span>
      ),
    },

    {
      key: "name",
      header: "Institution",
      sortable: true,
      accessor: (school) => (
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500">
            <SchoolIcon className="h-4 w-4" />
          </span>

          <span className="truncate font-medium text-slate-900">
            {school.name}
          </span>
        </div>
      ),
    },

    {
      key: "address",
      header: "Address",
      sortable: true,
      accessor: (school) =>
        school.address ? (
          <span className="text-slate-500">
            {school.address}
          </span>
        ) : (
          <span className="text-slate-400">
            No address provided
          </span>
        ),
    },

    {
      key: "actions",
      header: "Actions",
      align: "right",
      accessor: (school) => (
        <div
          className="flex justify-end gap-2"
          onClick={(event) => event.stopPropagation()}
        >
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
      ),
    },
  ];

  /* ---------- Render ---------- */

  return (
    <div className="space-y-6">
      {/* Header */}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Institutional Schools Registry
          </h1>

          <p className="text-xs text-slate-500">
            Manage registered schools, addresses, and
            institution records.
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

          <button
            type="button"
            onClick={openAddModal}
            className={darkBtn}
          >
            <span className="text-sm leading-none">
              +
            </span>

            Add School
          </button>
        </div>
      </header>

      {/* Stat Cards */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Registered Schools"
          value={
            loading
              ? "—"
              : String(schools.length)
          }
          icon={<SchoolIcon />}
          foot={error ? "Error" : "Real-time"}
          footRight={`Showing: ${schools.length}`}
        />

        <StatCard
          label="Address on File"
          value={
            loading
              ? "—"
              : `${withAddress} Complete`
          }
          icon={<PinIcon />}
          foot={`${missingAddress} Missing`}
          footRight="Address records"
        />

        <StatCard
          label="Registry Status"
          value={
            error
              ? "Error"
              : loading
              ? "Syncing"
              : "Online"
          }
          icon={<PulseIcon />}
          foot={
            error
              ? "Request failed"
              : "Connected API"
          }
          footRight={`State: ${
            error ? "Fault" : "Nominal"
          }`}
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

      {/* Schools Table */}

      <DataTable
        title="Registered School Records"
        subtitle="All institutions currently stored in the system."
        data={schools}
        columns={columns}
        keyExtractor={(school) =>
          school.id.toString()
        }
        pageSize={10}
        isLoading={loading}
        emptyMessage="No schools found."
        searchFilter={(school, searchQuery) => {
          const query = searchQuery.toLowerCase();

          return (
            school.name
              .toLowerCase()
              .includes(query) ||
            (school.address || "")
              .toLowerCase()
              .includes(query) ||
            school.id
              .toString()
              .includes(query)
          );
        }}
      />

      {/* Add / Edit Modal */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
            {/* Modal Header */}

            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {editingSchool
                    ? "Edit School"
                    : "Add School"}
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

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* School Name */}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                  School Name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                  placeholder="Enter school name"
                  className={inputCls}
                  required
                />
              </div>

              {/* Address */}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                  Address
                </label>

                <input
                  type="text"
                  value={form.address || ""}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      address: event.target.value,
                    })
                  }
                  placeholder="Enter school address"
                  className={inputCls}
                />
              </div>

              {/* Form Buttons */}

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className={outlineBtn}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className={darkBtn}
                >
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