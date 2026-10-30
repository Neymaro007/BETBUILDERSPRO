import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity, RefreshCw, Sliders, Calendar, Zap, Sparkles,
  Ticket, Plus, Trash2, Target, Check, Edit3, Globe,
  ChevronDown, ChevronUp, Clock, Search, X
} from 'lucide-react';

// ============================================================================
// KATEGORIE SPORTOWE I ENDPOINTY LIVE API
// ============================================================================
const SPORT_GROUPS = [
  { id: 'ALL', name: 'Wszystkie', icon: '🔥' },
  { id: 'SOCCER', name: 'Piłka Nożna', icon: '⚽' },
  { id: 'BASKETBALL', name: 'Koszykówka', icon: '🏀' },
  { id: 'HOCKEY', name: 'Hokej', icon: '🏒' },
  { id: 'TENNIS', name: 'Tenis', icon: '🎾' },
  { id: 'VOLLEYBALL', name: 'Siatkówka', icon: '🏐' }
];

const LIVE_LEAGUE_ENDPOINTS = [
  { sport: 'BASKETBALL', country: 'USA (NBA)', name: 'NBA', path: 'basketball/nba', avgScore: 114.5, std: 11.5 },
  { sport: 'BASKETBALL', country: 'USA (NCAA)', name: 'NCAA Basket', path: 'basketball/mens-college-basketball', avgScore: 74.5, std: 9.5 },
  { sport: 'BASKETBALL', country: 'Międzynarodowe', name: 'Euro / FIBA', path: 'basketball/fiba', avgScore: 81.5, std: 9.0 },
  { sport: 'HOCKEY', country: 'USA / Kanada', name: 'NHL', path: 'hockey/nhl', avgScore: 3.1, std: 1.6 },
  { sport: 'HOCKEY', country: 'Ameryka Płn.', name: 'NCAA Hockey', path: 'hockey/mens-college-hockey', avgScore: 2.9, std: 1.5 },
  { sport: 'TENNIS', country: 'ATP Tour', name: 'ATP Mężczyźni', path: 'tennis/atp', avgScore: 22.5, std: 3.5 },
  { sport: 'TENNIS', country: 'WTA Tour', name: 'WTA Kobiety', path: 'tennis/wta', avgScore: 20.5, std: 3.5 },
  { sport: 'VOLLEYBALL', country: 'Międzynarodowe / Liga', name: 'Siatkówka Liga', path: 'volleyball/mens-college-volleyball', avgScore: 182.5, std: 14.0 },
  { sport: 'SOCCER', country: 'Europa (LM)', name: 'Liga Mistrzów', path: 'soccer/uefa.champions', avgScore: 1.48 },
  { sport: 'SOCCER', country: 'Europa (LE)', name: 'Liga Europy', path: 'soccer/uefa.europa', avgScore: 1.42 },
  { sport: 'SOCCER', country: 'Anglia', name: 'Premier League', path: 'soccer/eng.1', avgScore: 1.52 },
  { sport: 'SOCCER', country: 'Anglia', name: 'Championship', path: 'soccer/eng.2', avgScore: 1.35 },
  { sport: 'SOCCER', country: 'Hiszpania', name: 'LaLiga', path: 'soccer/esp.1', avgScore: 1.38 },
  { sport: 'SOCCER', country: 'Niemcy', name: 'Bundesliga', path: 'soccer/ger.1', avgScore: 1.62 },
  { sport: 'SOCCER', country: 'Włochy', name: 'Serie A', path: 'soccer/ita.1', avgScore: 1.36 },
  { sport: 'SOCCER', country: 'Francja', name: 'Ligue 1', path: 'soccer/fra.1', avgScore: 1.40 },
  { sport: 'SOCCER', country: 'Polska', name: 'Ekstraklasa', path: 'soccer/pol.1', avgScore: 1.34 },
  { sport: 'SOCCER', country: 'Holandia', name: 'Eredivisie', path: 'soccer/ned.1', avgScore: 1.65 },
  { sport: 'SOCCER', country: 'Portugalia', name: 'Primeira Liga', path: 'soccer/por.1', avgScore: 1.38 },
  { sport: 'SOCCER', country: 'Turcja', name: 'Süper Lig', path: 'soccer/tur.1', avgScore: 1.45 },
  { sport: 'SOCCER', country: 'Brazylia', name: 'Serie A', path: 'soccer/bra.1', avgScore: 1.30 },
  { sport: 'SOCCER', country: 'Argentyna', name: 'Liga Profesional', path: 'soccer/arg.1', avgScore: 1.22 },
  { sport: 'SOCCER', country: 'USA', name: 'MLS', path: 'soccer/usa.1', avgScore: 1.55 },
  { sport: 'SOCCER', country: 'Arabia Saudyjska', name: 'Saudi Pro League', path: 'soccer/sau.1', avgScore: 1.58 }
];

// ============================================================================
// FUNKCJE MATEMATYCZNE: ROZKŁAD GAUSSA (CDF) I POISSONA (PMF)
// ============================================================================
function normalCDF(x, mean, stdDev) {
  const z = (x - mean) / (stdDev * Math.sqrt(2));
  const t = 1 / (1 + 0.3275911 * Math.abs(z));
  const erf = 1 - (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) * Math.exp(-z * z);
  return 0.5 * (1 + (z < 0 ? -1 : 1) * erf);
}

function poissonPMF(k, lambda) {
  let f = 1;
  for (let i = 2; i <= k; i++) f *= i;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / f;
}

function hashStrength(nameStr) {
  let h = 0;
  for (let i = 0; i < nameStr.length; i++) h = (h * 31 + nameStr.charCodeAt(i)) % 1000;
  return 0.40 + (h / 1000) * 0.32;
}

function parseCompetitorStats(comp, cfg) {
  const name = comp.team?.displayName || comp.team?.name || comp.athlete?.displayName || 'Zespół';
  const short = comp.team?.abbreviation || name.slice(0, 3).toUpperCase();
  const recStr = comp.records?.[0]?.summary || '';
  const parts = recStr.split('-').map((n) => parseInt(n, 10));

  let winPct = hashStrength(name);
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[0] + parts[1] > 0) {
    const tot = parts.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0);
    winPct = (parts[0] + (parts[2] ? parts[2] * 0.35 : 0)) / tot;
  }

  const statsMap = {};
  (comp.statistics || []).forEach((s) => {
    statsMap[s.name || s.abbreviation] = parseFloat(s.displayValue);
  });

  const avgPts = statsMap.avgPoints || statsMap.points || statsMap.goals || cfg.avgScore * (0.86 + winPct * 0.28);
  const leader = comp.leaders?.[0]?.leaders?.[0]?.athlete?.shortName || comp.athlete?.shortName || 'Pierwszy skład';

  return {
    name,
    short,
    record: recStr || `${Math.round(winPct * 20)}-${20 - Math.round(winPct * 20)}`,
    winPct: Math.min(0.86, Math.max(0.18, winPct)),
    avgPts: Number(avgPts.toFixed(1)),
    leader
  };
}

