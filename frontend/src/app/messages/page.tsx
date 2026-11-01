"use client";

import { useEffect, useState, useRef } from "react";
import { fetchFromApi } from "@/lib/api";
import { useRouter } from "next/navigation";

interface Conversation {
  id: string;
  reservationId: string;
  itemId: string;
  itemTitle: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage: string;
  lastMessageAt: string;
  reservationStatus: string;
  owner: boolean; // isOwner
  hasRated: boolean;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  read: boolean;
}

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Rating states
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [hasRated, setHasRated] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeConvId) {
      loadMessages(activeConvId);
      interval = setInterval(() => loadMessages(activeConvId), 5000);
    }
    return () => clearInterval(interval);
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const data = await fetchFromApi("/conversations");
      setConversations(data);
    } catch (err) {
      console.error(err);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const data = await fetchFromApi(`/conversations/${convId}/messages`);
      setMessages(data);
      // Notifier la Navbar que des messages ont été lus
      window.dispatchEvent(new Event("messages-read"));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvId) return;

    try {
      const msg = await fetchFromApi(`/conversations/${activeConvId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: newMessage }),
      });
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
      setConversations((prev) => 
        prev.map(c => c.id === activeConvId ? { ...c, lastMessage: msg.content, lastMessageAt: msg.sentAt } : c)
      );
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi du message");
    }
  };

  const handleAccept = async (reservationId: string) => {
    try {
      await fetchFromApi(`/reservations/${reservationId}/accept`, { method: "POST" });
      loadConversations();
      if (activeConvId) loadMessages(activeConvId);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'acceptation");
    }
  };

  const handleReject = async (reservationId: string) => {
    try {
      await fetchFromApi(`/reservations/${reservationId}/reject`, { method: "POST" });
      loadConversations();
      if (activeConvId) loadMessages(activeConvId);
    } catch (err) {
      console.error(err);
      alert("Erreur lors du refus");
    }
  };

  const handleHandover = async (reservationId: string) => {
    try {
      await fetchFromApi(`/reservations/${reservationId}/handover`, { method: "POST" });
      loadConversations();
      if (activeConvId) loadMessages(activeConvId);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la confirmation de remise");
    }
  };

  const handleReturn = async (reservationId: string) => {
    try {
      await fetchFromApi(`/reservations/${reservationId}/return`, { method: "POST" });
      loadConversations();
      if (activeConvId) loadMessages(activeConvId);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la confirmation de retour");
    }
  };

  const handleRecovery = async (reservationId: string) => {
    try {
      await fetchFromApi(`/reservations/${reservationId}/recovery`, { method: "POST" });
      loadConversations();
      if (activeConvId) loadMessages(activeConvId);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la confirmation de récupération");
    }
  };

  const handleRatingSubmit = async (e: React.FormEvent, reservationId: string) => {
    e.preventDefault();
    try {
      await fetchFromApi(`/reservations/${reservationId}/rate`, {
        method: "POST",
        body: JSON.stringify({ score: ratingScore, comment: ratingComment }),
      });
      setHasRated(prev => ({ ...prev, [reservationId]: true }));
      setConversations(prev => prev.map(c => c.id === activeConvId ? { ...c, hasRated: true } : c));
      setRatingComment("");
      alert("Avis envoyé avec succès !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi de l'avis (vous l'avez peut-être déjà envoyé).");
    }
  };

  if (loading) return <div className="text-center mt-20">Chargement de la messagerie...</div>;

  const activeConv = conversations.find((c) => c.id === activeConvId);

  // Déterminer si on doit afficher l'interface d'évaluation
  const shouldShowRating = activeConv && 
    (activeConv.reservationStatus === 'GIVEN' || activeConv.reservationStatus === 'RETURNED' || activeConv.reservationStatus === 'RECOVERED') &&
    !activeConv.hasRated &&
    !hasRated[activeConv.reservationId];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 h-[calc(100vh-80px)]">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex h-full">
        
        {/* Colonne de gauche : Liste des chats */}
        <div className="w-1/3 flex flex-col border-r border-slate-200 bg-slate-50 z-10">
          <div className="p-5 border-b border-slate-200 bg-white shadow-sm z-20">
            <h2 className="text-xl font-bold text-slate-800">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="p-4 text-slate-500 text-sm text-center mt-10">Aucune conversation pour le moment.</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`p-4 cursor-pointer transition-all duration-300 ${
                    activeConvId === conv.id 
                      ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30 mx-3 my-2 rounded-2xl scale-[1.02] border border-primary-500" 
                      : "bg-white hover:bg-slate-100 border border-transparent hover:border-slate-200 mx-2 my-1 rounded-2xl hover:shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <h3 className={`font-semibold truncate pr-2 ${activeConvId === conv.id ? "text-white" : "text-slate-800"}`}>
                      {conv.otherUserName}
                    </h3>
                    <span className={`text-xs whitespace-nowrap mt-0.5 ${activeConvId === conv.id ? "text-primary-100" : "text-slate-500"}`}>
                      {new Date(conv.lastMessageAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className={`text-xs font-bold mb-1.5 uppercase tracking-wide ${activeConvId === conv.id ? "text-primary-200" : "text-slate-500"}`}>{conv.itemTitle}</p>
                  <p className={`text-sm truncate ${activeConvId === conv.id ? "text-primary-50" : "text-slate-600"}`}>
                    {conv.lastMessage}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Colonne de droite : Chat actif */}
        <div className="w-2/3 bg-slate-100 flex flex-col relative">
        {activeConv ? (
          <>
            <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm z-10">
              <div>
                <h3 className="font-semibold text-slate-900">{activeConv.otherUserName}</h3>
                <p className="text-sm text-slate-600">Demande pour : <span className="font-medium text-primary-600">{activeConv.itemTitle}</span></p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  activeConv.reservationStatus === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                  activeConv.reservationStatus === "ACCEPTED" ? "bg-green-100 text-green-800" :
                  activeConv.reservationStatus === "LENT" ? "bg-blue-100 text-blue-800" :
                  activeConv.reservationStatus === "GIVEN" ? "bg-purple-100 text-purple-800" :
                  activeConv.reservationStatus === "PENDING_CONFIRMATION" ? "bg-orange-100 text-orange-800" :
                  activeConv.reservationStatus === "RETURNED" ? "bg-slate-200 text-slate-800" :
                  activeConv.reservationStatus === "REJECTED" ? "bg-red-100 text-red-800" :
                  "bg-slate-200 text-slate-800"
                }`}>
                  {activeConv.reservationStatus === "PENDING" ? "En attente" :
                   activeConv.reservationStatus === "ACCEPTED" ? "Accepté" :
                   activeConv.reservationStatus === "LENT" ? "Prêté" :
                   activeConv.reservationStatus === "GIVEN" ? "Donné" :
                   activeConv.reservationStatus === "PENDING_CONFIRMATION" ? "Retour à confirmer" :
                   activeConv.reservationStatus === "RETURNED" ? "Terminé" :
                   activeConv.reservationStatus === "REJECTED" ? "Refusé" :
                   activeConv.reservationStatus}
                </span>

                {/* Actions Propriétaire : Accepter/Refuser */}
                {activeConv.owner && activeConv.reservationStatus === "PENDING" && (
                  <div className="flex gap-2">
                    <button onClick={() => handleAccept(activeConv.reservationId)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition">Accepter</button>
                    <button onClick={() => handleReject(activeConv.reservationId)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition">Refuser</button>
                  </div>
                )}

                {/* Actions Propriétaire : Confirmer remise */}
                {activeConv.owner && activeConv.reservationStatus === "ACCEPTED" && (
                  <button onClick={() => handleHandover(activeConv.reservationId)} className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition">
                    🤝 Confirmer la remise
                  </button>
                )}

                {/* Actions Emprunteur : Confirmer retour */}
                {!activeConv.owner && activeConv.reservationStatus === "LENT" && (
                  <button onClick={() => handleReturn(activeConv.reservationId)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition">
                    📦 J'ai rendu l'objet
                  </button>
                )}

                {/* Actions Propriétaire : Confirmer récupération */}
                {activeConv.owner && activeConv.reservationStatus === "PENDING_CONFIRMATION" && (
                  <button onClick={() => handleRecovery(activeConv.reservationId)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition">
                    ✅ Confirmer récupération
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-200/60 shadow-inner">
              {messages.map((msg, idx) => {
                const isMe = msg.senderId !== activeConv.otherUserId;
                return (
                  <div key={idx} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <div className="flex items-end gap-2 max-w-[75%]">
                      {!isMe && (
                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 font-bold text-sm flex-shrink-0 border border-slate-200">
                          {msg.senderName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className={`px-5 py-2.5 rounded-3xl shadow-md ${
                        isMe 
                          ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-br-sm" 
                          : "bg-white text-slate-800 rounded-bl-sm border border-slate-100"
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 mt-1.5 mx-2 font-medium">
                      {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Zone de Rating */}
            {shouldShowRating && (
              <div className="p-4 border-t border-yellow-100 bg-yellow-50">
                <h4 className="font-semibold text-gray-800 mb-2">Évaluez cet échange avec {activeConv.otherUserName}</h4>
                <form onSubmit={(e) => handleRatingSubmit(e, activeConv.reservationId)} className="flex flex-col gap-3">
                  <div className="flex gap-2 text-2xl">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star} 
                        type="button" 
                        onClick={() => setRatingScore(star)}
                        className={star <= ratingScore ? "text-yellow-400" : "text-gray-300"}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      placeholder="Laissez un petit mot sympa (optionnel)..."
                      className="flex-1 border border-yellow-200 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-400"
                    />
                    <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-6 py-2 rounded-lg font-medium transition">
                      Envoyer l'avis
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Input d'envoi de message classique */}
            <div className="p-4 bg-white border-t border-slate-200 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez un message..."
                  className="flex-1 bg-slate-100 text-slate-900 placeholder-slate-500 border border-slate-200 rounded-full px-6 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-inner transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 disabled:from-slate-300 disabled:to-slate-400 disabled:text-slate-100 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-full font-bold shadow-md shadow-primary-500/30 transition-all transform hover:scale-105 disabled:hover:scale-100"
                >
                  Envoyer
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>Sélectionnez une conversation pour commencer à discuter</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
