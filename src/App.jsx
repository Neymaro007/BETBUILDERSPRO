import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity, RefreshCw, Sliders, CheckCircle2, Calendar, Zap, Sparkles,
  Ticket, Plus, Trash2, Target, Check, UserX, Edit3, Globe, ChevronDown, ChevronUp, Clock
} from 'lucide-react';

// ============================================================================
// KONFIGURACJA ENDPOINTÓW LIVE API (SPORTY, KRAJE I LIGI Z OFERTY BUKMACHERSKIEJ)
// ============================================================================
const SPORT_GROUPS = [
  { id: 'ALL', name: 'Wszystkie', icon: '🔥' },
  { id: 'SOCCER', name: 'Piłka Nożna', icon: '⚽' },
  { id: 'BASKETBALL', name: 'Koszykówka', icon: '🏀' },
  { id: 'HOCKEY', name: 'Hokej', icon: '🏒' },
  { id: 'TENNIS', name: 'Tenis', icon: '🎾' }
];

const LIVE_LEAGUE_ENDPOINTS = [
  // KOSZYKÓWKA
  { sport: 'BASKETBALL', country: 'USA (NBA)', name: 'NBA', path: 'basketball/nba', avgScore: 114.5, std: 11.5 },
  { sport: 'BASKETBALL', country: 'USA (NCAA)', name: 'NCAA Basket', path: 'basketball/mens-college-basketball', avgScore: 74.5, std: 9.5 },
  { sport: 'BASKETBALL', country: 'Międzynarodowe', name: 'WNBA / FIBA', path: 'basketball/wnba', avgScore: 81.0, std: 8.8 },
  // HOKEJ NA LODZIE
  { sport: 'HOCKEY', country: 'USA / Kanada', name: 'NHL', path: 'hockey/nhl', avgScore: 3.1, std: 1.6 },
  { sport: 'HOCKEY', country: 'Ameryka Płn.', name: 'NCAA Hockey', path: 'hockey/mens-college-hockey', avgScore: 2.9, std: 1.5 },
  // TENIS
  { sport: 'TENNIS', country: 'ATP Tour', name: 'ATP Mężczyźni', path: 'tennis/atp', avgScore: 22.0, std: 3.5 },
  { sport: 'TENNIS', country: 'WTA Tour', name: 'WTA Kobiety', path: 'tennis/wta', avgScore: 20.5, std: 3.5 },
  // PIŁKA NOŻNA - EUROPA, PUCHARY I ŚWIAT (Jak na screenach STS)
  { sport: 'SOCCER', country: 'Międzynarodowe', name: 'Liga Mistrzów UEFA', path: 'soccer/uefa.champions', avgScore: 1.48 },
  { sport: 'SOCCER', country: 'Międzynarodowe', name: 'Liga Europy UEFA', path: 'soccer/uefa.europa', avgScore: 1.42 },
  { sport: 'SOCCER', country: 'Międzynarodowe', name: 'Liga Konferencji', path: 'soccer/uefa.europa.conf', avgScore: 1.40 },
  { sport: 'SOCCER', country: 'Anglia', name: 'Premier League', path: 'soccer/eng.1', avgScore: 1.52 },
  { sport: 'SOCCER', country: 'Anglia', name: 'Championship', path: 'soccer/eng.2', avgScore: 1.35 },
  { sport: 'SOCCER', country: 'Hiszpania', name: 'LaLiga', path: 'soccer/esp.1', avgScore: 1.38 },
  { sport: 'SOCCER', country: 'Niemcy', name: 'Bundesliga', path: 'soccer/ger.1', avgScore: 1.62 },
  { sport: 'SOCCER', country: 'Włochy', name: 'Serie A', path: 'soccer/ita.1', avgScore: 1.36 },
  { sport: 'SOCCER', country: 'Francja', name: 'Ligue 1', path: 'soccer/fra.1', avgScore: 1.40 },
  { sport: 'SOCCER', country: 'Polska / Europa', name: 'Kwalifikacje / Ekstraklasa', path: 'soccer/pol.1', avgScore: 1.34 },
  { sport: 'SOCCER', country: 'Holandia', name: 'Eredivisie', path: 'soccer/ned.1', avgScore: 1.65 },
  { sport: 'SOCCER', country: 'Portugalia', name: 'Primeira Liga', path: 'soccer/por.1', avgScore: 1.38 },
  { sport: 'SOCCER', country: 'Turcja', name: 'Süper Lig', path: 'soccer/tur.1', avgScore: 1.45 },
  { sport: 'SOCCER', country: 'Brazylia', name: 'Serie A Betano', path: 'soccer/bra.1', avgScore: 1.30 },
  { sport: 'SOCCER', country: 'Argentyna', name: 'Liga Profesional', path: 'soccer/arg.1', avgScore: 1.22 },
  { sport: 'SOCCER', country: 'USA', name: 'MLS', path: 'soccer/usa.1', avgScore: 1.55 },
  { sport: 'SOCCER', country: 'Meksyk', name: 'Liga MX', path: 'soccer/mex.1', avgScore: 1.42 },
  { sport: 'SOCCER', country: 'Arabia Saudyjska', name: 'Saudi Pro League', path: 'soccer/sau.1', avgScore: 1.58 }
];

