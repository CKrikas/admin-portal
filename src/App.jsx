import { useEffect, useState } from "react";
import { login, logout, hasRole, authedFetch, API_BASE } from "./auth";

export default function App() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const isOfficer = hasRole("officer");

  async function load() {
    if (!isOfficer) return;
    setLoading(true);
    const data = await authedFetch(`${API_BASE}/applications?status=pending`);
    setApps(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [isOfficer]);

  async function approve(id) {
    await authedFetch(`${API_BASE}/applications/${id}/approve`, { method: "POST" });
    await load();
  }

  if (!isOfficer) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-3xl font-bold text-blue-600">Admin Portal</h1>
        <p className="p-3 rounded bg-yellow-50 border border-yellow-200">
          You must sign in as <b>officer</b> to view and approve applications.
        </p>
        <div className="flex gap-2">
          <button onClick={login}  className="px-3 py-2 bg-blue-600 text-white rounded">Login</button>
          <button onClick={logout} className="px-3 py-2 bg-gray-600 text-white rounded">Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-blue-600">Admin Portal</h1>
        <div className="flex gap-2">
          <button onClick={login}  className="px-3 py-2 bg-blue-600 text-white rounded">Login</button>
          <button onClick={logout} className="px-3 py-2 bg-gray-600 text-white rounded">Logout</button>
        </div>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <table className="min-w-[700px] border">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2 border">ID</th>
              <th className="text-left p-2 border">Type</th>
              <th className="text-left p-2 border">Branch</th>
              <th className="text-left p-2 border">Status</th>
              <th className="text-left p-2 border">Citizen ID</th>
              <th className="text-left p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apps.map(a => (
              <tr key={a.id}>
                <td className="p-2 border">{a.id}</td>
                <td className="p-2 border">{a.type}</td>
                <td className="p-2 border">{a.desired_branch}</td>
                <td className="p-2 border">{a.status}</td>
                <td className="p-2 border">{a.citizen_id}</td>
                <td className="p-2 border">
                  <button
                    onClick={()=>approve(a.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    Approve
                  </button>
                </td>
              </tr>
            ))}
            {apps.length === 0 && (
              <tr><td className="p-2 border" colSpan={6}>No pending applications</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
