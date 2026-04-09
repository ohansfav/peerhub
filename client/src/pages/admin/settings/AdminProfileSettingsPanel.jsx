// src/pages/admin/settings/AdminProfileSettingsPanel.jsx
import React, { useState } from "react";
import SettingsBackBar from "../../../components/SettingsBackBar";
import AdminLayout from "../../../layouts/Layout";

export default function AdminProfileSettingsPanel({ onBack }) {
  const [form, setForm] = useState({
    displayName: "Admin Name",
    email: "admin@edupeer.com",
    phone: "+234 800 000 0000",
  });
  const [avatarPreview, setAvatarPreview] = useState(
    "https://i.pravatar.cc/120?img=12"
  );
  const [saving, setSaving] = useState(false);

  function updateField(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    // TODO: upload file to server
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      alert("Profile saved (mock).");
    } catch (err) {
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <SettingsBackBar title="Profile Setting" onBack={onBack} />

      <form onSubmit={handleSave} className="space-y-8">
        <div className="flex items-center gap-6">
          <img
            src={avatarPreview}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover shadow-sm"
          />

          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Display name
            </label>
            <input
              name="displayName"
              value={form.displayName}
              onChange={updateField}
              className="w-full px-4 py-3 border rounded-lg"
            />
            <div className="mt-3 flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-md bg-white cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <span className="text-sm">Change avatar</span>
              </label>

              <button
                type="button"
                onClick={() =>
                  setAvatarPreview("https://i.pravatar.cc/120?img=12")
                }
                className="px-3 py-2 border rounded-md text-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={updateField}
              className="w-full px-4 py-3 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={updateField}
              className="w-full px-4 py-3 border rounded-lg"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
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
