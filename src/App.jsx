import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity, RefreshCw, Sliders, Calendar, Zap, Sparkles,
  Ticket, Plus, Trash2, Target, Check, Edit3, Globe,
  ChevronDown, ChevronUp, Clock, Search, X, Stethoscope, AlertTriangle
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
  { sport: 'BASKETBALL', country: 'USA (NBA)', name: 'NBA', path: 'basketball/nba', avgScore: 114.5, std: 12.5, deepScan: true },
  { sport: 'BASKETBALL', country: 'USA (NCAA)', name: 'NCAA Basket', path: 'basketball/mens-college-basketball', avgScore: 74.5, std: 11.0, deepScan: false },
  { sport: 'HOCKEY', country: 'USA / Kanada', name: 'NHL', path: 'hockey/nhl', avgScore: 3.1, std: 1.6, deepScan: true },
  { sport: 'HOCKEY', country: 'Ameryka Płn.', name: 'NCAA Hockey', path: 'hockey/mens-college-hockey', avgScore: 3.0, std: 1.6, deepScan: false },
  { sport: 'TENNIS', country: 'ATP Tour', name: 'ATP Mężczyźni', path: 'tennis/atp', avgScore: 22.0, std: 3.5, deepScan: false },
  { sport: 'TENNIS', country: 'WTA Tour', name: 'WTA Kobiety', path: 'tennis/wta', avgScore: 20.0, std: 3.5, deepScan: false },
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