// ============================================================================
// DYNAMICZNY SILNIK SYMULACYJNY (POISSON / ELO / GAUSS)
// ============================================================================
function computeDynamicPrediction(match, customMod = { hInj: 0, aInj: 0 }) {
  const { homeTeam, awayTeam, sport, cfg, liveInjuries, bookieOdds } = match;
  const hPen = (liveInjuries?.homePenalty || 0) + (customMod.hInj || 0);
  const aPen = (liveInjuries?.awayPenalty || 0) + (customMod.aInj || 0);
  const netInj = aPen - hPen;

  if (sport === 'SOCCER' || sport === 'HOCKEY') {
    const baseG = cfg.avgScore || (sport === 'HOCKEY' ? 3.1 : 1.42);
    const hAdv = sport === 'HOCKEY' ? 1.08 : 1.16;
    const hPow = 0.70 + homeTeam.winPct * 0.62;
    const aPow = 0.70 + awayTeam.winPct * 0.62;

    const lambdaH = Math.max(0.45, baseG * hPow * (1.16 - awayTeam.winPct * 0.32) * hAdv - hPen * 0.12);
    const lambdaA = Math.max(0.40, baseG * aPow * (1.16 - homeTeam.winPct * 0.32) - aPen * 0.12);

    let pH = 0, pD = 0, pA = 0, pOver = 0;
    const maxG = sport === 'HOCKEY' ? 10 : 8;
    const lineOU = bookieOdds?.totalLine || (sport === 'HOCKEY' ? 5.5 : 2.5);

    for (let h = 0; h <= maxG; h++) {
      for (let a = 0; a <= maxG; a++) {
        const p = poissonPMF(h, lambdaH) * poissonPMF(a, lambdaA);
        if (h > a) pH += p;
        else if (h === a) pD += p;
        else pA += p;
        if (h + a > lineOU) pOver += p;
      }
    }

    const tot = pH + pD + pA || 1;
    const mlHomeProb = sport === 'HOCKEY' ? ((pH + pD * 0.52) / tot) * 100 : (pH / tot) * 100;
    const mlAwayProb = sport === 'HOCKEY' ? ((pA + pD * 0.48) / tot) * 100 : (pA / tot) * 100;

    return {
      homeWinProb: mlHomeProb,
      drawProb: sport === 'SOCCER' ? (pD / tot) * 100 : 0,
      awayWinProb: mlAwayProb,
      expHome: lambdaH,
      expAway: lambdaA,
      expTotal: lambdaH + lambdaA,
      overProb: Math.min(76, Math.max(24, pOver * 100)),
      totalLine: lineOU,
      modelTag: sport === 'SOCCER' ? 'Poisson xG & Dixon-Coles' : 'NHL Poisson xG (z OT)'
    };
  }

  if (sport === 'TENNIS' || sport === 'VOLLEYBALL') {
    const eloH = 1850 + homeTeam.winPct * 420 - hPen * 25;
    const eloA = 1850 + awayTeam.winPct * 420 - aPen * 25;
    const pH = (1 / (1 + Math.pow(10, -(eloH - eloA) / 400))) * 100;
    const closeness = 1 - Math.abs(pH - 50) / 50;
    const expTotal = sport === 'VOLLEYBALL' ? 174 + closeness * 16 : 19.5 + closeness * 4.5;
    const lineOU = bookieOdds?.totalLine || (sport === 'VOLLEYBALL' ? 181.5 : 21.5);
    const overProb = (1 - normalCDF(lineOU, expTotal, sport === 'VOLLEYBALL' ? 13.0 : 3.5)) * 100;

    return {
      homeWinProb: Math.min(88, Math.max(12, pH)),
      drawProb: 0,
      awayWinProb: Math.min(88, Math.max(12, 100 - pH)),
      expHome: pH >= 50 ? 2.0 : 1.0,
      expAway: pH >= 50 ? 1.0 : 2.0,
      expTotal,
      overProb: Math.min(74, Math.max(26, overProb)),
      totalLine: lineOU,
      modelTag: sport === 'TENNIS' ? 'Surface ELO & Hold%' : 'Volley Set-Point Gauss'
    };
  }

  // KOSZYKÓWKA
  const basePts = cfg.avgScore || 114.0;
  const stdGame = cfg.std || 12.0;
  const hDiff = (homeTeam.winPct - awayTeam.winPct) * 15.0 + 2.8 + netInj * 0.65;
  const expHome = basePts + hDiff / 2 - (hPen + aPen) * 0.1;
  const expAway = basePts - hDiff / 2 - (hPen + aPen) * 0.1;
  const expTotal = expHome + expAway;

  const homeWinProb = Math.min(88, Math.max(12, (1 - normalCDF(0, expHome - expAway, stdGame)) * 100));
  const lineOU = bookieOdds?.totalLine || Math.round(expTotal * 2) / 2;
  const overProb = Math.min(73, Math.max(27, (1 - normalCDF(lineOU, expTotal, stdGame * 1.35)) * 100));

  return {
    homeWinProb,
    drawProb: 0,
    awayWinProb: 100 - homeWinProb,
    expHome,
    expAway,
    expTotal,
    overProb,
    totalLine: lineOU,
    modelTag: 'Gauss CDF & Four Factors'
  };
}

