// src/pages/admin/settings/AdminSecuritySettingsPanel.jsx
import React, { useState } from "react";
import AdminLayout from "../../../layouts/Layout";
import SettingsBackBar from "../../../components/SettingsBackBar";

export default function AdminSecuritySettingsPanel({ onBack }) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);

  function updateField(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function validate() {
    if (!form.currentPassword) return "Enter current password.";
    if (!form.newPassword || form.newPassword.length < 8)
      return "New password must be at least 8 characters.";
    if (form.newPassword !== form.confirmPassword)
      return "Passwords do not match.";
    return null;
  }

  async function handleSave(e) {
    e.preventDefault();
    const err = validate();
    if (err) return alert(err);

    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      alert("Password changed (mock).");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      onBack && onBack();
    } catch {
      alert("Failed to change password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <SettingsBackBar title="Security Settings" onBack={onBack} />

      <form onSubmit={handleSave} className="space-y-6">
        <section>
          <h3 className="text-lg font-semibold mb-4">Password &amp; Login</h3>

          <div className="space-y-4 max-w-xl">
            <div>
              <label className="block text-sm font-medium mb-2">
                Current password
              </label>
              <input
                name="currentPassword"
                type="password"
                placeholder="Enter current password"
                value={form.currentPassword}
                onChange={updateField}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                New password
              </label>
              <input
                name="newPassword"
                type="password"
                placeholder="Enter new password"
                value={form.newPassword}
                onChange={updateField}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm new password
              </label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={form.confirmPassword}
                onChange={updateField}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>
          </div>
        </section>

        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-full bg-blue-600 text-white"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 rounded-full border"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
