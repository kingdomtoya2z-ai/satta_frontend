"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminGames from "@/components/admin-games";
import AdminAds from "@/components/admin-ads";
import { ADMIN_API } from "@/lib/api";

const MAX_CHART_GAMES = 5;

interface Game {
  _id: string; name: string; shortName?: string; time: string; showInChart: boolean;
}

interface Ad {
  _id: string; title: string; type: "image" | "video"; url: string; active: boolean;
}

function Msg({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => { if (msg) { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); } }, [msg, onClose]);
  if (!msg) return null;
  return (
    <div className="flex items-center justify-between bg-accent text-accent-foreground text-sm p-3 rounded-sm">
      <span>{msg}</span>
      <button onClick={onClose} className="text-accent-foreground/70 hover:text-accent-foreground ml-3">&times;</button>
    </div>
  );
}

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: "≡" },
  { key: "games", label: "Games", icon: "🎮" },
  { key: "ads", label: "Ads", icon: "📢" },
] as const;

type Section = (typeof navItems)[number]["key"];

function AdminLayout() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [section, setSection] = useState<Section>("dashboard");
  const [msg, setMsg] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [games, setGames] = useState<Game[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchGames = useCallback(async () => {
    try { const res = await fetch(`${ADMIN_API}/games`); if (res.ok) setGames(await res.json()); }
    catch { setMsg("Cannot connect to server"); }
  }, []);

  const fetchAds = useCallback(async () => {
    try { const res = await fetch(`${ADMIN_API}/ads`, { headers }); if (res.ok) setAds(await res.json()); }
    catch {}
  }, [token]);

  useEffect(() => { fetchGames(); }, [fetchGames]);
  useEffect(() => { fetchAds(); }, [fetchAds]);

  const activeAds = ads.filter(a => a.active);
  const chartGames = games.filter(g => g.showInChart);

  function handleLogout() { logout(); router.push("/login"); }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-56 bg-card border-r border-border flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="text-base font-bold">Admin</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground text-xl leading-none">&times;</button>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => { setSection(item.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-sm transition-colors text-left ${
                section === item.key
                  ? "bg-primary text-primary-foreground font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <Link href="/" className="block w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors">
            &larr; Back to Home
          </Link>
          <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-destructive hover:text-destructive/80 hover:bg-muted rounded-sm transition-colors">
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 bg-background border-b border-border flex items-center gap-3 px-4 py-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-foreground text-xl leading-none">☰</button>
          <h1 className="text-sm font-bold truncate">
            {section === "dashboard" ? "Dashboard" : section === "games" ? "Games Management" : "Ads Management"}
          </h1>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <Msg msg={msg} onClose={() => setMsg("")} />

          {section === "dashboard" && (
            <>
              <h2 className="text-xl sm:text-2xl font-bold mb-5 hidden lg:block">Dashboard</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-card border border-border p-4 rounded-sm">
                  <div className="text-2xl font-bold text-foreground">{games.length}</div>
                  <div className="text-xs text-muted-foreground mt-1">Total Games</div>
                </div>
                <div className="bg-card border border-border p-4 rounded-sm">
                  <div className="text-2xl font-bold text-accent">{chartGames.length}/{MAX_CHART_GAMES}</div>
                  <div className="text-xs text-muted-foreground mt-1">Chart Slots</div>
                </div>
                <div className="bg-card border border-border p-4 rounded-sm">
                  <div className="text-2xl font-bold text-foreground">{ads.length}</div>
                  <div className="text-xs text-muted-foreground mt-1">Total Ads</div>
                </div>
                <div className="bg-card border border-border p-4 rounded-sm">
                  <div className="text-2xl font-bold text-primary">{activeAds.length}</div>
                  <div className="text-xs text-muted-foreground mt-1">Active Ads</div>
                </div>
              </div>
            </>
          )}

          {section === "games" && (
            <>
              <h2 className="text-xl sm:text-2xl font-bold mb-5 hidden lg:block">Games Management</h2>
              <AdminGames ADMIN_API={ADMIN_API} headers={headers} onMsg={setMsg} />
            </>
          )}

          {section === "ads" && (
            <>
              <h2 className="text-xl sm:text-2xl font-bold mb-5 hidden lg:block">Ads Management</h2>
              <AdminAds ADMIN_API={ADMIN_API} headers={headers} token={token} onMsg={setMsg} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Admin() {
  return (
    <ProtectedRoute>
      <AdminLayout />
    </ProtectedRoute>
  );
}