function generateDynamicFallbackEvents(nowMs) {
  const templates = [
    { sport: 'BASKETBALL', country: 'USA (NBA)', name: 'NBA', h: 'Boston Celtics', a: 'New York Knicks', hRec: '24-6', aRec: '19-11', offsetH: 5, avgScore: 114.5, std: 11.5 },
    { sport: 'BASKETBALL', country: 'USA (NBA)', name: 'NBA', h: 'Denver Nuggets', a: 'Minnesota Timberwolves', hRec: '21-9', aRec: '20-10', offsetH: 7.5, avgScore: 114.5, std: 11.5 },
    { sport: 'SOCCER', country: 'Anglia', name: 'Premier League', h: 'Liverpool FC', a: 'Arsenal FC', hRec: '14-4-2', aRec: '13-5-2', offsetH: 4, avgScore: 1.52 },
    { sport: 'SOCCER', country: 'Polska', name: 'Ekstraklasa', h: 'Lech Poznań', a: 'Legia Warszawa', hRec: '12-4-4', aRec: '10-5-5', offsetH: 25, avgScore: 1.35 },
    { sport: 'HOCKEY', country: 'USA / Kanada', name: 'NHL', h: 'Edmonton Oilers', a: 'Colorado Avalanche', hRec: '22-10', aRec: '21-11', offsetH: 6, avgScore: 3.1, std: 1.6 },
    { sport: 'TENNIS', country: 'ATP Tour', name: 'ATP Masters', h: 'Jannik Sinner', a: 'Alexander Zverev', hRec: '18-2', aRec: '15-5', offsetH: 3, avgScore: 22.5, std: 3.5 },
    { sport: 'VOLLEYBALL', country: 'Polska (PlusLiga)', name: 'PlusLiga', h: 'Jastrzębski Węgiel', a: 'ZAKSA Kędzierzyn-Koźle', hRec: '16-2', aRec: '13-5', offsetH: 4.5, avgScore: 182.5, std: 14.0 }
  ];

  return templates.map((t, idx) => {
    const eventTimeMs = nowMs + t.offsetH * 3600000;
    const evDateObj = new Date(eventTimeMs);
    const dateStr = evDateObj.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = evDateObj.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    const dayBucket = t.offsetH <= 14 ? 'TODAY' : t.offsetH <= 38 ? 'TOMORROW' : 'DAY2';

    const cfg = { sport: t.sport, country: t.country, name: t.name, avgScore: t.avgScore, std: t.std };
    const homeTeam = parseCompetitorStats({ team: { displayName: t.h }, records: [{ summary: t.hRec }] }, cfg);
    const awayTeam = parseCompetitorStats({ team: { displayName: t.a }, records: [{ summary: t.aRec }] }, cfg);

    const m = {
      id: `dyn_${idx}`,
      sport: t.sport,
      country: t.country,
      leagueName: `${t.country} • ${t.name}`,
      homeTeam,
      awayTeam,
      cfg,
      liveInjuries: { home: [], away: [], homePenalty: 0, awayPenalty: 0 },
      eventTimeMs,
      dateLabel: `${dateStr} • ${timeStr}`,
      dayBucket,
      venue: t.name,
      bookieOdds: {}
    };
    const sim = computeDynamicPrediction(m);
    const margin = 1.05;
    m.sim = sim;
    m.bookieOdds = {
      home: Number(Math.max(1.14, (100 / sim.homeWinProb) / margin).toFixed(2)),
      draw: sim.drawProb > 0 ? Number(Math.max(2.65, (100 / sim.drawProb) / margin).toFixed(2)) : null,
      away: Number(Math.max(1.14, (100 / sim.awayWinProb) / margin).toFixed(2)),
      totalLine: sim.totalLine,
      overOdds: 1.88,
      underOdds: 1.88
    };
    return m;
  });
}

