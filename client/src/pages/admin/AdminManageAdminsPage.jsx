import { useState } from "react";
import Spinner from "../../components/common/Spinner";
import ErrorAlert from "../../components/common/ErrorAlert";
import { useAdmins, useCreateAdmin } from "../../hooks/admin";
import { useIsSuperAdmin } from "../../hooks/auth/useUserRoles";
import Input from "../../components/ui/Input";
import ResponsiveDataSection from "../../components/admin/ResponsiveDataSection";

const getUserName = (user) => {
  if (!user) return "—";
  const userDetails = user.user || user;
  const name =
    `${userDetails.firstName || ""} ${userDetails.lastName || ""}`.trim() ||
    "—";
  return name;
};

const adminColumns = [
  {
    header: "Name",
    cell: (admin) => (
      <div className="flex items-center gap-2">
        <img
          src={admin.user?.profileImageUrl || "https://via.placeholder.com/32x32?text=A"}
          alt={getUserName(admin)}
          className="w-8 h-8 rounded-full object-cover"
        />
        {getUserName(admin)}
      </div>
    ),
  },
  { header: "Email", cell: (admin) => admin.user.email ?? "—" },
  {
    header: "Role",
    cell: (admin) => admin.user.role ?? "—",
    cellClassName: "capitalize",
  },
  {
    header: "Status",
    cell: (admin) => (
      <span
        className={`px-2 py-1 text-xs rounded-full ${
          admin.user.accountStatus === "active"
            ? "bg-blue-100 text-blue-700"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {admin.user.accountStatus ?? "—"}
      </span>
    ),
  },
  {
    header: "Type",
    cell: (admin) =>
      admin.isSuperAdmin ? (
        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
          Super Admin
        </span>
      ) : (
        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
          Admin
        </span>
      ),
  },
];

const renderAdminCard = (admin) => (
  <div className="border rounded-lg p-4 space-y-3">
    <div className="flex items-center gap-3">
      <img
        src={admin.user?.profileImageUrl || "https://via.placeholder.com/40x40?text=A"}
        alt={getUserName(admin)}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div>
        <p className="font-medium text-gray-900">{getUserName(admin)}</p>
        <p className="text-sm text-gray-500">{admin.user.email ?? "—"}</p>
      </div>
    </div>
    <div className="flex items-center justify-between text-sm">
      <p className="text-gray-600 capitalize">{admin.user.role ?? "—"}</p>
      <div>
        {admin.isSuperAdmin ? (
          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
            Super Admin
          </span>
        ) : (
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
            Admin
          </span>
        )}
      </div>
    </div>
  </div>
);

export default function AdminSettingsPage() {
  const isSuperAdmin = useIsSuperAdmin();
  const { data: admins, isLoading, error } = useAdmins();
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const createAdminMutation = useCreateAdmin({
    onSuccess: () => {
      setFormState({ firstName: "", lastName: "", email: "", password: "" });
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    createAdminMutation.mutate(formState);
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Access Restricted
          </h2>
          <p className="text-gray-500 mt-1">
            You don’t have permission to manage administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-10 mx-auto">
      <div className="mb-4">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Manage Platform Administrators
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Review current administrators, add new team members, and manage super
          admin access.
        </p>
      </div>

      <ResponsiveDataSection
        title="Admin Accounts"
        data={admins}
        columns={adminColumns}
        renderCard={renderAdminCard}
        getLink={() => "#"} // No view link for admins in this context
        isLoading={isLoading}
        error={error}
        emptyMessage="No admins found."
      />

      {/* ================= Add New Admin ================= */}
      <section className="bg-white border rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Add New Admin</h2>
          <p className="text-sm text-gray-500 mt-1">
            Invite a new administrator to manage the platform.
          </p>
        </div>

        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          {createAdminMutation.error && (
            <ErrorAlert error={createAdminMutation.error} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <Input
                name="firstName"
                value={formState.firstName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Ada"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <Input
                name="lastName"
                value={formState.lastName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Okeke"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                type="email"
                name="email"
                value={formState.email}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Temporary Password
              </label>
              <Input
                type="password"
                name="password"
                value={formState.password}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none "
                placeholder="Enter a secure password"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createAdminMutation.isPending}
              className="px-6 py-3 rounded-md bg-blue-600 text-white font-medium hover:brightness-95 disabled:opacity-60"
            >
              {createAdminMutation.isPending ? "Creating..." : "Create Admin"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