// Lista najważniejszych gwiazd NBA/NHL (aby skaner kontuzji nigdy nie traktował ich jako zwykłej rotacji, gdy wypadną z pola "leaders")
const SUPERSTAR_LASTNAMES = new Set([
  'edwards', 'jokic', 'jokić', 'tatum', 'doncic', 'dončić', 'antetokounmpo', 'gilgeous-alexander',
  'embiid', 'brunson', 'durant', 'booker', 'curry', 'james', 'davis', 'mitchell', 'haliburton',
  'wembanyama', 'morant', 'sabonis', 'fox', 'banchero', 'cunningham', 'young', 'irving', 'lillard',
  'mcdavid', 'mackinnon', 'matthews', 'kucherov', 'draisaitl', 'makar', 'panarin', 'barkov', 'kaprizov', 'hughes'
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
// PARSER TELEMETRII ZESPOŁU / ZAWODNIKA (Z obsługą Rankingu ATP/WTA i bez hashStrength!)
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

  // Sprawdzanie rankingu ATP/WTA lub rozstawienia turniejowego (seed)
  const rawRank = comp.curatedRank?.current || comp.rank || comp.seed || comp.athlete?.rank || null;
  const tennisRank = rawRank && rawRank > 0 && rawRank < 1500 ? Number(rawRank) : null;

  // Czy mamy zweryfikowane dane o sile (prawdziwy bilans meczów lub ranking)?
  const hasVerifiedData = parsedTotal.games > 0 || tennisRank !== null;

  let rawWinPct = 0.50;
  if (parsedTotal.pct !== null) {
    rawWinPct = parsedTotal.pct;
  } else if (tennisRank !== null) {
    // Przeliczenie miejsca w rankingu WTA/ATP na siłę bazową (np. #10 -> 0.72, #100 -> 0.55, #500 -> 0.35)
    rawWinPct = clamp(0.82 - Math.log10(Math.max(1, tennisRank)) * 0.16, 0.25, 0.80);
  }

  const gamesPlayed = parsedTotal.games;

  // Silna stabilizacja Bayesowska na początku sezonu (k=26 dla NBA, aby bilans 5-0 vs 0-5 nie dawał 80% szans!)
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
    avgPtsFor = clamp(avgPtsFor, 2.30, 3.85);
    avgPtsAgainst = clamp(avgPtsAgainst, 2.30, 3.85);
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
    record: totalRecObj?.summary || (tennisRank ? `Rank #${tennisRank}` : 'Brak bilansu'),
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

// ============================================================================
// SKANER KONTUZJI (Rozpoznaje gwiazdy takie jak Anthony Edwards nawet gdy są OUT!)
// ============================================================================
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

    // Naprawa błędu z filmu: Sprawdzamy zarówno aktywnego lidera, jak i globalną bazę gwiazd NBA/NHL!
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

  let realHomeOdd = americanToDecimal(mlHomeRaw);
  let realAwayOdd = americanToDecimal(mlAwayRaw);
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
// SKALIBROWANY SILNIK SYMULACYJNY
// ============================================================================
function computeDynamicPrediction(match, customMod = { hInj: 0, aInj: 0 }) {
  const { homeTeam, awayTeam, sport, cfg, liveInjuries, realOddsInfo } = match;
  const hPen = (liveInjuries?.homePenalty || 0) + (customMod.hInj || 0);
  const aPen = (liveInjuries?.awayPenalty || 0) + (customMod.aInj || 0);
  const netInjDiff = aPen - hPen;

  // Sprawdzenie, czy mecz ma twarde pokrycie w danych (bilans, ranking lub kursy z API)
  const hasHardData =
    homeTeam.hasVerifiedData ||
    awayTeam.hasVerifiedData ||
    Boolean(realOddsInfo?.realHomeOdd) ||
    Boolean(realOddsInfo?.realSpreadHome);

  // 1. PIŁKA NOŻNA ORAZ HOKEJ
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

    const minG = sport === 'HOCKEY' ? 2.05 : 0.65;
    const maxG = sport === 'HOCKEY' ? 3.95 : 2.55;
    const lambdaH = clamp(baseTotal / 2 + finalDiff / 2, minG, maxG);
    const lambdaA = clamp(baseTotal / 2 - finalDiff / 2, minG, maxG);

    let pH = 0, pD = 0, pA = 0, pOver = 0;
    const maxLoop = sport === 'HOCKEY' ? 10 : 8;
    const lineOU = realOddsInfo?.totalLine || (sport === 'HOCKEY' ? 5.5 : 2.5);

    for (let h = 0; h <= maxLoop; h++) {
      for (let a = 0; a <= maxLoop; a++) {
        const p = poissonPMF(h, lambdaH) * poissonPMF(a, lambdaA);
        if (h > a) pH += p;
        else if (h === a) pD += p;
        else pA += p;
        if (h + a > lineOU) pOver += p;
      }
    }

    const tot = pH + pD + pA || 1;
    const regHome = clamp((pH / tot) * 100, 18, 65);
    const regDraw = clamp((pD / tot) * 100, 18, 30);
    const regAway = clamp(100 - regHome - regDraw, 18, 65);

    const mlHome = clamp(((pH + pD * 0.52) / tot) * 100, 28, 72);
    const mlAway = 100 - mlHome;
    const useMoneylineProbs = sport === 'HOCKEY' && !realOddsInfo?.realDrawOdd;

    return {
      homeWinProb: useMoneylineProbs ? mlHome : regHome,
      drawProb: useMoneylineProbs ? 0 : regDraw,
      awayWinProb: useMoneylineProbs ? mlAway : regAway,
      regHomeProb: regHome,
      regDrawProb: regDraw,
      regAwayProb: regAway,
      expHome: lambdaH,
      expAway: lambdaA,
      expTotal: lambdaH + lambdaA,
      overProb: clamp(pOver * 100, 36, 62),
      totalLine: lineOU,
      netInjDiff,
      hasHardData,
      modelTag: sport === 'SOCCER' ? 'Poisson xG (90m 1X2)' : 'NHL Poisson xG (Moneyline z OT)'
    };
  }

  // 2. TENIS & SIATKÓWKA (Naprawiona linia gemów zależna od faworyta!)
  if (sport === 'TENNIS' || sport === 'VOLLEYBALL') {
    const eloH = 1850 + homeTeam.compositePower * 360 - hPen * 25;
    const eloA = 1850 + awayTeam.compositePower * 360 - aPen * 25;
    let pH = (1 / (1 + Math.pow(10, -(eloH - eloA) / 400))) * 100;

    if (realOddsInfo?.realHomeOdd && realOddsInfo?.realAwayOdd) {
      const mktP = ((1 / realOddsInfo.realHomeOdd) / (1 / realOddsInfo.realHomeOdd + 1 / realOddsInfo.realAwayOdd)) * 100;
      pH = mktP * 0.70 + pH * 0.30;
    }

    pH = clamp(pH, 15, 85);
    // Im większa przewaga faworyta, tym krótszy mecz i niższa linia gemów (np. 16.5 - 18.5 zamiast sztywnego 21.5!)
    const closeness = 1 - Math.abs(pH - 50) / 50;
    const dynamicTennisLine = closeness < 0.45 ? 17.5 : closeness < 0.70 ? 19.5 : 21.5;
    const lineOU = realOddsInfo?.totalLine || (sport === 'VOLLEYBALL' ? 180.5 : dynamicTennisLine);
    const expTotal = sport === 'VOLLEYBALL' ? 175 + closeness * 12 : 16.5 + closeness * 5.8;

    // Jeżeli nie mamy twardych danych (np. kwalifikacje WTA bez rankingu i kursów w API), nie pompujemy Overa do 66%!
    const rawOverProb = (1 - normalCDF(lineOU, expTotal, sport === 'VOLLEYBALL' ? 13.5 : 3.6)) * 100;
    const overProb = hasHardData ? clamp(rawOverProb, 38, 61) : 50.0;

    return {
      homeWinProb: pH,
      drawProb: 0,
      awayWinProb: 100 - pH,
      expHome: pH >= 50 ? 2.0 : 0.8,
      expAway: pH >= 50 ? 0.8 : 2.0,
      expTotal,
      overProb,
      totalLine: lineOU,
      netInjDiff,
      hasHardData,
      modelTag: sport === 'TENNIS' ? 'ATP/WTA Rank ELO' : 'Volley Set-Point Gauss'
    };
  }

  // 3. KOSZYKÓWKA (NBA / NCAA) - Mocne kotwiczenie na starcie sezonu (brak kursów 1.16 na wyrównane mecze!)
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

  // Ograniczenie maksymalnego spreadu bez kursów do +/- 7.5 pkt (co odpowiada max ~72% szansy i kursowi ~1.35)
  const maxAllowedMargin = (realOddsInfo?.realHomeOdd || realOddsInfo?.realSpreadHome) ? 12.5 : 7.2;
  expectedMarginHome = clamp(expectedMarginHome, -maxAllowedMargin, maxAllowedMargin);

  const statTotal = homeTeam.avgPtsFor + awayTeam.avgPtsFor;
  const totalTarget = realOddsInfo?.totalLine ? (realOddsInfo.totalLine * 0.70 + statTotal * 0.30) : statTotal || basePts * 2;

  const expHome = totalTarget / 2 + expectedMarginHome / 2;
  const expAway = totalTarget / 2 - expectedMarginHome / 2;
  const expTotal = expHome + expAway;

  const homeWinProb = clamp((1 - normalCDF(0, expectedMarginHome, stdGame)) * 100, 24, 76);
  const lineOU = realOddsInfo?.totalLine || Math.round(expTotal * 2) / 2;
  const overProb = clamp((1 - normalCDF(lineOU, expTotal, stdGame * 1.4)) * 100, 38, 62);

  return {
    homeWinProb,
    drawProb: 0,
    awayWinProb: 100 - homeWinProb,
    expHome,
    expAway,
    expTotal,
    overProb,
    totalLine: lineOU,
    netInjDiff,
    hasHardData,
    modelTag: 'Four Factors + Pythagorean + Live Injuries'
  };
}

// ============================================================================
// GŁÓWNY KOMPONENT APLIKACJI (v6.6)
// ============================================================================
export default function App() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncInfo, setSyncInfo] = useState('Skanowanie telemetrii meczowej, rankingów i raportów kontuzji...');

  const [mainTab, setMainTab] = useState('builder');
  const [mobileCouponModalOpen, setMobileCouponModalOpen] = useState(false);

  const [dateFilter, setDateFilter] = useState('TODAY');
  const [activeSport, setActiveSport] = useState('ALL');
  const [activeCountry, setActiveCountry] = useState('ALL');
  const [marketFilter, setMarketFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(50);

  const [includedSports, setIncludedSports] = useState(['SOCCER', 'BASKETBALL', 'HOCKEY', 'TENNIS', 'VOLLEYBALL']);
  const [targetMinOdds, setTargetMinOdds] = useState(2.0);
  const [builderStrategy, setBuilderStrategy] = useState('safe');
  const [builderScope, setBuilderScope] = useState('ML_ONLY');
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

      // KROK 2: POBIERANIE KONTUZJI ORAZ DODATKOWYCH KURSÓW Z PICKCENTER (summary?event=ID)
      const allCollected = Array.from(collectedMap.values());
      const matchesForDeepScan = allCollected.filter((m) => m.cfg.deepScan && (m.dayBucket === 'TODAY' || m.dayBucket === 'TOMORROW')).slice(0, 22);

      await Promise.allSettled(
        matchesForDeepScan.map(async (m) => {
          try {
            const sumUrl = `https://site.api.espn.com/apis/site/v2/sports/${m.cfg.path}/summary?event=${m.rawEventId}`;
            const sumRes = await fetch(sumUrl);
            if (!sumRes.ok) return;
            const sumData = await sumRes.json();

            // Wyciągnięcie kursów z pickcenter, jeśli nie było ich na głównej tablicy scoreboard
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
          home: m.realOddsInfo.realHomeOdd || Number(Math.max(1.22, (100 / sim.homeWinProb) / margin).toFixed(2)),
          draw: m.realOddsInfo.realDrawOdd || (sim.drawProb > 0 ? Number(Math.max(2.90, (100 / sim.drawProb) / margin).toFixed(2)) : null),
          away: m.realOddsInfo.realAwayOdd || Number(Math.max(1.22, (100 / sim.awayWinProb) / margin).toFixed(2)),
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

    matches.forEach((m) => {
      const { sim, homeTeam, awayTeam, bookieOdds } = m;
      const sportIcon = SPORT_GROUPS.find((s) => s.id === m.sport)?.icon || '🏆';
      const scoreUnit = m.sport === 'SOCCER' ? 'goli (xG)' : m.sport === 'HOCKEY' ? 'bramek' : m.sport === 'TENNIS' ? 'sety' : 'pkt';
      const projStr = `${awayTeam.short} ${sim.expAway.toFixed(1)} : ${sim.expHome.toFixed(1)} ${homeTeam.short} (${scoreUnit})`;
      const marketSuffix = m.sport === 'HOCKEY' ? ' (z OT)' : m.sport === 'SOCCER' ? ' (90m 1X2)' : '';

      const idH = `${m.id}_HOME`;
      const oddH = customOddsMap[idH] ?? bookieOdds.home;
      const evH = ((sim.homeWinProb / 100) * (oddH * taxMult) - 1) * 100;
      list.push({
        id: idH,
        match: m,
        sport: m.sport,
        sportIcon,
        marketType: 'ML',
        selectionName: `${homeTeam.name} wygra (1)${marketSuffix}`,
        odds: oddH,
        prob: sim.homeWinProb,
        ev: evH,
        projStr,
        hasHardData: sim.hasHardData,
        score: sim.homeWinProb * 0.78 + clamp(evH, -15, 25) * 1.1
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
        selectionName: `${awayTeam.name} wygra (2)${marketSuffix}`,
        odds: oddA,
        prob: sim.awayWinProb,
        ev: evA,
        projStr,
        hasHardData: sim.hasHardData,
        score: sim.awayWinProb * 0.78 + clamp(evA, -15, 25) * 1.1
      });

      // Rynek Over/Under dodajemy tylko wtedy, gdy mecz ma zweryfikowane dane (blokada ślepych Overów 21.5 w kwalifikacjach WTA!)
      if (sim.hasHardData) {
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
          hasHardData: true,
          score: probOU * 0.72 + clamp(evOU, -15, 25) * 1.1
        });
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
    return allPicks.filter((p) => {
      if (dateFilter !== 'ALL_UPCOMING' && p.match.dayBucket !== dateFilter) return false;
      if (activeSport !== 'ALL' && p.sport !== activeSport) return false;
      if (activeCountry !== 'ALL' && p.match.country !== activeCountry) return false;
      if (marketFilter !== 'ALL' && p.marketType !== marketFilter) return false;
      if (q && !`${p.match.homeTeam.name} ${p.match.awayTeam.name} ${p.match.leagueName}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allPicks, dateFilter, activeSport, activeCountry, marketFilter, searchQuery]);

  // Automatyczny kreator kuponu bierze TYLKO mecze ze zweryfikowanymi statystykami/rankingiem (p.hasHardData === true)!
  const buildAutoCoupon = (minOdds = targetMinOdds, strat = builderStrategy, scope = builderScope, sports = includedSports, dFilter = dateFilter) => {
    setTargetMinOdds(minOdds);
    setBuilderStrategy(strat);
    setBuilderScope(scope);

    let pool = allPicks.filter(
      (p) =>
        p.hasHardData &&
        sports.includes(p.sport) &&
        (dFilter === 'ALL_UPCOMING' || p.match.dayBucket === dFilter) &&
        p.odds >= 1.20 &&
        p.prob >= 50
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

  // Kafelek telemetrii dostosowany do konkretnego sportu (bez koszykarskich zbiórek w piłce i tenisie!)
  const renderLabDetails = (m) => {
    const { homeTeam, awayTeam, sim, liveInjuries } = m;
    const hInj = liveInjuries?.home || [];
    const aInj = liveInjuries?.away || [];
    const unitName = m.sport === 'BASKETBALL' ? 'pkt' : 'gola';

    return (
      <div className="mt-3 pt-3 border-t border-indigo-500/40 bg-slate-950/95 rounded-xl p-3.5 text-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">
            🔬 Telemetria Spotkania • {sim.modelTag}
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
          {m.sport === 'HOCKEY' && sim.regHomeProb && (
            <div className="text-[10px] text-slate-400 text-center pt-0.5 font-mono">
              Czas regulaminowy 60m (1X2): {awayTeam.short} {sim.regAwayProb.toFixed(1)}% | Remis {sim.regDrawProb.toFixed(1)}% | {homeTeam.short} {sim.regHomeProb.toFixed(1)}%
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center font-mono text-[11px]">
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase">Bilans / Ranking</div>
            <div className="text-white font-bold mt-0.5">
              {awayTeam.record} vs <span className="text-orange-400">{homeTeam.record}</span>
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">
              {awayTeam.splitRecord} | {homeTeam.splitRecord}
            </div>
          </div>

          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase">Siła Pitagorejska (Śr./Mecz)</div>
            <div className="text-emerald-400 font-bold mt-0.5">
              {Math.round(awayTeam.pythagoreanWinPct * 100)}% vs <span className="text-orange-400">{Math.round(homeTeam.pythagoreanWinPct * 100)}%</span>
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">
              Śr. {awayTeam.avgPtsFor}:{awayTeam.avgPtsAgainst} | {homeTeam.avgPtsFor}:{homeTeam.avgPtsAgainst}
            </div>
          </div>

          {/* Kafelek nr 3 dopasowany ściśle do dyscypliny sportowej! */}
          {m.sport === 'BASKETBALL' ? (
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <div className="text-[9px] text-slate-400 uppercase">Four Factors (eFG% / Zb.)</div>
              <div className="text-indigo-300 font-bold mt-0.5">
                {awayTeam.efgPct}% vs <span className="text-orange-400">{homeTeam.efgPct}%</span>
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                REB: {awayTeam.rebounds}/{homeTeam.rebounds} • TOV: {awayTeam.turnovers}/{homeTeam.turnovers}
              </div>
            </div>
          ) : m.sport === 'TENNIS' ? (
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <div className="text-[9px] text-slate-400 uppercase">Profil ATP/WTA</div>
              <div className="text-indigo-300 font-bold mt-0.5">
                {awayTeam.tennisRank ? `#${awayTeam.tennisRank}` : 'Kwal.'} vs <span className="text-orange-400">{homeTeam.tennisRank ? `#${homeTeam.tennisRank}` : 'Kwal.'}</span>
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                {sim.hasHardData ? 'Dane zweryfikowane' : 'Brak kursów w API'}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <div className="text-[9px] text-slate-400 uppercase">Bilans Bramek (Atak/Obrona)</div>
              <div className="text-indigo-300 font-bold mt-0.5">
                {awayTeam.avgPtsFor} vs <span className="text-orange-400">{homeTeam.avgPtsFor}</span>
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                Stracone śr.: {awayTeam.avgPtsAgainst} / {homeTeam.avgPtsAgainst}
              </div>
            </div>
          )}

          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase">Composite Power Index</div>
            <div className="text-white font-bold mt-0.5">
              {(awayTeam.compositePower * 100).toFixed(1)} vs <span className="text-orange-400">{(homeTeam.compositePower * 100).toFixed(1)}</span>
            </div>
          </div>

          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase">Prognoza Wyniku</div>
            <div className="text-emerald-400 font-bold mt-0.5">
              {sim.expAway.toFixed(1)} : {sim.expHome.toFixed(1)} (Σ {sim.expTotal.toFixed(1)})
            </div>
          </div>

          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase">Linia Suma {sim.totalLine}</div>
            <div className="text-indigo-300 font-bold mt-0.5">
              Over: {sim.overProb.toFixed(1)}% / Under: {(100 - sim.overProb).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 space-y-1.5 text-[11px]">
          <div className="flex flex-wrap justify-between gap-2">
            <span>Aktywny lider {awayTeam.short}: <strong className="text-indigo-300">{awayTeam.leader}</strong></span>
            <span>Aktywny lider {homeTeam.short}: <strong className="text-orange-300">{homeTeam.leader}</strong></span>
          </div>

          {(hInj.length > 0 || aInj.length > 0) ? (
            <div className="pt-1.5 border-t border-rose-500/30 text-rose-300 text-[10px] space-y-1">
              <div className="font-bold text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Raport Kontuzji (Wpływ netto: {sim.netInjDiff > 0 ? `+${sim.netInjDiff.toFixed(2)} ${unitName} dla ${homeTeam.short}` : `${sim.netInjDiff.toFixed(2)} ${unitName}`}):
              </div>
              {aInj.map((inj, i) => (
                <div key={`ai_${i}`}>• <strong>{awayTeam.short}</strong>: {inj.name} [{inj.role}] — {inj.status} (-{inj.impact} {unitName})</div>
              ))}
              {hInj.map((inj, i) => (
                <div key={`hi_${i}`}>• <strong>{homeTeam.short}</strong>: {inj.name} [{inj.role}] — {inj.status} (-{inj.impact} {unitName})</div>
              ))}
            </div>
          ) : (
            <div className="text-[10px] text-emerald-400 flex items-center gap-1">
              <Stethoscope className="w-3 h-3" /> Raport Medyczny API: Brak kluczowych absencji zgłoszonych przed meczem.
            </div>
          )}
        </div>
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
            <p className="text-[10px] text-slate-400">Kliknij na spotkanie poniżej, aby rozwinąć pełną telemetrię i kontuzje</p>
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
                        <span className="text-[10px] font-mono text-indigo-300">{item.match.dateLabel}</span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">{item.prob.toFixed(1)}%</span>
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
                  QUANT<span className="text-orange-500">BET</span> LIVE v6.6
                </h1>
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Verified Data & Star Injury AI
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

      {mainTab === 'builder' && (
        <main className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-5">
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-400" />
                    Kreator Kuponów AKO (Tylko Zweryfikowane Dane Meczowe)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Odrzuca mecze kwalifikacyjne bez bilansu/rankingu i rozpoznaje kontuzjowane gwiazdy (np. A. Edwards).
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

            <div className="block lg:hidden">
              {renderCouponBox()}
            </div>

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
                            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {pick.match.dateLabel}
                            </span>
                            {injCount > 0 && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                🚑 Kontuzje ({injCount})
                              </span>
                            )}
                            {!pick.hasHardData && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                Brak bilansu w API (Wpisz kurs z STS)
                              </span>
                            )}
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
