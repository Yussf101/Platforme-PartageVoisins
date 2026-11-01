"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import { fetchFromApi } from "@/lib/api";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("stats");
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== "ADMIN") {
      router.push("/");
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, reportsData, usersData, disputesData] = await Promise.all([
        fetchFromApi("/admin/stats"),
        fetchFromApi("/admin/reports"),
        fetchFromApi("/admin/users"),
        fetchFromApi("/admin/disputes"),
      ]);
      setStats(statsData);
      setReports(reportsData);
      setUsers(usersData);
      setDisputes(disputesData);
    } catch (err) {
      console.error(err);
      alert("Erreur lors du chargement des données Admin");
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      await fetchFromApi(`/admin/reports/${reportId}/resolve`, { method: "POST" });
      setReports((prev) => prev.map(r => r.id === reportId ? { ...r, status: "REVIEWED" } : r));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la résolution");
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      await fetchFromApi(`/admin/users/${userId}/suspend`, { method: "POST" });
      setUsers((prev) => prev.map(u => u.id === userId ? { ...u, active: !u.active } : u));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'action sur l'utilisateur");
    }
  };

  const handleHideItem = async (itemId: string) => {
    try {
      await fetchFromApi(`/admin/items/${itemId}/hide`, { method: "POST" });
      alert("L'objet a été masqué avec succès.");
    } catch (err) {
      console.error(err);
      alert("Erreur lors du masquage de l'objet");
    }
  };

  const handleResolveDispute = async (reservationId: string) => {
    try {
      await fetchFromApi(`/admin/reservations/${reservationId}/resolve-dispute`, { method: "POST" });
      setDisputes((prev) => prev.filter(d => d.id !== reservationId));
      alert("Le litige a été clôturé.");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la résolution du litige");
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Chargement de l'interface d'administration...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[70vh]">
      <div className="flex border-b border-slate-200 bg-slate-50">
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-6 py-4 font-medium text-sm transition-colors ${
            activeTab === "stats" ? "bg-white text-slate-900 border-t-2 border-t-indigo-500" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          📊 Vue d'ensemble
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-6 py-4 font-medium text-sm transition-colors ${
            activeTab === "reports" ? "bg-white text-slate-900 border-t-2 border-t-indigo-500" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          🚩 Signalements
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-6 py-4 font-medium text-sm transition-colors ${
            activeTab === "users" ? "bg-white text-slate-900 border-t-2 border-t-indigo-500" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          👥 Utilisateurs
        </button>
        <button
          onClick={() => setActiveTab("disputes")}
          className={`px-6 py-4 font-medium text-sm transition-colors ${
            activeTab === "disputes" ? "bg-white text-slate-900 border-t-2 border-t-indigo-500" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          ⚖️ Litiges
        </button>
      </div>

      <div className="p-6 sm:p-8">
        
        {/* TAB: STATS */}
        {activeTab === "stats" && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <h3 className="text-slate-500 text-sm font-medium mb-1">Total Utilisateurs</h3>
              <p className="text-3xl font-bold text-slate-800">{stats.totalUsers}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <h3 className="text-slate-500 text-sm font-medium mb-1">Total Objets</h3>
              <p className="text-3xl font-bold text-slate-800">{stats.totalItems}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <h3 className="text-slate-500 text-sm font-medium mb-1">Signalements</h3>
              <p className="text-3xl font-bold text-slate-800">{stats.totalReports}</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
              <h3 className="text-indigo-600 text-sm font-medium mb-1">CO2 Économisé (kg)</h3>
              <p className="text-3xl font-bold text-indigo-900">{stats.totalCo2}</p>
            </div>
          </div>
        )}

        {/* TAB: REPORTS */}
        {activeTab === "reports" && (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Signalements à traiter</h2>
            {reports.length === 0 ? (
              <p className="text-slate-500 italic">Aucun signalement.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200">
                      <th className="py-3 px-4 text-sm font-semibold text-slate-600">Date</th>
                      <th className="py-3 px-4 text-sm font-semibold text-slate-600">Raison</th>
                      <th className="py-3 px-4 text-sm font-semibold text-slate-600">Statut</th>
                      <th className="py-3 px-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.id} className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-800 font-medium">
                          {r.reason}
                          {r.reportedItemTitle && (
                            <div className="text-xs text-slate-500 mt-1">
                              Objet : {r.reportedItemTitle}
                            </div>
                          )}
                          {r.reportedUserName && (
                            <div className="text-xs text-slate-500 mt-1">
                              Utilisateur : {r.reportedUserName}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {r.status === "PENDING" ? (
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-bold">En attente</span>
                          ) : (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">Traité</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-3">
                          {r.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleResolveReport(r.id)}
                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                              >
                                Marquer comme traité
                              </button>
                              {r.reportedItemId && (
                                <button
                                  onClick={() => handleHideItem(r.reportedItemId)}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                  Masquer l'objet
                                </button>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: USERS */}
        {activeTab === "users" && (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Gestion des utilisateurs</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200">
                    <th className="py-3 px-4 text-sm font-semibold text-slate-600">Nom</th>
                    <th className="py-3 px-4 text-sm font-semibold text-slate-600">Email</th>
                    <th className="py-3 px-4 text-sm font-semibold text-slate-600">Rôle</th>
                    <th className="py-3 px-4 text-sm font-semibold text-slate-600">Statut</th>
                    <th className="py-3 px-4 text-sm font-semibold text-slate-600 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100">
                      <td className="py-3 px-4 text-sm text-slate-800 font-medium">{u.firstName} {u.lastName}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{u.email}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className={u.role === "ADMIN" ? "text-indigo-600 font-bold" : "text-slate-500"}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {u.active ? (
                          <span className="text-green-600 font-medium">Actif</span>
                        ) : (
                          <span className="text-red-600 font-medium">Suspendu</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {u.role !== "ADMIN" && (
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            className={`text-sm font-medium ${u.active ? "text-red-600 hover:text-red-800" : "text-green-600 hover:text-green-800"}`}
                          >
                            {u.active ? "Suspendre" : "Réactiver"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: DISPUTES */}
        {activeTab === "disputes" && (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Gestion des litiges</h2>
            {disputes.length === 0 ? (
              <p className="text-slate-500 italic">Aucun litige en cours.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200">
                      <th className="py-3 px-4 text-sm font-semibold text-slate-600">Objet concerné</th>
                      <th className="py-3 px-4 text-sm font-semibold text-slate-600">Prêteur</th>
                      <th className="py-3 px-4 text-sm font-semibold text-slate-600">Emprunteur</th>
                      <th className="py-3 px-4 text-sm font-semibold text-slate-600">Dates</th>
                      <th className="py-3 px-4 text-sm font-semibold text-slate-600 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disputes.map((d) => (
                      <tr key={d.id} className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm text-slate-800 font-medium">{d.itemName}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{d.ownerName}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{d.borrowerName}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {new Date(d.startDate).toLocaleDateString()} - {new Date(d.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleResolveDispute(d.id)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                          >
                            Clôturer le litige
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