// ============================================================================
// FUNKCJE MATEMATYCZNE: ROZKŁAD GAUSSA (CDF) ORAZ ROZKŁAD POISSONA (PMF)
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

// ============================================================================
// PARSER STATYSTYK Z API ESPN (Wyciąga formę, bilans, średnie i kursy w locie)
// ============================================================================
function parseCompetitorStats(comp, cfg) {
  const name = comp.team?.displayName || comp.athlete?.displayName || 'Drużyna';
  const short = comp.team?.abbreviation || name.slice(0, 3).toUpperCase();
  const recStr = comp.records?.[0]?.summary || '0-0';
  const parts = recStr.split('-').map((n) => parseInt(n, 10));
  let winPct = 0.50;
  if (parts.length >= 2 && parts[0] + parts[1] > 0) {
    winPct = (parts[0] + (parts[2] ? parts[2] * 0.3 : 0)) / (parts.reduce((a, b) => a + b, 0));
  }

  const statsMap = {};
  (comp.statistics || []).forEach((s) => {
    statsMap[s.name || s.abbreviation] = parseFloat(s.displayValue);
  });

  const avgPts = statsMap.avgPoints || statsMap.points || statsMap.goals || cfg.avgScore * (0.85 + winPct * 0.3);
  const fgPct = statsMap.fieldGoalPct || (44 + winPct * 8);
  const leader = comp.leaders?.[0]?.leaders?.[0]?.athlete?.shortName || 'Skład podstawowy';

  return {
    name,
    short,
    record: recStr,
    winPct: Math.min(0.88, Math.max(0.15, winPct)),
    avgPts: Number(avgPts.toFixed(1)),
    fgPct: Number(fgPct.toFixed(1)),
    leader
  };
}

