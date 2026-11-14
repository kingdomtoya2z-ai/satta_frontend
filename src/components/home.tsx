"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AdPopup from "@/components/AdPopup";
import AdSlideDown from "@/components/AdSlideDown";
import AdSidebar from "@/components/AdSidebar";
import { RESULTS_API, ADMIN_API } from "@/lib/api";

interface GameRow {
  name: string;
  shortName: string;
  time: string;
  timeOrder: number;
  yesterdayResult: string;
  todayResult: string;
  highlight: boolean;
}

interface MonthlyRow {
  date: string;
  sunday?: boolean;
  [key: string]: string | boolean | undefined;
}

interface TodayData {
  live: GameRow[];
  next: GameRow[];
  rest: GameRow[];
}

interface Ad {
  _id: string;
  title: string;
  type: "image" | "video";
  url: string;
  active: boolean;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function Home({ initialMonth, initialYear }: { initialMonth: string; initialYear: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlMonth = searchParams.get("month") || initialMonth;
  const urlYear = searchParams.get("year") || initialYear;
  const urlRecord = searchParams.get("record");

  // The chart month/year and record chart game always follow the URL, just
  // like the original app which reloaded the page for every navigation.
  const chartMonth = urlMonth;
  const chartYear = urlYear;
  const recordChartGame = urlRecord;

  const [selectedMonth, setSelectedMonth] = useState(urlMonth);
  const [selectedYear, setSelectedYear] = useState(urlYear);
  const [showDisawar, setShowDisawar] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [todayData, setTodayData] = useState<TodayData>({ live: [], next: [], rest: [] });
  const [monthlyChart, setMonthlyChart] = useState<MonthlyRow[]>([]);
  const [gameKeys, setGameKeys] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([initialYear]);
  const [recordChartMonthly, setRecordChartMonthly] = useState<MonthlyRow[]>([]);
  const [recordChartKeys, setRecordChartKeys] = useState<string[]>([]);
  const [recordChartLoading, setRecordChartLoading] = useState(false);
  const [ads, setAds] = useState<Ad[]>([]);
  const [pendingRecordGame, setPendingRecordGame] = useState<string | null>(null);
  const [popupAd, setPopupAd] = useState<Ad | null>(null);

  // Current time is only available after mount so the server-rendered HTML
  // and the hydrated markup always agree.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); }, []);

  const today = now ? now.getDate() : 0;
  const todayDay = now ? DAYS[now.getDay()] : "";
  const yesterday = now ? new Date(now.getTime() - 86400000) : null;
  const yesterdayDay = yesterday ? DAYS[yesterday.getDay()] : "";

  const sections = ["LIVE", "NEXT", "REST"];
  const activeAds = ads.filter(a => a.active);

  // Keep the selector form in sync with the URL (the original app reset it
  // on every full-page navigation).
  useEffect(() => {
    setSelectedMonth(urlMonth);
    setSelectedYear(urlYear);
  }, [urlMonth, urlYear]);

  const fetchToday = useCallback(async () => {
    try {
      const res = await fetch(`${RESULTS_API}/today`, { cache: "no-store" });
      if (res.ok) {
        setTodayData(await res.json());
        setNow(new Date());
      }
    } catch {}
  }, []);

  const fetchMonthly = useCallback(async () => {
    try {
      const res = await fetch(`${RESULTS_API}/monthly?month=${chartMonth}&year=${chartYear}`, { cache: "no-store" });
      if (res.ok) {
        const data: MonthlyRow[] = await res.json();
        setMonthlyChart(data);
        if (data.length > 0) {
          setGameKeys(Object.keys(data[0]).filter(k => k !== "date" && k !== "sunday"));
        }
      }
    } catch {}
  }, [chartMonth, chartYear]);

  const fetchYears = useCallback(async () => {
    try {
      const res = await fetch(`${RESULTS_API}/years`, { cache: "no-store" });
      if (res.ok) {
        const years = await res.json();
        setAvailableYears(years.length > 0 ? years : [initialYear]);
      }
    } catch {}
  }, [initialYear]);

  const fetchAds = useCallback(async () => {
    try {
      const res = await fetch(`${ADMIN_API}/ads`, { cache: "no-store" });
      if (res.ok) setAds(await res.json());
    } catch {}
  }, []);

  useEffect(() => { fetchToday(); }, [fetchToday]);
  useEffect(() => { fetchMonthly(); }, [fetchMonthly]);
  useEffect(() => { fetchYears(); }, [fetchYears]);
  useEffect(() => { fetchAds(); }, [fetchAds]);

  useEffect(() => {
    const interval = setInterval(fetchToday, 30000);
    return () => clearInterval(interval);
  }, [fetchToday]);

  useEffect(() => {
    const interval = setInterval(fetchMonthly, 30000);
    return () => clearInterval(interval);
  }, [fetchMonthly]);

  useEffect(() => {
    const interval = setInterval(fetchYears, 60000);
    return () => clearInterval(interval);
  }, [fetchYears]);

  useEffect(() => {
    const interval = setInterval(fetchAds, 60000);
    return () => clearInterval(interval);
  }, [fetchAds]);

  useEffect(() => {
    if (!urlRecord) {
      setRecordChartMonthly([]);
      setRecordChartKeys([]);
      setRecordChartLoading(false);
      return;
    }
    let cancelled = false;
    const load = () => {
      setRecordChartLoading(true);
      fetch(`${RESULTS_API}/monthly?month=${chartMonth}&year=${chartYear}&include=${encodeURIComponent(urlRecord)}`, { cache: "no-store" })
        .then(res => res.ok ? res.json() : [])
        .then((data: MonthlyRow[]) => {
          if (cancelled) return;
          setRecordChartMonthly(data);
          if (data.length > 0) {
            setRecordChartKeys(Object.keys(data[0]).filter(k => k !== "date" && k !== "sunday"));
          }
          setRecordChartLoading(false);
        })
        .catch(() => { if (!cancelled) setRecordChartLoading(false); });
    };
    load();
    const interval = setInterval(load, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [urlRecord, chartMonth, chartYear]);

  function sectionGames(section: string) {
    if (section === "LIVE") return todayData.live.map(g => ({ ...g, section: "LIVE" }));
    if (section === "NEXT") return todayData.next.map(g => ({ ...g, section: "NEXT" }));
    return todayData.rest.map(g => ({ ...g, section: "REST" }));
  }

  function handleRecordChart(e: React.MouseEvent, gameName: string) {
    e.preventDefault();
    if (activeAds.length > 0) {
      const idx = Math.floor(Math.random() * activeAds.length);
      setPopupAd(activeAds[idx]);
      setPendingRecordGame(gameName);
    } else {
      navigateToRecordChart(gameName);
    }
  }

  function handleAdClose() {
    if (pendingRecordGame) {
      navigateToRecordChart(pendingRecordGame);
      setPendingRecordGame(null);
    }
    setPopupAd(null);
  }

  function navigateToRecordChart(gameName: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (recordChartGame === gameName) {
      next.delete("record");
    } else {
      next.set("record", gameName);
    }
    router.push(`/?${next.toString()}`);
  }

  const activeMonthlyChart = recordChartGame && recordChartMonthly.length > 0 ? recordChartMonthly : monthlyChart;
  const activeGameKeys = recordChartGame && recordChartKeys.length > 0 ? recordChartKeys : gameKeys;

  function renderGameRows() {
    const mostRecent = todayData.live[0];
    return (
      <>
        <div className="bg-primary text-primary-foreground text-center py-2 sm:py-3 text-sm sm:text-base md:text-xl font-bold rounded-t-sm">
          Satta-Samrat Results of {now ? now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""} &amp; {yesterday ? yesterday.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""}
        </div>
        <div className="grid grid-cols-[1fr_75px_75px] sm:grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_130px_130px] bg-primary/90 text-primary-foreground text-sm sm:text-base md:text-xl font-semibold">
          <div className="px-2 py-2 sm:px-2 sm:py-3">Regional Offline Draw Results</div>
           <div className="px-2 sm:px-3 py-2 sm:py-3 text-right">{yesterdayDay}. {yesterday ? ordinal(yesterday.getDate()) : ""}</div>
           <div className="px-2 sm:px-3 py-2 sm:py-3 text-right">{todayDay}. {now ? ordinal(today) : ""}</div>
        </div>
        {sections.map((section) => {
          const games = sectionGames(section);
          if (games.length === 0) return null;
          return (
          <div key={section} className={`${
              section === "LIVE" ? "bg-accent/10" :
              section === "NEXT" ? "bg-secondary/10" :
              "bg-pink/10"
            }`}>
            <div className={`px-2 sm:px-3 py-1.5 sm:py-2 font-bold text-sm sm:text-base md:text-xl border-b border-border ${
              section === "LIVE" ? "bg-accent text-accent-foreground" :
              section === "NEXT" ? "bg-secondary text-secondary-foreground" :
              "bg-pink text-pink-foreground"
            }`}>
              {section}
            </div>
            {games.map((game, idx) => {
              const isMostRecent = mostRecent && game.name === mostRecent.name;
              return (
              <div
                key={idx}
                className={`grid grid-cols-[1fr_75px_75px] sm:grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_130px_130px] border-b text-sm sm:text-base md:text-xl border-border ${
                  isMostRecent ? "bg-accent/20" :
                  game.highlight || game.name === recordChartGame ? "bg-secondary/20" : "hover:bg-black/5"
                }`}
              >
                <div className="px-2 sm:px-3 py-2 sm:py-3 min-w-0">
                  <div className={`font-bold truncate text-sm sm:text-lg md:text-2xl ${isMostRecent ? "text-accent" : game.highlight || game.name === recordChartGame ? "text-secondary-foreground" : "text-foreground"}`}>
                    {game.name}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs sm:text-sm">
                    <span className="truncate">{game.time}</span>
                    <a href="#" onClick={(e) => { handleRecordChart(e, game.name); }} className="text-accent hover:underline shrink-0 font-medium">Record Chart</a>
                  </div>
                </div>
                <div className={`px-2 sm:px-3 py-2 sm:py-3 text-right font-bold self-center text-sm sm:text-lg md:text-2xl ${game.yesterdayResult === "--" ? "text-muted-foreground" : "text-foreground"}`}>
                  {game.yesterdayResult}
                </div>
                <div className={`px-2 sm:px-3 py-2 sm:py-3 text-right font-bold self-center text-sm sm:text-lg md:text-2xl ${game.todayResult === "XX" || game.todayResult === "--" ? "text-muted-foreground" : "text-foreground"}`}>
                  {game.todayResult}
                </div>
              </div>
              );
            })}
          </div>
          );
        })}
      </>
    );
  }

  return (
    <div className={`min-h-screen font-sans ${isDark ? "dark" : ""} bg-background text-foreground`}>
      {/* Header */}
      <div className="text-center py-3 sm:py-4 px-2 relative bg-card">
        <div className="flex items-center justify-center gap-1 sm:gap-2 mt-[2rem] sm:mt-6">
          <img src={isDark?"logo2.png":"logo.png"} className=" h-10 md:h-20 lg:h-30" alt="" />
        </div>
        <button
          onClick={() => setIsDark(!isDark)}
          className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-6 sm:w-25 sm:h-10 rounded-full p-0.5 sm:p-1 transition-colors duration-300 ${isDark ? "bg-primary" : "bg-muted"}`}
        >
          <div className={` w-4 h-4 sm:w-8 sm:h-8 rounded-full bg-background shadow-md transition-transform duration-300 flex items-center justify-center text-[8px] sm:text-[10px] ${isDark ? "translate-x-7 sm:translate-x-15" : "translate-x-0"}`}>
            {isDark ? "🌙" : "☀️"}
          </div>
        </button>

      </div>

      {/* Ad Popup */}
      <AdPopup ad={popupAd} onClose={handleAdClose} />

      {/* Slide-down ad banner */}
      {activeAds.length > 0 && <AdSlideDown ads={activeAds} />}

      {/* Sidebar ads */}
      {activeAds.length > 0 && <AdSidebar ads={activeAds} />}

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-2 sm:px-3 py-3">
        {/* Description */}
        <p className="text-sm sm:text-base md:text-lg text-center mb-3 sm:mb-4 leading-relaxed text-muted-foreground">
          Daily Superfast Satta-Samrat Result of {now ? now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""} And Leak Numbers for Gali, Desawar, Ghaziabad and Faridabad
          With Complete Old Satta-Samrat Chart of 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2023, 2024, 2025 From
          Satta-Samrat, Satta-Samrat Ghaziabad, Satta-Samrat Desawar, Satta-Samrat Gali, Satta-Samrat Faridabad.
        </p>

        {/* Disclaimer */}
        <div className="bg-destructive text-destructive-foreground text-sm sm:text-base md:text-lg p-3 sm:p-4 mb-3 rounded-sm">
          <span className="font-bold">DISCLAIMER:</span> This website is an independent media portal for informational and
          journalistic purposes only. As a non-transactional service, we are not affiliated with any entity mentioned. Users
          are solely responsible for complying with all applicable laws in their jurisdiction.{" "}
          <Link href="/terms" className="underline text-secondary">Read More...</Link>
        </div>

        {/* Updated timestamp */}
        <p className="text-center text-sm sm:text-base md:text-xl mb-3 sm:mb-4 text-accent font-semibold">
          {now ? <>Updated: {now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}, {now.toLocaleTimeString("en-US", { hour12: false })} IST.</> : null}
        </p>

        {/* Most recent result banner - only if there's an actual result */}
        {todayData.live.find(g => g.todayResult !== "--" && g.todayResult !== "XX") && (
          <div className="bg-accent text-accent-foreground text-center py-3 sm:py-4 mb-3 rounded-sm font-bold text-sm sm:text-lg md:text-xl">
            {(() => {
              const mostRecent = [...todayData.live].filter(g => g.todayResult !== "--" && g.todayResult !== "XX").sort((a, b) => b.timeOrder - a.timeOrder)[0];
              return <>Most Recent Result — {mostRecent.name}: {mostRecent.todayResult}</>;
            })()}
          </div>
        )}

        {/* Record Chart (top) - only when active */}
        {recordChartGame && (() => {
          const allGames = [...todayData.live, ...todayData.next, ...todayData.rest];
          const keys = activeGameKeys;
          const filtered = allGames.filter(g => keys.includes(g.shortName));
          const sorted = [...filtered].sort((a, b) => a.timeOrder - b.timeOrder);
          return (
            <>
              <div className="bg-primary text-primary-foreground text-center py-2 sm:py-3 text-sm sm:text-base md:text-xl font-bold rounded-t-sm">
                Record Chart - {recordChartGame}
              </div>
              <div className="grid grid-cols-[1fr_75px_75px] sm:grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_130px_130px] bg-primary/90 text-primary-foreground text-sm sm:text-base md:text-xl font-semibold">
                <div className="px-2 py-2 sm:px-2 sm:py-3">Record Chart Results</div>
                <div className="px-2 sm:px-3 py-2 sm:py-3 text-right">{yesterdayDay}. {yesterday ? ordinal(yesterday.getDate()) : ""}</div>
                <div className="px-2 sm:px-3 py-2 sm:py-3 text-right">{todayDay}. {now ? ordinal(today) : ""}</div>
              </div>
              {recordChartLoading ? (
                <div className="text-center py-4 text-muted-foreground text-sm">Loading...</div>
              ) : (
                sorted.map((game, idx) => (
                  <div key={idx} className={`grid grid-cols-[1fr_75px_75px] sm:grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_130px_130px] border-b text-sm sm:text-base md:text-xl border-border ${game.name === recordChartGame ? "bg-secondary/20" : "hover:bg-black/5"}`}>
                    <div className="px-2 sm:px-3 py-2 sm:py-3 min-w-0">
                      <div className={`font-bold truncate text-sm sm:text-lg md:text-2xl ${game.name === recordChartGame ? "text-secondary-foreground" : "text-foreground"}`}>{game.name}</div>
                      <div className="flex items-center gap-1 text-muted-foreground text-xs sm:text-sm">
                        <span className="truncate">{game.time}</span>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleRecordChart(e, game.name); }} className="text-accent hover:underline shrink-0 font-medium">Record Chart</a>
                      </div>
                    </div>
                    <div className="px-2 sm:px-3 py-2 sm:py-3 text-right font-bold self-center text-sm sm:text-lg md:text-2xl">{game.yesterdayResult}</div>
                    <div className={`px-2 sm:px-3 py-2 sm:py-3 text-right font-bold self-center text-sm sm:text-lg md:text-2xl ${game.todayResult === "--" ? "text-muted-foreground" : "text-foreground"}`}>{game.todayResult}</div>
                  </div>
                ))
              )}
            </>
          );
        })()}

        {/* Game rows - at top normally, at bottom when record chart is active */}
        {!recordChartGame && renderGameRows()}

        {/* Show Your Game Banner */}
        <div className="bg-secondary text-secondary-foreground text-center py-3 sm:py-4 mt-2 border-2 border-secondary">
          <div className="font-bold text-sm sm:text-lg md:text-xl">🔴🔴 SHOW YOUR GAME HERE 🔴🔴</div>
          <a href="#" className="text-accent text-sm sm:text-base md:text-lg hover:underline font-medium">Contact us to show your game here</a>
        </div>

        {/* Disawar toggle banner */}
        <div
          className="bg-primary text-primary-foreground text-center py-2 sm:py-3 mt-2 sm:mt-3 cursor-pointer hover:bg-primary/90 transition-colors"
          onClick={() => setShowDisawar(!showDisawar)}
        >
          <span className="text-secondary font-bold text-sm sm:text-lg md:text-xl">New </span>
          <span className="text-sm sm:text-base md:text-xl">Show Disawar at its original position of the next day</span>
        </div>

        {/* Chart section */}
        <div className="bg-primary text-primary-foreground text-center py-2 sm:py-3 text-sm sm:text-base md:text-xl font-bold">
          Monthly Satta-Samrat Result Chart of {new Date(parseInt(chartYear), parseInt(chartMonth) - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })} for {activeGameKeys.join(", ")}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm sm:text-base md:text-xl border-collapse">
            <thead>
              <tr className="bg-secondary text-secondary-foreground">
                <th className="border border-border px-3 sm:px-4 py-2 sm:py-3 font-bold text-center">DATE</th>
                {activeGameKeys.map(key => (
                  <th key={key} className="border border-border px-3 sm:px-4 py-2 sm:py-3 font-bold text-center">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeMonthlyChart.map((row) => (
                <tr key={row.date as string} className="bg-card hover:bg-muted/50">
                  <td className={`border border-border px-3 sm:px-4 py-2 sm:py-2.5 text-center font-bold ${row.sunday ? "text-destructive" : "text-foreground"}`}>
                    {row.date as string}
                  </td>
                  {activeGameKeys.map(key => (
                    <td key={key} className={`border border-border px-3 sm:px-4 py-2 sm:py-2.5 text-center font-bold ${row.sunday ? "text-destructive" : "text-foreground"}`}>
                      {row[key] as string}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-3 mt-3 sm:mt-4">
          <button
            onClick={() => { router.push(`/?month=${String(parseInt(chartMonth) - 1).padStart(2, "0")}&year=${parseInt(chartMonth) === 1 ? String(parseInt(chartYear) - 1) : chartYear}`); }}
            className="flex-1 bg-primary text-primary-foreground py-2 sm:py-3 text-sm sm:text-lg md:text-xl font-bold hover:bg-primary/90 transition-colors rounded-sm"
          >
            {MONTHS[(parseInt(chartMonth) - 2 + 12) % 12]} {parseInt(chartMonth) === 1 ? parseInt(chartYear) - 1 : chartYear}
          </button>
          <button
            onClick={() => { router.push(`/?month=${String(parseInt(chartMonth) + 1).padStart(2, "0")}&year=${parseInt(chartMonth) === 12 ? String(parseInt(chartYear) + 1) : chartYear}`); }}
            className="flex-1 bg-primary text-primary-foreground py-2 sm:py-3 text-sm sm:text-lg md:text-xl font-bold hover:bg-primary/90 transition-colors rounded-sm"
          >
            {MONTHS[parseInt(chartMonth) % 12]} {parseInt(chartMonth) === 12 ? parseInt(chartYear) + 1 : chartYear}
          </button>
        </div>

        <div className="bg-primary text-primary-foreground text-center py-2 sm:py-3 mt-2 sm:mt-3 text-sm sm:text-base md:text-lg font-semibold cursor-pointer hover:bg-primary/90 transition-colors rounded-sm">
          Click here to view the latest chart for {activeGameKeys.join(", ")} for {new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </div>

        <div className="mt-3 sm:mt-4 p-4 sm:p-6 rounded-sm bg-secondary text-secondary-foreground">
          <p className="text-center text-sm sm:text-base md:text-xl mb-3 sm:mb-4 font-semibold">
            Select a month and year to view the combined chart for {activeGameKeys.join(", ")}.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={MONTHS[parseInt(selectedMonth) - 1]}
              onChange={(e) => setSelectedMonth(String(MONTHS.indexOf(e.target.value) + 1).padStart(2, "0"))}
              className="flex-1 border border-border px-3 py-2 sm:py-3 text-sm sm:text-base md:text-xl rounded-sm bg-background text-foreground font-medium"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="flex-1 border border-border px-3 py-2 sm:py-3 text-sm sm:text-base md:text-xl rounded-sm bg-background text-foreground font-medium"
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
            <button
              onClick={() => { router.push(`/?month=${selectedMonth}&year=${selectedYear}`); }}
              className="bg-primary text-primary-foreground px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base md:text-xl font-bold hover:bg-primary/90 transition-colors rounded-sm"
            >
              Go
            </button>
          </div>
        </div>

        {/* Game rows at bottom when record chart is active */}
        {recordChartGame && renderGameRows()}

        {/* Footer */}
        <div className="text-center text-sm sm:text-base md:text-xl mt-4 sm:mt-6 pb-8 text-muted-foreground font-medium space-y-2">
          <p>Satta-Samrat — Results updated daily at 6:00 PM IST</p>
          <div className="flex items-center justify-center gap-4 text-xs sm:text-sm">
            <Link href="/terms" className="text-accent hover:underline">Terms</Link>
            <span className="text-muted-foreground/50">|</span>
            <Link href="/contact" className="text-accent hover:underline">Contact Us</Link>
          </div>
        </div>
      </div>

      {/* Contact Us button */}
      <Link
        href="/contact"
        className="fixed bottom-18 sm:bottom-20 right-4 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg flex items-center justify-center transition-colors duration-200 bg-card text-foreground hover:bg-muted"
        aria-label="Contact Us"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      </Link>

      {/* Refresh button */}
      <button
        onClick={() => window.location.reload()}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg flex items-center justify-center transition-colors duration-200 bg-card text-foreground hover:bg-muted"
        aria-label="Refresh"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/>
        </svg>
      </button>
    </div>
  );
}