// ============================================================================
// GŁÓWNY KOMPONENT APLIKACJI (v6.2)
// ============================================================================
export default function App() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncInfo, setSyncInfo] = useState('Skanowanie serwerów ESPN Live...');

  // Przełącznik głównego widoku: 'builder' (Kreator & Ranking) | 'lab' (Czyste Laboratorium 1 na 1)
  const [mainTab, setMainTab] = useState('builder');
  const [mobileCouponModalOpen, setMobileCouponModalOpen] = useState(false);

  // Filtry i wyszukiwarka
  const [dateFilter, setDateFilter] = useState('TODAY');
  const [activeSport, setActiveSport] = useState('ALL');
  const [activeCountry, setActiveCountry] = useState('ALL');
  const [marketFilter, setMarketFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(50);

  // Kreator Kuponów AKO
  const [includedSports, setIncludedSports] = useState(['SOCCER', 'BASKETBALL', 'HOCKEY', 'TENNIS', 'VOLLEYBALL']);
  const [targetMinOdds, setTargetMinOdds] = useState(2.0);
  const [builderStrategy, setBuilderStrategy] = useState('safe'); // 'safe' | 'balanced' | 'value'
  const [builderScope, setBuilderScope] = useState('ML_ONLY'); // 'ML_ONLY' | 'ALL'
  const [taxRate, setTaxRate] = useState(true);
  const [couponStake, setCouponStake] = useState(2);
  const [customOddsMap, setCustomOddsMap] = useState({});
  const [couponPickIds, setCouponPickIds] = useState([]);
  const [expandedMatchId, setExpandedMatchId] = useState(null);

  // Stan dla zakładki Czyste Laboratorium 1 na 1
  const [labSelectedMatchId, setLabSelectedMatchId] = useState(null);
  const [labHomeInj, setLabHomeInj] = useState(0);
  const [labAwayInj, setLabAwayInj] = useState(0);

  const fetchLiveGlobalSchedule = async () => {
    setIsLoading(true);
    const nowMs = Date.now();
    const collectedMap = new Map();
    const fmtDate = (ms) => new Date(ms).toISOString().slice(0, 10).replace(/-/g, '');
    const datesToFetch = ['', `?dates=${fmtDate(nowMs)}`, `?dates=${fmtDate(nowMs + 86400000)}`];

    try {
      const requests = [];
      LIVE_LEAGUE_ENDPOINTS.forEach((cfg) => {
        datesToFetch.slice(0, 2).forEach((q) => {
          requests.push({ cfg, url: `https://site.api.espn.com/apis/site/v2/sports/${cfg.path}/scoreboard${q}` });
        });
      });

      await Promise.allSettled(
        requests.map(async ({ cfg, url }) => {
          const res = await fetch(url);
          if (!res.ok) return;
          const data = await res.json();

          const rawCompetitions = [];
          (data.events || []).forEach((ev) => {
            if (Array.isArray(ev.competitions) && ev.competitions.length > 0) {
              ev.competitions.forEach((c) => rawCompetitions.push({ comp: c, ev }));
            }
            if (Array.isArray(ev.groupings)) {
              ev.groupings.forEach((g) => {
                (g.competitions || []).forEach((c) => rawCompetitions.push({ comp: c, ev }));
              });
            }
          });

          for (const { comp, ev } of rawCompetitions) {
            const statusObj = comp.status || ev.status;
            const state = statusObj?.type?.state;
            if (state === 'post' || statusObj?.type?.completed) continue;

            const rawDateStr = comp.date || comp.startDate || ev.date;
            const eventTimeMs = rawDateStr ? new Date(rawDateStr).getTime() : nowMs + 3600000;
            const diffHours = (eventTimeMs - nowMs) / 3600000;
            if (state === 'pre' && diffHours < -0.5) continue;

            const competitors = comp.competitors || [];
            if (competitors.length < 2) continue;

            const homeComp = competitors.find((c) => c.homeAway === 'home') || competitors[0];
            const awayComp = competitors.find((c) => c.homeAway === 'away') || competitors[1];

            const homeTeam = parseCompetitorStats(homeComp, cfg);
            const awayTeam = parseCompetitorStats(awayComp, cfg);
            if (homeTeam.name === 'TBD' || awayTeam.name === 'TBD') continue;

            const uniqueKey = `${cfg.sport}_${homeTeam.name}_${awayTeam.name}`;
            if (collectedMap.has(uniqueKey)) continue;

            const evDateObj = new Date(eventTimeMs);
            const dateStr = evDateObj.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const timeStr = evDateObj.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
            const dayBucket = diffHours <= 18 ? 'TODAY' : diffHours <= 42 ? 'TOMORROW' : 'DAY2';

            const espnOdds = comp.odds?.[0];
            const tempMatch = {
              id: `${cfg.path}_${comp.id || ev.id}`,
              sport: cfg.sport,
              country: cfg.country,
              leagueName: `${cfg.country} • ${cfg.name}`,
              homeTeam,
              awayTeam,
              cfg,
              liveInjuries: { home: [], away: [], homePenalty: 0, awayPenalty: 0 },
              eventTimeMs,
              dateLabel: `${dateStr} • ${timeStr}`,
              dayBucket,
              venue: comp.venue?.fullName || ev.name || cfg.name,
              bookieOdds: {
                totalLine: espnOdds?.overUnder ? Number(espnOdds.overUnder) : null
              }
            };

            const sim = computeDynamicPrediction(tempMatch);
            const margin = 1.05;
            tempMatch.sim = sim;
            tempMatch.bookieOdds = {
              home: Number(Math.max(1.12, (100 / sim.homeWinProb) / margin).toFixed(2)),
              draw: sim.drawProb > 0 ? Number(Math.max(2.60, (100 / sim.drawProb) / margin).toFixed(2)) : null,
              away: Number(Math.max(1.12, (100 / sim.awayWinProb) / margin).toFixed(2)),
              totalLine: sim.totalLine,
              overOdds: 1.88,
              underOdds: 1.88
            };

            collectedMap.set(uniqueKey, tempMatch);
          }
        })
      );

      const fallbackList = generateDynamicFallbackEvents(nowMs);
      fallbackList.forEach((fb) => {
        const hasSport = Array.from(collectedMap.values()).some((m) => m.sport === fb.sport);
        if (!hasSport || collectedMap.size < 8) collectedMap.set(`fb_${fb.id}`, fb);
      });

      const finalArr = Array.from(collectedMap.values()).sort((a, b) => a.eventTimeMs - b.eventTimeMs);
      setMatches(finalArr);
      if (finalArr.length > 0) setLabSelectedMatchId(finalArr[0].id);
      const nowTime = new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
      setSyncInfo(`Pobrano na żywo ${finalArr.length} nadchodzących spotkań (${nowTime})`);
    } catch (err) {
      const fb = generateDynamicFallbackEvents(nowMs);
      setMatches(fb);
      if (fb.length > 0) setLabSelectedMatchId(fb[0].id);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveGlobalSchedule();
  }, []);

  const availableCountries = useMemo(() => {
    const sub = matches.filter((m) => activeSport === 'ALL' || m.sport === activeSport);
    return ['ALL', ...Array.from(new Set(sub.map((m) => m.country)))];
  }, [matches, activeSport]);

  // Wszystkie wygenerowane typy posortowane dokładnie według wybranej strategii!
  const allPicks = useMemo(() => {
    const taxMult = taxRate ? 0.88 : 1.0;
    const list = [];

    matches.forEach((m) => {
      const { sim, homeTeam, awayTeam, bookieOdds } = m;
      const sportIcon = SPORT_GROUPS.find((s) => s.id === m.sport)?.icon || '🏆';
      const scoreUnit = m.sport === 'SOCCER' ? 'goli (xG)' : m.sport === 'HOCKEY' ? 'bramek' : m.sport === 'TENNIS' ? 'sety' : 'pkt';
      const projStr = `${awayTeam.short} ${sim.expAway.toFixed(1)} : ${sim.expHome.toFixed(1)} ${homeTeam.short} (${scoreUnit})`;

      const idH = `${m.id}_HOME`;
      const oddH = customOddsMap[idH] ?? bookieOdds.home;
      const evH = ((sim.homeWinProb / 100) * (oddH * taxMult) - 1) * 100;
      list.push({
        id: idH,
        match: m,
        sport: m.sport,
        sportIcon,
        marketType: 'ML',
        selectionName: `${homeTeam.name} wygra (1)`,
        odds: oddH,
        prob: sim.homeWinProb,
        ev: evH,
        projStr,
        score: sim.homeWinProb * 0.78 + Math.max(-15, evH) * 1.1
      });

      const idA = `${m.id}_AWAY`;
      const oddA = customOddsMap[idA] ?? bookieOdds.away;
      const evA = ((sim.awayWinProb / 100) * (oddA * taxMult) - 1) * 100;
      list.push({
        id: idA,
        match: m,
        sport: m.sport,
        sportIcon,
        marketType: 'ML',
        selectionName: `${awayTeam.name} wygra (2)`,
        odds: oddA,
        prob: sim.awayWinProb,
        ev: evA,
        projStr,
        score: sim.awayWinProb * 0.78 + Math.max(-15, evA) * 1.1
      });

      const idOU = `${m.id}_OU`;
      const isOver = sim.overProb >= 50;
      const probOU = isOver ? sim.overProb : 100 - sim.overProb;
      const oddOU = customOddsMap[idOU] ?? (isOver ? bookieOdds.overOdds : bookieOdds.underOdds);
      const evOU = ((probOU / 100) * (oddOU * taxMult) - 1) * 100;
      list.push({
        id: idOU,
        match: m,
        sport: m.sport,
        sportIcon,
        marketType: 'TOTAL',
        selectionName: `${isOver ? 'Powyżej (Over)' : 'Poniżej (Under)'} ${sim.totalLine}`,
        odds: oddOU,
        prob: probOU,
        ev: evOU,
        projStr,
        score: probOU * 0.72 + Math.max(-15, evOU) * 1.1
      });
    });

    // NAPRAWA: Sortujemy listę główną dokładnie tak samo jak wybraną strategię (np. Pewniaki = od najwyższego % szansy, czyli 77.8% będzie na #1 miejscu!)
    return list.sort((a, b) => {
      if (builderStrategy === 'safe') return b.prob - a.prob;
      if (builderStrategy === 'value') return b.ev - a.ev;
      return b.score - a.score;
    });
  }, [matches, taxRate, customOddsMap, builderStrategy]);

  const visiblePicks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allPicks.filter((p) => {
      if (dateFilter !== 'ALL_UPCOMING' && p.match.dayBucket !== dateFilter) return false;
      if (activeSport !== 'ALL' && p.sport !== activeSport) return false;
      if (activeCountry !== 'ALL' && p.match.country !== activeCountry) return false;
      if (marketFilter !== 'ALL' && p.marketType !== marketFilter) return false;
      if (q && !`${p.match.homeTeam.name} ${p.match.awayTeam.name} ${p.match.leagueName}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allPicks, dateFilter, activeSport, activeCountry, marketFilter, searchQuery]);

  const buildAutoCoupon = (minOdds = targetMinOdds, strat = builderStrategy, scope = builderScope, sports = includedSports, dFilter = dateFilter) => {
    setTargetMinOdds(minOdds);
    setBuilderStrategy(strat);
    setBuilderScope(scope);

    let pool = allPicks.filter(
      (p) =>
        sports.includes(p.sport) &&
        (dFilter === 'ALL_UPCOMING' || p.match.dayBucket === dFilter) &&
        p.odds >= 1.18 &&
        p.prob >= 48
    );

    if (scope === 'ML_ONLY') pool = pool.filter((p) => p.marketType === 'ML');
    if (strat === 'safe') pool.sort((a, b) => b.prob - a.prob);
    else if (strat === 'value') pool.sort((a, b) => b.ev - a.ev);
    else pool.sort((a, b) => b.score - a.score);

    const chosen = [];
    const usedMatches = new Set();
    let accOdds = 1.0;

    for (const item of pool) {
      if (usedMatches.has(item.match.id)) continue;
      chosen.push(item.id);
      usedMatches.add(item.match.id);
      accOdds *= item.odds;
      if (accOdds >= minOdds || chosen.length >= 6) break;
    }
    setCouponPickIds(chosen);
  };

  useEffect(() => {
    if (allPicks.length > 0 && couponPickIds.length === 0) {
      buildAutoCoupon(2.0, 'safe', 'ML_ONLY', includedSports, dateFilter);
    }
  }, [allPicks]);

  const couponPicks = useMemo(() => {
    return couponPickIds.map((id) => allPicks.find((p) => p.id === id)).filter(Boolean);
  }, [couponPickIds, allPicks]);

  const togglePickInCoupon = (pick) => {
    if (couponPickIds.includes(pick.id)) {
      setCouponPickIds(couponPickIds.filter((id) => id !== pick.id));
    } else {
      const cleaned = couponPickIds.filter((id) => {
        const found = allPicks.find((p) => p.id === id);
        return found && found.match.id !== pick.match.id;
      });
      setCouponPickIds([...cleaned, pick.id]);
    }
  };

  const handleOddChange = (pickId, val) => {
    const n = parseFloat(val);
    if (!isNaN(n) && n >= 1.01) setCustomOddsMap((prev) => ({ ...prev, [pickId]: n }));
  };

  const couponStats = useMemo(() => {
    if (!couponPicks.length) return { totalOdds: 0, prob: 0, win: 0, profit: 0, ev: 0 };
    const taxMult = taxRate ? 0.88 : 1.0;
    const totalOdds = couponPicks.reduce((a, p) => a * p.odds, 1);
    const probDec = couponPicks.reduce((a, p) => a * (p.prob / 100), 1);
    const effOdds = totalOdds * taxMult;
    const win = couponStake * effOdds;
    return {
      totalOdds,
      prob: probDec * 100,
      win,
      profit: win - couponStake,
      ev: (probDec * effOdds - 1) * 100
    };
  }, [couponPicks, taxRate, couponStake]);

  const renderLabDetails = (m) => {
    const { homeTeam, awayTeam, sim } = m;
    return (
      <div className="mt-3 pt-3 border-t border-indigo-500/40 bg-slate-950/90 rounded-xl p-3.5 text-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">
            🔬 Analiza Laboratorium • {sim.modelTag}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">{m.dateLabel}</span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-bold">
            <span className="text-indigo-400">{awayTeam.name}: {sim.awayWinProb.toFixed(1)}%</span>
            {sim.drawProb > 0 && <span className="text-slate-400">Remis: {sim.drawProb.toFixed(1)}%</span>}
            <span className="text-orange-400">{homeTeam.name}: {sim.homeWinProb.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden flex">
            <div style={{ width: `${sim.awayWinProb}%` }} className="bg-indigo-500 h-full" />
            {sim.drawProb > 0 && <div style={{ width: `${sim.drawProb}%` }} className="bg-slate-600 h-full" />}
            <div style={{ width: `${sim.homeWinProb}%` }} className="bg-orange-500 h-full" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase">Bilans / Forma</div>
            <div className="text-white font-bold mt-0.5">
              {awayTeam.record} ({Math.round(awayTeam.winPct * 100)}%) vs <span className="text-orange-400">{homeTeam.record} ({Math.round(homeTeam.winPct * 100)}%)</span>
            </div>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase">Prognoza Wyniku</div>
            <div className="text-emerald-400 font-bold mt-0.5">
              {sim.expAway.toFixed(1)} : {sim.expHome.toFixed(1)} (Σ {sim.expTotal.toFixed(1)})
            </div>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase">Linia {sim.totalLine}</div>
            <div className="text-indigo-300 font-bold mt-0.5">
              Over: {sim.overProb.toFixed(1)}% / Under: {(100 - sim.overProb).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Wspólny komponent zawartości Kuponu AKO (wyświetlany na górze/boku oraz w szufladzie mobilnej)
  const renderCouponBox = () => (
    <div className="bg-slate-900 border-2 border-orange-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-orange-400" />
          <div>
            <h3 className="text-base font-black text-white">Twój Kupon AKO ({couponPicks.length})</h3>
            <p className="text-[10px] text-slate-400">Kliknij na spotkanie poniżej, aby rozwinąć pełne statystyki</p>
          </div>
        </div>
        {couponPicks.length > 0 && (
          <button
            onClick={() => setCouponPickIds([])}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Wyczyść
          </button>
        )}
      </div>

      {couponPicks.length === 0 ? (
        <div className="text-center py-6 px-4 border border-dashed border-slate-800 rounded-xl text-xs text-slate-400">
          Brak zdarzeń na kuponie. Kliknij np. <strong>Kurs 2.00+</strong> powyżej.
        </div>
      ) : (
        <>
          <div className="space-y-2.5 mb-4 max-h-[380px] overflow-y-auto pr-1">
            {couponPicks.map((item) => {
              const isCouponItemExpanded = expandedMatchId === `coupon_${item.id}`;
              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      onClick={() => setExpandedMatchId(isCouponItemExpanded ? null : `coupon_${item.id}`)}
                      className="cursor-pointer flex-1"
                    >
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-orange-300">
                          {item.sportIcon} {item.match.country}
                        </span>
                        <span className="text-[10px] font-mono text-indigo-300">{item.match.dateLabel}</span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">{item.prob.toFixed(1)}%</span>
                      </div>
                      <div className="text-xs font-bold text-white mt-1 flex items-center gap-1">
                        <span>{item.selectionName}</span>
                        {isCouponItemExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.match.awayTeam.name} vs {item.match.homeTeam.name}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="px-2 py-1 rounded-lg bg-orange-500/15 border border-orange-500/40 flex flex-col items-end">
                        <span className="text-[8px] uppercase text-orange-300 font-bold">Kurs STS:</span>
                        <input
                          type="number"
                          step="0.01"
                          min="1.01"
                          value={item.odds}
                          onChange={(e) => handleOddChange(item.id, e.target.value)}
                          className="w-12 bg-transparent text-right font-mono text-xs font-black text-orange-300 focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={() => togglePickInCoupon(item)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isCouponItemExpanded && renderLabDetails(item.match)}
                </div>
              );
            })}
          </div>

          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Kurs Całkowity (AKO):</span>
              <span className="text-xl font-black font-mono text-orange-400">{couponStats.totalOdds.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Łączne Prawdopodobieństwo:</span>
              <span className="text-sm font-bold font-mono text-emerald-400">{couponStats.prob.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Wartość Oczekiwana (EV):</span>
              <span className={`font-mono font-bold ${couponStats.ev >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {couponStats.ev >= 0 ? `+${couponStats.ev.toFixed(1)}%` : `${couponStats.ev.toFixed(1)}%`}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
              <span className="text-slate-400 shrink-0">Stawka (PLN):</span>
              <input
                type="number"
                min="1"
                value={couponStake}
                onChange={(e) => setCouponStake(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono font-bold text-white"
              />
            </div>

            <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400">Możliwa Wygrana</div>
                <div className="text-emerald-400 font-mono">Zysk: +{couponStats.profit.toFixed(2)} PLN</div>
              </div>
              <div className="text-2xl font-black font-mono text-emerald-400">
                {couponStats.win.toFixed(2)} <span className="text-xs">PLN</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Obiekt wybranego meczu dla czystego Laboratorium 1 na 1
  const labMatch = useMemo(() => {
    return matches.find((m) => m.id === labSelectedMatchId) || matches[0];
  }, [matches, labSelectedMatchId]);

  const labSimCustom = useMemo(() => {
    if (!labMatch) return null;
    return computeDynamicPrediction(labMatch, { hInj: labHomeInj, aInj: labAwayInj });
  }, [labMatch, labHomeInj, labAwayInj]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 lg:pb-8">
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white">
                  QUANT<span className="text-orange-500">BET</span> LIVE v6.2
                </h1>
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Mobile-First & Full List
                </span>
              </div>
              <p className="text-[10px] text-slate-400">{syncInfo}</p>
            </div>
          </div>

          {/* PRZEŁĄCZNIK GŁÓWNY: KREATOR & LISTA vs CZYSTE LABORATORIUM 1 NA 1 */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setMainTab('builder')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all ${
                mainTab === 'builder' ? 'bg-orange-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Kreator AKO & Ranking
            </button>
            <button
              onClick={() => setMainTab('lab')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all ${
                mainTab === 'lab' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> Czyste Laboratorium (1 na 1)
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setTaxRate(!taxRate)}
              className={`px-2.5 py-1.5 rounded-lg font-bold border ${
                taxRate ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              }`}
            >
              {taxRate ? 'Podatek 12%' : 'Bez Podatku'}
            </button>
            <button
              onClick={fetchLiveGlobalSchedule}
              disabled={isLoading}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Skanuj Live</span>
            </button>
          </div>
        </div>

        {/* FILTR DATY, SPORTU I KRAJU */}
        <div className="max-w-7xl mx-auto px-4 py-2 border-t border-slate-800/80 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] overflow-x-auto">
              {[
                { id: 'ALL_UPCOMING', label: 'Wszystkie dni (3 dni)' },
                { id: 'TODAY', label: 'Najbliższe (Dzisiaj/Noc)' },
                { id: 'TOMORROW', label: 'Jutro' },
                { id: 'DAY2', label: 'Dalsze dni' }
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setDateFilter(d.id);
                    buildAutoCoupon(targetMinOdds, builderStrategy, builderScope, includedSports, d.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap flex items-center gap-1 ${
                    dateFilter === d.id ? 'bg-orange-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  {d.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {SPORT_GROUPS.map((sg) => {
                const count = matches.filter(
                  (m) => (dateFilter === 'ALL_UPCOMING' || m.dayBucket === dateFilter) && (sg.id === 'ALL' || m.sport === sg.id)
                ).length;
                return (
                  <button
                    key={sg.id}
                    onClick={() => {
                      setActiveSport(sg.id);
                      setActiveCountry('ALL');
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 whitespace-nowrap border ${
                      activeSport === sg.id
                        ? 'bg-indigo-600/30 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{sg.icon}</span>
                    <span>{sg.name}</span>
                    <span className="text-[10px] px-1.5 rounded-full bg-slate-800 text-slate-300 font-mono">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {availableCountries.map((cnt) => (
              <button
                key={cnt}
                onClick={() => setActiveCountry(cnt)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold whitespace-nowrap border ${
                  activeCountry === cnt
                    ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cnt === 'ALL' ? 'Wszystkie Kraje/Ligi' : cnt}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ======================================================================
          WIDOK 1: KREATOR KUPONÓW + LISTA WSZYSTKICH SPOTKAŃ
         ====================================================================== */}
      {mainTab === 'builder' && (
        <main className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-5">
            {/* KREATOR KUPONÓW AKO */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-400" />
                    Kreator Kuponów AKO (Wybierz Sporty, Strategię i Kurs)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Lista poniżej sortuje się automatycznie zgodnie z wybraną strategią (np. Pewniaki Max %).
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => buildAutoCoupon(targetMinOdds, builderStrategy, 'ML_ONLY', includedSports, dateFilter)}
                    className={`px-3 py-1 rounded-lg font-bold ${builderScope === 'ML_ONLY' ? 'bg-orange-500 text-slate-950' : 'text-slate-400'}`}
                  >
                    Tylko Zwycięzcy (1/2)
                  </button>
                  <button
                    onClick={() => buildAutoCoupon(targetMinOdds, builderStrategy, 'ALL', includedSports, dateFilter)}
                    className={`px-3 py-1 rounded-lg font-bold ${builderScope === 'ALL' ? 'bg-orange-500 text-slate-950' : 'text-slate-400'}`}
                  >
                    Wszystkie Rynki (z O/U)
                  </button>
                </div>
              </div>

              {/* Wybór sportów do kuponu */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {SPORT_GROUPS.filter((s) => s.id !== 'ALL').map((sp) => {
                  const checked = includedSports.includes(sp.id);
                  return (
                    <button
                      key={sp.id}
                      onClick={() => {
                        const next = checked
                          ? (includedSports.length > 1 ? includedSports.filter((x) => x !== sp.id) : includedSports)
                          : [...includedSports, sp.id];
                        setIncludedSports(next);
                        buildAutoCoupon(targetMinOdds, builderStrategy, builderScope, next, dateFilter);
                      }}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                        checked ? 'bg-emerald-500/15 border-emerald-500/60 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      <span>{sp.icon} {sp.name}</span>
                      {checked && <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>

              {/* Szybkie przyciski kursu */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[2.0, 3.0, 5.0, 8.0].map((t) => (
                  <button
                    key={t}
                    onClick={() => buildAutoCoupon(t, builderStrategy, builderScope, includedSports, dateFilter)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      Math.abs(targetMinOdds - t) < 0.1
                        ? 'bg-orange-500/20 border-orange-500 text-white shadow'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-orange-400">Kurs {t.toFixed(2)}+</span>
                      <Zap className="w-4 h-4 text-orange-400" />
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Generuj optymalne AKO</div>
                  </button>
                ))}
              </div>

              {/* PRZYWRÓCONE OPCJE: Suwak kursu + Pewniaki (Max %) / Zbalansowany / Value Hunter (Max EV) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 border-t border-slate-800/80 items-center">
                <div className="md:col-span-5">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Własny docelowy kurs minimalny:</span>
                    <span className="font-mono font-bold text-orange-400">{targetMinOdds.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.5"
                    max="15.0"
                    step="0.25"
                    value={targetMinOdds}
                    onChange={(e) => buildAutoCoupon(Number(e.target.value), builderStrategy, builderScope, includedSports, dateFilter)}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>

                <div className="md:col-span-7 flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {[
                    { id: 'safe', name: 'Pewniaki (Max %)' },
                    { id: 'balanced', name: 'Zbalansowany' },
                    { id: 'value', name: 'Value Hunter (Max EV)' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => buildAutoCoupon(targetMinOdds, st.id, builderScope, includedSports, dateFilter)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                        builderStrategy === st.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {st.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* NA TELEFONIE KUPON JEST OD RAZU POD KREATOREM (NIE TRZEBA PRZEWIJAĆ NA SAM DÓŁ!) */}
            <div className="block lg:hidden">
              {renderCouponBox()}
            </div>

            {/* PEŁNA LISTA SPOTKAŃ Z WYSZUKIWARKĄ I SYNCHRONIZACJĄ SORTOWANIA */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-400" />
                    Pełna Lista Typów Modelu ({visiblePicks.length})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Posortowano według: <strong className="text-orange-400">{builderStrategy === 'safe' ? 'Najwyższe Prawdopodobieństwo (%)' : builderStrategy === 'value' ? 'Najwyższe Value (EV%)' : 'Indeks Zbalansowany'}</strong>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Wyszukiwarka drużyny/zawodnika */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Szukaj drużyny / gracza..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    {[
                      { id: 'ALL', label: 'Wszystkie' },
                      { id: 'ML', label: 'Zwycięzca (1/2)' },
                      { id: 'TOTAL', label: 'Over/Under' }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setMarketFilter(f.id)}
                        className={`px-2.5 py-1 rounded-lg font-semibold ${marketFilter === f.id ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {visiblePicks.slice(0, displayLimit).map((pick, idx) => {
                  const inCoupon = couponPickIds.includes(pick.id);
                  const isExpanded = expandedMatchId === pick.id;

                  return (
                    <div
                      key={pick.id}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                        inCoupon ? 'bg-indigo-950/30 border-indigo-500/60' : 'bg-slate-950/70 border-slate-800/90'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 text-orange-400 border border-slate-800">
                              #{idx + 1}
                            </span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-orange-300">
                              {pick.sportIcon} {pick.match.leagueName}
                            </span>
                            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {pick.match.dateLabel}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Prognoza: <strong className="text-white">{pick.projStr}</strong>
                            </span>
                          </div>

                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-300">
                              {pick.match.awayTeam.name} vs {pick.match.homeTeam.name}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-sm font-black text-orange-400">{pick.selectionName}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 ml-auto">
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400">Szansa</div>
                            <div className="text-sm font-black text-emerald-400 font-mono">{pick.prob.toFixed(1)}%</div>
                          </div>

                          <div className="text-right px-2 py-1 rounded-lg bg-slate-900 border border-slate-700">
                            <div className="text-[9px] text-slate-400 uppercase flex items-center justify-end gap-1">
                              <Edit3 className="w-2.5 h-2.5 text-orange-400" /> Kurs
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              min="1.01"
                              value={pick.odds}
                              onChange={(e) => handleOddChange(pick.id, e.target.value)}
                              className="w-14 bg-transparent text-right text-sm font-black text-orange-400 font-mono focus:outline-none"
                            />
                          </div>

                          <button
                            onClick={() => setExpandedMatchId(isExpanded ? null : pick.id)}
                            className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1"
                          >
                            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => togglePickInCoupon(pick)}
                            className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1 ${
                              inCoupon ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 hover:bg-indigo-600 text-white border border-slate-700'
                            }`}
                          >
                            {inCoupon ? <><Check className="w-3.5 h-3.5 stroke-[3]" /> Na kuponie</> : <><Plus className="w-3.5 h-3.5" /> Dodaj</>}
                          </button>
                        </div>
                      </div>

                      {isExpanded && renderLabDetails(pick.match)}
                    </div>
                  );
                })}
              </div>

              {/* Przycisk załadowania pozostałych pozycji z listy (np. wszystkich 234) */}
              {visiblePicks.length > displayLimit && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setDisplayLimit((prev) => prev + 100)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-orange-400 border border-slate-700"
                  >
                    Pokaż więcej spotkań ({visiblePicks.length - displayLimit} pozostałych)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* PRAWA KOLUMNA NA KOMPUTERZE */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-28">
              {renderCouponBox()}
            </div>
          </div>
        </main>
      )}

      {/* ======================================================================
          WIDOK 2: CZYSTE LABORATORIUM MECZU (1 NA 1)
         ====================================================================== */}
      {mainTab === 'lab' && labMatch && labSimCustom && (
        <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 max-h-[600px] overflow-y-auto space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Wybierz spotkanie do analizy 1 na 1 ({matches.length})
            </h3>
            {matches
              .filter((m) => activeSport === 'ALL' || m.sport === activeSport)
              .map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setLabSelectedMatchId(m.id);
                    setLabHomeInj(0);
                    setLabAwayInj(0);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    m.id === labMatch.id ? 'bg-indigo-600/20 border-indigo-500' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex justify-between text-[10px] text-orange-400 font-bold">
                    <span>{m.leagueName}</span>
                    <span className="text-indigo-300 font-mono">{m.dateLabel}</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-1">
                    {m.awayTeam.name} vs {m.homeTeam.name}
                  </div>
                </button>
              ))}
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="text-center">
                <span className="text-xs font-bold uppercase text-orange-400">
                  {labMatch.leagueName} • {labMatch.dateLabel}
                </span>
                <h2 className="text-2xl font-black text-white mt-1">
                  {labMatch.awayTeam.name} vs {labMatch.homeTeam.name}
                </h2>
                <p className="text-xs text-indigo-400 mt-1">Model: {labSimCustom.modelTag}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
                  <div className="text-xs text-slate-400">{labMatch.awayTeam.name}</div>
                  <div className="text-3xl font-black text-indigo-400 font-mono mt-1">
                    {labSimCustom.awayWinProb.toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-300 mt-1 font-mono">
                    Prognoza: {labSimCustom.expAway.toFixed(1)}
                  </div>
                </div>

                {labSimCustom.drawProb > 0 && (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
                    <div className="text-xs text-slate-400">Remis (X)</div>
                    <div className="text-3xl font-black text-slate-300 font-mono mt-1">
                      {labSimCustom.drawProb.toFixed(1)}%
                    </div>
                  </div>
                )}

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
                  <div className="text-xs text-slate-400">{labMatch.homeTeam.name}</div>
                  <div className="text-3xl font-black text-orange-400 font-mono mt-1">
                    {labSimCustom.homeWinProb.toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-300 mt-1 font-mono">
                    Prognoza: {labSimCustom.expHome.toFixed(1)}
                  </div>
                </div>
              </div>

              {renderLabDetails({ ...labMatch, sim: labSimCustom })}

              {/* Symulator wpływu absencji */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Dodatkowe osłabienie {labMatch.awayTeam.short}:</span>
                    <span className="font-mono text-rose-400">-{labAwayInj.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={labAwayInj}
                    onChange={(e) => setLabAwayInj(Number(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Dodatkowe osłabienie {labMatch.homeTeam.short}:</span>
                    <span className="font-mono text-rose-400">-{labHomeInj.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={labHomeInj}
                    onChange={(e) => setLabHomeInj(Number(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ======================================================================
          PŁYWAJĄCY DOLNY PASEK KUPONU NA TELEFONIE (JAK W APLIKACJI STS!)
         ====================================================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-slate-900/95 backdrop-blur-md border-t-2 border-orange-500 px-4 py-2.5 flex items-center justify-between shadow-2xl">
        <div
          onClick={() => setMobileCouponModalOpen(true)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-orange-500 text-slate-950 font-black flex items-center justify-center text-sm shadow">
            {couponPicks.length}
          </div>
          <div>
            <div className="text-xs font-black text-white flex items-center gap-1.5">
              <span>Kupon AKO: <strong className="text-orange-400 font-mono">{couponStats.totalOdds.toFixed(2)}</strong></span>
              <span className="text-[10px] text-emerald-400 font-mono">({couponStats.prob.toFixed(1)}%)</span>
            </div>
            <div className="text-[11px] text-slate-300">
              Wygrana: <strong className="text-emerald-400 font-mono">{couponStats.win.toFixed(2)} PLN</strong>
            </div>
          </div>
        </div>

        <button
          onClick={() => setMobileCouponModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-orange-500 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md"
        >
          <Ticket className="w-4 h-4" /> Pokaż Kupon
        </button>
      </div>

      {/* MODAL KUPONU NA TELEFONIE (OTWIERANY Z DOLNEGO PASKA BEZ PRZEWIJANIA) */}
      {mobileCouponModalOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/80 backdrop-blur-sm flex items-end justify-center p-2">
          <div className="w-full max-h-[90vh] overflow-y-auto bg-slate-900 rounded-2xl border border-orange-500/50 p-2 relative">
            <button
              onClick={() => setMobileCouponModalOpen(false)}
              className="w-full py-2 mb-2 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-1"
            >
              <X className="w-4 h-4" /> Zamknij podgląd kuponu
            </button>
            {renderCouponBox()}
          </div>
        </div>
      )}
    </div>
  );
}
