import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity, RefreshCw, Sliders, Calendar, Zap, Sparkles,
  Ticket, Plus, Trash2, Target, Check, Edit3, Globe,
  ChevronDown, ChevronUp, Clock, Search, X, Stethoscope, AlertTriangle, ShieldCheck, Award
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

const MARKET_SCOPES = [
  { id: 'ML', label: '🏆 Zwycięzcy / DNB' },
  { id: 'TOTAL', label: '📊 Drabinka Punktów/Goli' },
  { id: 'HANDICAP', label: '⚖️ Drabinka Handicapów' },
  { id: 'SPECIALS', label: '🎯 1X/X2, BTTS, Sety, Różnica' },
  { id: 'ALL', label: '🔥 Wszystkie Rynki (Mix)' }
];

const LINE_RISK_PROFILES = [
  { id: 'SAFE_LADDER', label: 'Bezpieczne linie (64%–84% | Kurs ~1.15–1.48)', minProb: 64, maxProb: 85 },
  { id: 'MAIN_LADDER', label: 'Linie środkowe (50%–64% | Kurs ~1.50–1.95)', minProb: 50, maxProb: 64 },
  { id: 'HIGH_ODDS_LADDER', label: 'Wysokie kursy (22%–50% | Kurs ~2.00–4.50)', minProb: 22, maxProb: 50 },
  { id: 'FULL_LADDER', label: 'Cała drabinka (Wszystkie linie od–do)', minProb: 18, maxProb: 86 }
];

const LIVE_LEAGUE_ENDPOINTS = [
  { sport: 'BASKETBALL', country: 'USA (NBA)', name: 'NBA', path: 'basketball/nba', avgScore: 114.5, std: 12.5, deepScan: true },
  { sport: 'BASKETBALL', country: 'USA (NCAA)', name: 'NCAA Basket', path: 'basketball/mens-college-basketball', avgScore: 74.5, std: 11.0, deepScan: false },
  { sport: 'HOCKEY', country: 'USA / Kanada', name: 'NHL', path: 'hockey/nhl', avgScore: 3.1, std: 1.6, deepScan: true },
  { sport: 'HOCKEY', country: 'Ameryka Płn.', name: 'NCAA Hockey', path: 'hockey/mens-college-hockey', avgScore: 2.9, std: 1.6, deepScan: false },
  { sport: 'TENNIS', country: 'ATP Tour', name: 'ATP Mężczyźni', path: 'tennis/atp', avgScore: 22.0, std: 3.6, deepScan: false },
  { sport: 'TENNIS', country: 'WTA Tour', name: 'WTA Kobiety', path: 'tennis/wta', avgScore: 20.0, std: 3.6, deepScan: false },
  { sport: 'VOLLEYBALL', country: 'Międzynarodowe / Liga', name: 'Siatkówka Liga', path: 'volleyball/mens-college-volleyball', avgScore: 181.5, std: 14.0, deepScan: false },
  { sport: 'SOCCER', country: 'Europa (LM)', name: 'Liga Mistrzów', path: 'soccer/uefa.champions', avgScore: 1.48, deepScan: true },
  { sport: 'SOCCER', country: 'Europa (LE)', name: 'Liga Europy', path: 'soccer/uefa.europa', avgScore: 1.42, deepScan: false },
  { sport: 'SOCCER', country: 'Anglia', name: 'Premier League', path: 'soccer/eng.1', avgScore: 1.52, deepScan: true },
  { sport: 'SOCCER', country: 'Anglia', name: 'Championship', path: 'soccer/eng.2', avgScore: 1.35, deepScan: false },
  { sport: 'SOCCER', country: 'Hiszpania', name: 'LaLiga', path: 'soccer/esp.1', avgScore: 1.38, deepScan: true },
  { sport: 'SOCCER', country: 'Niemcy', name: 'Bundesliga', path: 'soccer/ger.1', avgScore: 1.62, deepScan: true },
  { sport: 'SOCCER', country: 'Włochy', name: 'Serie A', path: 'soccer/ita.1', avgScore: 1.36, deepScan: true },
  { sport: 'SOCCER', country: 'Francja', name: 'Ligue 1', path: 'soccer/fra.1', avgScore: 1.40, deepScan: false },
  { sport: 'SOCCER', country: 'Polska', name: 'Ekstraklasa', path: 'soccer/pol.1', avgScore: 1.34, deepScan: true },
  { sport: 'SOCCER', country: 'Holandia', name: 'Eredivisie', path: 'soccer/ned.1', avgScore: 1.65, deepScan: false },
  { sport: 'SOCCER', country: 'Portugalia', name: 'Primeira Liga', path: 'soccer/por.1', avgScore: 1.38, deepScan: false },
  { sport: 'SOCCER', country: 'Turcja', name: 'Süper Lig', path: 'soccer/tur.1', avgScore: 1.45, deepScan: false },
  { sport: 'SOCCER', country: 'Brazylia', name: 'Serie A', path: 'soccer/bra.1', avgScore: 1.30, deepScan: false },
  { sport: 'SOCCER', country: 'Argentyna', name: 'Liga Profesional', path: 'soccer/arg.1', avgScore: 1.22, deepScan: false },
  { sport: 'SOCCER', country: 'USA', name: 'MLS', path: 'soccer/usa.1', avgScore: 1.55, deepScan: false },
  { sport: 'SOCCER', country: 'Arabia Saudyjska', name: 'Saudi Pro League', path: 'soccer/sau.1', avgScore: 1.58, deepScan: false }
];

const SUPERSTAR_LASTNAMES = new Set([
  'edwards', 'jokic', 'jokić', 'tatum', 'doncic', 'dončić', 'antetokounmpo', 'gilgeous-alexander',
  'embiid', 'brunson', 'durant', 'booker', 'curry', 'james', 'davis', 'mitchell', 'haliburton',
  'wembanyama', 'morant', 'sabonis', 'fox', 'banchero', 'cunningham', 'young', 'irving', 'lillard',
  'markkanen', 'avdija', 'simons', 'sharpe', 'sengun', 'mcdavid', 'mackinnon', 'matthews', 'kucherov',
  'draisaitl', 'makar', 'panarin', 'barkov', 'kaprizov', 'hughes', 'ball', 'miller', 'maxey'
]);

// ============================================================================
// FUNKCJE MATEMATYCZNE: GAUSS CDF, POISSON PMF, KONWERTER KURSÓW
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

function americanToDecimal(amOdds) {
  const n = parseFloat(amOdds);
  if (isNaN(n) || n === 0) return null;
  if (n > 0) return Number((1 + n / 100).toFixed(2));
  return Number((1 + 100 / Math.abs(n)).toFixed(2));
}

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

function probToFairBookieOdd(probPct, margin = 1.06) {
  const p = clamp(probPct, 5, 93) / 100;
  return Number(Math.max(1.07, (1 / p) / margin).toFixed(2));
}

// Kolorowanie procentów w zależności od wysokości prawdopodobieństwa
function getProbColorClass(prob) {
  if (prob >= 72) return 'text-emerald-400 font-black';
  if (prob >= 60) return 'text-teal-300 font-bold';
  if (prob >= 50) return 'text-amber-300 font-bold';
  return 'text-rose-400 font-semibold';
}

function getProbBadgeStyle(prob) {
  if (prob >= 72) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  if (prob >= 60) return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
  if (prob >= 50) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
}

function parseRecordString(recStr) {
  if (!recStr) return { wins: 0, losses: 0, ties: 0, games: 0, pct: null };
  const parts = recStr.split('-').map((n) => parseInt(n, 10));
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    const games = parts.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0);
    if (games > 0) {
      const wins = parts[0] + (parts[2] ? parts[2] * 0.35 : 0);
      return { wins: parts[0], losses: parts[1], ties: parts[2] || 0, games, pct: wins / games };
    }
  }
  return { wins: 0, losses: 0, ties: 0, games: 0, pct: null };
}

