import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faSearch, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../../AuthContext";

const resettableRoles = new Set(["student", "faculty", "mentor", "uil"]);

const roleLabels = {
  student: "Student",
  faculty: "Faculty",
  mentor: "Faculty Mentor",
  uil: "UIL",
};

const UserPasswordResets = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [resettingKey, setResettingKey] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setUsers(Array.isArray(res.data?.users) ? res.data.users : []);
    } catch (error) {
      console.error("Failed to load users.", error);
      toast.error(error.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchUsers();
    else setLoading(false);
  }, [user?.token]);

  const resettableUsers = useMemo(
    () => users.filter((item) => resettableRoles.has(String(item.role || "").toLowerCase())),
    [users],
  );

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return resettableUsers.filter((item) => {
      const role = String(item.role || "").toLowerCase();
      if (roleFilter !== "all" && role !== roleFilter) return false;
      if (!query) return true;

      return [item.id, item.full_name, item.email, item.faculty, item.department, role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [resettableUsers, roleFilter, search]);

  const handleReset = async (account) => {
    const role = String(account.role || "").toLowerCase();
    const key = `${role}-${account.id}`;

    try {
      setResettingKey(key);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${encodeURIComponent(role)}/${encodeURIComponent(account.id)}/reset-password`,
        {},
        { headers: { Authorization: `Bearer ${user?.token}` } },
      );

      const tempPassword = res.data?.temporary_password;
      toast.success(
        tempPassword
          ? `${res.data?.message || "Temporary password generated."} Temporary password: ${tempPassword}`
          : res.data?.message || "Temporary password sent.",
        { autoClose: tempPassword ? false : 4000 },
      );
    } catch (error) {
      console.error("Failed to reset password.", error);
      toast.error(error.response?.data?.message || "Failed to reset password.");
    } finally {
      setResettingKey("");
    }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <ToastContainer theme="dark" position="bottom-right" />
      <header>
        <h2 className="text-2xl font-black tracking-tight text-slate-800">User Password Resets</h2>
        <p className="mt-1 text-sm text-slate-500">
          Reset passwords for student, faculty, faculty mentor, and UIL accounts. Each reset is written to the audit log.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, ID, email, role..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All resettable roles</option>
            <option value="student">Students</option>
            <option value="faculty">Faculty</option>
            <option value="mentor">Faculty Mentors</option>
            <option value="uil">UIL</option>
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-indigo-500">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-slate-500">
            No resettable accounts match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/70">
                <tr>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Account</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Email</th>
                  <th className="p-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((account) => {
                  const role = String(account.role || "").toLowerCase();
                  const key = `${role}-${account.id}`;

                  return (
                    <tr key={key} className="hover:bg-slate-50/60">
                      <td className="p-5">
                        <p className="font-bold text-slate-800">{account.full_name || account.id}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-400">{account.id}</p>
                      </td>
                      <td className="p-5">
                        <span className="rounded-xl bg-indigo-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-700">
                          {roleLabels[role] || role}
                        </span>
                      </td>
                      <td className="p-5 text-slate-500">{account.email || "No email"}</td>
                      <td className="p-5 text-right">
                        <button
                          type="button"
                          onClick={() => handleReset(account)}
                          disabled={resettingKey === key}
                          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-indigo-700 disabled:opacity-60"
                        >
                          <FontAwesomeIcon icon={resettingKey === key ? faSpinner : faKey} spin={resettingKey === key} />
                          Reset Password
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default UserPasswordResets;
