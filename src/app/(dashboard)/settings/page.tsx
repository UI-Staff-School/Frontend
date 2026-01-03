"use client";

import { useUser } from "@/lib/hooks/useUser";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Settings = {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private" | "contacts";
    showEmail: boolean;
    showPhone: boolean;
  };
  preferences: {
    theme: "light" | "dark" | "auto";
    language: string;
    timezone: string;
  };
};

const SettingsPage = () => {
  const { user, loading } = useUser();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [settings, setSettings] = useState<Settings>({
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    privacy: {
      profileVisibility: "contacts",
      showEmail: true,
      showPhone: false,
    },
    preferences: {
      theme: "light",
      language: "en",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  // Load saved settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("userSettings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved settings:", e);
      }
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      // Save to localStorage
      localStorage.setItem("userSettings", JSON.stringify(settings));

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSaveMessage({
        type: "success",
        text: "Settings saved successfully!",
      });

      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      setSaveMessage({
        type: "error",
        text: error.message || "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateNotification = (key: keyof Settings["notifications"], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
  };

  const updatePrivacy = (
    key: keyof Settings["privacy"],
    value: string | boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: value },
    }));
  };

  const updatePreference = (
    key: keyof Settings["preferences"],
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value },
    }));
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lamaPurple mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Settings
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* SAVE MESSAGE */}
      {saveMessage && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            saveMessage.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      {/* NOTIFICATIONS */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Image src="/announcement.png" alt="" width={20} height={20} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Notifications
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Choose how you want to be notified
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Image src="/mail.png" alt="" width={20} height={20} />
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Receive notifications via email
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) =>
                  updateNotification("email", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Image src="/announcement.png" alt="" width={20} height={20} />
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Receive push notifications in browser
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.push}
                onChange={(e) => updateNotification("push", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Image src="/phone.png" alt="" width={20} height={20} />
              <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Receive notifications via SMS
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.sms}
                onChange={(e) => updateNotification("sms", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* PRIVACY */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Image src="/setting.png" alt="" width={20} height={20} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Privacy
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Control your privacy settings
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-3 border border-gray-200 rounded-lg">
            <label className="block mb-2 font-medium text-gray-900">
              Profile Visibility
            </label>
            <select
              value={settings.privacy.profileVisibility}
              onChange={(e) =>
                updatePrivacy(
                  "profileVisibility",
                  e.target.value as Settings["privacy"]["profileVisibility"]
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="public">Public</option>
              <option value="contacts">Contacts Only</option>
              <option value="private">Private</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Who can view your profile
            </p>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Show Email</p>
              <p className="text-xs sm:text-sm text-gray-500">
                Display your email on profile
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.showEmail}
                onChange={(e) => updatePrivacy("showEmail", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Show Phone Number</p>
              <p className="text-xs sm:text-sm text-gray-500">
                Display your phone on profile
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.showPhone}
                onChange={(e) => updatePrivacy("showPhone", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* PREFERENCES */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Image src="/setting.png" alt="" width={20} height={20} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Preferences
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Customize your experience
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-3 border border-gray-200 rounded-lg">
            <label className="block mb-2 font-medium text-gray-900">Theme</label>
            <select
              value={settings.preferences.theme}
              onChange={(e) =>
                updatePreference(
                  "theme",
                  e.target.value as Settings["preferences"]["theme"]
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div className="p-3 border border-gray-200 rounded-lg">
            <label className="block mb-2 font-medium text-gray-900">
              Language
            </label>
            <select
              value={settings.preferences.language}
              onChange={(e) => updatePreference("language", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          <div className="p-3 border border-gray-200 rounded-lg">
            <label className="block mb-2 font-medium text-gray-900">
              Timezone
            </label>
            <select
              value={settings.preferences.timezone}
              onChange={(e) => updatePreference("timezone", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
              <option value="Europe/London">Europe/London</option>
            </select>
          </div>
        </div>
      </div>

      {/* ACCOUNT ACTIONS */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Image src="/logout.png" alt="" width={20} height={20} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Account Actions
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Manage your account
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push("/profile")}
            className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Image src="/profile.png" alt="" width={20} height={20} />
              <span className="font-medium text-gray-900">View Profile</span>
            </div>
            <span className="text-gray-400">→</span>
          </button>

          <button
            onClick={() => router.push("/logout")}
            className="w-full flex items-center justify-between p-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600"
          >
            <div className="flex items-center gap-3">
              <Image src="/logout.png" alt="" width={20} height={20} />
              <span className="font-medium">Sign Out</span>
            </div>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-lamaPurple text-white rounded-lg hover:bg-lamaPurpleDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;