// ============================================================================
// PARSER TELEMETRII
// ============================================================================
function parseCompetitorStats(comp, cfg, isHome = true) {
  const name = comp.team?.displayName || comp.team?.name || comp.athlete?.displayName || 'Zespół';
  const short = comp.team?.abbreviation || name.slice(0, 3).toUpperCase();

  const recordsArr = comp.records || [];
  const totalRecObj = recordsArr.find((r) => r.type === 'total' || r.name === 'overall') || recordsArr[0];
  const homeRecObj = recordsArr.find((r) => r.type === 'home' || r.name === 'Home');
  const awayRecObj = recordsArr.find((r) => r.type === 'road' || r.name === 'Road' || r.type === 'away');

  const parsedTotal = parseRecordString(totalRecObj?.summary);
  const parsedSplit = isHome ? parseRecordString(homeRecObj?.summary) : parseRecordString(awayRecObj?.summary);

  const officialRank = comp.curatedRank?.current || comp.athlete?.Rank || null;
  const tennisRank = officialRank && officialRank > 0 && officialRank < 1000 ? Number(officialRank) : null;
  const hasVerifiedData = parsedTotal.games > 0 || tennisRank !== null;

  let rawWinPct = 0.50;
  if (parsedTotal.pct !== null) {
    rawWinPct = parsedTotal.pct;
  } else if (tennisRank !== null) {
    rawWinPct = clamp(0.80 - Math.log10(Math.max(1, tennisRank)) * 0.15, 0.28, 0.78);
  }

  const gamesPlayed = parsedTotal.games;
  const kPrior = cfg.sport === 'BASKETBALL' ? 26 : cfg.sport === 'HOCKEY' ? 18 : 12;
  const bayesianWinPct = gamesPlayed > 0
    ? (rawWinPct * gamesPlayed + 0.50 * kPrior) / (gamesPlayed + kPrior)
    : rawWinPct;

  const splitFactor = parsedSplit.pct !== null && parsedSplit.games >= 3
    ? clamp((parsedSplit.pct - rawWinPct) * 0.20, -0.05, 0.05)
    : 0;

  const statsMap = {};
  (comp.statistics || []).forEach((s) => {
    const key = (s.name || s.abbreviation || '').toLowerCase();
    statsMap[key] = parseFloat(s.displayValue);
  });

  let avgPtsFor = cfg.avgScore * (0.93 + (bayesianWinPct + splitFactor - 0.50) * 0.26);
  let avgPtsAgainst = cfg.avgScore * (1.07 - (bayesianWinPct + splitFactor - 0.50) * 0.26);

  if (cfg.sport === 'BASKETBALL') {
    const rawPpg = statsMap.avgpoints || statsMap.ppg;
    if (rawPpg && rawPpg > 55 && rawPpg < 135) avgPtsFor = rawPpg;
    avgPtsFor = clamp(avgPtsFor, cfg.avgScore * 0.88, cfg.avgScore * 1.12);
    avgPtsAgainst = clamp(avgPtsAgainst, cfg.avgScore * 0.88, cfg.avgScore * 1.12);
  } else if (cfg.sport === 'HOCKEY') {
    const rawGpg = statsMap.avggoals || (statsMap.goals && gamesPlayed > 0 ? statsMap.goals / gamesPlayed : null);
    if (rawGpg && rawGpg > 1.6 && rawGpg < 4.6) avgPtsFor = rawGpg;
    avgPtsFor = clamp(avgPtsFor, 2.25, 3.85);
    avgPtsAgainst = clamp(avgPtsAgainst, 2.25, 3.85);
  } else if (cfg.sport === 'SOCCER') {
    const rawGpg = statsMap.avggoals || (statsMap.goalsfor && gamesPlayed > 0 ? statsMap.goalsfor / gamesPlayed : null);
    if (rawGpg && rawGpg > 0.5 && rawGpg < 3.2) avgPtsFor = rawGpg;
    avgPtsFor = clamp(avgPtsFor, 0.85, 2.35);
    avgPtsAgainst = clamp(avgPtsAgainst, 0.80, 2.25);
  }

  const expGamma = cfg.sport === 'BASKETBALL' ? 10.5 : 2.0;
  const rawPyth = Math.pow(avgPtsFor, expGamma) / (Math.pow(avgPtsFor, expGamma) + Math.pow(avgPtsAgainst, expGamma));
  const pythagoreanWinPct = clamp(rawPyth, 0.32, 0.68);

  const fgPct = clamp(statsMap.fieldgoalpct || statsMap.fgp || (45.5 + (bayesianWinPct - 0.5) * 7), 40.0, 54.0);
  const threePct = clamp(statsMap.threepointfieldgoalpct || statsMap.threepointpct || (35.5 + (bayesianWinPct - 0.5) * 5), 30.0, 42.0);
  const efgPct = Number((fgPct + 0.5 * (threePct * 0.35)).toFixed(1));
  const rebounds = Number(clamp(statsMap.avgRebounds || statsMap.rebounds || (43.0 + (bayesianWinPct - 0.5) * 4), 38.0, 49.0).toFixed(1));
  const turnovers = Number(clamp(statsMap.avgTurnovers || statsMap.turnovers || (13.5 - (bayesianWinPct - 0.5) * 2), 10.5, 17.0).toFixed(1));

  const fourFactorsIndex = (efgPct - 52.0) * 0.30 + (rebounds - 43.0) * 0.12 - (turnovers - 13.5) * 0.20;
  const compositePower = clamp(
    bayesianWinPct * 0.55 + pythagoreanWinPct * 0.30 + (0.50 + splitFactor) * 0.15,
    0.34,
    0.66
  );

  const leaderObj = comp.leaders?.[0]?.leaders?.[0];
  const leaderName = leaderObj?.athlete?.displayName || leaderObj?.athlete?.shortName || comp.athlete?.displayName || 'Skład meczowy';
  const leaderStat = leaderObj?.displayValue || '';

  return {
    name,
    short,
    record: totalRecObj?.summary || (tennisRank ? `WTA/ATP #${tennisRank}` : 'Brak bilansu'),
    splitRecord: isHome
      ? (homeRecObj?.summary ? `Dom: ${homeRecObj.summary}` : `Siła: ${Math.round(compositePower * 100)}%`)
      : (awayRecObj?.summary ? `Wyjazd: ${awayRecObj.summary}` : `Siła: ${Math.round(compositePower * 100)}%`),
    tennisRank,
    hasVerifiedData,
    gamesPlayed,
    bayesianWinPct: Number(bayesianWinPct.toFixed(3)),
    pythagoreanWinPct: Number(pythagoreanWinPct.toFixed(3)),
    compositePower: Number(compositePower.toFixed(3)),
    avgPtsFor: Number(avgPtsFor.toFixed(2)),
    avgPtsAgainst: Number(avgPtsAgainst.toFixed(2)),
    efgPct,
    rebounds,
    turnovers,
    fourFactorsIndex: Number(fourFactorsIndex.toFixed(2)),
    leader: leaderStat ? `${leaderName} (${leaderStat})` : leaderName,
    leaderLastName: leaderName.split(' ').pop().toLowerCase()
  };
}

function evaluateLiveInjuries(injuriesArr, teamStats, sport) {
  if (!Array.isArray(injuriesArr) || injuriesArr.length === 0) {
    return { list: [], penalty: 0 };
  }

  const unitScale = sport === 'BASKETBALL' ? 1.0 : 0.12;
  let totalPenalty = 0;
  let benchAcc = 0;
  const parsed = [];

  injuriesArr.forEach((item) => {
    const player = item.athlete?.displayName || item.athlete?.shortName || 'Zawodnik';
    const last = player.split(' ').pop().toLowerCase();
    const statusRaw = (item.status || item.type?.description || 'Out').toUpperCase();
    const pos = item.athlete?.position?.abbreviation || '';

    const isStar = SUPERSTAR_LASTNAMES.has(last) || (teamStats.leaderLastName && last.length > 2 && teamStats.leaderLastName === last);
    const basePts = isStar ? 2.6 : 0.55;
    const roleTag = isStar ? 'GWIAZDA / LIDER' : (pos ? `Rotacja (${pos})` : 'Rotacja');

    let mult = 0;
    let statusShort = 'OUT';

    if (statusRaw.includes('OUT') || statusRaw.includes('INJURED') || statusRaw.includes('IR')) {
      mult = 1.0;
      statusShort = 'OUT';
    } else if (statusRaw.includes('DOUBTFUL')) {
      mult = 0.65;
      statusShort = 'DOUBTFUL';
    } else if (statusRaw.includes('QUESTIONABLE') || statusRaw.includes('DAY-TO-DAY') || statusRaw.includes('GTD')) {
      mult = 0.30;
      statusShort = 'GTD';
    }

    const rawImpact = basePts * mult;
    if (rawImpact > 0) {
      if (isStar) {
        totalPenalty += rawImpact;
      } else if (benchAcc < 1.4) {
        const add = Math.min(rawImpact, 1.4 - benchAcc);
        benchAcc += add;
        totalPenalty += add;
      }
      parsed.push({
        name: player,
        role: roleTag,
        status: statusShort,
        impact: Number((rawImpact * unitScale).toFixed(2))
      });
    }
  });

  const maxCap = sport === 'BASKETBALL' ? 4.5 : 0.45;
  return {
    list: parsed.slice(0, 5),
    penalty: Number(Math.min(maxCap, totalPenalty * unitScale).toFixed(2))
  };
}

function extractRealBookieOdds(comp, homeAbbr) {
  const oddsObj = comp.odds?.[0];
  if (!oddsObj) return { realHomeOdd: null, realAwayOdd: null, realDrawOdd: null, realSpreadHome: null, totalLine: null };

  const totalLine = oddsObj.overUnder ? Number(oddsObj.overUnder) : null;
  const mlHomeRaw = oddsObj.homeTeamOdds?.moneyLine ?? oddsObj.moneyline?.home?.close?.odds;
  const mlAwayRaw = oddsObj.awayTeamOdds?.moneyLine ?? oddsObj.moneyline?.away?.close?.odds;
  const mlDrawRaw = oddsObj.drawOdds?.moneyLine;

  const realHomeOdd = americanToDecimal(mlHomeRaw);
  const realAwayOdd = americanToDecimal(mlAwayRaw);
  const realDrawOdd = americanToDecimal(mlDrawRaw);

  let realSpreadHome = null;
  if (typeof oddsObj.Details === 'string' || typeof oddsObj.details === 'string') {
    const det = (oddsObj.details || oddsObj.Details || '').trim();
    const parts = det.split(' ');
    if (parts.length === 2) {
      const favAbbr = parts[0].toUpperCase();
      const val = parseFloat(parts[1]);
      if (!isNaN(val)) realSpreadHome = favAbbr === homeAbbr ? val : -val;
    }
  } else if (typeof oddsObj.spread === 'number') {
    realSpreadHome = oddsObj.homeTeamOdds?.favorite ? -Math.abs(oddsObj.spread) : Math.abs(oddsObj.spread);
  }

  return { realHomeOdd, realAwayOdd, realDrawOdd, realSpreadHome, totalLine };
}

