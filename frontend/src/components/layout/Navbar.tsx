"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUser, logout, User } from "@/lib/auth";
import { fetchFromApi } from "@/lib/api";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchUnreadCount = async (currentUser: User) => {
    try {
      const data = await fetchFromApi("/conversations/unread-count");
      if (data && data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
    } catch (err: any) {
      console.error("Erreur lors de la récupération du compteur :", err);
      if (err.message && err.message.includes("401")) {
        handleLogout();
      }
    }
  };

  const checkAuth = () => {
    const currentUser = getUser();
    setUser(currentUser);
    if (currentUser) {
      fetchUnreadCount(currentUser);
    } else {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    setMounted(true);
    checkAuth();
    
    // Écouter les changements d'auth
    window.addEventListener("auth-change", checkAuth);
    
    // Écouter quand la page Messages remet le compteur à jour
    const handleUnreadUpdate = () => {
      const currentUser = getUser();
      if (currentUser) fetchUnreadCount(currentUser);
    };
    window.addEventListener("messages-read", handleUnreadUpdate);

    return () => {
      window.removeEventListener("auth-change", checkAuth);
      window.removeEventListener("messages-read", handleUnreadUpdate);
    };
  }, []);

  // WebSockets pour les notifications temps réel
  useEffect(() => {
    if (!user) return;

    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        // On s'abonne à la file privée de l'utilisateur
        stompClient.subscribe(`/user/${user.id}/queue/messages`, (msg) => {
          // Un nouveau message est reçu ! On incrémente le compteur
          setUnreadCount((prev) => prev + 1);
        });
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    checkAuth();
    router.push("/");
  };

  // Pour éviter les problèmes d'hydratation (différence serveur/client)
  if (!mounted) {
    return (
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-primary-600">PartageVoisins</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-primary-600">PartageVoisins</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-2 items-center">
              <Link href="/items" className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-full hover:bg-slate-100 text-sm font-medium transition-all">
                Rechercher
              </Link>
              {user && (
                <>
                  {user.role !== "ADMIN" && (
                    <>
                      <Link href="/my-items" className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-full hover:bg-slate-100 text-sm font-medium transition-all">
                        Mes Objets
                      </Link>
                      <Link href="/messages" className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-full hover:bg-slate-100 text-sm font-medium transition-all flex items-center gap-2">
                        Messages
                        {unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full shadow-sm">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                      <Link href="/profile" className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-full hover:bg-slate-100 text-sm font-medium transition-all">
                        Mon Profil
                      </Link>
                    </>
                  )}
                  {user.role === "ADMIN" && (
                    <Link href="/admin" className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-full hover:bg-slate-100 text-sm font-medium transition-all">
                      Espace Admin
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center gap-4">
                {user.role !== "ADMIN" && (
                  <Link
                    href="/items/new"
                    className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 border border-transparent rounded-full shadow-md text-sm font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105"
                  >
                    + Ajouter un objet
                  </Link>
                )}
                <span className="text-sm font-medium text-slate-700 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                  {user.role === "ADMIN" ? "Admin in the house" : `Bonjour, ${user.firstName}`}
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center px-5 py-2 border border-red-200 rounded-full shadow-sm text-sm font-bold text-red-600 bg-white hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex items-center h-full gap-3 ml-8">
                <Link 
                  href="/login" 
                  className="inline-flex items-center justify-center px-6 h-10 border-2 border-primary-500 rounded-full shadow-sm text-sm font-bold text-primary-600 bg-white hover:bg-primary-50 transition-all"
                >
                  Connexion
                </Link>
                <Link 
                  href="/register" 
                  className="inline-flex items-center justify-center px-6 h-10 border border-transparent rounded-full shadow-md text-sm font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