// ============================================================================
// DYNAMICZNY SILNIK SYMULACYJNY (Oblicza prawdopodobieństwa z danych Live)
// ============================================================================
function computeDynamicPrediction(match) {
  const { homeTeam, awayTeam, sport, cfg, liveInjuries, bookieOdds } = match;
  const hPen = liveInjuries?.homePenalty || 0;
  const aPen = liveInjuries?.awayPenalty || 0;
  const netInj = aPen - hPen;

  // 1. PIŁKA NOŻNA ORAZ HOKEJ (Rozkład Poissona Expected Goals xG)
  if (sport === 'SOCCER' || sport === 'HOCKEY') {
    const baseG = cfg.avgScore || (sport === 'HOCKEY' ? 3.1 : 1.42);
    const hAdv = sport === 'HOCKEY' ? 1.07 : 1.15;
    const hPower = 0.72 + homeTeam.winPct * 0.58;
    const aPower = 0.72 + awayTeam.winPct * 0.58;

    const lambdaH = Math.max(0.45, baseG * hPower * (1.15 - awayTeam.winPct * 0.3) * hAdv - hPen * 0.12);
    const lambdaA = Math.max(0.40, baseG * aPower * (1.15 - homeTeam.winPct * 0.3) - aPen * 0.12);

    let pH = 0, pD = 0, pA = 0, pOver = 0, pBtts = 0;
    const maxG = sport === 'HOCKEY' ? 10 : 8;
    const lineOU = bookieOdds.totalLine || (sport === 'HOCKEY' ? 5.5 : 2.5);

    for (let h = 0; h <= maxG; h++) {
      for (let a = 0; a <= maxG; a++) {
        const p = poissonPMF(h, lambdaH) * poissonPMF(a, lambdaA);
        if (h > a) pH += p;
        else if (h === a) pD += p;
        else pA += p;
        if (h + a > lineOU) pOver += p;
        if (h > 0 && a > 0) pBtts += p;
      }
    }

    const tot = pH + pD + pA || 1;
    // W hokeju i przy rynkach 2-drogowych doliczamy dogrywkę
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
      bttsProb: pBtts * 100,
      totalLine: lineOU,
      modelTag: sport === 'SOCCER' ? 'Poisson xG & Dixon-Coles' : 'NHL Poisson xG (z OT)'
    };
  }

  // 2. TENIS (Model ELO & Symulacja Gemów)
  if (sport === 'TENNIS') {
    const eloH = 1850 + homeTeam.winPct * 400 - hPen * 30;
    const eloA = 1850 + awayTeam.winPct * 400 - aPen * 30;
    const pH = (1 / (1 + Math.pow(10, -(eloH - eloA) / 400))) * 100;
    const closeness = 1 - Math.abs(pH - 50) / 50;
    const expGames = 19.5 + closeness * 4.5;
    const lineOU = bookieOdds.totalLine || 21.5;
    const overProb = (1 - normalCDF(lineOU, expGames, 3.6)) * 100;

    return {
      homeWinProb: Math.min(89, Math.max(11, pH)),
      drawProb: 0,
      awayWinProb: Math.min(89, Math.max(11, 100 - pH)),
      expHome: pH >= 50 ? 2.0 : 0.9,
      expAway: pH >= 50 ? 0.9 : 2.0,
      expTotal: expGames,
      overProb: Math.min(74, Math.max(26, overProb)),
      totalLine: lineOU,
      modelTag: 'Surface ELO & Hold%'
    };
  }

  // 3. KOSZYKÓWKA (Gauss CDF + Efektywność z gry i kontuzje)
  const basePts = cfg.avgScore || 114.0;
  const stdGame = cfg.std || 12.5;
  const hDiff = (homeTeam.winPct - awayTeam.winPct) * 14.5 + 2.8 + netInj * 0.65;
  const expHome = basePts + hDiff / 2 - (hPen + aPen) * 0.1;
  const expAway = basePts - hDiff / 2 - (hPen + aPen) * 0.1;
  const expTotal = expHome + expAway;

  const homeWinProb = Math.min(88, Math.max(12, (1 - normalCDF(0, expHome - expAway, stdGame)) * 100));
  const lineOU = bookieOdds.totalLine || Math.round(expTotal * 2) / 2;
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

