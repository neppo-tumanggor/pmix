"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

type Settings = {
  storeName: string;
  email: string;
  currency: string;
  notifyEmail: boolean;
  notifyProduct: boolean;
};

const defaultSettings: Settings = {
  storeName: "Mixer Store",
  email: "admin@example.com",
  currency: "IDR",
  notifyEmail: true,
  notifyProduct: false,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("mixer-settings");
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch {
        setSettings(defaultSettings);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("marketing-settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = (patch: Partial<Settings>) =>
    setSettings((prev) => ({ ...prev, ...patch }));

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage general application settings
        </p>
      </div>

      <div className="bg-white border border-border rounded-lg divide-y divide-border">
        <div className="p-6">
          <h2 className="text-base font-semibold text-foreground">General</h2>
          <p className="text-sm text-gray-500 mt-1">
            Basic store information used across the dashboard.
          </p>

          <div className="mt-4 grid gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Store name
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => update({ storeName: e.target.value })}
                className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Contact email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => update({ email: e.target.value })}
                className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) => update({ currency: e.target.value })}
                className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
              >
                <option value="IDR">IDR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-base font-semibold text-foreground">Notifications</h2>
          <p className="text-sm text-gray-500 mt-1">
            Choose what notifications you want to receive.
          </p>

          <div className="mt-4 space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-foreground">
                Email notifications
              </span>
              <input
                type="checkbox"
                checked={settings.notifyEmail}
                onChange={(e) => update({ notifyEmail: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-foreground">
                Product update alerts
              </span>
              <input
                type="checkbox"
                checked={settings.notifyProduct}
                onChange={(e) => update({ notifyProduct: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
            </label>
          </div>
        </div>

        <div className="p-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">Settings are saved locally for now.</p>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-sm text-green-700">Saved</span>
            )}
            <Button onClick={handleSave}>Save settings</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
