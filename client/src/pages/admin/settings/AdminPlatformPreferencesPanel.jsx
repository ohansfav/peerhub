// src/pages/admin/settings/AdminPlatformPreferencesPanel.jsx
import React, { useState } from "react";
import SettingsBackBar from "../../../components/SettingsBackBar";
import AdminLayout from "../../../layouts/Layout";

const TIMEZONES = ["UTC", "Africa/Lagos", "America/New_York", "Europe/London"];
const LANGUAGES = ["English", "Français", "Español"];

export default function AdminPlatformPreferencesPanel({ onBack }) {
  const [form, setForm] = useState({
    enableBetaFeatures: false,
    maintenanceMode: false,
    defaultLanguage: "English",
    timezone: "Africa/Lagos",
  });
  const [saving, setSaving] = useState(false);

  function toggle(key) {
    setForm((p) => ({ ...p, [key]: !p[key] }));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      alert("Platform preferences saved (mock).");
    } catch {
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <SettingsBackBar title="Platform Preferences" onBack={onBack} />

      <form onSubmit={handleSave} className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-start justify-between p-4 rounded-lg border bg-white">
            <div>
              <div className="text-sm font-medium">Enable beta features</div>
              <div className="text-sm text-gray-500 mt-1">
                Allow early access to experimental features for admins.
              </div>
            </div>
            <div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.enableBetaFeatures}
                  onChange={() => toggle("enableBetaFeatures")}
                  className="sr-only"
                />
                <span
                  className={`w-12 h-6 rounded-full transition ${
                    form.enableBetaFeatures ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`block w-5 h-5 mt-0.5 ml-0.5 rounded-full bg-white transform transition ${
                      form.enableBetaFeatures
                        ? "translate-x-6"
                        : "translate-x-0"
                    }`}
                  ></span>
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-start justify-between p-4 rounded-lg border bg-white">
            <div>
              <div className="text-sm font-medium">Maintenance mode</div>
              <div className="text-sm text-gray-500 mt-1">
                Put the platform in maintenance mode for updates.
              </div>
            </div>
            <div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.maintenanceMode}
                  onChange={() => toggle("maintenanceMode")}
                  className="sr-only"
                />
                <span
                  className={`w-12 h-6 rounded-full transition ${
                    form.maintenanceMode ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`block w-5 h-5 mt-0.5 ml-0.5 rounded-full bg-white transform transition ${
                      form.maintenanceMode ? "translate-x-6" : "translate-x-0"
                    }`}
                  ></span>
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Default language
            </label>
            <select
              name="defaultLanguage"
              value={form.defaultLanguage}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Timezone</label>
            <select
              name="timezone"
              value={form.timezone}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg"
            >
              {TIMEZONES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
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
