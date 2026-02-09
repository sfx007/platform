"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import Link from "next/link";

interface ProfileData {
  username: string;
  displayName: string;
  bio: string;
  profileImage: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile", { credentials: "include" });
        if (!res.ok) {
          setMessage({ type: "error", text: "Failed to load profile" });
          setLoading(false);
          return;
        }
        const data: ProfileData = await res.json();
        setProfile(data);
        setDisplayName(data.displayName);
        setBio(data.bio);
        setProfileImage(data.profileImage);
      } catch {
        setMessage({ type: "error", text: "Network error loading profile" });
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  async function handleFileUpload(file: File) {
    // Validate on client side first
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: "error", text: "Only JPEG, PNG, WebP, and GIF images are allowed." });
      return;
    }

    // Compress/resize on client before uploading (max 512KB, max 400x400)
    const compressed = await compressImage(file, 400, 0.85);
    if (compressed.size > 512 * 1024) {
      setMessage({ type: "error", text: "Image is too large even after compression. Try a smaller image." });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", compressed);

      const res = await fetch("/api/profile/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Upload failed" });
        return;
      }

      setProfileImage(data.profileImage);
      setMessage({ type: "success", text: "Profile picture updated!" });
    } catch {
      setMessage({ type: "error", text: "Network error uploading image" });
    } finally {
      setUploading(false);
    }
  }

  function compressImage(file: File, maxSize: number, quality: number): Promise<File> {
    return new Promise((resolve) => {
      const img = document.createElement("img");
      const canvas = document.createElement("canvas");
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          let { width, height } = img;

          // Scale down to fit within maxSize x maxSize
          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], file.name, { type: "image/webp" }));
              } else {
                resolve(file); // fallback to original
              }
            },
            "image/webp",
            quality
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ displayName, bio, profileImage }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to save" });
        setSaving(false);
        return;
      }

      setProfile(data);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch {
      setMessage({ type: "error", text: "Network error — please try again" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="px-6 py-6 max-w-2xl mx-auto flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500 text-sm">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 max-w-2xl mx-auto animate-float-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge badge-yellow">SETTINGS</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-100 mb-1">Edit Profile</h1>
        <p className="text-gray-500 text-sm">
          Update your display name, bio, and profile image.
        </p>
      </div>

      {/* Preview card */}
      {profile && (
        <div className="game-card p-5 mb-6 flex items-center gap-4">
          <div
            className={`relative h-20 w-20 rounded-full overflow-hidden border-2 flex-shrink-0 cursor-pointer group transition-all ${
              dragOver ? "border-yellow-400 ring-2 ring-yellow-500/40" : "border-gray-700 hover:border-yellow-500"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profileImage || "/img/new_boots_profile.webp"}
              alt={displayName || profile.username}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploading ? (
                <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
                e.target.value = "";
              }}
            />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-gray-100 truncate">
              {displayName || profile.username}
            </p>
            <p className="text-sm text-gray-500">@{profile.username}</p>
            {bio && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{bio}</p>}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-2 text-[11px] text-yellow-500 hover:text-yellow-400 font-semibold transition-colors disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "📷 Change Picture"}
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="game-card p-6 space-y-5">
        {message && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-950/50 border border-green-800/30 text-green-400"
                : "bg-red-950/50 border border-red-800/30 text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
            {message.text}
          </div>
        )}

        <div>
          <label htmlFor="displayName" className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 transition-all text-sm"
            placeholder="Your display name"
            required
            minLength={1}
            maxLength={50}
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 transition-all text-sm resize-none"
            placeholder="Tell us about yourself…"
            maxLength={200}
            rows={3}
          />
          <p className="text-xs text-gray-600 mt-1 text-right">{bio.length}/200</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
            Profile Picture
          </label>
          <div
            className={`relative w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
              dragOver
                ? "border-yellow-400 bg-yellow-500/10"
                : "border-gray-700 hover:border-gray-500 bg-gray-800/50"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-400">Uploading…</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-500">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p className="text-xs text-gray-400">
                  <span className="text-yellow-500 font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-[10px] text-gray-600">
                  JPEG, PNG, WebP, GIF • Max 512 KB • Auto-compressed to 400×400
                </p>
              </div>
            )}
          </div>
          {profileImage && profileImage !== "/img/new_boots_profile.webp" && (
            <button
              type="button"
              onClick={() => {
                setProfileImage("/img/new_boots_profile.webp");
                setMessage({ type: "success", text: "Profile picture reset. Click Save to confirm." });
              }}
              className="mt-2 text-[11px] text-red-400 hover:text-red-300 font-semibold transition-colors"
            >
              ✕ Remove picture (use default)
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary !py-2.5 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <Link href="/progress" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
