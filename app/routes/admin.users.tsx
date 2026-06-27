import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

type AdminUser = {
  id: string;
  email: string;
  role: "admin" | "user" | "member";
  memberExpiresAt: string | null;
  name: string | null;
  phone: string | null;
  bio: string | null;
  bannedAt: string | null;
  createdAt: string;
};

function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AdminUser["role"]>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setLoading(true);
    apiFetch("/api/admin/users")
      .then((data) => setUsers(data.users || []))
      .catch((e: any) => setError(e?.message || "Failed to load users"))
      .finally(() => setLoading(false));
  };

  const saveUser = async (user: AdminUser) => {
    try {
      await apiFetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          role: user.role,
          memberExpiresAt: user.memberExpiresAt ? new Date(user.memberExpiresAt).toISOString() : null,
          name: user.name,
          phone: user.phone,
          bio: user.bio,
          bannedAt: user.bannedAt,
        }),
      });
      setMessage("User saved successfully.");
      setError("");
      setTimeout(() => setMessage(""), 3000);
    } catch (e: any) {
      setError(e?.message || "Failed to save user");
    }
  };

  const toggleBan = async (user: AdminUser) => {
    const nextBannedAt = user.bannedAt ? null : new Date().toISOString();
    try {
      await apiFetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          role: user.role,
          memberExpiresAt: user.memberExpiresAt,
          bannedAt: nextBannedAt,
        }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, bannedAt: nextBannedAt } : u))
      );
      setMessage(user.bannedAt ? "User unbanned." : "User banned.");
      setError("");
      setTimeout(() => setMessage(""), 3000);
    } catch (e: any) {
      setError(e?.message || "Failed to update ban status");
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await apiFetch(`/api/admin/users/${id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setDeleteConfirmId(null);
      setMessage("User deleted.");
      setError("");
      setTimeout(() => setMessage(""), 3000);
    } catch (e: any) {
      setError(e?.message || "Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-brown-dark mb-6">Users</h1>
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-brown-dark/40 border border-gold-light/10 rounded-xl p-6 h-24" />
          ))}
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    const emailMatch = u.email.toLowerCase().includes(query.toLowerCase());
    const roleMatch = roleFilter === "all" ? true : u.role === roleFilter;
    return emailMatch && roleMatch;
  });

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-brown-dark mb-6">Users</h1>

      {message && (
        <div className="mb-4 rounded-lg border border-green-800/30 bg-green-900/20 px-4 py-3 text-sm text-green-300 font-medium flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-800/30 bg-red-900/20 px-4 py-3 text-sm text-red-300 font-medium flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by email..."
          className="w-full px-3 py-2.5 rounded-lg bg-brown-dark border border-gold-light/20 text-gold-pale text-sm focus:outline-none focus:ring-2 focus:ring-gold-primary/40 placeholder:text-gold-light/30"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="w-full px-3 py-2.5 rounded-lg bg-brown-dark border border-gold-light/20 text-gold-pale text-sm focus:outline-none focus:ring-2 focus:ring-gold-primary/40"
        >
          <option value="all">All roles</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
          <option value="user">User</option>
        </select>
        <div className="text-sm text-brown-dark/80 self-center">
          Showing {filteredUsers.length} / {users.length}
        </div>
      </div>

      {/* User Cards */}
      <div className="space-y-3">
        {filteredUsers.map((u) => {
          const isExpanded = expandedId === u.id;
          const isBanned = !!u.bannedAt;

          return (
            <div
              key={u.id}
              className={`bg-brown-dark/85 border rounded-xl overflow-hidden transition ${
                isBanned ? "border-red-500/30" : "border-gold-light/20"
              }`}
            >
              {/* Main row */}
              <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
                {/* Avatar + Identity */}
                <div className="flex items-center gap-3 md:w-56 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gold-primary/20 border border-gold-primary/30 flex items-center justify-center text-gold-primary font-bold text-sm">
                    {(u.name || u.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gold-pale truncate">{u.email}</p>
                    <p className="text-xs text-gold-light/50">
                      Created: {new Date(u.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Role + Expiry */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gold-light/60 mb-1">Role</label>
                    <select
                      value={u.role}
                      onChange={(e) => {
                        const role = e.target.value as AdminUser["role"];
                        setUsers((prev) =>
                          prev.map((item) =>
                            item.id === u.id
                              ? {
                                  ...item,
                                  role,
                                  memberExpiresAt:
                                    role === "member"
                                      ? item.memberExpiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                                      : null,
                                }
                              : item
                          )
                        );
                      }}
                      className="w-full px-2 py-2 rounded-lg bg-brown-dark border border-gold-light/20 text-gold-pale text-sm focus:outline-none focus:ring-2 focus:ring-gold-primary/40"
                    >
                      <option value="user">User</option>
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gold-light/60 mb-1">Member Expires</label>
                    <input
                      type="date"
                      value={u.memberExpiresAt ? new Date(u.memberExpiresAt).toISOString().slice(0, 10) : ""}
                      onChange={(e) =>
                        setUsers((prev) =>
                          prev.map((item) =>
                            item.id === u.id ? { ...item, memberExpiresAt: e.target.value ? new Date(`${e.target.value}T00:00:00Z`).toISOString() : null } : item
                          )
                        )
                      }
                      className="w-full px-2 py-2 rounded-lg bg-brown-dark border border-gold-light/20 text-gold-pale text-sm focus:outline-none focus:ring-2 focus:ring-gold-primary/40"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      onClick={() => saveUser(u)}
                      className="flex-1 px-4 py-2 rounded-lg bg-gold-primary text-brown-dark text-sm font-semibold hover:bg-gold-light transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => toggleBan(u)}
                      title={isBanned ? "Unban user" : "Ban user"}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                        isBanned
                          ? "border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                          : "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      }`}
                    >
                      {isBanned ? "Unban" : "Ban"}
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(u.id)}
                      title="Delete user"
                      className="px-3 py-2 rounded-lg text-sm font-medium border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Banned banner */}
              {isBanned && (
                <div className="mx-4 md:mx-5 mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300 font-medium flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  Banned on {new Date(u.bannedAt!).toLocaleDateString()}
                </div>
              )}

              {/* Expand / collapse profile */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : u.id)}
                className="w-full flex items-center justify-center gap-1 py-2 text-xs text-gold-light/60 hover:text-gold-pale hover:bg-gold-primary/5 transition border-t border-gold-light/10"
              >
                {isExpanded ? "Hide Profile" : "Show Profile"}
                <svg className={`w-3 h-3 transition ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded profile fields */}
              {isExpanded && (
                <div className="px-4 md:px-5 pb-5 pt-3 border-t border-gold-light/10 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gold-light/60 mb-1">Name</label>
                    <input
                      value={u.name || ""}
                      onChange={(e) =>
                        setUsers((prev) => prev.map((item) => (item.id === u.id ? { ...item, name: e.target.value || null } : item)))
                      }
                      placeholder="No name set"
                      className="w-full px-3 py-2 rounded-lg bg-brown-dark border border-gold-light/20 text-gold-pale text-sm focus:outline-none focus:ring-2 focus:ring-gold-primary/40 placeholder:text-gold-light/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gold-light/60 mb-1">Phone</label>
                    <input
                      value={u.phone || ""}
                      onChange={(e) =>
                        setUsers((prev) => prev.map((item) => (item.id === u.id ? { ...item, phone: e.target.value || null } : item)))
                      }
                      placeholder="No phone set"
                      className="w-full px-3 py-2 rounded-lg bg-brown-dark border border-gold-light/20 text-gold-pale text-sm focus:outline-none focus:ring-2 focus:ring-gold-primary/40 placeholder:text-gold-light/30"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs text-gold-light/60 mb-1">Bio</label>
                    <textarea
                      value={u.bio || ""}
                      onChange={(e) =>
                        setUsers((prev) => prev.map((item) => (item.id === u.id ? { ...item, bio: e.target.value || null } : item)))
                      }
                      rows={3}
                      placeholder="No bio set"
                      className="w-full px-3 py-2 rounded-lg bg-brown-dark border border-gold-light/20 text-gold-pale text-sm focus:outline-none focus:ring-2 focus:ring-gold-primary/40 placeholder:text-gold-light/30 resize-y"
                    />
                  </div>
                  <div className="md:col-span-3 flex justify-end">
                    <button
                      onClick={() => saveUser(u)}
                      className="px-5 py-2 rounded-lg bg-gold-primary text-brown-dark text-sm font-semibold hover:bg-gold-light transition"
                    >
                      Save Profile
                    </button>
                  </div>
                </div>
              )}

              {/* Delete confirmation */}
              {deleteConfirmId === u.id && (
                <div className="px-4 md:px-5 pb-5 pt-3 border-t border-red-500/20">
                  <p className="text-sm text-red-300 mb-3">
                    Are you sure you want to delete <span className="font-semibold">{u.email}</span>? This action cannot be undone.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-semibold hover:bg-red-500/30 transition"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-4 py-2 rounded-lg border border-gold-light/20 text-gold-pale text-sm font-medium hover:bg-gold-primary/10 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-16">
          <svg className="w-16 h-16 mx-auto text-gold-light/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gold-light/70 text-lg font-medium">No users found.</p>
          <p className="text-gold-light/50 text-sm mt-1">Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}