// ============================================================================
// SILNIK SYMULACYJNY GENERUJĄCY TELEMETRIĘ + PEŁNE CIĄGŁE DRABINKI CO 1.0 PKT
// ============================================================================
function computeDynamicPrediction(match, customMod = { hInj: 0, aInj: 0 }) {
  const { homeTeam, awayTeam, sport, cfg, liveInjuries, realOddsInfo } = match;
  const hPen = (liveInjuries?.homePenalty || 0) + (customMod.hInj || 0);
  const aPen = (liveInjuries?.awayPenalty || 0) + (customMod.aInj || 0);
  const netInjDiff = aPen - hPen;

  const hasHardData =
    (homeTeam.hasVerifiedData && awayTeam.hasVerifiedData) ||
    Boolean(realOddsInfo?.realHomeOdd) ||
    Boolean(realOddsInfo?.realSpreadHome);

  if (sport === 'SOCCER' || sport === 'HOCKEY') {
    const hAdv = sport === 'HOCKEY' ? 0.16 : 0.20;
    const statDiff = (homeTeam.compositePower - awayTeam.compositePower) * (sport === 'HOCKEY' ? 2.1 : 1.6) + hAdv + netInjDiff;
    const baseTotal = realOddsInfo?.totalLine || (homeTeam.avgPtsFor + awayTeam.avgPtsFor);

    let finalDiff = statDiff;
    if (realOddsInfo?.realHomeOdd && realOddsInfo?.realAwayOdd) {
      const pMktH = (1 / realOddsInfo.realHomeOdd) / (1 / realOddsInfo.realHomeOdd + 1 / realOddsInfo.realAwayOdd);
      const mktDiff = (pMktH - 0.5) * (sport === 'HOCKEY' ? 2.4 : 1.8);
      finalDiff = mktDiff * 0.65 + statDiff * 0.35;
    }

    const minG = sport === 'HOCKEY' ? 1.95 : 0.55;
    const maxG = sport === 'HOCKEY' ? 3.95 : 2.60;
    const lambdaH = clamp(baseTotal / 2 + finalDiff / 2, minG, maxG);
    const lambdaA = clamp(baseTotal / 2 - finalDiff / 2, minG, maxG);

    const maxLoop = sport === 'HOCKEY' ? 13 : 10;
    let pH = 0, pD = 0, pA = 0, bttsYes = 0;
    const totalGoalsDist = new Array(maxLoop * 2 + 1).fill(0);
    const marginDist = {};

    for (let h = 0; h <= maxLoop; h++) {
      for (let a = 0; a <= maxLoop; a++) {
        const p = poissonPMF(h, lambdaH) * poissonPMF(a, lambdaA);
        if (h > a) pH += p;
        else if (h === a) pD += p;
        else pA += p;
        if (h >= 1 && a >= 1) bttsYes += p;
        totalGoalsDist[h + a] += p;
        const diff = h - a;
        marginDist[diff] = (marginDist[diff] || 0) + p;
      }
    }

    const tot = pH + pD + pA || 1;
    const regHome = clamp((pH / tot) * 100, 16, 66);
    const regDraw = clamp((pD / tot) * 100, 17, 31);
    const regAway = clamp(100 - regHome - regDraw, 16, 66);

    const dnbHome = clamp((regHome / (regHome + regAway)) * 100, 22, 78);
    const dnbAway = 100 - dnbHome;
    const mlHome = clamp(((pH + pD * 0.52) / tot) * 100, 24, 76);
    const mlAway = 100 - mlHome;

    const dc1X = clamp(regHome + regDraw, 35, 86);
    const dcX2 = clamp(regAway + regDraw, 35, 86);
    const dc12 = clamp(regHome + regAway, 68, 84);

    const ladderLines = sport === 'HOCKEY' ? [2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5] : [0.5, 1.5, 2.5, 3.5, 4.5, 5.5];
    const totalsLadder = ladderLines.map((line) => {
      let overP = 0;
      for (let g = 0; g < totalGoalsDist.length; g++) {
        if (g > line) overP += totalGoalsDist[g];
      }
      const overProb = clamp((overP / tot) * 100, 8, 92);
      return { line, overProb, underProb: 100 - overProb };
    });

    const hcpLines = [-2.5, -1.5, 1.5, 2.5];
    const handicapLadder = hcpLines.map((hLine) => {
      let covHome = 0;
      Object.entries(marginDist).forEach(([diffStr, probVal]) => {
        if (Number(diffStr) + hLine > 0) covHome += probVal;
      });
      const homeCoverProb = clamp((covHome / tot) * 100, 12, 88);
      return { lineHome: hLine, homeCoverProb, awayCoverProb: 100 - homeCoverProb };
    });

    const centerLine = realOddsInfo?.totalLine || (sport === 'HOCKEY' ? 5.5 : 2.5);
    const mainTotalObj = totalsLadder.find((t) => t.line === centerLine) || totalsLadder[2];
    const useMoneylineProbs = sport === 'HOCKEY' && !realOddsInfo?.realDrawOdd;

    return {
      homeWinProb: useMoneylineProbs ? mlHome : regHome,
      drawProb: useMoneylineProbs ? 0 : regDraw,
      awayWinProb: useMoneylineProbs ? mlAway : regAway,
      regHomeProb: regHome,
      regDrawProb: regDraw,
      regAwayProb: regAway,
      mlHomeProb: mlHome,
      mlAwayProb: mlAway,
      dnbHomeProb: dnbHome,
      dnbAwayProb: dnbAway,
      dc1XProb: dc1X,
      dcX2Prob: dcX2,
      dc12Prob: dc12,
      bttsYesProb: clamp((bttsYes / tot) * 100, 28, 74),
      expHome: lambdaH,
      expAway: lambdaA,
      expTotal: lambdaH + lambdaA,
      overProb: mainTotalObj.overProb,
      totalLine: mainTotalObj.line,
      spreadLine: lambdaH >= lambdaA ? -1.5 : 1.5,
      spreadHomeProb: handicapLadder[1].homeCoverProb,
      totalsLadder,
      handicapLadder,
      netInjDiff,
      hasHardData,
      modelTag: sport === 'SOCCER' ? 'Poisson xG (Drabinka 0.5–5.5)' : 'Hokej Poisson xG (Drabinka 2.5–8.5)'
    };
  }

  if (sport === 'TENNIS' || sport === 'VOLLEYBALL') {
    const eloH = 1850 + homeTeam.compositePower * 360 - hPen * 25;
    const eloA = 1850 + awayTeam.compositePower * 360 - aPen * 25;
    let pH = (1 / (1 + Math.pow(10, -(eloH - eloA) / 400))) * 100;

    if (realOddsInfo?.realHomeOdd && realOddsInfo?.realAwayOdd) {
      const mktP = ((1 / realOddsInfo.realHomeOdd) / (1 / realOddsInfo.realHomeOdd + 1 / realOddsInfo.realAwayOdd)) * 100;
      pH = mktP * 0.70 + pH * 0.30;
    }

    pH = clamp(pH, 16, 84);
    const closeness = 1 - Math.abs(pH - 50) / 50;
    const expTotal = sport === 'VOLLEYBALL' ? 176 + closeness * 12 : 18.0 + closeness * 4.8;
    const stdTotal = sport === 'VOLLEYBALL' ? 13.5 : 3.6;

    const baseCenter = Math.floor(expTotal) + 0.5;
    const ladderLines = [];
    const span = sport === 'TENNIS' ? 4 : 6;
    const step = sport === 'TENNIS' ? 1 : 2;
    for (let d = -span; d <= span; d += step) {
      ladderLines.push(Number((baseCenter + d).toFixed(1)));
    }

    const totalsLadder = ladderLines.map((line) => {
      const rawOv = (1 - normalCDF(line, expTotal, stdTotal)) * 100;
      const overProb = hasHardData ? clamp(rawOv, 12, 88) : 50.0;
      return { line, overProb, underProb: 100 - overProb };
    });

    const expGameMarginHome = ((pH - 50) / 50) * 5.8;
    const hcpLines = [-5.5, -4.5, -3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5, 4.5, 5.5];
    const handicapLadder = hcpLines.map((hLine) => {
      const covH = clamp((1 - normalCDF(-hLine, expGameMarginHome, 3.8)) * 100, 12, 88);
      return { lineHome: hLine, homeCoverProb: covH, awayCoverProb: 100 - covH };
    });

    const p1prob = pH / 100;
    const p2prob = 1 - p1prob;
    const prob2_0 = clamp(p1prob * p1prob * 108, 12, 72);
    const prob0_2 = clamp(p2prob * p2prob * 108, 12, 72);
    const setsUnder25Prob = clamp(prob2_0 + prob0_2, 42, 74);
    const setsOver25Prob = 100 - setsUnder25Prob;

    const mainTotalObj = totalsLadder[Math.floor(totalsLadder.length / 2)] || totalsLadder[0];

    return {
      homeWinProb: pH,
      drawProb: 0,
      awayWinProb: 100 - pH,
      expHome: pH >= 50 ? 2.0 : 0.9,
      expAway: pH >= 50 ? 0.9 : 2.0,
      expTotal,
      overProb: mainTotalObj.overProb,
      totalLine: mainTotalObj.line,
      spreadLine: pH >= 50 ? -2.5 : 2.5,
      spreadHomeProb: handicapLadder[3].homeCoverProb,
      totalsLadder,
      handicapLadder,
      prob2_0,
      prob0_2,
      setsUnder25Prob,
      setsOver25Prob,
      netInjDiff,
      hasHardData,
      modelTag: sport === 'TENNIS' ? 'ATP/WTA Rank ELO' : 'Volley Set-Point Gauss'
    };
  }

  // KOSZYKÓWKA
  const basePts = cfg.avgScore || 114.0;
  const stdGame = cfg.std || 12.5;

  const powerMargin = (homeTeam.compositePower - awayTeam.compositePower) * 14.0;
  const fourFactorsMargin = (homeTeam.fourFactorsIndex - awayTeam.fourFactorsIndex) * 0.35;
  const homeCourtBonus = 2.2;

  let expectedMarginHome = powerMargin + fourFactorsMargin + homeCourtBonus + netInjDiff * 0.85;

  if (realOddsInfo?.realSpreadHome !== null && realOddsInfo?.realSpreadHome !== undefined) {
    const bookieMarginHome = -realOddsInfo.realSpreadHome;
    expectedMarginHome = bookieMarginHome * 0.70 + expectedMarginHome * 0.30;
  } else if (realOddsInfo?.realHomeOdd && realOddsInfo?.realAwayOdd) {
    const pMktH = (1 / realOddsInfo.realHomeOdd) / (1 / realOddsInfo.realHomeOdd + 1 / realOddsInfo.realAwayOdd);
    const mktMargin = (pMktH - 0.5) * 24.0;
    expectedMarginHome = mktMargin * 0.70 + expectedMarginHome * 0.30;
  }

  const maxAllowedMargin = (realOddsInfo?.realHomeOdd || realOddsInfo?.realSpreadHome) ? 12.5 : 7.0;
  expectedMarginHome = clamp(expectedMarginHome, -maxAllowedMargin, maxAllowedMargin);

  const statTotal = homeTeam.avgPtsFor + awayTeam.avgPtsFor;
  const totalTarget = realOddsInfo?.totalLine ? (realOddsInfo.totalLine * 0.70 + statTotal * 0.30) : statTotal || basePts * 2;

  const expHome = totalTarget / 2 + expectedMarginHome / 2;
  const expAway = totalTarget / 2 - expectedMarginHome / 2;
  const expTotal = expHome + expAway;

  const homeWinProb = clamp((1 - normalCDF(0, expectedMarginHome, stdGame)) * 100, 22, 78);
  const centerLine = Math.floor(realOddsInfo?.totalLine || expTotal) + 0.5;

  const totalsLadder = [];
  for (let offset = -15; offset <= 15; offset += 1) {
    const line = Number((centerLine + offset).toFixed(1));
    const overProb = clamp((1 - normalCDF(line, expTotal, stdGame * 1.38)) * 100, 10, 90);
    totalsLadder.push({ line, overProb, underProb: 100 - overProb });
  }

  const centerSpreadHome = Math.floor(-expectedMarginHome) + 0.5;
  const handicapLadder = [];
  for (let offset = -12; offset <= 12; offset += 1) {
    const lineHome = Number((centerSpreadHome + offset).toFixed(1));
    if (Math.abs(lineHome) < 0.4) continue;
    const homeCoverProb = clamp((1 - normalCDF(-lineHome, expectedMarginHome, stdGame)) * 100, 10, 90);
    handicapLadder.push({ lineHome, homeCoverProb, awayCoverProb: 100 - homeCoverProb });
  }

  const favIsHome = expectedMarginHome >= 0;
  const favMarginMean = Math.abs(expectedMarginHome);
  const winBy1to7Prob = clamp((normalCDF(7.5, favMarginMean, stdGame) - normalCDF(0, favMarginMean, stdGame)) * 100, 18, 38);
  const winBy8to14Prob = clamp((normalCDF(14.5, favMarginMean, stdGame) - normalCDF(7.5, favMarginMean, stdGame)) * 100, 14, 34);

  const regDrawProb = clamp(6.5 - Math.abs(expectedMarginHome) * 0.25, 4.0, 7.5);
  const regHomeProb = clamp(homeWinProb - regDrawProb * 0.5, 20, 74);
  const regAwayProb = clamp(100 - homeWinProb - regDrawProb * 0.5, 20, 74);

  const midTotalObj = totalsLadder.find((t) => t.line === centerLine) || totalsLadder[15];
  const midSpreadObj = handicapLadder[Math.floor(handicapLadder.length / 2)] || { lineHome: -3.5, homeCoverProb: 50 };

  return {
    homeWinProb,
    drawProb: 0,
    awayWinProb: 100 - homeWinProb,
    regHomeProb,
    regDrawProb,
    regAwayProb,
    expHome,
    expAway,
    expTotal,
    overProb: midTotalObj.overProb,
    totalLine: centerLine,
    spreadLine: midSpreadObj.lineHome,
    spreadHomeProb: midSpreadObj.homeCoverProb,
    totalsLadder,
    handicapLadder,
    favIsHome,
    winBy1to7Prob,
    winBy8to14Prob,
    netInjDiff,
    hasHardData,
    modelTag: 'Four Factors + Pythagorean + Live Injuries'
  };
}

