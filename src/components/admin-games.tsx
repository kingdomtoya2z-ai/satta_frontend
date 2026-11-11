"use client";

import { useState, useEffect, useCallback } from "react";

const MAX_CHART_GAMES = 5;

function to12h(time: string) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const d = new Date(); d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function from12h(time: string) {
  if (!time) return "";
  const [t, p] = time.split(" ");
  let [h, m] = t.split(":").map(Number);
  if (p === "PM" && h !== 12) h += 12;
  if (p === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

interface Game {
  _id: string; name: string; shortName?: string; time: string; showInChart: boolean;
}

export default function AdminGames({ ADMIN_API, headers, onMsg }: {
  ADMIN_API: string; headers: Record<string, string>; onMsg: (m: string) => void;
}) {
  const [games, setGames] = useState<Game[]>([]);
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [time, setTime] = useState("");
  const [showInChart, setShowInChart] = useState(false);

  const [editingGame, setEditingGame] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editShortName, setEditShortName] = useState("");
  const [editTime, setEditTime] = useState("");

  const [gameSearch, setGameSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    try {
      const res = await fetch(`${ADMIN_API}/games`);
      if (res.ok) setGames(await res.json());
    } catch { onMsg("Cannot connect to server"); }
  }, [ADMIN_API, onMsg]);

  useEffect(() => { fetchGames(); }, [fetchGames]);

  const chartGames = games.filter(g => g.showInChart);
  const filteredGames = games.filter(g =>
    !gameSearch || g.name.toLowerCase().includes(gameSearch.toLowerCase()) ||
    (g.shortName || "").toLowerCase().includes(gameSearch.toLowerCase())
  );

  async function addGame(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !time) { onMsg("Fill all fields"); return; }
    try {
      const res = await fetch(`${ADMIN_API}/games`, {
        method: "POST", headers,
        body: JSON.stringify({ name: name.trim(), shortName: shortName.trim() || undefined, time: to12h(time), showInChart }),
      });
      if (!res.ok) { const err = await res.json(); onMsg(err.error); }
      else { onMsg("Game added"); setName(""); setShortName(""); setTime(""); setShowInChart(false); fetchGames(); }
    } catch { onMsg("Cannot connect to server"); }
  }

  function startEdit(game: Game) {
    setEditingGame(game._id);
    setEditName(game.name);
    setEditShortName(game.shortName || "");
    setEditTime(from12h(game.time));
  }

  async function saveEdit(id: string) {
    if (!editName.trim() || !editTime) return;
    try {
      const res = await fetch(`${ADMIN_API}/games/${id}`, {
        method: "PUT", headers,
        body: JSON.stringify({ name: editName.trim(), shortName: editShortName.trim() || undefined, time: to12h(editTime) }),
      });
      if (!res.ok) { const err = await res.json(); onMsg(err.error); }
      else { onMsg("Game updated"); setEditingGame(null); fetchGames(); }
    } catch { onMsg("Cannot connect to server"); }
  }

  function cancelEdit() { setEditingGame(null); }

  async function deleteGame(id: string) {
    try {
      await fetch(`${ADMIN_API}/games/${id}`, { method: "DELETE", headers });
      fetchGames(); onMsg("Game deleted"); setConfirmDelete(null);
    } catch { onMsg("Cannot connect to server"); }
  }

  async function toggleChart(id: string, current: boolean) {
    try {
      const count = games.filter(g => g.showInChart && g._id !== id).length;
      if (!current && count >= MAX_CHART_GAMES) { onMsg(`Maximum ${MAX_CHART_GAMES} games in chart`); return; }
      const res = await fetch(`${ADMIN_API}/games/${id}/chart`, { method: "PUT", headers, body: JSON.stringify({ showInChart: !current }) });
      if (!res.ok) { const err = await res.json(); onMsg(err.error); } else fetchGames();
    } catch { onMsg("Cannot connect to server"); }
  }

  return (
    <>
      <div className="bg-card border border-border rounded-sm mb-6">
        <div className="bg-primary text-primary-foreground px-4 py-3 font-bold text-sm sm:text-base flex items-center justify-between">
          <span>Manage Games</span>
          <span className="text-xs font-normal opacity-80">{filteredGames.length} games</span>
        </div>

        <form onSubmit={addGame} className="p-4 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <input type="text" placeholder="Game Name" value={name} onChange={e => setName(e.target.value)} className="flex-1 border border-border px-3 py-2 text-sm rounded-sm bg-background text-foreground" />
            <input type="text" placeholder="Short Name (e.g. FRBD)" value={shortName} onChange={e => setShortName(e.target.value)} className="flex-1 border border-border px-3 py-2 text-sm rounded-sm bg-background text-foreground" />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <input type="time" value={time} onChange={e => setTime(e.target.value)} className="border border-border px-3 py-2 text-sm rounded-sm bg-background text-foreground" />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={showInChart} onChange={e => setShowInChart(e.target.checked)}
                disabled={!showInChart && chartGames.length >= MAX_CHART_GAMES} className="accent-primary" />
              Show in Chart
            </label>
            <button type="submit" className="bg-primary text-primary-foreground px-5 py-2 text-sm font-bold rounded-sm hover:bg-primary/90">Add Game</button>
          </div>
        </form>

        <div className="px-4 py-2 border-b border-border">
          <input type="text" placeholder="Search games..." value={gameSearch} onChange={e => setGameSearch(e.target.value)} className="w-full border border-border px-3 py-1.5 text-sm rounded-sm bg-background text-foreground" />
        </div>

        {filteredGames.length === 0 ? (
          <p className="p-4 text-muted-foreground text-sm">No games found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="bg-muted text-left">
                  <th className="px-4 py-2 font-semibold">Name</th>
                  <th className="px-4 py-2 font-semibold">Short</th>
                  <th className="px-4 py-2 font-semibold">Time</th>
                  <th className="px-4 py-2 font-semibold text-center w-16">Chart</th>
                  <th className="px-4 py-2 font-semibold text-right w-44">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGames.map(game => (
                  <tr key={game._id} className="border-t border-border hover:bg-muted/30">
                    {editingGame === game._id ? (
                      <>
                        <td className="px-4 py-2">
                          <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full border border-border px-2 py-1 text-sm rounded-sm bg-background text-foreground" />
                        </td>
                        <td className="px-4 py-2">
                          <input type="text" value={editShortName} onChange={e => setEditShortName(e.target.value)} className="w-full border border-border px-2 py-1 text-sm rounded-sm bg-background text-foreground" />
                        </td>
                        <td className="px-4 py-2">
                          <input type="time" value={editTime} onChange={e => setEditTime(e.target.value)} className="border border-border px-2 py-1 text-sm rounded-sm bg-background text-foreground" />
                        </td>
                        <td className="px-4 py-2 text-center text-muted-foreground text-xs">—</td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">
                          <button onClick={() => saveEdit(game._id)} className="text-primary hover:underline text-sm mr-2 font-bold">Save</button>
                          <button onClick={cancelEdit} className="text-muted-foreground hover:underline text-sm">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2 font-medium">{game.name}</td>
                        <td className="px-4 py-2 text-muted-foreground">{game.shortName || "—"}</td>
                        <td className="px-4 py-2 text-muted-foreground">{game.time}</td>
                        <td className="px-4 py-2 text-center">
                          <button onClick={() => toggleChart(game._id, game.showInChart)}
                            className={`text-xs font-bold px-2 py-1 rounded-sm ${game.showInChart ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            {game.showInChart ? "ON" : "OFF"}
                          </button>
                        </td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">
                          <button onClick={() => startEdit(game)} className="text-muted-foreground hover:text-foreground text-sm" title="Edit">✎</button>
                          <button onClick={() => setConfirmDelete(game._id)} className="text-destructive hover:underline text-sm">Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setConfirmDelete(null)}>
          <div className="bg-card border border-border p-6 rounded-sm shadow-xl max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <p className="text-foreground font-bold mb-2">Delete Game?</p>
            <p className="text-muted-foreground text-sm mb-4">This cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm font-bold rounded-sm bg-muted text-muted-foreground hover:bg-muted/80">Cancel</button>
              <button onClick={() => deleteGame(confirmDelete)} className="px-4 py-2 text-sm font-bold rounded-sm bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
