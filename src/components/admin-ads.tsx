"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Ad {
  _id: string; title: string; type: "image" | "video"; url: string; active: boolean;
}

export default function AdminAds({ ADMIN_API, headers, token, onMsg }: {
  ADMIN_API: string; headers: Record<string, string>; token: string | null; onMsg: (m: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [adTitle, setAdTitle] = useState("");
  const [adType, setAdType] = useState<"image" | "video">("image");
  const [adFile, setAdFile] = useState<File | null>(null);
  const [adUrl, setAdUrl] = useState("");
  const [adInputMode, setAdInputMode] = useState<"upload" | "url">("url");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const [adSearch, setAdSearch] = useState("");
  const [editingAdTitle, setEditingAdTitle] = useState<string | null>(null);
  const [editAdTitleValue, setEditAdTitleValue] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchAds = useCallback(async () => {
    try {
      const res = await fetch(`${ADMIN_API}/ads`, { headers });
      if (res.ok) setAds(await res.json());
    } catch { onMsg("Cannot connect to server"); }
  }, [ADMIN_API, headers, onMsg]);

  useEffect(() => { fetchAds(); }, [fetchAds]);
  useEffect(() => {
    if (adInputMode === "url" && adUrl.trim()) setPreviewUrl(adUrl.trim());
    else if (adInputMode === "upload" && adFile) { const url = URL.createObjectURL(adFile); setPreviewUrl(url); return () => URL.revokeObjectURL(url); }
    else setPreviewUrl("");
  }, [adUrl, adFile, adInputMode]);

  const activeAds = ads.filter(a => a.active);
  const filteredAds = ads.filter(a =>
    !adSearch || a.title.toLowerCase().includes(adSearch.toLowerCase())
  );

  async function handleUploadAd(e: React.FormEvent) {
    e.preventDefault();
    if (!adTitle.trim()) { onMsg("Fill title"); return; }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("title", adTitle.trim());
      body.append("type", adType);
      body.append("active", "true");

      if (adInputMode === "upload") {
        if (!adFile) { onMsg("Select a file"); setUploading(false); return; }
        body.append("file", adFile);
      } else {
        if (!adUrl.trim()) { onMsg("Enter an ad URL"); setUploading(false); return; }
        body.append("url", adUrl.trim());
      }

      const res = await fetch(`${ADMIN_API}/ads`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); onMsg(err.error || "Failed to save ad"); }
      else {
        onMsg("Ad added");
        setAdTitle(""); setAdFile(null); setAdUrl(""); setPreviewUrl("");
        setAdType("image");
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchAds();
      }
    } catch { onMsg("Cannot connect to server"); }
    finally { setUploading(false); }
  }

  async function toggleAdActive(ad: Ad) {
    try {
      const res = await fetch(`${ADMIN_API}/ads/${ad._id}`, { method: "PUT", headers, body: JSON.stringify({ active: !ad.active }) });
      if (res.ok) fetchAds();
    } catch { onMsg("Cannot connect to server"); }
  }

  function startEditAdTitle(ad: Ad) {
    setEditingAdTitle(ad._id);
    setEditAdTitleValue(ad.title);
  }

  async function saveAdTitle(id: string) {
    if (!editAdTitleValue.trim()) return;
    try {
      const res = await fetch(`${ADMIN_API}/ads/${id}`, { method: "PUT", headers, body: JSON.stringify({ title: editAdTitleValue.trim() }) });
      if (res.ok) { setEditingAdTitle(null); fetchAds(); }
      else { const err = await res.json(); onMsg(err.error); }
    } catch { onMsg("Cannot connect to server"); }
  }

  async function deleteAd(id: string) {
    try {
      await fetch(`${ADMIN_API}/ads/${id}`, { method: "DELETE", headers });
      fetchAds(); onMsg("Ad deleted"); setConfirmDelete(null);
    } catch { onMsg("Cannot connect to server"); }
  }

  return (
    <>
      <div className="bg-card border border-border rounded-sm mb-6">
        <div className="bg-primary text-primary-foreground px-4 py-3 font-bold text-sm sm:text-base flex items-center justify-between">
          <span>Manage Ads</span>
          <span className="text-xs font-normal opacity-80">{activeAds.length} active / {ads.length} total</span>
        </div>

        <form onSubmit={handleUploadAd} className="p-4 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <input type="text" placeholder="Ad Title" value={adTitle} onChange={e => setAdTitle(e.target.value)} className="flex-1 border border-border px-3 py-2 text-sm rounded-sm bg-background text-foreground" />
            <select value={adType} onChange={e => setAdType(e.target.value as "image" | "video")} className="border border-border px-3 py-2 text-sm rounded-sm bg-background text-foreground">
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div className="flex gap-2 mb-3">
            <button type="button" onClick={() => setAdInputMode("url")}
              className={`px-3 py-1.5 text-xs font-bold rounded-sm ${adInputMode === "url" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>URL</button>
            <button type="button" onClick={() => setAdInputMode("upload")}
              className={`px-3 py-1.5 text-xs font-bold rounded-sm ${adInputMode === "upload" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>Upload</button>
          </div>

          {adInputMode === "url" ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <input type="url" placeholder="https://res.cloudinary.com/..." value={adUrl} onChange={e => setAdUrl(e.target.value)}
                className="flex-1 border border-border px-3 py-2 text-sm rounded-sm bg-background text-foreground" />
              <button type="submit" disabled={uploading} className="bg-primary text-primary-foreground px-5 py-2 text-sm font-bold rounded-sm hover:bg-primary/90 disabled:opacity-50">Add Ad</button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <input ref={fileInputRef} type="file" accept={adType === "image" ? "image/*" : "video/*"}
                onChange={e => setAdFile(e.target.files?.[0] || null)}
                className="flex-1 border border-border px-3 py-2 text-sm rounded-sm bg-background text-foreground file:mr-3 file:py-1 file:px-3 file:rounded-sm file:border-0 file:bg-primary file:text-primary-foreground file:text-sm file:font-bold" />
              <button type="submit" disabled={uploading} className="bg-primary text-primary-foreground px-5 py-2 text-sm font-bold rounded-sm hover:bg-primary/90 disabled:opacity-50">
                {uploading ? "Uploading..." : "Upload & Add"}
              </button>
            </div>
          )}

          {previewUrl && (
            <div className="mt-3 border border-border rounded-sm overflow-hidden max-w-xs">
              {adType === "video" ? (
                <video src={previewUrl} muted autoPlay loop playsInline className="w-full max-h-28 object-contain" />
              ) : (
                <img src={previewUrl} alt="Preview" className="w-full max-h-28 object-contain" />
              )}
            </div>
          )}
        </form>

        <div className="px-4 py-2 border-b border-border">
          <input type="text" placeholder="Search ads..." value={adSearch} onChange={e => setAdSearch(e.target.value)} className="w-full border border-border px-3 py-1.5 text-sm rounded-sm bg-background text-foreground" />
        </div>

        {filteredAds.length === 0 ? (
          <p className="p-4 text-muted-foreground text-sm">No ads found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="bg-muted text-left">
                  <th className="px-4 py-2 font-semibold">Title</th>
                  <th className="px-4 py-2 font-semibold">Preview</th>
                  <th className="px-4 py-2 font-semibold">Type</th>
                  <th className="px-4 py-2 font-semibold text-center w-20">Status</th>
                  <th className="px-4 py-2 font-semibold text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAds.map(ad => (
                  <tr key={ad._id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2">
                      {editingAdTitle === ad._id ? (
                        <div className="flex gap-1">
                          <input type="text" value={editAdTitleValue} onChange={e => setEditAdTitleValue(e.target.value)}
                            className="flex-1 border border-border px-2 py-1 text-sm rounded-sm bg-background text-foreground min-w-0" autoFocus />
                          <button onClick={() => saveAdTitle(ad._id)} className="text-primary text-xs font-bold whitespace-nowrap">Save</button>
                          <button onClick={() => setEditingAdTitle(null)} className="text-muted-foreground text-xs whitespace-nowrap">Esc</button>
                        </div>
                      ) : (
                        <button onClick={() => startEditAdTitle(ad)} className="hover:text-accent transition-colors text-left">{ad.title}</button>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="w-12 h-8 rounded-sm overflow-hidden bg-muted shrink-0">
                        {ad.type === "video" ? (
                          <video src={ad.url} muted className="w-full h-full object-cover" />
                        ) : (
                          <img src={ad.url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground uppercase text-xs">{ad.type}</td>
                    <td className="px-4 py-2 text-center">
                      <button onClick={() => toggleAdActive(ad)}
                        className={`text-xs font-bold px-2 py-1 rounded-sm ${ad.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {ad.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => setConfirmDelete(ad._id)} className="text-destructive hover:underline text-sm">Delete</button>
                    </td>
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
            <p className="text-foreground font-bold mb-2">Delete Ad?</p>
            <p className="text-muted-foreground text-sm mb-4">This cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm font-bold rounded-sm bg-muted text-muted-foreground hover:bg-muted/80">Cancel</button>
              <button onClick={() => deleteAd(confirmDelete)} className="px-4 py-2 text-sm font-bold rounded-sm bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
