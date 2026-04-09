// src/pages/admin/settings/AdminNotificationsPanel.jsx
import React, { useState } from "react";
import AdminLayout from "../../../layouts/Layout";
import SettingsBackBar from "../../../components/SettingsBackBar";

export default function AdminNotificationsPanel({ onBack }) {
  const [alerts, setAlerts] = useState({
    newTutorApplications: false,
    studentComplaints: false,
    sessionCancellations: false,
  });

  const [channels, setChannels] = useState({
    email: false,
    inApp: false,
    sms: false,
  });

  const [saving, setSaving] = useState(false);

  function toggleAlert(key) {
    setAlerts((p) => ({ ...p, [key]: !p[key] }));
  }

  function toggleChannel(key) {
    setChannels((p) => ({ ...p, [key]: !p[key] }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      alert("Notification settings saved (mock).");
    } catch {
      alert("Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <SettingsBackBar title="Notification Settings" onBack={onBack} />

      <form onSubmit={handleSave} className="space-y-8">
        <section>
          <h3 className="text-lg font-semibold mb-4">System Alerts</h3>

          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="max-w-[70%]">
                <div className="text-sm font-medium">
                  New Tutor Applications
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Receive notifications when new tutors apply to join the
                  platform.
                </div>
              </div>

              <div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alerts.newTutorApplications}
                    onChange={() => toggleAlert("newTutorApplications")}
                    className="sr-only"
                  />
                  <span
                    className={`w-12 h-6 rounded-full transition ${
                      alerts.newTutorApplications
                        ? "bg-blue-600"
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 mt-0.5 ml-0.5 rounded-full bg-white transform transition ${
                        alerts.newTutorApplications
                          ? "translate-x-6"
                          : "translate-x-0"
                      }`}
                    ></span>
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-start justify-between">
              <div className="max-w-[70%]">
                <div className="text-sm font-medium">
                  Student Complaints & Reports
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Get notified about student complaints and reports regarding
                  tutors or sessions.
                </div>
              </div>

              <div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alerts.studentComplaints}
                    onChange={() => toggleAlert("studentComplaints")}
                    className="sr-only"
                  />
                  <span
                    className={`w-12 h-6 rounded-full transition ${
                      alerts.studentComplaints ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 mt-0.5 ml-0.5 rounded-full bg-white transform transition ${
                        alerts.studentComplaints
                          ? "translate-x-6"
                          : "translate-x-0"
                      }`}
                    ></span>
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-start justify-between">
              <div className="max-w-[70%]">
                <div className="text-sm font-medium">Session Cancellations</div>
                <div className="text-sm text-gray-500 mt-1">
                  Receive alerts when students cancel their scheduled tutoring
                  sessions.
                </div>
              </div>

              <div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alerts.sessionCancellations}
                    onChange={() => toggleAlert("sessionCancellations")}
                    className="sr-only"
                  />
                  <span
                    className={`w-12 h-6 rounded-full transition ${
                      alerts.sessionCancellations
                        ? "bg-blue-600"
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 mt-0.5 ml-0.5 rounded-full bg-white transform transition ${
                        alerts.sessionCancellations
                          ? "translate-x-6"
                          : "translate-x-0"
                      }`}
                    ></span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-4">
            Communication Preferences
          </h3>

          <div className="space-y-3">
            <label className="inline-flex items-center gap-3">
              <input
                type="checkbox"
                checked={channels.email}
                onChange={() => toggleChannel("email")}
                className="w-4 h-4 border rounded"
              />
              <span className="text-sm text-gray-700">Email</span>
            </label>

            <label className="inline-flex items-center gap-3">
              <input
                type="checkbox"
                checked={channels.inApp}
                onChange={() => toggleChannel("inApp")}
                className="w-4 h-4 border rounded"
              />
              <span className="text-sm text-gray-700">
                In-app dashboard alerts
              </span>
            </label>

            <label className="inline-flex items-center gap-3">
              <input
                type="checkbox"
                checked={channels.sms}
                onChange={() => toggleChannel("sms")}
                className="w-4 h-4 border rounded"
              />
              <span className="text-sm text-gray-700">
                SMS (optional, may incur charges)
              </span>
            </label>
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