// ============================================================================
// GŁÓWNY KOMPONENT APLIKACJI (v7.0 SMART SPLIT & COMBO OPTIMIZER)
// ============================================================================
export default function App() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncInfo, setSyncInfo] = useState('Skanowanie telemetrii meczowej, Four Factors i raportów kontuzji...');

  const [mainTab, setMainTab] = useState('builder');
  const [mobileCouponModalOpen, setMobileCouponModalOpen] = useState(false);

  const [dateFilter, setDateFilter] = useState('TODAY');
  const [activeSport, setActiveSport] = useState('ALL');
  const [activeCountry, setActiveCountry] = useState('ALL');
  const [marketFilter, setMarketFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(60);

  const [includedSports, setIncludedSports] = useState(['SOCCER', 'BASKETBALL', 'HOCKEY', 'TENNIS', 'VOLLEYBALL']);
  const [targetMinOdds, setTargetMinOdds] = useState(2.0);
  const [builderStrategy, setBuilderStrategy] = useState('safe');
  const [builderScope, setBuilderScope] = useState('ML');
  const [lineRiskProfile, setLineRiskProfile] = useState('SAFE_LADDER');
  const [activeSpecialMode, setActiveSpecialMode] = useState('STANDARD'); // 'STANDARD' | 'TOP_SUREBETS' | 'BEST_DUO'
  const [taxRate, setTaxRate] = useState(true);
  const [couponStake, setCouponStake] = useState(2);
  const [customOddsMap, setCustomOddsMap] = useState({});
  const [couponPickIds, setCouponPickIds] = useState([]);
  const [expandedMatchId, setExpandedMatchId] = useState(null);

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

            const homeTeam = parseCompetitorStats(homeComp, cfg, true);
            const awayTeam = parseCompetitorStats(awayComp, cfg, false);
            if (homeTeam.name === 'TBD' || awayTeam.name === 'TBD') continue;

            const uniqueKey = `${cfg.sport}_${homeTeam.name}_${awayTeam.name}`;
            if (collectedMap.has(uniqueKey)) continue;

            const evDateObj = new Date(eventTimeMs);
            const dateStr = evDateObj.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const timeStr = evDateObj.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
            const dayBucket = diffHours <= 18 ? 'TODAY' : diffHours <= 42 ? 'TOMORROW' : 'DAY2';

            const realOddsInfo = extractRealBookieOdds(comp, homeTeam.short);

            const tempMatch = {
              id: `${cfg.path}_${comp.id || ev.id}`,
              rawEventId: ev.id || comp.id,
              sport: cfg.sport,
              country: cfg.country,
              leagueName: `${cfg.country} • ${cfg.name}`,
              homeTeam,
              awayTeam,
              cfg,
              realOddsInfo,
              liveInjuries: { home: [], away: [], homePenalty: 0, awayPenalty: 0 },
              eventTimeMs,
              dateLabel: `${dateStr} • ${timeStr}`,
              dayBucket,
              venue: comp.venue?.fullName || ev.name || cfg.name,
              bookieOdds: {
                totalLine: realOddsInfo.totalLine
              }
            };

            collectedMap.set(uniqueKey, tempMatch);
          }
        })
      );

      const allCollected = Array.from(collectedMap.values());
      const matchesForDeepScan = allCollected.filter((m) => m.cfg.deepScan && (m.dayBucket === 'TODAY' || m.dayBucket === 'TOMORROW')).slice(0, 22);

      await Promise.allSettled(
        matchesForDeepScan.map(async (m) => {
          try {
            const sumUrl = `https://site.api.espn.com/apis/site/v2/sports/${m.cfg.path}/summary?event=${m.rawEventId}`;
            const sumRes = await fetch(sumUrl);
            if (!sumRes.ok) return;
            const sumData = await sumRes.json();

            if (!m.realOddsInfo.realHomeOdd && Array.isArray(sumData.pickcenter) && sumData.pickcenter.length > 0) {
              const pc = sumData.pickcenter[0];
              const hOdd = americanToDecimal(pc.homeTeamOdds?.moneyLine);
              const aOdd = americanToDecimal(pc.awayTeamOdds?.moneyLine);
              if (hOdd && aOdd) {
                m.realOddsInfo.realHomeOdd = hOdd;
                m.realOddsInfo.realAwayOdd = aOdd;
              }
              if (typeof pc.spread === 'number') {
                m.realOddsInfo.realSpreadHome = pc.homeTeamOdds?.favorite ? -Math.abs(pc.spread) : Math.abs(pc.spread);
              }
              if (pc.overUnder) m.realOddsInfo.totalLine = Number(pc.overUnder);
            }

            if (Array.isArray(sumData.injuries) && sumData.injuries.length > 0) {
              const hInjObj = sumData.injuries.find(
                (x) => x.team?.abbreviation === m.homeTeam.short || x.team?.displayName === m.homeTeam.name
              );
              const aInjObj = sumData.injuries.find(
                (x) => x.team?.abbreviation === m.awayTeam.short || x.team?.displayName === m.awayTeam.name
              );

              const evalH = evaluateLiveInjuries(hInjObj?.injuries || [], m.homeTeam, m.sport);
              const evalA = evaluateLiveInjuries(aInjObj?.injuries || [], m.awayTeam, m.sport);

              m.liveInjuries = {
                home: evalH.list,
                away: evalA.list,
                homePenalty: evalH.penalty,
                awayPenalty: evalA.penalty
              };
            }
          } catch (e) {
            // Kontynuuj
          }
        })
      );

      let totalInjuriesCount = 0;
      allCollected.forEach((m) => {
        totalInjuriesCount += (m.liveInjuries?.home?.length || 0) + (m.liveInjuries?.away?.length || 0);
        const sim = computeDynamicPrediction(m);
        const margin = 1.055;
        m.sim = sim;
        m.bookieOdds = {
          home: m.realOddsInfo.realHomeOdd || probToFairBookieOdd(sim.homeWinProb, margin),
          draw: m.realOddsInfo.realDrawOdd || (sim.drawProb > 0 ? probToFairBookieOdd(sim.drawProb, margin) : null),
          away: m.realOddsInfo.realAwayOdd || probToFairBookieOdd(sim.awayWinProb, margin),
          totalLine: sim.totalLine,
          overOdds: 1.88,
          underOdds: 1.88
        };
      });

      const finalArr = allCollected.sort((a, b) => a.eventTimeMs - b.eventTimeMs);
      setMatches(finalArr);
      if (finalArr.length > 0) setLabSelectedMatchId(finalArr[0].id);
      const nowTime = new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
      setSyncInfo(
        `Telemetria Live (${nowTime}): ${finalArr.length} meczów • Uwzględniono ${totalInjuriesCount} raportów kontuzji`
      );
    } catch (err) {
      setSyncInfo('Błąd sieci podczas synchronizacji.');
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

  const allPicks = useMemo(() => {
    const taxMult = taxRate ? 0.88 : 1.0;
    const list = [];

    const addPick = (id, m, sportIcon, marketType, marketBadge, selectionName, defaultOdd, prob, projStr, hasHardData = true) => {
      const odd = customOddsMap[id] ?? defaultOdd;
      const ev = ((prob / 100) * (odd * taxMult) - 1) * 100;
      list.push({
        id,
        match: m,
        sport: m.sport,
        sportIcon,
        marketType,
        marketBadge,
        selectionName,
        odds: odd,
        prob,
        ev,
        projStr,
        hasHardData,
        score: prob * 0.76 + clamp(ev, -15, 25) * 1.1
      });
    };

    matches.forEach((m) => {
      const { sim, homeTeam, awayTeam, bookieOdds } = m;
      const sportIcon = SPORT_GROUPS.find((s) => s.id === m.sport)?.icon || '🏆';
      const unitLabel = m.sport === 'SOCCER' ? 'goli' : m.sport === 'HOCKEY' ? 'goli' : m.sport === 'TENNIS' ? 'gemów' : 'pkt';
      const projStr = `${awayTeam.short} ${sim.expAway.toFixed(1)} : ${sim.expHome.toFixed(1)} ${homeTeam.short} (Σ ${sim.expTotal.toFixed(1)} ${unitLabel})`;
      const mlSuffix = m.sport === 'HOCKEY' ? ' (z dogr./karn.)' : m.sport === 'SOCCER' ? ' (90m 1X2)' : m.sport === 'BASKETBALL' ? ' (z dogr.)' : '';

      addPick(`${m.id}_ML_1`, m, sportIcon, 'ML', 'Zwycięzca', `${homeTeam.name} wygra (1)${mlSuffix}`, bookieOdds.home, sim.homeWinProb, projStr, sim.hasHardData);
      addPick(`${m.id}_ML_2`, m, sportIcon, 'ML', 'Zwycięzca', `${awayTeam.name} wygra (2)${mlSuffix}`, bookieOdds.away, sim.awayWinProb, projStr, sim.hasHardData);

      if (!sim.hasHardData) return;

      if ((m.sport === 'SOCCER' || m.sport === 'HOCKEY') && sim.dnbHomeProb) {
        const favHome = sim.dnbHomeProb >= 50;
        const dnbProb = favHome ? sim.dnbHomeProb : sim.dnbAwayProb;
        const dnbTeam = favHome ? homeTeam.name : awayTeam.name;
        addPick(`${m.id}_DNB`, m, sportIcon, 'ML', 'Zakład bez remisu', `Zakład bez remisu: ${dnbTeam} (${favHome ? '1' : '2'})`, probToFairBookieOdd(dnbProb, 1.055), dnbProb, projStr);
      }

      (sim.totalsLadder || []).forEach((rung) => {
        addPick(`${m.id}_OVER_${rung.line}`, m, sportIcon, 'TOTAL', `Liczba ${unitLabel} +${rung.line}`, `Liczba ${unitLabel}: +${rung.line} (Powyżej)`, probToFairBookieOdd(rung.overProb, 1.06), rung.overProb, projStr);
        addPick(`${m.id}_UNDER_${rung.line}`, m, sportIcon, 'TOTAL', `Liczba ${unitLabel} -${rung.line}`, `Liczba ${unitLabel}: -${rung.line} (Poniżej)`, probToFairBookieOdd(rung.underProb, 1.06), rung.underProb, projStr);
      });

      (sim.handicapLadder || []).forEach((hRung) => {
        const signH = hRung.lineHome > 0 ? `+${hRung.lineHome}` : `${hRung.lineHome}`;
        const awayLine = Number((-hRung.lineHome).toFixed(1));
        const signA = awayLine > 0 ? `+${awayLine}` : `${awayLine}`;
        const hcpTypeLabel = m.sport === 'TENNIS' ? 'Gemy - handicap' : 'Handicap (z dogr.)';

        addPick(`${m.id}_HCP_H_${hRung.lineHome}`, m, sportIcon, 'HANDICAP', `1 (${signH})`, `${hcpTypeLabel}: 1 - ${homeTeam.name} (${signH})`, probToFairBookieOdd(hRung.homeCoverProb, 1.06), hRung.homeCoverProb, projStr);
        addPick(`${m.id}_HCP_A_${awayLine}`, m, sportIcon, 'HANDICAP', `2 (${signA})`, `${hcpTypeLabel}: 2 - ${awayTeam.name} (${signA})`, probToFairBookieOdd(hRung.awayCoverProb, 1.06), hRung.awayCoverProb, projStr);
      });

      if (m.sport === 'SOCCER' || m.sport === 'HOCKEY') {
        const pick1X = sim.dc1XProb >= sim.dcX2Prob;
        const dcProb = pick1X ? sim.dc1XProb : sim.dcX2Prob;
        const dcLabel = pick1X ? `1X (${homeTeam.short} lub remis)` : `X2 (${awayTeam.short} lub remis)`;
        addPick(`${m.id}_DC`, m, sportIcon, 'SPECIALS', 'Podwójna szansa', `Podwójna szansa: ${dcLabel}`, probToFairBookieOdd(dcProb, 1.065), dcProb, projStr);

        const bttsYes = sim.bttsYesProb >= 50;
        const bttsProb = bttsYes ? sim.bttsYesProb : 100 - sim.bttsYesProb;
        addPick(`${m.id}_BTTS`, m, sportIcon, 'SPECIALS', 'Obie strzelą', `Obie drużyny strzelą gola: ${bttsYes ? 'TAK' : 'NIE'}`, probToFairBookieOdd(bttsProb, 1.065), bttsProb, projStr);
      }

      if (m.sport === 'TENNIS' && sim.setsUnder25Prob) {
        const is2Sets = sim.setsUnder25Prob >= 50;
        const setsP = is2Sets ? sim.setsUnder25Prob : sim.setsOver25Prob;
        addPick(`${m.id}_SETS_OU`, m, sportIcon, 'SPECIALS', 'Liczba setów', `Liczba setów: ${is2Sets ? '-2.5 (2 sety)' : '+2.5 (3 sety)'}`, probToFairBookieOdd(setsP, 1.06), setsP, projStr);
      }

      if (m.sport === 'BASKETBALL' && sim.winBy1to7Prob) {
        const favTeam = sim.favIsHome ? homeTeam : awayTeam;
        const pick1to7 = sim.winBy1to7Prob >= sim.winBy8to14Prob;
        const marginProb = pick1to7 ? sim.winBy1to7Prob : sim.winBy8to14Prob;
        addPick(`${m.id}_MARGIN`, m, sportIcon, 'SPECIALS', 'Różnica zwycięstwa', `Różnica zwycięstwa: ${favTeam.name} (${pick1to7 ? '1-7 pkt' : '8-14 pkt'})`, probToFairBookieOdd(marginProb, 1.08), marginProb, projStr);
      }
    });

    return list.sort((a, b) => {
      if (builderStrategy === 'safe') return b.prob - a.prob;
      if (builderStrategy === 'value') return b.ev - a.ev;
      return b.score - a.score;
    });
  }, [matches, taxRate, customOddsMap, builderStrategy]);

  const visiblePicks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const riskObj = LINE_RISK_PROFILES.find((r) => r.id === lineRiskProfile) || LINE_RISK_PROFILES[0];

    return allPicks.filter((p) => {
      if (dateFilter !== 'ALL_UPCOMING' && p.match.dayBucket !== dateFilter) return false;
      if (activeSport !== 'ALL' && p.sport !== activeSport) return false;
      if (activeCountry !== 'ALL' && p.match.country !== activeCountry) return false;
      if (marketFilter !== 'ALL' && p.marketType !== marketFilter) return false;
      if ((p.marketType === 'TOTAL' || p.marketType === 'HANDICAP') && (p.prob < riskObj.minProb || p.prob > riskObj.maxProb)) {
        return false;
      }
      if (q && !`${p.match.homeTeam.name} ${p.match.awayTeam.name} ${p.match.leagueName} ${p.selectionName}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allPicks, dateFilter, activeSport, activeCountry, marketFilter, searchQuery, lineRiskProfile]);

  // ==========================================================================
  // 1. KLASYCZNY KREATOR KUPONU POD KURS DOCELOWY
  // ==========================================================================
  const buildAutoCoupon = (
    minOdds = targetMinOdds,
    strat = builderStrategy,
    scope = builderScope,
    sports = includedSports,
    dFilter = dateFilter,
    riskProf = lineRiskProfile
  ) => {
    setActiveSpecialMode('STANDARD');
    setTargetMinOdds(minOdds);
    setBuilderStrategy(strat);
    setBuilderScope(scope);
    setMarketFilter(scope);
    setLineRiskProfile(riskProf);

    const riskObj = LINE_RISK_PROFILES.find((r) => r.id === riskProf) || LINE_RISK_PROFILES[0];

    let pool = allPicks.filter(
      (p) =>
        p.hasHardData &&
        sports.includes(p.sport) &&
        (dFilter === 'ALL_UPCOMING' || p.match.dayBucket === dFilter) &&
        p.odds >= 1.13 &&
        p.prob >= (scope === 'SPECIALS' ? 22 : riskObj.minProb) &&
        p.prob <= (scope === 'ML' ? 88 : riskObj.maxProb)
    );

    if (scope !== 'ALL') {
      pool = pool.filter((p) => p.marketType === scope);
    }

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

  // ==========================================================================
  // 2. NOWOŚĆ: TOP PEWNIAKI BEZ WZGLĘDU NA KURS (Np. 2, 3 lub 4 najpewniejsze mecze dnia)
  // ==========================================================================
  const buildPureSurebetsCoupon = (count = 3, scope = builderScope, sports = includedSports, dFilter = dateFilter) => {
    setActiveSpecialMode(`TOP_${count}`);
    let pool = allPicks.filter(
      (p) =>
        p.hasHardData &&
        sports.includes(p.sport) &&
        (dFilter === 'ALL_UPCOMING' || p.match.dayBucket === dFilter) &&
        (scope === 'ALL' ? true : p.marketType === scope)
    );

    // Sortujemy ściśle od najwyższego prawdopodobieństwa bez patrzenia na kurs
    pool.sort((a, b) => b.prob - a.prob);

    const chosen = [];
    const usedMatches = new Set();
    for (const item of pool) {
      if (usedMatches.has(item.match.id)) continue;
      chosen.push(item.id);
      usedMatches.add(item.match.id);
      if (chosen.length >= count) break;
    }
    setCouponPickIds(chosen);
  };

  // ==========================================================================
  // 3. NOWOŚĆ: ZŁOTY DUBLET (Dokładnie 2 mecze o kursie łącznym >= minTarget i NAJWYŻSZYM ŁĄCZNYM PRAWDOPODOBIEŃSTWIE!)
  // ==========================================================================
  const buildOptimalTwoMatchCombo = (minTarget = 2.0, scope = builderScope, sports = includedSports, dFilter = dateFilter) => {
    setActiveSpecialMode(`DUO_${minTarget}`);
    setTargetMinOdds(minTarget);

    // Wybieramy najlepszy typ z każdego pojedynczego meczu w ramach wybranego zakresu
    const bestPerMatchMap = new Map();
    allPicks.forEach((p) => {
      if (!p.hasHardData) return;
      if (!sports.includes(p.sport)) return;
      if (dFilter !== 'ALL_UPCOMING' && p.match.dayBucket !== dFilter) return;
      if (scope !== 'ALL' && p.marketType !== scope) return;

      const listForMatch = bestPerMatchMap.get(p.match.id) || [];
      listForMatch.push(p);
      bestPerMatchMap.set(p.match.id, listForMatch);
    });

    // Zbieramy kandydatów (do 80 najmocniejszych typów)
    const candidates = allPicks
      .filter(
        (p) =>
          p.hasHardData &&
          sports.includes(p.sport) &&
          (dFilter === 'ALL_UPCOMING' || p.match.dayBucket === dFilter) &&
          (scope === 'ALL' ? true : p.marketType === scope)
      )
      .sort((a, b) => b.prob - a.prob)
      .slice(0, 80);

    let bestPair = null;
    let maxCombinedProb = -1;

    // Przeszukujemy wszystkie pary nieskorelowanych spotkań (i, j), które dają kurs łączny >= minTarget
    for (let i = 0; i < candidates.length; i++) {
      for (let j = i + 1; j < candidates.length; j++) {
        const p1 = candidates[i];
        const p2 = candidates[j];
        if (p1.match.id === p2.match.id) continue;

        const combinedOdds = p1.odds * p2.odds;
        if (combinedOdds >= minTarget) {
          const combinedProb = (p1.prob / 100) * (p2.prob / 100);
          if (combinedProb > maxCombinedProb) {
            maxCombinedProb = combinedProb;
            bestPair = [p1.id, p2.id];
          }
        }
      }
    }

    if (bestPair) {
      setCouponPickIds(bestPair);
    } else {
      // Jeśli żadne 2 pojedyncze typy nie przebiły progu, uruchamiamy standardowy dobór
      buildAutoCoupon(minTarget, 'safe', scope, sports, dFilter, lineRiskProfile);
    }
  };

  useEffect(() => {
    if (allPicks.length > 0 && couponPickIds.length === 0) {
      buildOptimalTwoMatchCombo(2.0, 'ML', includedSports, dateFilter);
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

  // ==========================================================================
  // PODGLĄD TELEMETRII:
  // includeLadders = false -> NA KUPONIE (Tylko 6 kolorowych kafelków statystyk + kontuzje, BEZ drabinek!)
  // includeLadders = true  -> NA LIŚCIE SPOTKAŃ I W LABORATORIUM (Statystyki + pełne drabinki 31 linii STS!)
  // ==========================================================================
  const renderLabDetails = (m, includeLadders = true) => {
    const { homeTeam, awayTeam, sim, liveInjuries } = m;
    const hInj = liveInjuries?.home || [];
    const aInj = liveInjuries?.away || [];
    const unitName = m.sport === 'BASKETBALL' ? 'punktów (z dogrywką)' : m.sport === 'TENNIS' ? 'gemów' : 'goli';
    const shortUnit = m.sport === 'BASKETBALL' ? 'pkt' : 'gola';

    const selectPickById = (pickId) => {
      const found = allPicks.find((p) => p.id === pickId);
      if (found) togglePickInCoupon(found);
    };

    return (
      <div className="mt-3 pt-3 border-t border-indigo-500/40 bg-slate-950/95 rounded-xl p-3.5 text-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">
            🔬 Pełna Telemetria Modelu • {sim.modelTag}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">{m.dateLabel}</span>
        </div>

        {/* Kolorowy pasek rozkładu szans */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-bold">
            <span className="text-indigo-400">1: {homeTeam.name} ({sim.homeWinProb.toFixed(1)}%)</span>
            {sim.drawProb > 0 && <span className="text-slate-300">X: {sim.drawProb.toFixed(1)}%</span>}
            <span className="text-orange-400">2: {awayTeam.name} ({sim.awayWinProb.toFixed(1)}%)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden flex">
            <div style={{ width: `${sim.homeWinProb}%` }} className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-full" />
            {sim.drawProb > 0 && <div style={{ width: `${sim.drawProb}%` }} className="bg-slate-600 h-full" />}
            <div style={{ width: `${sim.awayWinProb}%` }} className="bg-gradient-to-r from-orange-400 to-orange-600 h-full" />
          </div>
          {(m.sport === 'HOCKEY' || m.sport === 'BASKETBALL') && sim.regHomeProb && (
            <div className="text-[10px] text-slate-400 text-center pt-0.5 font-mono">
              Czas regulaminowy (1X2): {homeTeam.short} <span className="text-indigo-300">{sim.regHomeProb.toFixed(1)}%</span> | Remis <span className="text-slate-300">{sim.regDrawProb.toFixed(1)}%</span> | {awayTeam.short} <span className="text-orange-300">{sim.regAwayProb.toFixed(1)}%</span>
            </div>
          )}
        </div>

        {/* PRZYWRÓCONE 6 KOLOROWYCH KAFELKÓW TELEMETRYCZNYCH (WIDOCZNE ZARÓWNO NA KUPONIE, JAK I NA LIŚCIE!) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center font-mono text-[11px]">
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase">Bilans / Ranking</div>
            <div className="text-indigo-300 font-bold mt-0.5">
              {homeTeam.record} <span className="text-slate-500">vs</span> <span className="text-orange-400">{awayTeam.record}</span>
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">
              {homeTeam.splitRecord} | {awayTeam.splitRecord}
            </div>
          </div>

          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase">Siła Pitagorejska (Śr./Mecz)</div>
            <div className="font-bold mt-0.5">
              <span className="text-emerald-400">{Math.round(homeTeam.pythagoreanWinPct * 100)}%</span> <span className="text-slate-500">vs</span> <span className="text-amber-400">{Math.round(awayTeam.pythagoreanWinPct * 100)}%</span>
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">
              Śr. {homeTeam.avgPtsFor}:{homeTeam.avgPtsAgainst} | {awayTeam.avgPtsFor}:{awayTeam.avgPtsAgainst}
            </div>
          </div>

          {m.sport === 'BASKETBALL' ? (
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <div className="text-[9px] text-slate-400 uppercase">Four Factors (eFG% / Zb.)</div>
              <div className="font-bold mt-0.5">
                <span className="text-cyan-400">{homeTeam.efgPct}%</span> <span className="text-slate-500">vs</span> <span className="text-orange-400">{awayTeam.efgPct}%</span>
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                REB: {homeTeam.rebounds}/{awayTeam.rebounds} • TOV: {homeTeam.turnovers}/{awayTeam.turnovers}
              </div>
            </div>
          ) : m.sport === 'TENNIS' ? (
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <div className="text-[9px] text-slate-400 uppercase">Oficjalny Ranking</div>
              <div className="font-bold mt-0.5">
                <span className="text-cyan-400">{homeTeam.tennisRank ? `#${homeTeam.tennisRank}` : 'Poza Top'}</span> <span className="text-slate-500">vs</span> <span className="text-orange-400">{awayTeam.tennisRank ? `#${awayTeam.tennisRank}` : 'Poza Top'}</span>
              </div>
              <div className="text-[9px] text-emerald-400 mt-0.5">
                {sim.hasHardData ? 'Dane zweryfikowane' : 'Wymaga kursu ręcznego'}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <div className="text-[9px] text-slate-400 uppercase">Bilans Bramek (Atak/Obrona)</div>
              <div className="font-bold mt-0.5">
                <span className="text-cyan-400">{homeTeam.avgPtsFor}</span> <span className="text-slate-500">vs</span> <span className="text-orange-400">{awayTeam.avgPtsFor}</span>
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                Stracone śr.: {homeTeam.avgPtsAgainst} / {awayTeam.avgPtsAgainst}
              </div>
            </div>
          )}

          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase">Composite Power Index</div>
            <div className="font-bold mt-0.5">
              <span className="text-indigo-400">{(homeTeam.compositePower * 100).toFixed(1)}</span> <span className="text-slate-500">vs</span> <span className="text-orange-400">{(awayTeam.compositePower * 100).toFixed(1)}</span>
            </div>
          </div>

          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase">Prognoza Wyniku</div>
            <div className="text-emerald-400 font-black mt-0.5">
              {sim.expHome.toFixed(1)} : {sim.expAway.toFixed(1)} <span className="text-teal-300">(Σ {sim.expTotal.toFixed(1)})</span>
            </div>
          </div>

          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase">Główna Linia {sim.totalLine}</div>
            <div className="font-bold mt-0.5">
              <span className="text-emerald-400">Over: {sim.overProb.toFixed(1)}%</span> / <span className="text-amber-300">Under: {(100 - sim.overProb).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Sekcja Liderów i Kontuzji Live (Zawsze widoczna i na kuponie, i na liście!) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 space-y-1.5 text-[11px]">
          <div className="flex flex-wrap justify-between gap-2">
            <span>Lider 1 ({homeTeam.short}): <strong className="text-indigo-300">{homeTeam.leader}</strong></span>
            <span>Lider 2 ({awayTeam.short}): <strong className="text-orange-300">{awayTeam.leader}</strong></span>
          </div>

          {(hInj.length > 0 || aInj.length > 0) ? (
            <div className="pt-1.5 border-t border-rose-500/30 text-rose-300 text-[10px] space-y-1">
              <div className="font-bold text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Raport Kontuzji (Wpływ netto: {sim.netInjDiff > 0 ? `+${sim.netInjDiff.toFixed(2)} ${shortUnit} dla ${homeTeam.short}` : `${sim.netInjDiff.toFixed(2)} ${shortUnit}`}):
              </div>
              {hInj.map((inj, i) => (
                <div key={`hi_${i}`}>• <strong>{homeTeam.short}</strong>: {inj.name} [{inj.role}] — {inj.status} (-{inj.impact} {shortUnit})</div>
              ))}
              {aInj.map((inj, i) => (
                <div key={`ai_${i}`}>• <strong>{awayTeam.short}</strong>: {inj.name} [{inj.role}] — {inj.status} (-{inj.impact} {shortUnit})</div>
              ))}
            </div>
          ) : (
            <div className="text-[10px] text-emerald-400 flex items-center gap-1">
              <Stethoscope className="w-3 h-3" /> Raport Medyczny API: Brak kluczowych absencji zgłoszonych przed meczem.
            </div>
          )}
        </div>

        {/* DWUKOLUMNOWE DRABINKI STS WYŚWIETLAMY TYLKO NA GŁÓWNEJ LIŚCIE SPOTKAŃ I W LABORATORIUM (NIE ZAŚMIECAJĄ KUPONU!) */}
        {includeLadders && sim.totalsLadder && sim.totalsLadder.length > 0 && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] font-black text-white mb-2 flex items-center justify-between">
              <span>📊 Liczba {unitName} ({sim.totalsLadder.length} linii co 1.0)</span>
              <span className="text-[10px] font-normal text-slate-400">Kliknij kafel, aby dodać na kupon</span>
            </div>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {sim.totalsLadder.map((r) => {
                const underId = `${m.id}_UNDER_${r.line}`;
                const overId = `${m.id}_OVER_${r.line}`;
                const underActive = couponPickIds.includes(underId);
                const overActive = couponPickIds.includes(overId);
                const underOdd = customOddsMap[underId] ?? probToFairBookieOdd(r.underProb, 1.06);
                const overOdd = customOddsMap[overId] ?? probToFairBookieOdd(r.overProb, 1.06);

                return (
                  <div key={r.line} className="grid grid-cols-2 gap-2 font-mono text-xs">
                    <button
                      onClick={() => selectPickById(underId)}
                      className={`px-3 py-2 rounded-lg border flex items-center justify-between transition-all ${
                        underActive
                          ? 'bg-emerald-500/25 border-emerald-500 text-white'
                          : 'bg-slate-950 border-slate-800/90 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>-{r.line}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] ${getProbColorClass(r.underProb)}`}>({r.underProb.toFixed(0)}%)</span>
                        <span className="font-black text-amber-400">{underOdd.toFixed(2)}</span>
                      </div>
                    </button>

                    <button
                      onClick={() => selectPickById(overId)}
                      className={`px-3 py-2 rounded-lg border flex items-center justify-between transition-all ${
                        overActive
                          ? 'bg-emerald-500/25 border-emerald-500 text-white'
                          : 'bg-slate-950 border-slate-800/90 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>+{r.line}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] ${getProbColorClass(r.overProb)}`}>({r.overProb.toFixed(0)}%)</span>
                        <span className="font-black text-amber-400">{overOdd.toFixed(2)}</span>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {includeLadders && sim.handicapLadder && sim.handicapLadder.length > 0 && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] font-black text-white mb-2 flex items-center justify-between">
              <span>⚖️ Handicap ({sim.handicapLadder.length} linii co 1.0)</span>
              <span className="text-[10px] font-normal text-slate-400">1: {homeTeam.short} | 2: {awayTeam.short}</span>
            </div>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {sim.handicapLadder.map((hRung) => {
                const signH = hRung.lineHome > 0 ? `+${hRung.lineHome}` : `${hRung.lineHome}`;
                const awayLine = Number((-hRung.lineHome).toFixed(1));
                const signA = awayLine > 0 ? `+${awayLine}` : `${awayLine}`;

                const hId = `${m.id}_HCP_H_${hRung.lineHome}`;
                const aId = `${m.id}_HCP_A_${awayLine}`;
                const hActive = couponPickIds.includes(hId);
                const aActive = couponPickIds.includes(aId);
                const hOdd = customOddsMap[hId] ?? probToFairBookieOdd(hRung.homeCoverProb, 1.06);
                const aOdd = customOddsMap[aId] ?? probToFairBookieOdd(hRung.awayCoverProb, 1.06);

                return (
                  <div key={hRung.lineHome} className="grid grid-cols-2 gap-2 font-mono text-xs">
                    <button
                      onClick={() => selectPickById(hId)}
                      className={`px-3 py-2 rounded-lg border flex items-center justify-between transition-all ${
                        hActive
                          ? 'bg-emerald-500/25 border-emerald-500 text-white'
                          : 'bg-slate-950 border-slate-800/90 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>1 ({signH})</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] ${getProbColorClass(hRung.homeCoverProb)}`}>({hRung.homeCoverProb.toFixed(0)}%)</span>
                        <span className="font-black text-amber-400">{hOdd.toFixed(2)}</span>
                      </div>
                    </button>

                    <button
                      onClick={() => selectPickById(aId)}
                      className={`px-3 py-2 rounded-lg border flex items-center justify-between transition-all ${
                        aActive
                          ? 'bg-emerald-500/25 border-emerald-500 text-white'
                          : 'bg-slate-950 border-slate-800/90 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>2 ({signA})</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] ${getProbColorClass(hRung.awayCoverProb)}`}>({hRung.awayCoverProb.toFixed(0)}%)</span>
                        <span className="font-black text-amber-400">{aOdd.toFixed(2)}</span>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCouponBox = () => (
    <div className="bg-slate-900 border-2 border-orange-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-orange-400" />
          <div>
            <h3 className="text-base font-black text-white">Twój Kupon AKO ({couponPicks.length})</h3>
            <p className="text-[10px] text-slate-400">Kliknij na spotkanie poniżej, aby wyświetlić kolorowe statystyki i kontuzje</p>
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
          Brak zdarzeń na kuponie. Wybierz powyżej np. <strong>Złoty Dublet 2.00+</strong> lub <strong>Top Pewniaki</strong>.
        </div>
      ) : (
        <>
          <div className="space-y-2.5 mb-4 max-h-[420px] overflow-y-auto pr-1">
            {couponPicks.map((item) => {
              const isCouponItemExpanded = expandedMatchId === `coupon_${item.id}`;
              const injCount = (item.match.liveInjuries?.home?.length || 0) + (item.match.liveInjuries?.away?.length || 0);
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
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                          {item.marketBadge}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{item.match.dateLabel}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${getProbBadgeStyle(item.prob)}`}>
                          {item.prob.toFixed(1)}%
                        </span>
                        {injCount > 0 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                            Kontuzje: {injCount}
                          </span>
                        )}
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
                        1: {item.match.homeTeam.name} vs 2: {item.match.awayTeam.name}
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

                  {/* NA KUPONIE POKAZUJEMY WYŁĄCZNIE CZYSTE STATYSTYKI (includeLadders = false)! */}
                  {isCouponItemExpanded && renderLabDetails(item.match, false)}
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
              <span className={`text-sm font-mono ${getProbColorClass(couponStats.prob)}`}>{couponStats.prob.toFixed(1)}%</span>
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
                  QUANT<span className="text-orange-500">BET</span> LIVE v7.0
                </h1>
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Smart Split & Combo Optimizer
                </span>
              </div>
              <p className="text-[10px] text-slate-400">{syncInfo}</p>
            </div>
          </div>

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
                    buildAutoCoupon(targetMinOdds, builderStrategy, builderScope, includedSports, d.id, lineRiskProfile);
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

      {mainTab === 'builder' && (
        <main className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-5">
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-400" />
                  Kreator Kuponów AKO & Optymalizator Par (Złoty Dublet / Top Pewniaki)
                </h2>
                <p className="text-xs text-slate-400">
                  Wybierz gotowy tryb specjalny (np. 2 mecze o kursie 2.00+ z najwyższym łącznym %) lub klasyczny cel kursowy.
                </p>
              </div>

              {/* NOWY BLOK SPECJALNYCH TRYBÓW KUPONU (ZGODNIE Z TWOJĄ PROŚBĄ!) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-2.5 rounded-xl bg-slate-950/90 border border-emerald-500/30">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Top Pewniaki (Bez względu na kurs):
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { cnt: 2, label: 'Top 2 Mecze' },
                      { cnt: 3, label: 'Top 3 Mecze' },
                      { cnt: 4, label: 'Top 4 Mecze' }
                    ].map((b) => (
                      <button
                        key={b.cnt}
                        onClick={() => buildPureSurebetsCoupon(b.cnt, builderScope, includedSports, dateFilter)}
                        className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all ${
                          activeSpecialMode === `TOP_${b.cnt}`
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                            : 'bg-slate-900 border-slate-800 text-emerald-300 hover:border-emerald-500/50'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> Złoty Dublet (Dokładnie 2 mecze o max % łącznym):
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { target: 2.0, label: '2 Mecze • Kurs 2.00+' },
                      { target: 3.0, label: '2 Mecze • Kurs 3.00+' }
                    ].map((d) => (
                      <button
                        key={d.target}
                        onClick={() => buildOptimalTwoMatchCombo(d.target, builderScope, includedSports, dateFilter)}
                        className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all ${
                          activeSpecialMode === `DUO_${d.target}`
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                            : 'bg-slate-900 border-slate-800 text-amber-300 hover:border-amber-500/50'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
                {MARKET_SCOPES.map((ms) => (
                  <button
                    key={ms.id}
                    onClick={() => buildAutoCoupon(targetMinOdds, builderStrategy, ms.id, includedSports, dateFilter, lineRiskProfile)}
                    className={`py-2 px-2 rounded-lg font-bold transition-all text-center ${
                      builderScope === ms.id
                        ? 'bg-orange-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    {ms.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 bg-slate-950/80 p-2 rounded-xl border border-slate-800/90 text-[11px]">
                {LINE_RISK_PROFILES.map((rp) => (
                  <button
                    key={rp.id}
                    onClick={() => buildAutoCoupon(targetMinOdds, builderStrategy, builderScope, includedSports, dateFilter, rp.id)}
                    className={`py-1.5 px-2 rounded-lg font-bold transition-all ${
                      lineRiskProfile === rp.id
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {rp.label}
                  </button>
                ))}
              </div>

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
                        buildAutoCoupon(targetMinOdds, builderStrategy, builderScope, next, dateFilter, lineRiskProfile);
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

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[2.0, 3.0, 5.0, 8.0].map((t) => (
                  <button
                    key={t}
                    onClick={() => buildAutoCoupon(t, builderStrategy, builderScope, includedSports, dateFilter, lineRiskProfile)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      activeSpecialMode === 'STANDARD' && Math.abs(targetMinOdds - t) < 0.1
                        ? 'bg-orange-500/20 border-orange-500 text-white shadow'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-orange-400">Kurs {t.toFixed(2)}+</span>
                      <Zap className="w-4 h-4 text-orange-400" />
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Dowolna liczba spotkań</div>
                  </button>
                ))}
              </div>

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
                    onChange={(e) => buildAutoCoupon(Number(e.target.value), builderStrategy, builderScope, includedSports, dateFilter, lineRiskProfile)}
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
                      onClick={() => buildAutoCoupon(targetMinOdds, st.id, builderScope, includedSports, dateFilter, lineRiskProfile)}
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

            <div className="block lg:hidden">
              {renderCouponBox()}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-400" />
                    Pełna Lista Spotkań & Drabinki STS ({visiblePicks.length})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Tutaj po kliknięciu ikony suwaków otworzysz zarówno statystyki, jak i pełne drabinki 31 linii punktów oraz handicapów!
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Szukaj drużyny / linii..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto">
                    {[
                      { id: 'ALL', label: 'Wszystkie' },
                      { id: 'ML', label: 'Zwycięzca/DNB' },
                      { id: 'TOTAL', label: 'Drabinka O/U' },
                      { id: 'HANDICAP', label: 'Handicapy' },
                      { id: 'SPECIALS', label: '1X/X2 & BTTS' }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setMarketFilter(f.id)}
                        className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap ${
                          marketFilter === f.id ? 'bg-slate-800 text-white' : 'text-slate-400'
                        }`}
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
                  const injCount = (pick.match.liveInjuries?.home?.length || 0) + (pick.match.liveInjuries?.away?.length || 0);

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
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                              {pick.marketBadge}
                            </span>
                            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {pick.match.dateLabel}
                            </span>
                            {injCount > 0 && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                🚑 Kontuzje ({injCount})
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400 font-mono">
                              Prognoza: <strong className="text-white">{pick.projStr}</strong>
                            </span>
                          </div>

                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-300">
                              1: {pick.match.homeTeam.name} vs 2: {pick.match.awayTeam.name}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-sm font-black text-orange-400">{pick.selectionName}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 ml-auto">
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400">Szansa</div>
                            <div className={`text-sm font-mono ${getProbColorClass(pick.prob)}`}>{pick.prob.toFixed(1)}%</div>
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
                            title="Rozwiń pełną telemetrię i drabinki STS"
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

                      {/* NA LIŚCIE SPOTKAŃ POKAZUJEMY PEŁNY WIDOK Z DRABINKAMI STS (includeLadders = true)! */}
                      {isExpanded && renderLabDetails(pick.match, true)}
                    </div>
                  );
                })}
              </div>

              {visiblePicks.length > displayLimit && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setDisplayLimit((prev) => prev + 100)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-orange-400 border border-slate-700"
                  >
                    Pokaż więcej pozycji z drabinki ({visiblePicks.length - displayLimit} pozostałych)
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-28">
              {renderCouponBox()}
            </div>
          </div>
        </main>
      )}

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
                    1: {m.homeTeam.name} vs 2: {m.awayTeam.name}
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
                  1: {labMatch.homeTeam.name} vs 2: {labMatch.awayTeam.name}
                </h2>
                <p className="text-xs text-indigo-400 mt-1">Model: {labSimCustom.modelTag}</p>
              </div>

              {renderLabDetails({ ...labMatch, sim: labSimCustom }, true)}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Dodatkowe osłabienie 1 ({labMatch.homeTeam.short}):</span>
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
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Dodatkowe osłabienie 2 ({labMatch.awayTeam.short}):</span>
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
              </div>
            </div>
          </div>
        </main>
      )}

      {/* PŁYWAJĄCY DOLNY PASEK KUPONU NA TELEFONIE */}
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
              <span className={`text-[10px] font-mono ${getProbColorClass(couponStats.prob)}`}>({couponStats.prob.toFixed(1)}%)</span>
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