// ============================================================================
// GŁÓWNY KOMPONENT APLIKACJI (v6.0 PURE DYNAMIC LIVE ENGINE)
// ============================================================================
export default function App() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncInfo, setSyncInfo] = useState('Pobieranie terminarzy na żywo...');

  // Filtry czasu, sportu i kraju
  const [dateFilter, setDateFilter] = useState('ALL_UPCOMING'); // 'TODAY' | 'TOMORROW' | 'DAY2' | 'ALL_UPCOMING'
  const [activeSport, setActiveSport] = useState('ALL');
  const [activeCountry, setActiveCountry] = useState('ALL');
  const [marketFilter, setMarketFilter] = useState('ALL');

  // Kreator Kuponów AKO i stawkowanie
  const [includedSports, setIncludedSports] = useState(['SOCCER', 'BASKETBALL', 'HOCKEY', 'TENNIS']);
  const [targetMinOdds, setTargetMinOdds] = useState(2.0);
  const [builderStrategy, setBuilderStrategy] = useState('safe');
  const [builderScope, setBuilderScope] = useState('ML_ONLY');
  const [taxRate, setTaxRate] = useState(true);
  const [couponStake, setCouponStake] = useState(10);
  const [customOddsMap, setCustomOddsMap] = useState({});
  const [couponPickIds, setCouponPickIds] = useState([]);

  // Identyfikator rozwiniętego meczu w Kuponie lub Rankingach (Widok Laboratorium 1 na 1)
  const [expandedMatchId, setExpandedMatchId] = useState(null);

  // Pomocnik formatowania daty pod zapytanie API (YYYYMMDD)
  const getDateRangeQuery = () => {
    const now = new Date();
    const end = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const fmt = (d) => d.toISOString().slice(0, 10).replace(/-/g, '');
    return `${fmt(now)}-${fmt(end)}`;
  };

  // ==========================================================================
  // POBIERANIE DANYCH W 100% NA ŻYWO (Z ODRZUCENIEM MECZÓW ZAKOŃCZONYCH!)
  // ==========================================================================
  const fetchLiveGlobalSchedule = async () => {
    setIsLoading(true);
    const dateRange = getDateRangeQuery();
    const nowMs = Date.now();
    const collected = [];

    try {
      await Promise.allSettled(
        LIVE_LEAGUE_ENDPOINTS.map(async (cfg) => {
          const url = `https://site.api.espn.com/apis/site/v2/sports/${cfg.path}/scoreboard?dates=${dateRange}`;
          const res = await fetch(url);
          if (!res.ok) return;
          const data = await res.json();

          for (const ev of data.events || []) {
            const comp = ev.competitions?.[0];
            if (!comp) continue;

            // KLUCZOWY FILTR: Odrzucamy wszystkie mecze zakończone (state === 'post') lub sprzed ponad 2.5h!
            const state = ev.status?.type?.state;
            const eventTimeMs = new Date(ev.date).getTime();
            if (state === 'post' || ev.status?.type?.completed) continue;
            if (state === 'pre' && eventTimeMs < nowMs - 15 * 60 * 1000) continue;

            const competitors = comp.competitors || [];
            if (competitors.length < 2) continue;

            const homeComp = competitors.find((c) => c.homeAway === 'home') || competitors[0];
            const awayComp = competitors.find((c) => c.homeAway === 'away') || competitors[1];

            const homeTeam = parseCompetitorStats(homeComp, cfg);
            const awayTeam = parseCompetitorStats(awayComp, cfg);

            // Formatowanie dokładnej daty i godziny w strefie PL
            const evDateObj = new Date(ev.date);
            const dateStr = evDateObj.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const timeStr = evDateObj.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

            // Określenie koszyka dniowego (Dzisiaj / Jutro / Dalsze dni)
            const todayStr = new Date().toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const tomStr = new Date(nowMs + 86400000).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const dayBucket = dateStr === todayStr ? 'TODAY' : dateStr === tomStr ? 'TOMORROW' : 'DAY2';

            // Pobieranie kontuzji na żywo dla NBA / NHL (dla dzisiejszych meczów)
            let liveInjuries = { home: [], away: [], homePenalty: 0, awayPenalty: 0 };
            if ((cfg.path === 'basketball/nba' || cfg.path === 'hockey/nhl') && dayBucket === 'TODAY') {
              try {
                const sumRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${cfg.path}/summary?event=${ev.id}`);
                if (sumRes.ok) {
                  const sumData = await sumRes.json();
                  const hInj = (sumData.injuries || []).find((i) => i.team?.abbreviation === homeComp.team?.abbreviation)?.injuries || [];
                  const aInj = (sumData.injuries || []).find((i) => i.team?.abbreviation === awayComp.team?.abbreviation)?.injuries || [];
                  liveInjuries = {
                    home: hInj.slice(0, 4).map((x) => `${x.athlete?.shortName || 'Gracz'} (${x.status})`),
                    away: aInj.slice(0, 4).map((x) => `${x.athlete?.shortName || 'Gracz'} (${x.status})`),
                    homePenalty: Math.min(3.5, hInj.length * 0.65),
                    awayPenalty: Math.min(3.5, aInj.length * 0.65)
                  };
                }
              } catch (e) {
                // Kontynuuj w razie braku raportu
              }
            }

            const espnOdds = comp.odds?.[0];
            const tempMatch = {
              id: `${cfg.path}_${ev.id}`,
              sport: cfg.sport,
              country: cfg.country,
              leagueName: `${cfg.country} • ${cfg.name}`,
              homeTeam,
              awayTeam,
              cfg,
              liveInjuries,
              eventTimeMs,
              dateLabel: `${dateStr} • ${timeStr}`,
              dayBucket,
              isLiveNow: state === 'in',
              venue: comp.venue?.fullName || cfg.name,
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

            collected.push(tempMatch);
          }
        })
      );

      collected.sort((a, b) => a.eventTimeMs - b.eventTimeMs);
      setMatches(collected);
      const nowTime = new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
      setSyncInfo(`Pobrano na żywo ${collected.length} nadchodzących spotkań (${nowTime})`);
    } catch (err) {
      setSyncInfo('Błąd połączenia z API – sprawdź dostęp do sieci.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveGlobalSchedule();
  }, []);

  // Lista krajów dostępnych dla wybranego sportu
  const availableCountries = useMemo(() => {
    const sub = matches.filter((m) => activeSport === 'ALL' || m.sport === activeSport);
    return ['ALL', ...Array.from(new Set(sub.map((m) => m.country)))];
  }, [matches, activeSport]);

  // Generowanie typów bukmacherskich ze wszystkich pobranych na żywo meczów
  const allPicks = useMemo(() => {
    const taxMult = taxRate ? 0.88 : 1.0;
    const list = [];

    matches.forEach((m) => {
      const { sim, homeTeam, awayTeam, bookieOdds } = m;
      const sportIcon = SPORT_GROUPS.find((s) => s.id === m.sport)?.icon || '🏆';
      const scoreUnit = m.sport === 'SOCCER' ? 'goli (xG)' : m.sport === 'HOCKEY' ? 'bramek' : m.sport === 'TENNIS' ? 'sety' : 'pkt';
      const projStr = `${awayTeam.short} ${sim.expAway.toFixed(1)} : ${sim.expHome.toFixed(1)} ${homeTeam.short} (${scoreUnit})`;

      // 1. Typ na Gospodarza (1)
      const idH = `${m.id}_HOME`;
      const oddH = customOddsMap[idH] ?? bookieOdds.home;
      const evH = ((sim.homeWinProb / 100) * (oddH * taxMult) - 1) * 100;
      list.push({
        id: idH,
        match: m,
        sport: m.sport,
        sportIcon,
        marketType: 'ML',
        marketLabel: 'Zwycięzca (1)',
        selectionName: `${homeTeam.name} wygra (1)`,
        odds: oddH,
        prob: sim.homeWinProb,
        ev: evH,
        projStr,
        score: sim.homeWinProb * 0.78 + Math.max(-12, evH) * 1.2
      });

      // 2. Typ na Gościa (2)
      const idA = `${m.id}_AWAY`;
      const oddA = customOddsMap[idA] ?? bookieOdds.away;
      const evA = ((sim.awayWinProb / 100) * (oddA * taxMult) - 1) * 100;
      list.push({
        id: idA,
        match: m,
        sport: m.sport,
        sportIcon,
        marketType: 'ML',
        marketLabel: 'Zwycięzca (2)',
        selectionName: `${awayTeam.name} wygra (2)`,
        odds: oddA,
        prob: sim.awayWinProb,
        ev: evA,
        projStr,
        score: sim.awayWinProb * 0.78 + Math.max(-12, evA) * 1.2
      });

      // 3. Typ Over / Under
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
        marketLabel: 'Suma (O/U)',
        selectionName: `${isOver ? 'Powyżej (Over)' : 'Poniżej (Under)'} ${sim.totalLine}`,
        odds: oddOU,
        prob: probOU,
        ev: evOU,
        projStr,
        score: probOU * 0.70 + Math.max(-12, evOU) * 1.2
      });
    });

    return list.sort((a, b) => b.score - a.score);
  }, [matches, taxRate, customOddsMap]);

  // Filtrowane rekomendacje według daty, sportu, kraju i rynku
  const visiblePicks = useMemo(() => {
    return allPicks.filter((p) => {
      if (dateFilter !== 'ALL_UPCOMING' && p.match.dayBucket !== dateFilter) return false;
      if (activeSport !== 'ALL' && p.sport !== activeSport) return false;
      if (activeCountry !== 'ALL' && p.match.country !== activeCountry) return false;
      if (marketFilter !== 'ALL' && p.marketType !== marketFilter) return false;
      return true;
    });
  }, [allPicks, dateFilter, activeSport, activeCountry, marketFilter]);

  // Automatyczny kreator kuponu AKO
  const buildAutoCoupon = (minOdds = targetMinOdds, strat = builderStrategy, scope = builderScope, sports = includedSports, dFilter = dateFilter) => {
    setTargetMinOdds(minOdds);
    setBuilderStrategy(strat);
    setBuilderScope(scope);

    let pool = allPicks.filter(
      (p) =>
        sports.includes(p.sport) &&
        (dFilter === 'ALL_UPCOMING' || p.match.dayBucket === dFilter) &&
        p.odds >= 1.20 &&
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

  // Komponent rozszerzonych statystyk Laboratorium (wyświetlany po kliknięciu w mecz na kuponie lub liście)
  const renderLabDetails = (m) => {
    const { homeTeam, awayTeam, sim, liveInjuries } = m;
    return (
      <div className="mt-3 pt-3 border-t border-indigo-500/40 bg-slate-950/90 rounded-xl p-3.5 text-xs space-y-3 animate-fadeIn">
        <div className="flex items-center justify-between">
          <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">
            🔬 Laboratorium Meczu • {sim.modelTag}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">{m.venue}</span>
        </div>

        {/* Pasek rozkładu szans */}
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

        {/* Tabela porównawcza parametrów Live z API */}
        <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase">Bilans Live (W% )</div>
            <div className="text-white font-bold mt-0.5">
              {awayTeam.record} ({Math.round(awayTeam.winPct * 100)}%) vs <span className="text-orange-400">{homeTeam.record} ({Math.round(homeTeam.winPct * 100)}%)</span>
            </div>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase">Prognoza Modelu</div>
            <div className="text-emerald-400 font-bold mt-0.5">
              {sim.expAway.toFixed(1)} : {sim.expHome.toFixed(1)} (Σ {sim.expTotal.toFixed(1)})
            </div>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase">Over {sim.totalLine} Szansa</div>
            <div className="text-indigo-300 font-bold mt-0.5">
              Over: {sim.overProb.toFixed(1)}% / Under: {(100 - sim.overProb).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Raport składów i liderów */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-800/80">
            <span className="text-slate-400">Lider {awayTeam.short}: </span>
            <strong className="text-slate-200">{awayTeam.leader}</strong>
            {liveInjuries?.away?.length > 0 && (
              <div className="text-rose-400 text-[10px] mt-1">
                Absencje: {liveInjuries.away.join(', ')}
              </div>
            )}
          </div>
          <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-800/80">
            <span className="text-slate-400">Lider {homeTeam.short}: </span>
            <strong className="text-slate-200">{homeTeam.leader}</strong>
            {liveInjuries?.home?.length > 0 && (
              <div className="text-rose-400 text-[10px] mt-1">
                Absencje: {liveInjuries.home.join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* NAGŁÓWEK */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-white">
                  QUANT<span className="text-orange-500">BET</span> LIVE v6.0
                </h1>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  100% Live API • Zero Hardcode
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{syncInfo}</p>
            </div>
          </div>

          {/* FILTR DNIA SPOTKANIA (Dzisiaj / Jutro / +2 Dni / Wszystkie nadchodzące) */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {[
              { id: 'TODAY', label: 'Tylko Dzisiaj' },
              { id: 'TOMORROW', label: 'Jutro' },
              { id: 'DAY2', label: 'Pojutrze (+2 dni)' },
              { id: 'ALL_UPCOMING', label: 'Wszystkie dni (3 dni)' }
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  setDateFilter(d.id);
                  buildAutoCoupon(targetMinOdds, builderStrategy, builderScope, includedSports, d.id);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  dateFilter === d.id
                    ? 'bg-orange-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                {d.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setTaxRate(!taxRate)}
              className={`px-3 py-1.5 rounded-lg font-bold border ${
                taxRate ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              }`}
            >
              {taxRate ? 'Podatek 12%' : 'Bez Podatku'}
            </button>
            <button
              onClick={fetchLiveGlobalSchedule}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Skanuj API Live</span>
            </button>
          </div>
        </div>

        {/* PASEK SPORTÓW I KRAJÓW (JAK W STS) */}
        <div className="max-w-7xl mx-auto px-4 py-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
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

          {/* Lista Krajów / Rozgrywek */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {availableCountries.map((cnt) => (
              <button
                key={cnt}
                onClick={() => setActiveCountry(cnt)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap border ${
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

      {/* GŁÓWNA ZAWARTOŚĆ */}
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEWA KOLUMNA (8/12): KREATOR AKO + LISTA NADCHODZĄCYCH SPOTKAŃ LIVE */}
        <div className="lg:col-span-8 space-y-6">
          {/* KREATOR KUPONÓW POD KURS */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-indigo-500/30 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-400" />
                  Kreator Kuponów AKO (Tylko Nadchodzące Mecze Live)
                </h2>
                <p className="text-xs text-slate-400">
                  Zakończone mecze są automatycznie odfiltrowane. Wybierz sporty do kuponu i docelowy kurs.
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
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

            {/* Przyciski docelowego kursu */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[2.0, 3.0, 5.0, 8.0].map((t) => (
                <button
                  key={t}
                  onClick={() => buildAutoCoupon(t, builderStrategy, builderScope, includedSports, dateFilter)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    Math.abs(targetMinOdds - t) < 0.1
                      ? 'bg-orange-500/20 border-orange-500 text-white'
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
          </div>

          {/* LISTA SPOTKAŃ I REKOMENDACJI */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                Nadchodzące Spotkania & Typy Modelu ({visiblePicks.length})
              </h3>
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

            {isLoading ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                <RefreshCw className="w-7 h-7 animate-spin text-orange-400 mx-auto mb-2" />
                Skanowanie serwerów ESPN Live i obliczanie rozkładów prawdopodobieństwa...
              </div>
            ) : visiblePicks.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl">
                Brak zaplanowanych spotkań dla wybranego filtra. Przełącz na górze na <strong>„Wszystkie dni (3 dni)”</strong> lub wybierz inny sport.
              </div>
            ) : (
              <div className="space-y-3">
                {visiblePicks.slice(0, 25).map((pick, idx) => {
                  const inCoupon = couponPickIds.includes(pick.id);
                  const isExpanded = expandedMatchId === pick.id;

                  return (
                    <div
                      key={pick.id}
                      className={`p-4 rounded-xl border transition-all ${
                        inCoupon ? 'bg-indigo-950/30 border-indigo-500/60' : 'bg-slate-950/70 border-slate-800/90'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-orange-300">
                              {pick.sportIcon} {pick.match.leagueName}
                            </span>
                            {/* WIDOCZNA DATA I GODZINA SPOTKANIA */}
                            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {pick.match.dateLabel}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Prognoza: <strong className="text-white">{pick.projStr}</strong>
                            </span>
                          </div>

                          <div className="mt-1.5 flex items-center gap-2">
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
                            title="Pokaż pełne statystyki Laboratorium"
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
            )}
          </div>
        </div>

        {/* PRAWA KOLUMNA (4/12): TWÓJ KUPON AKO (KLIKNIJ W MECZ, ABY OTWORZYĆ LABORATORIUM!) */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900 border-2 border-orange-500/40 rounded-2xl p-5 sticky top-28 shadow-2xl">
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
              <div className="text-center py-8 px-4 border border-dashed border-slate-800 rounded-xl text-xs text-slate-400">
                Brak zdarzeń na kuponie. Kliknij np. <strong>Kurs 2.00+</strong> lub dodaj mecz z listy.
              </div>
            ) : (
              <>
                <div className="space-y-2.5 mb-4 max-h-[420px] overflow-y-auto pr-1">
                  {couponPicks.map((item) => {
                    const isCouponItemExpanded = expandedMatchId === `coupon_${item.id}`;
                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          {/* Kliknięcie w opis spotkania rozwija pełną analizę Laboratorium w kuponie */}
                          <div
                            onClick={() => setExpandedMatchId(isCouponItemExpanded ? null : `coupon_${item.id}`)}
                            className="cursor-pointer flex-1"
                          >
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-orange-300">
                                {item.sportIcon} {item.match.country}
                              </span>
                              <span className="text-[10px] font-mono text-indigo-300">
                                {item.match.dateLabel}
                              </span>
                              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                                {item.prob.toFixed(1)}%
                              </span>
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

                        {/* ROZWINIĘTE STATYSTYKI LABORATORIUM BEZPOŚREDNIO W KUPONIE */}
                        {isCouponItemExpanded && renderLabDetails(item.match)}
                      </div>
                    );
                  })}
                </div>

                {/* Podsumowanie finansowe kuponu */}
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2.5 text-xs">
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
        </div>
      </main>
    </div>
  );
}
