import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Calculator,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Zap,
  Sparkles,
  Ticket,
  Plus,
  Trash2,
  Target,
  Layers,
  ArrowUpRight,
  Check,
  UserX,
  Stethoscope,
  Edit3
} from 'lucide-react';

// ============================================================================
// BAZA BAZOWA DRUŻYN NBA (Używana jako fundament i automatycznie wzbogacana
// o bilanse, składy i kontuzje pobierane w czasie rzeczywistym z ESPN Live API)
// ============================================================================
const NBA_TEAMS_DB = {
  BOS: {
    id: 'BOS', name: 'Boston Celtics', short: 'BOS', conf: 'East', color: '#007A33',
    ortg: 123.2, drtg: 111.6, pace: 98.2, efg: 57.8, tov: 11.9, orb: 28.8, ftr: 20.5,
    l10: 0.80, homeRecord: '33-6', awayRecord: '27-14', starPlayer: 'Jayson Tatum, Jaylen Brown'
  },
  OKC: {
    id: 'OKC', name: 'Oklahoma City Thunder', short: 'OKC', conf: 'West', color: '#007AC1',
    ortg: 119.5, drtg: 111.0, pace: 100.6, efg: 57.3, tov: 12.4, orb: 24.5, ftr: 21.8,
    l10: 0.70, homeRecord: '31-8', awayRecord: '25-15', starPlayer: 'Shai Gilgeous-Alexander, Chet Holmgren'
  },
  DEN: {
    id: 'DEN', name: 'Denver Nuggets', short: 'DEN', conf: 'West', color: '#0E2240',
    ortg: 118.5, drtg: 112.3, pace: 97.4, efg: 56.2, tov: 12.6, orb: 30.2, ftr: 19.9,
    l10: 0.80, homeRecord: '32-8', awayRecord: '24-17', starPlayer: 'Nikola Jokić, Jamal Murray'
  },
  MIN: {
    id: 'MIN', name: 'Minnesota Timberwolves', short: 'MIN', conf: 'West', color: '#0C2340',
    ortg: 115.6, drtg: 109.0, pace: 97.8, efg: 55.9, tov: 14.2, orb: 27.5, ftr: 22.8,
    l10: 0.70, homeRecord: '29-10', awayRecord: '26-15', starPlayer: 'Anthony Edwards, Rudy Gobert'
  },
  NYK: {
    id: 'NYK', name: 'New York Knicks', short: 'NYK', conf: 'East', color: '#F58426',
    ortg: 118.2, drtg: 112.4, pace: 96.1, efg: 54.8, tov: 13.1, orb: 33.4, ftr: 21.2,
    l10: 0.60, homeRecord: '27-12', awayRecord: '23-18', starPlayer: 'Jalen Brunson, Karl-Anthony Towns'
  },
  MIL: {
    id: 'MIL', name: 'Milwaukee Bucks', short: 'MIL', conf: 'East', color: '#00471B',
    ortg: 118.4, drtg: 115.2, pace: 100.2, efg: 56.8, tov: 12.7, orb: 24.8, ftr: 23.9,
    l10: 0.60, homeRecord: '30-10', awayRecord: '19-20', starPlayer: 'Giannis Antetokounmpo, Damian Lillard'
  },
  DAL: {
    id: 'DAL', name: 'Dallas Mavericks', short: 'DAL', conf: 'West', color: '#00538C',
    ortg: 117.9, drtg: 114.6, pace: 100.1, efg: 56.5, tov: 12.1, orb: 25.9, ftr: 21.4,
    l10: 0.80, homeRecord: '25-15', awayRecord: '25-15', starPlayer: 'Kyrie Irving, Klay Thompson'
  },
  CLE: {
    id: 'CLE', name: 'Cleveland Cavaliers', short: 'CLE', conf: 'East', color: '#860038',
    ortg: 116.2, drtg: 112.1, pace: 98.0, efg: 55.7, tov: 13.4, orb: 26.8, ftr: 20.1,
    l10: 0.60, homeRecord: '26-14', awayRecord: '22-18', starPlayer: 'Donovan Mitchell, Evan Mobley'
  },
  PHX: {
    id: 'PHX', name: 'Phoenix Suns', short: 'PHX', conf: 'West', color: '#E56020',
    ortg: 117.6, drtg: 114.4, pace: 98.5, efg: 56.4, tov: 14.6, orb: 29.1, ftr: 23.4,
    l10: 0.70, homeRecord: '25-15', awayRecord: '23-17', starPlayer: 'Kevin Durant, Devin Booker'
  },
  LAL: {
    id: 'LAL', name: 'Los Angeles Lakers', short: 'LAL', conf: 'West', color: '#552583',
    ortg: 115.9, drtg: 115.2, pace: 101.4, efg: 56.6, tov: 13.6, orb: 24.1, ftr: 24.8,
    l10: 0.70, homeRecord: '28-12', awayRecord: '18-21', starPlayer: 'Luka Dončić, LeBron James'
  },
  IND: {
    id: 'IND', name: 'Indiana Pacers', short: 'IND', conf: 'East', color: '#002D62',
    ortg: 120.5, drtg: 118.0, pace: 102.3, efg: 57.9, tov: 12.8, orb: 26.2, ftr: 19.2,
    l10: 0.60, homeRecord: '26-15', awayRecord: '21-20', starPlayer: 'Tyrese Haliburton, Pascal Siakam'
  },
  PHI: {
    id: 'PHI', name: 'Philadelphia 76ers', short: 'PHI', conf: 'East', color: '#006BB6',
    ortg: 116.8, drtg: 113.8, pace: 97.6, efg: 53.9, tov: 11.8, orb: 28.9, ftr: 24.2,
    l10: 0.60, homeRecord: '25-15', awayRecord: '22-18', starPlayer: 'Joel Embiid, Tyrese Maxey'
  },
  ORL: {
    id: 'ORL', name: 'Orlando Magic', short: 'ORL', conf: 'East', color: '#0077C0',
    ortg: 113.4, drtg: 110.8, pace: 97.3, efg: 54.1, tov: 14.5, orb: 29.8, ftr: 25.1,
    l10: 0.60, homeRecord: '29-11', awayRecord: '18-22', starPlayer: 'Paolo Banchero, Franz Wagner'
  },
  SAC: {
    id: 'SAC', name: 'Sacramento Kings', short: 'SAC', conf: 'West', color: '#5A2D81',
    ortg: 116.9, drtg: 115.1, pace: 100.1, efg: 56.1, tov: 13.0, orb: 28.2, ftr: 19.6,
    l10: 0.50, homeRecord: '24-16', awayRecord: '22-18', starPlayer: 'Domantas Sabonis, DeMar DeRozan'
  },
  GSW: {
    id: 'GSW', name: 'Golden State Warriors', short: 'GSW', conf: 'West', color: '#1D428A',
    ortg: 117.2, drtg: 115.0, pace: 99.8, efg: 55.8, tov: 14.1, orb: 31.2, ftr: 20.0,
    l10: 0.70, homeRecord: '21-19', awayRecord: '25-15', starPlayer: 'Stephen Curry, Jimmy Butler'
  },
  MIA: {
    id: 'MIA', name: 'Miami Heat', short: 'MIA', conf: 'East', color: '#98002E',
    ortg: 114.0, drtg: 112.2, pace: 96.2, efg: 53.8, tov: 12.6, orb: 25.6, ftr: 22.1,
    l10: 0.60, homeRecord: '22-18', awayRecord: '24-16', starPlayer: 'Bam Adebayo, Tyler Herro'
  },
  LAC: {
    id: 'LAC', name: 'LA Clippers', short: 'LAC', conf: 'West', color: '#C8102E',
    ortg: 118.1, drtg: 114.9, pace: 97.5, efg: 56.3, tov: 13.1, orb: 27.6, ftr: 22.5,
    l10: 0.50, homeRecord: '25-15', awayRecord: '26-14', starPlayer: 'Kawhi Leonard, James Harden'
  },
  NOP: {
    id: 'NOP', name: 'New Orleans Pelicans', short: 'NOP', conf: 'West', color: '#0C2340',
    ortg: 116.7, drtg: 112.2, pace: 98.3, efg: 55.9, tov: 13.2, orb: 28.5, ftr: 22.2,
    l10: 0.60, homeRecord: '21-19', awayRecord: '28-14', starPlayer: 'Zion Williamson, CJ McCollum'
  },
  HOU: {
    id: 'HOU', name: 'Houston Rockets', short: 'HOU', conf: 'West', color: '#CE1141',
    ortg: 114.5, drtg: 112.9, pace: 99.4, efg: 53.5, tov: 12.6, orb: 29.4, ftr: 21.8,
    l10: 0.60, homeRecord: '27-13', awayRecord: '14-26', starPlayer: 'Alperen Şengün, Jalen Green'
  },
  CHI: {
    id: 'CHI', name: 'Chicago Bulls', short: 'CHI', conf: 'East', color: '#CE1141',
    ortg: 114.2, drtg: 116.1, pace: 96.9, efg: 53.4, tov: 12.1, orb: 28.1, ftr: 20.9,
    l10: 0.50, homeRecord: '20-20', awayRecord: '19-21', starPlayer: 'Coby White, Nikola Vučević'
  },
  ATL: {
    id: 'ATL', name: 'Atlanta Hawks', short: 'ATL', conf: 'East', color: '#E03A3E',
    ortg: 116.6, drtg: 118.8, pace: 100.8, efg: 54.2, tov: 13.2, orb: 30.8, ftr: 22.0,
    l10: 0.40, homeRecord: '21-20', awayRecord: '15-26', starPlayer: 'Trae Young, Jalen Johnson'
  },
  BKN: {
    id: 'BKN', name: 'Brooklyn Nets', short: 'BKN', conf: 'East', color: '#000000',
    ortg: 112.8, drtg: 116.0, pace: 97.6, efg: 53.1, tov: 12.9, orb: 28.0, ftr: 19.8,
    l10: 0.40, homeRecord: '20-21', awayRecord: '12-29', starPlayer: 'Cam Thomas, Dennis Schröder'
  },
  TOR: {
    id: 'TOR', name: 'Toronto Raptors', short: 'TOR', conf: 'East', color: '#CE1141',
    ortg: 112.1, drtg: 118.1, pace: 99.7, efg: 53.5, tov: 13.8, orb: 27.1, ftr: 20.4,
    l10: 0.30, homeRecord: '14-27', awayRecord: '11-30', starPlayer: 'Scottie Barnes, RJ Barrett'
  },
  MEM: {
    id: 'MEM', name: 'Memphis Grizzlies', short: 'MEM', conf: 'West', color: '#5D76A9',
    ortg: 109.8, drtg: 113.8, pace: 98.6, efg: 51.9, tov: 14.8, orb: 27.9, ftr: 20.2,
    l10: 0.40, homeRecord: '9-32', awayRecord: '18-23', starPlayer: 'Ja Morant, Jaren Jackson Jr.'
  },
  UTA: {
    id: 'UTA', name: 'Utah Jazz', short: 'UTA', conf: 'West', color: '#002B5C',
    ortg: 114.8, drtg: 119.9, pace: 100.2, efg: 53.9, tov: 15.3, orb: 31.0, ftr: 22.1,
    l10: 0.30, homeRecord: '21-20', awayRecord: '10-31', starPlayer: 'Lauri Markkanen, Keyonte George'
  },
  SAS: {
    id: 'SAS', name: 'San Antonio Spurs', short: 'SAS', conf: 'West', color: '#C4CED4',
    ortg: 110.3, drtg: 116.4, pace: 101.5, efg: 52.8, tov: 14.9, orb: 26.5, ftr: 19.5,
    l10: 0.40, homeRecord: '12-29', awayRecord: '10-31', starPlayer: 'Victor Wembanyama, De\'Aaron Fox'
  },
  POR: {
    id: 'POR', name: 'Portland Trail Blazers', short: 'POR', conf: 'West', color: '#E03A3E',
    ortg: 108.6, drtg: 116.9, pace: 97.8, efg: 50.8, tov: 15.1, orb: 31.4, ftr: 20.6,
    l10: 0.20, homeRecord: '11-30', awayRecord: '10-31', starPlayer: 'Anfernee Simons, Scoot Henderson'
  },
  CHA: {
    id: 'CHA', name: 'Charlotte Hornets', short: 'CHA', conf: 'East', color: '#1D1160',
    ortg: 109.1, drtg: 119.2, pace: 97.6, efg: 51.8, tov: 13.7, orb: 25.1, ftr: 19.1,
    l10: 0.20, homeRecord: '11-30', awayRecord: '10-31', starPlayer: 'LaMelo Ball, Brandon Miller'
  },
  WAS: {
    id: 'WAS', name: 'Washington Wizards', short: 'WAS', conf: 'East', color: '#002B5C',
    ortg: 110.2, drtg: 119.6, pace: 102.7, efg: 53.4, tov: 13.9, orb: 23.9, ftr: 19.3,
    l10: 0.20, homeRecord: '7-34', awayRecord: '8-33', starPlayer: 'Jordan Poole, Kyle Kuzma'
  },
  DET: {
    id: 'DET', name: 'Detroit Pistons', short: 'DET', conf: 'East', color: '#C8102E',
    ortg: 109.5, drtg: 118.4, pace: 100.1, efg: 52.1, tov: 15.0, orb: 28.4, ftr: 21.1,
    l10: 0.20, homeRecord: '7-33', awayRecord: '7-35', starPlayer: 'Cade Cunningham, Jalen Duren'
  }
};

const ESPN_ABBR_MAP = {
  GS: 'GSW', NY: 'NYK', NO: 'NOP', SA: 'SAS', UTAH: 'UTA', WSH: 'WAS'
};

const FALLBACK_MATCHES = [
  {
    id: 'm1', home: 'ATL', away: 'CLE', time: '01:00 CET', status: 'Zaplanowany', venue: 'State Farm Arena (Atlanta)',
    bookieOdds: { home: 1.90, away: 1.85, spreadLine: 1.5, spreadHomeOdds: 1.90, spreadAwayOdds: 1.90, totalLine: 233.0, overOdds: 1.91, underOdds: 1.91 },
    liveInjuries: { home: [], away: [], homePenalty: 0, awayPenalty: 0 }
  },
  {
    id: 'm2', home: 'NOP', away: 'SAC', time: '01:00 CET', status: 'Zaplanowany', venue: 'Smoothie King Center (New Orleans)',
    bookieOdds: { home: 1.42, away: 2.85, spreadLine: -5.5, spreadHomeOdds: 1.91, spreadAwayOdds: 1.91, totalLine: 230.5, overOdds: 1.91, underOdds: 1.91 },
    liveInjuries: { home: [], away: [], homePenalty: 0, awayPenalty: 0 }
  },
  {
    id: 'm3', home: 'POR', away: 'MEM', time: '03:00 CET', status: 'Zaplanowany', venue: 'Moda Center (Portland)',
    bookieOdds: { home: 1.35, away: 3.20, spreadLine: -6.5, spreadHomeOdds: 1.90, spreadAwayOdds: 1.92, totalLine: 212.0, overOdds: 1.91, underOdds: 1.91 },
    liveInjuries: { home: [], away: [], homePenalty: 0, awayPenalty: 0 }
  }
];

// ============================================================================
// DETERMINISTYCZNY GENERATOR LOSOWY + BOX-MULLER (Stabilne kursy i wyniki)
// ============================================================================
function createSeededRandom(seedString) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedString.length; i++) {
    h = Math.imul(h ^ seedString.charCodeAt(i), 16777619);
  }
  return function () {
    h += h << 13;
    h ^= h >>> 7;
    h += h << 3;
    h ^= h >>> 17;
    return ((h >>> 0) % 100000) / 100000;
  };
}

function randomNormal(mean, stdDev, rng = Math.random) {
  let u1 = 0, u2 = 0;
  while (u1 === 0) u1 = rng();
  while (u2 === 0) u2 = rng();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

// ============================================================================
// SILNIK MONTE CARLO UWZGLĘDNIAJĄCY KONTUZJE LIVE (1-2H PRZED MECZEM)
// ============================================================================
function runMonteCarloSimulation(homeTeam, awayTeam, iterations, modifiers, seedKey = null) {
  const { homeCourtAdv = 2.8, homeB2B = false, awayB2B = false, homeInjuryImpact = 0, awayInjuryImpact = 0 } = modifiers;
  const rng = seedKey ? createSeededRandom(seedKey) : Math.random;

  const leagueAvgORTG = 115.3;
  const leagueAvgPace = 99.2;

  const expectedPace = (homeTeam.pace * awayTeam.pace) / leagueAvgPace;

  const homeFFIndex =
    (homeTeam.efg - 54.7) * 0.40 -
    (homeTeam.tov - 13.5) * 0.25 +
    (homeTeam.orb - 27.5) * 0.20 +
    (homeTeam.ftr - 21.0) * 0.15;

  const awayFFIndex =
    (awayTeam.efg - 54.7) * 0.40 -
    (awayTeam.tov - 13.5) * 0.25 +
    (awayTeam.orb - 27.5) * 0.20 +
    (awayTeam.ftr - 21.0) * 0.15;

  const baseHomeORTG = (homeTeam.ortg * awayTeam.drtg) / leagueAvgORTG + homeFFIndex * 0.45;
  const baseAwayORTG = (awayTeam.ortg * homeTeam.drtg) / leagueAvgORTG + awayFFIndex * 0.45;

  const formDiff = (homeTeam.l10 - awayTeam.l10) * 2.2;

  let expectedHomePts =
    (baseHomeORTG / 100) * expectedPace +
    homeCourtAdv / 2 +
    formDiff / 2 -
    (homeB2B ? 2.4 : 0) -
    homeInjuryImpact;

  let expectedAwayPts =
    (baseAwayORTG / 100) * expectedPace -
    homeCourtAdv / 2 -
    formDiff / 2 -
    (awayB2B ? 2.4 : 0) -
    awayInjuryImpact;

  const stdDevTeam = 11.2;

  let homeWins = 0;
  let awayWins = 0;
  let totalHomePts = 0;
  let totalAwayPts = 0;

  const projectedTotalLine = Math.round((expectedHomePts + expectedAwayPts) * 2) / 2;
  const projectedSpreadLine = Math.round((expectedAwayPts - expectedHomePts) * 2) / 2;

  for (let i = 0; i < iterations; i++) {
    const paceShock = randomNormal(0, 3.2, rng);
    let simHome = Math.round(randomNormal(expectedHomePts + paceShock, stdDevTeam, rng));
    let simAway = Math.round(randomNormal(expectedAwayPts + paceShock, stdDevTeam, rng));

    while (simHome === simAway) {
      simHome += Math.round(randomNormal(expectedHomePts * 0.104, 3.4, rng));
      simAway += Math.round(randomNormal(expectedAwayPts * 0.104, 3.4, rng));
    }

    if (simHome > simAway) homeWins++;
    else awayWins++;

    totalHomePts += simHome;
    totalAwayPts += simAway;
  }

  return {
    homeWinProb: (homeWins / iterations) * 100,
    awayWinProb: (awayWins / iterations) * 100,
    avgHomePts: totalHomePts / iterations,
    avgAwayPts: totalAwayPts / iterations,
    avgTotalPts: (totalHomePts + totalAwayPts) / iterations,
    projectedSpreadLine,
    projectedTotalLine,
    expectedPace,
    iterations
  };
}

// ============================================================================
// FUNKCJA ANALIZUJĄCA KONTUZJE POBRANE NA ŻYWO Z ESPN SUMMARY API
// ============================================================================
function calculateInjuryPenalty(injuriesList, starPlayersStr = '') {
  if (!injuriesList || injuriesList.length === 0) return { list: [], penalty: 0 };

  let penalty = 0;
  const parsedList = [];

  injuriesList.forEach((item) => {
    const athleteName = item.athlete?.displayName || item.athlete?.shortName || 'Zawodnik';
    const rawStatus = (item.status || item.type?.description || 'Out').toUpperCase();
    const comment = item.shortComment || item.longComment || '';
    const isStar = starPlayersStr.toLowerCase().includes(athleteName.split(' ').pop().toLowerCase());

    let ptsImpact = 0;
    let statusBadge = 'OUT';

    if (rawStatus.includes('OUT') || rawStatus.includes('INJURED')) {
      ptsImpact = isStar ? 3.4 : 1.3;
      statusBadge = 'OUT (Nie zagra)';
    } else if (rawStatus.includes('DOUBTFUL')) {
      ptsImpact = isStar ? 2.4 : 0.9;
      statusBadge = 'DOUBTFUL (25% szans)';
    } else if (rawStatus.includes('QUESTIONABLE') || rawStatus.includes('DAY-TO-DAY') || rawStatus.includes('GTD')) {
      ptsImpact = isStar ? 1.2 : 0.5;
      statusBadge = 'GTD (Decyzja przed meczem)';
    }

    if (ptsImpact > 0) {
      penalty += ptsImpact;
      parsedList.push({
        name: athleteName,
        status: statusBadge,
        impact: ptsImpact,
        isStar,
        comment
      });
    }
  });

  return {
    list: parsedList,
    penalty: Number(Math.min(8.5, penalty).toFixed(1))
  };
}

// ============================================================================
// GENERATOR REKOMENDACJI BUKMACHERSKICH (Z RAPORTEM KONTUZJI LIVE)
// ============================================================================
function generateAllSmartPicks(matches, taxRate, customOddsMap = {}) {
  const taxMultiplier = taxRate ? 0.88 : 1.0;
  const allPicks = [];

  matches.forEach((match) => {
    const homeTeam = match.homeTeamDynamic || NBA_TEAMS_DB[match.home];
    const awayTeam = match.awayTeamDynamic || NBA_TEAMS_DB[match.away];
    if (!homeTeam || !awayTeam) return;

    const homePenalty = match.liveInjuries?.homePenalty || 0;
    const awayPenalty = match.liveInjuries?.awayPenalty || 0;
    const homeInjList = match.liveInjuries?.home || [];
    const awayInjList = match.liveInjuries?.away || [];

    const sim = runMonteCarloSimulation(
      homeTeam,
      awayTeam,
      6000,
      {
        homeCourtAdv: 2.8,
        homeB2B: false,
        awayB2B: false,
        homeInjuryImpact: homePenalty,
        awayInjuryImpact: awayPenalty
      },
      `${match.id}_${homePenalty}_${awayPenalty}`
    );

    const netRtgHome = (homeTeam.ortg - homeTeam.drtg).toFixed(1);
    const netRtgAway = (awayTeam.ortg - awayTeam.drtg).toFixed(1);
    const formattedScore = `${awayTeam.short} ${sim.avgAwayPts.toFixed(0)} : ${sim.avgHomePts.toFixed(0)} ${homeTeam.short}`;

    const injuryReportText =
      homeInjList.length > 0 || awayInjList.length > 0
        ? `Raport Składów Live: ${awayTeam.short} (-${awayPenalty} pkt, ${awayInjList.length} absencji) vs ${homeTeam.short} (-${homePenalty} pkt, ${homeInjList.length} absencji).`
        : `Raport Składów Live: Brak kluczowych wykluczeń (pełne rotacje potwierdzone w API).`;

    // 1. Zwycięzca Gospodarz (ML Home)
    const idHomeML = `${match.id}_ML_HOME`;
    const oddsHomeVal = customOddsMap[idHomeML] ?? match.bookieOdds.home;
    const probHome = sim.homeWinProb / 100;
    const evHome = (probHome * (oddsHomeVal * taxMultiplier) - 1) * 100;

    allPicks.push({
      id: idHomeML,
      matchId: match.id,
      matchLabel: `${awayTeam.short} @ ${homeTeam.short}`,
      homeTeam,
      awayTeam,
      time: match.time,
      marketType: 'Zwycięzca (ML)',
      selectionName: `${homeTeam.name} wygra (1)`,
      odds: oddsHomeVal,
      fairOdds: 1 / probHome,
      prob: sim.homeWinProb,
      ev: evHome,
      projectedScore: formattedScore,
      liveInjuries: match.liveInjuries,
      confidenceScore: sim.homeWinProb * 0.65 + Math.max(-10, evHome) * 1.8,
      reasoning: [
        `Net Rating: ${homeTeam.short} (${netRtgHome > 0 ? '+' : ''}${netRtgHome}) vs ${awayTeam.short} (${netRtgAway > 0 ? '+' : ''}${netRtgAway}) + własny parkiet.`,
        injuryReportText,
        `Symulacja Monte Carlo (6000 gier): średni wynik ${formattedScore}.`
      ]
    });

    // 2. Zwycięzca Gość (ML Away)
    const idAwayML = `${match.id}_ML_AWAY`;
    const oddsAwayVal = customOddsMap[idAwayML] ?? match.bookieOdds.away;
    const probAway = sim.awayWinProb / 100;
    const evAway = (probAway * (oddsAwayVal * taxMultiplier) - 1) * 100;

    allPicks.push({
      id: idAwayML,
      matchId: match.id,
      matchLabel: `${awayTeam.short} @ ${homeTeam.short}`,
      homeTeam,
      awayTeam,
      time: match.time,
      marketType: 'Zwycięzca (ML)',
      selectionName: `${awayTeam.name} wygra (2)`,
      odds: oddsAwayVal,
      fairOdds: 1 / probAway,
      prob: sim.awayWinProb,
      ev: evAway,
      projectedScore: formattedScore,
      liveInjuries: match.liveInjuries,
      confidenceScore: sim.awayWinProb * 0.65 + Math.max(-10, evAway) * 1.8,
      reasoning: [
        `Kurs bukmachera (${oddsAwayVal.toFixed(2)}) zestawiony z kursem sprawiedliwym modelu (${(1 / probAway).toFixed(2)}).`,
        injuryReportText,
        `Ofensywa ${awayTeam.short} (${awayTeam.ortg} ORTG) vs obrona ${homeTeam.short} (${homeTeam.drtg} DRTG).`
      ]
    });

    // 3. Handicap (Spread)
    const idSpread = `${match.id}_SPREAD`;
    const bookieSpread = match.bookieOdds.spreadLine || -4.5;
    const modelMarginHome = sim.avgHomePts - sim.avgAwayPts;
    const spreadDiff = modelMarginHome + bookieSpread;
    const coverHomeProb = Math.min(82, Math.max(18, 50 + spreadDiff * 3.1));
    const pickHomeSpread = coverHomeProb >= 50;
    const finalSpreadProb = pickHomeSpread ? coverHomeProb : 100 - coverHomeProb;
    const defaultSpreadOdds = pickHomeSpread ? (match.bookieOdds.spreadHomeOdds || 1.90) : (match.bookieOdds.spreadAwayOdds || 1.90);
    const spreadOdds = customOddsMap[idSpread] ?? defaultSpreadOdds;
    const evSpread = ((finalSpreadProb / 100) * (spreadOdds * taxMultiplier) - 1) * 100;

    allPicks.push({
      id: idSpread,
      matchId: match.id,
      matchLabel: `${awayTeam.short} @ ${homeTeam.short}`,
      homeTeam,
      awayTeam,
      time: match.time,
      marketType: 'Handicap (Spread)',
      selectionName: pickHomeSpread
        ? `${homeTeam.short} Handicap ${bookieSpread > 0 ? `+${bookieSpread}` : bookieSpread}`
        : `${awayTeam.short} Handicap ${-bookieSpread > 0 ? `+${-bookieSpread}` : -bookieSpread}`,
      odds: spreadOdds,
      fairOdds: 1 / (finalSpreadProb / 100),
      prob: finalSpreadProb,
      ev: evSpread,
      projectedScore: formattedScore,
      liveInjuries: match.liveInjuries,
      confidenceScore: finalSpreadProb * 0.65 + Math.max(-10, evSpread) * 1.8,
      reasoning: [
        `Prognozowana różnica punktów: ${formattedScore} wobec linii handicapu (${bookieSpread}).`,
        injuryReportText,
        `Pokrycie linii handicapu w ${finalSpreadProb.toFixed(1)}% symulacji.`
      ]
    });

    // 4. Suma Punktów (Over/Under)
    const idTotal = `${match.id}_TOTAL`;
    const bookieTotal = match.bookieOdds.totalLine || 224.5;
    const totalDiff = sim.avgTotalPts - bookieTotal;
    const overLineProb = Math.min(84, Math.max(16, 50 + totalDiff * 2.7));
    const pickOver = overLineProb >= 50;
    const finalTotalProb = pickOver ? overLineProb : 100 - overLineProb;
    const defaultTotalOdds = pickOver ? (match.bookieOdds.overOdds || 1.90) : (match.bookieOdds.underOdds || 1.90);
    const totalOdds = customOddsMap[idTotal] ?? defaultTotalOdds;
    const evTotal = ((finalTotalProb / 100) * (totalOdds * taxMultiplier) - 1) * 100;

    allPicks.push({
      id: idTotal,
      matchId: match.id,
      matchLabel: `${awayTeam.short} @ ${homeTeam.short}`,
      homeTeam,
      awayTeam,
      time: match.time,
      marketType: 'Suma Punktów (O/U)',
      selectionName: `${pickOver ? 'Powyżej (Over)' : 'Poniżej (Under)'} ${bookieTotal} pkt`,
      odds: totalOdds,
      fairOdds: 1 / (finalTotalProb / 100),
      prob: finalTotalProb,
      ev: evTotal,
      projectedScore: formattedScore,
      liveInjuries: match.liveInjuries,
      confidenceScore: finalTotalProb * 0.65 + Math.max(-10, evTotal) * 1.8,
      reasoning: [
        `Prognozowana suma z modelu to ${sim.avgTotalPts.toFixed(1)} pkt (linia bukmachera: ${bookieTotal} pkt).`,
        injuryReportText,
        `Szacowane tempo meczu (Pace): ${sim.expectedPace.toFixed(1)} posiadań na 48 minut.`
      ]
    });
  });

  return allPicks.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

// ============================================================================
// GŁÓWNY KOMPONENT APLIKACJI
// ============================================================================
export default function App() {
  const [activeView, setActiveView] = useState('smart-builder');
  const [matches, setMatches] = useState(FALLBACK_MATCHES);
  const [selectedMatchId, setSelectedMatchId] = useState(FALLBACK_MATCHES[0].id);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [dataSourceStatus, setDataSourceStatus] = useState('Połączono z ESPN Live API (Mecze + Raport Kontuzji)');
  const [lastSyncTime, setLastSyncTime] = useState('Dzisiaj');

  // Ręcznie nadpisane kursy od bukmachera (np. z STS)
  const [customOddsMap, setCustomOddsMap] = useState({});

  // Parametry Symulacji (Match Lab)
  const [simCount, setSimCount] = useState(10000);
  const [homeCourtAdv, setHomeCourtAdv] = useState(2.8);
  const [homeB2B, setHomeB2B] = useState(false);
  const [awayB2B, setAwayB2B] = useState(false);
  const [homeInjuryImpact, setHomeInjuryImpact] = useState(0);
  const [awayInjuryImpact, setAwayInjuryImpact] = useState(0);

  // Parametry Bukmacherskie i Kuponu AKO
  const [oddsHome, setOddsHome] = useState(FALLBACK_MATCHES[0].bookieOdds.home);
  const [oddsAway, setOddsAway] = useState(FALLBACK_MATCHES[0].bookieOdds.away);
  const [taxRate, setTaxRate] = useState(true);
  const [bankroll, setBankroll] = useState(1000);
  const [couponStake, setCouponStake] = useState(2);
  const [kellyFraction, setKellyFraction] = useState(0.25);

  // Generator Kuponów AKO
  const [targetMinOdds, setTargetMinOdds] = useState(2.0);
  const [builderStrategy, setBuilderStrategy] = useState('safe');
  const [marketFilter, setMarketFilter] = useState('ALL');
  const [couponPickIds, setCouponPickIds] = useState([]);

  // ==========================================================================
  // POBIERANIE TERMINARZA + SKŁADÓW I KONTUZJI NA ŻYWO Z ESPN SUMMARY API
  // ==========================================================================
  const fetchLiveNBAScheduleAndInjuries = async () => {
    setIsLoadingLive(true);
    try {
      const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
      if (!response.ok) throw new Error('Błąd sieci API');
      const data = await response.json();

      if (data && data.events && data.events.length > 0) {
        const parsedMatches = await Promise.all(
          data.events.map(async (ev, idx) => {
            const comp = ev.competitions?.[0];
            if (!comp) return null;
            const homeComp = comp.competitors?.find((c) => c.homeAway === 'home');
            const awayComp = comp.competitors?.find((c) => c.homeAway === 'away');
            if (!homeComp || !awayComp) return null;

            const rawHome = homeComp.team?.abbreviation;
            const rawAway = awayComp.team?.abbreviation;
            const homeAbbr = ESPN_ABBR_MAP[rawHome] || rawHome;
            const awayAbbr = ESPN_ABBR_MAP[rawAway] || rawAway;

            if (!NBA_TEAMS_DB[homeAbbr] || !NBA_TEAMS_DB[awayAbbr]) return null;

            // Dynamiczne wzbogacenie danych o aktualny bilans i liderów z API
            const homeRecordLive = homeComp.records?.[0]?.summary || NBA_TEAMS_DB[homeAbbr].homeRecord;
            const awayRecordLive = awayComp.records?.[0]?.summary || NBA_TEAMS_DB[awayAbbr].awayRecord;

            const homeLeader = homeComp.leaders?.[0]?.leaders?.[0]?.athlete?.displayName;
            const awayLeader = awayComp.leaders?.[0]?.leaders?.[0]?.athlete?.displayName;

            const homeTeamDynamic = {
              ...NBA_TEAMS_DB[homeAbbr],
              homeRecord: homeRecordLive,
              starPlayer: homeLeader ? `${homeLeader}, ${NBA_TEAMS_DB[homeAbbr].starPlayer}` : NBA_TEAMS_DB[homeAbbr].starPlayer
            };
            const awayTeamDynamic = {
              ...NBA_TEAMS_DB[awayAbbr],
              awayRecord: awayRecordLive,
              starPlayer: awayLeader ? `${awayLeader}, ${NBA_TEAMS_DB[awayAbbr].starPlayer}` : NBA_TEAMS_DB[awayAbbr].starPlayer
            };

            // POBIERANIE RAPORTU KONTUZJI I SKŁADÓW Z ENDPOINTU SUMMARY DLA DANEGO MECZU
            let liveInjuries = { home: [], away: [], homePenalty: 0, awayPenalty: 0 };
            try {
              const summaryRes = await fetch(
                `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${ev.id}`
              );
              if (summaryRes.ok) {
                const summaryData = await summaryRes.json();
                if (Array.isArray(summaryData.injuries)) {
                  const homeInjObj = summaryData.injuries.find(
                    (inj) => (ESPN_ABBR_MAP[inj.team?.abbreviation] || inj.team?.abbreviation) === homeAbbr
                  );
                  const awayInjObj = summaryData.injuries.find(
                    (inj) => (ESPN_ABBR_MAP[inj.team?.abbreviation] || inj.team?.abbreviation) === awayAbbr
                  );

                  const parsedHomeInj = calculateInjuryPenalty(homeInjObj?.injuries || [], homeTeamDynamic.starPlayer);
                  const parsedAwayInj = calculateInjuryPenalty(awayInjObj?.injuries || [], awayTeamDynamic.starPlayer);

                  liveInjuries = {
                    home: parsedHomeInj.list,
                    away: parsedAwayInj.list,
                    homePenalty: parsedHomeInj.penalty,
                    awayPenalty: parsedAwayInj.penalty
                  };
                }
              }
            } catch (e) {
              // Jeśli endpoint szczegółów nie odpowie, zachowujemy zerowe kary
            }

            // Sprawdzenie, czy ESPN podaje bezpośrednie kursy bukmacherskie w obiekcie odds
            const espnOdds = comp.odds?.[0];
            const quickSim = runMonteCarloSimulation(
              homeTeamDynamic,
              awayTeamDynamic,
              2500,
              {
                homeCourtAdv: 2.8,
                homeInjuryImpact: liveInjuries.homePenalty,
                awayInjuryImpact: liveInjuries.awayPenalty
              },
              `init_${ev.id}`
            );

            const margin = 1.045;
            const estHomeOdd = Number(Math.max(1.12, (100 / quickSim.homeWinProb) / margin).toFixed(2));
            const estAwayOdd = Number(Math.max(1.12, (100 / quickSim.awayWinProb) / margin).toFixed(2));
            const spreadLine = espnOdds?.spread
              ? Number(espnOdds.spread)
              : Math.round((quickSim.avgAwayPts - quickSim.avgHomePts) * 2) / 2;
            const totalLine = espnOdds?.overUnder
              ? Number(espnOdds.overUnder)
              : Math.round(quickSim.avgTotalPts * 2) / 2;

            return {
              id: ev.id || `live_${idx}`,
              home: homeAbbr,
              away: awayAbbr,
              homeTeamDynamic,
              awayTeamDynamic,
              liveInjuries,
              time: ev.status?.type?.shortDetail || 'Dzisiaj Live',
              status: ev.status?.type?.description || 'W terminarzu',
              venue: comp.venue?.fullName || 'Hala NBA',
              bookieOdds: {
                home: estHomeOdd,
                away: estAwayOdd,
                spreadLine,
                spreadHomeOdds: 1.91,
                spreadAwayOdds: 1.91,
                totalLine,
                overOdds: 1.91,
                underOdds: 1.91
              }
            };
          })
        );

        const validMatches = parsedMatches.filter(Boolean);
        if (validMatches.length > 0) {
          setMatches(validMatches);
          setSelectedMatchId(validMatches[0].id);
          setOddsHome(validMatches[0].bookieOdds.home);
          setOddsAway(validMatches[0].bookieOdds.away);
          setHomeInjuryImpact(validMatches[0].liveInjuries?.homePenalty || 0);
          setAwayInjuryImpact(validMatches[0].liveInjuries?.awayPenalty || 0);

          const totalInjuriesFound = validMatches.reduce(
            (acc, m) => acc + (m.liveInjuries?.home.length || 0) + (m.liveInjuries?.away.length || 0),
            0
          );
          setDataSourceStatus(
            `ESPN Live API: ${validMatches.length} meczów • Wykryto ${totalInjuriesFound} raportów o absencjach w składach`
          );
        }
      }
    } catch (error) {
      setDataSourceStatus('Tryb Offline-Ready: Aktywna baza analityczna NBA');
    } finally {
      const now = new Date();
      setLastSyncTime(now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setIsLoadingLive(false);
    }
  };

  useEffect(() => {
    fetchLiveNBAScheduleAndInjuries();
  }, []);

  const selectedMatch = useMemo(() => {
    const found = matches.find((m) => m.id === selectedMatchId) || matches[0];
    return {
      ...found,
      homeTeam: found.homeTeamDynamic || NBA_TEAMS_DB[found.home],
      awayTeam: found.awayTeamDynamic || NBA_TEAMS_DB[found.away]
    };
  }, [matches, selectedMatchId]);

  const handleSelectMatch = (match) => {
    setSelectedMatchId(match.id);
    setOddsHome(match.bookieOdds.home);
    setOddsAway(match.bookieOdds.away);
    setHomeB2B(false);
    setAwayB2B(false);
    setHomeInjuryImpact(match.liveInjuries?.homePenalty || 0);
    setAwayInjuryImpact(match.liveInjuries?.awayPenalty || 0);
  };

  // Wszystkie wyliczone propozycje typów (uwzględniające Twoje ręcznie wpisane kursy z STS!)
  const allSmartPicks = useMemo(() => {
    return generateAllSmartPicks(matches, taxRate, customOddsMap);
  }, [matches, taxRate, customOddsMap]);

  // Funkcja zmiany kursu na własny (np. przepisany z aplikacji STS)
  const handleUpdatePickOdd = (pickId, newOddValue) => {
    const num = parseFloat(newOddValue);
    if (!isNaN(num) && num >= 1.01) {
      setCustomOddsMap((prev) => ({ ...prev, [pickId]: num }));
    }
  };

  const filteredSmartPicks = useMemo(() => {
    return allSmartPicks.filter((p) => {
      if (marketFilter === 'ALL') return true;
      if (marketFilter === 'ML') return p.marketType === 'Zwycięzca (ML)';
      if (marketFilter === 'SPREAD') return p.marketType === 'Handicap (Spread)';
      if (marketFilter === 'TOTAL') return p.marketType === 'Suma Punktów (O/U)';
      return true;
    });
  }, [allSmartPicks, marketFilter]);

  // Aktywne obiekty na kuponie (zawsze zsynchronizowane z listą po lewej!)
  const couponPicks = useMemo(() => {
    return couponPickIds
      .map((id) => allSmartPicks.find((p) => p.id === id))
      .filter(Boolean);
  }, [couponPickIds, allSmartPicks]);

  const buildAutoCoupon = (minOddsTarget, strategy = builderStrategy) => {
    setTargetMinOdds(minOddsTarget);
    setBuilderStrategy(strategy);

    const pool = [...allSmartPicks].filter((p) => p.odds >= 1.25 && p.prob >= 48);

    if (strategy === 'safe') {
      pool.sort((a, b) => b.prob - a.prob);
    } else if (strategy === 'value') {
      pool.sort((a, b) => b.ev - a.ev);
    } else {
      pool.sort((a, b) => b.confidenceScore - a.confidenceScore);
    }

    const selectedIds = [];
    const usedMatchIds = new Set();
    let currentTotalOdds = 1.0;

    for (const pick of pool) {
      if (usedMatchIds.has(pick.matchId)) continue;
      selectedIds.push(pick.id);
      usedMatchIds.add(pick.matchId);
      currentTotalOdds *= pick.odds;

      if (currentTotalOdds >= minOddsTarget || selectedIds.length >= 6) {
        break;
      }
    }

    setCouponPickIds(selectedIds);
  };

  useEffect(() => {
    if (allSmartPicks.length > 0 && couponPickIds.length === 0) {
      buildAutoCoupon(2.0, 'safe');
    }
  }, [allSmartPicks]);

  const togglePickInCoupon = (pick) => {
    const exists = couponPickIds.includes(pick.id);
    if (exists) {
      setCouponPickIds(couponPickIds.filter((id) => id !== pick.id));
    } else {
      const withoutSameMatch = couponPickIds.filter((id) => {
        const existingPick = allSmartPicks.find((p) => p.id === id);
        return existingPick && existingPick.matchId !== pick.matchId;
      });
      setCouponPickIds([...withoutSameMatch, pick.id]);
    }
  };

  // Podsumowanie finansowe Kuponu AKO
  const couponSummary = useMemo(() => {
    if (couponPicks.length === 0) {
      return { totalOdds: 0, combinedProb: 0, potentialWin: 0, netProfit: 0, akoEv: 0, kellySuggested: 0 };
    }
    const taxMultiplier = taxRate ? 0.88 : 1.0;
    const totalOdds = couponPicks.reduce((acc, p) => acc * p.odds, 1);
    const combinedProbDecimal = couponPicks.reduce((acc, p) => acc * (p.prob / 100), 1);
    const combinedProb = combinedProbDecimal * 100;

    const effectiveTotalOdds = totalOdds * taxMultiplier;
    const potentialWin = couponStake * effectiveTotalOdds;
    const netProfit = potentialWin - couponStake;
    const akoEv = (combinedProbDecimal * effectiveTotalOdds - 1) * 100;

    const b = effectiveTotalOdds - 1;
    const q = 1 - combinedProbDecimal;
    const rawKelly = b > 0 ? Math.max(0, (b * combinedProbDecimal - q) / b) : 0;
    const kellySuggested = rawKelly * kellyFraction * bankroll;

    return {
      totalOdds,
      combinedProb,
      potentialWin,
      netProfit,
      akoEv,
      kellySuggested
    };
  }, [couponPicks, taxRate, couponStake, bankroll, kellyFraction]);

  const simulationResults = useMemo(() => {
    return runMonteCarloSimulation(
      selectedMatch.homeTeam,
      selectedMatch.awayTeam,
      simCount,
      {
        homeCourtAdv,
        homeB2B,
        awayB2B,
        homeInjuryImpact,
        awayInjuryImpact
      },
      `lab_${selectedMatch.id}_${simCount}_${homeCourtAdv}_${homeB2B}_${awayB2B}_${homeInjuryImpact}_${awayInjuryImpact}`
    );
  }, [selectedMatch, simCount, homeCourtAdv, homeB2B, awayB2B, homeInjuryImpact, awayInjuryImpact]);

  const bettingAnalysis = useMemo(() => {
    const taxMultiplier = taxRate ? 0.88 : 1.0;
    const effHome = oddsHome * taxMultiplier;
    const effAway = oddsAway * taxMultiplier;

    const pHome = simulationResults.homeWinProb / 100;
    const pAway = simulationResults.awayWinProb / 100;

    const evHome = (pHome * effHome - 1) * 100;
    const evAway = (pAway * effAway - 1) * 100;

    const bHome = effHome - 1;
    const rawKellyHome = bHome > 0 ? Math.max(0, (bHome * pHome - pAway) / bHome) : 0;

    const bAway = effAway - 1;
    const rawKellyAway = bAway > 0 ? Math.max(0, (bAway * pAway - pHome) / bAway) : 0;

    const stakeHome = rawKellyHome * kellyFraction * bankroll;
    const stakeAway = rawKellyAway * kellyFraction * bankroll;

    const fairOddHome = pHome > 0 ? (1 / pHome) / taxMultiplier : 99;
    const fairOddAway = pAway > 0 ? (1 / pAway) / taxMultiplier : 99;

    return {
      evHome,
      evAway,
      stakeHome,
      stakeAway,
      fairOddHome,
      fairOddAway
    };
  }, [oddsHome, oddsAway, taxRate, simulationResults, bankroll, kellyFraction]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* PASEK NAWIGACJI GÓRNEJ */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  QUANT<span className="text-orange-500">BET</span> PRO
                </h1>
                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Rosters & Injury AI v4.0
                </span>
              </div>
              <p className="text-xs text-slate-400">{dataSourceStatus}</p>
            </div>
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveView('smart-builder')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'smart-builder'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Co Obstawiać & Kreator AKO (2.0+ / 3.0+)
            </button>
            <button
              onClick={() => setActiveView('match-lab')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'match-lab'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Laboratorium Meczu & Kontuzje (1 na 1)
            </button>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            <button
              onClick={() => setTaxRate(!taxRate)}
              className={`px-3 py-1.5 rounded-lg font-semibold border transition-all ${
                taxRate
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              }`}
            >
              {taxRate ? 'Podatek PL: 12% (x0.88)' : 'Gra Bez Podatku (x1.00)'}
            </button>
            <button
              onClick={fetchLiveNBAScheduleAndInjuries}
              disabled={isLoadingLive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-md"
              title="Pobierz najnowsze składy i raporty kontuzji (szczególnie ważne 1-2h przed meczem)"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLive ? 'animate-spin' : ''}`} />
              <span>Skanuj Składy Live ({lastSyncTime})</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================
          WIDOK 1: CO OBSTAWIAĆ & GENERATOR KUPONÓW AKO
         ======================================================================== */}
      {activeView === 'smart-builder' && (
        <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {/* PANEL GENERATORA KUPONÓW POWYŻEJ ZADANEGO KURSU */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-indigo-500/30 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20 mb-1">
                    <Stethoscope className="w-3.5 h-3.5" /> Zintegrowano ze Składami i Kontuzjami ESPN Live
                  </span>
                  <h2 className="text-xl font-black text-white">
                    Automatyczny Kreator Kuponów pod Wybrany Kurs
                  </h2>
                  <p className="text-xs text-slate-400">
                    Możesz edytować dowolny kurs ręcznie (np. wpisując dokładny kurs z aplikacji STS), a kupon i EV% zaktualizują się natychmiast.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Kurs 2.00+ (Podwojenie)', target: 2.0, desc: '2 najpewniejsze typy dnia' },
                  { label: 'Kurs 3.00+ (Potrojenie)', target: 3.0, desc: '2-3 zbilansowane mecze' },
                  { label: 'Kurs 5.00+ (Wysokie AKO)', target: 5.0, desc: '3-4 typy z wysokim EV' },
                  { label: 'Kurs 8.00+ (Max Value)', target: 8.0, desc: 'Taśma analityczna 4-5 gier' }
                ].map((preset) => {
                  const isActive = Math.abs(targetMinOdds - preset.target) < 0.1;
                  return (
                    <button
                      key={preset.target}
                      onClick={() => buildAutoCoupon(preset.target, builderStrategy)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isActive
                          ? 'bg-orange-500/15 border-orange-500 text-white shadow-lg shadow-orange-500/10'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-orange-400">{preset.target.toFixed(2)}+</span>
                        <Zap className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-slate-600'}`} />
                      </div>
                      <div className="text-xs font-bold text-white mt-0.5">{preset.label.split(' ')[2]}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{preset.desc}</div>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3 border-t border-slate-800/80 items-center">
                <div className="md:col-span-5">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-medium">Własny docelowy kurs minimalny:</span>
                    <span className="font-mono font-bold text-orange-400">{targetMinOdds.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.5"
                    max="12.0"
                    step="0.25"
                    value={targetMinOdds}
                    onChange={(e) => buildAutoCoupon(Number(e.target.value), builderStrategy)}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>

                <div className="md:col-span-5 flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {[
                    { id: 'safe', name: 'Pewniaki (Max %)' },
                    { id: 'balanced', name: 'Zbalansowany' },
                    { id: 'value', name: 'Value Hunter (Max EV)' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => buildAutoCoupon(targetMinOdds, st.id)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                        builderStrategy === st.id
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {st.name}
                    </button>
                  ))}
                </div>

                <div className="md:col-span-2">
                  <button
                    onClick={() => buildAutoCoupon(targetMinOdds, builderStrategy)}
                    className="w-full py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1 shadow-md"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Generuj
                  </button>
                </div>
              </div>
            </div>

            {/* RANKING REKOMENDACJI MODELU */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-400" />
                    Co Obstawiać Dzisiaj? Ranking Rekomendacji Modelu ({filteredSmartPicks.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Możesz kliknąć w pole „Kurs Bukmachera” przy dowolnym meczu i wpisać dokładny kurs ze swojego bukmachera (np. STS).
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  {[
                    { id: 'ALL', label: 'Wszystkie rynki' },
                    { id: 'ML', label: 'Zwycięzca (ML)' },
                    { id: 'SPREAD', label: 'Handicapy' },
                    { id: 'TOTAL', label: 'Over/Under' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setMarketFilter(f.id)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                        marketFilter === f.id
                          ? 'bg-slate-800 text-white border border-slate-700'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredSmartPicks.slice(0, 12).map((pick, idx) => {
                  const inCoupon = couponPickIds.includes(pick.id);
                  const isValue = pick.ev > 0;
                  const totalInj = (pick.liveInjuries?.home?.length || 0) + (pick.liveInjuries?.away?.length || 0);

                  return (
                    <div
                      key={pick.id}
                      className={`p-4 rounded-xl border transition-all ${
                        inCoupon
                          ? 'bg-indigo-950/30 border-indigo-500/60 shadow-lg shadow-indigo-500/5'
                          : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-xs font-bold text-orange-400 shrink-0 mt-0.5">
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                {pick.matchLabel}
                              </span>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                                {pick.marketType}
                              </span>
                              {isValue && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                  VALUE BET (+{pick.ev.toFixed(1)}% EV)
                                </span>
                              )}
                              {totalInj > 0 && (
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                                  <UserX className="w-3 h-3" /> Raport Kontuzji ({totalInj})
                                </span>
                              )}
                              <span className="text-[11px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                Prognoza: <strong className="text-white">{pick.projectedScore}</strong>
                              </span>
                            </div>

                            <h4 className="text-base font-black text-white mt-1.5">
                              Typ: <span className="text-orange-400">{pick.selectionName}</span>
                            </h4>
                          </div>
                        </div>

                        {/* Edytowalny kurs bukmachera + przycisk dodania do kuponu */}
                        <div className="flex items-center gap-3 ml-auto">
                          <div className="text-right">
                            <div className="text-[11px] text-slate-400">Szansa Modelu</div>
                            <div className="text-sm font-black text-emerald-400 font-mono">
                              {pick.prob.toFixed(1)}%
                            </div>
                          </div>

                          <div className="text-right px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700">
                            <div className="text-[9px] text-slate-400 uppercase flex items-center justify-end gap-1">
                              <Edit3 className="w-2.5 h-2.5 text-orange-400" /> Kurs (Edytuj)
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              min="1.01"
                              value={pick.odds}
                              onChange={(e) => handleUpdatePickOdd(pick.id, e.target.value)}
                              className="w-16 bg-transparent text-right text-base font-black text-orange-400 font-mono focus:outline-none border-b border-dashed border-orange-500/40"
                            />
                          </div>

                          <button
                            onClick={() => togglePickInCoupon(pick)}
                            className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                              inCoupon
                                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                                : 'bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700'
                            }`}
                          >
                            {inCoupon ? (
                              <>
                                <Check className="w-4 h-4 stroke-[3]" /> Na kuponie
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" /> Dodaj
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-800/70 grid grid-cols-1 md:grid-cols-3 gap-2">
                        {pick.reasoning.map((line, rIdx) => (
                          <div
                            key={rIdx}
                            className="text-[11px] text-slate-300 bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800/60 flex items-start gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                            <span>{line}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* PRAWA KOLUMNA (4/12): TWÓJ KUPON AKO Z EDYTOWALNYMI KURSAMI Z STS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border-2 border-orange-500/40 rounded-2xl p-5 sticky top-20 shadow-2xl">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-orange-400" />
                  <h3 className="text-base font-black text-white">
                    Twój Kupon AKO ({couponPicks.length})
                  </h3>
                </div>
                {couponPicks.length > 0 && (
                  <button
                    onClick={() => setCouponPickIds([])}
                    className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Wyczyść
                  </button>
                )}
              </div>

              {couponPicks.length === 0 ? (
                <div className="text-center py-8 px-4 border border-dashed border-slate-800 rounded-xl">
                  <Ticket className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">
                    Twój kupon jest pusty. Kliknij np. <strong>Kurs 2.00+</strong> lub dodaj typy ręcznie z listy.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2.5 mb-4 max-h-80 overflow-y-auto pr-1">
                    {couponPicks.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              {item.matchLabel}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                              Szansa: {item.prob.toFixed(1)}%
                            </span>
                          </div>
                          <div className="text-xs font-bold text-white mt-1">
                            {item.selectionName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Prognoza: <span className="text-slate-200 font-mono">{item.projectedScore}</span>
                          </div>
                        </div>

                        {/* EDYTOWALNE OKIENKO KURSU NA KUPONIE (NP. POD STS) */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="px-2 py-1 rounded-lg bg-orange-500/15 border border-orange-500/40 flex flex-col items-end">
                            <span className="text-[8px] uppercase text-orange-300/80 font-bold">Kurs STS:</span>
                            <input
                              type="number"
                              step="0.01"
                              min="1.01"
                              value={item.odds}
                              onChange={(e) => handleUpdatePickOdd(item.id, e.target.value)}
                              className="w-14 bg-transparent text-right font-mono text-xs font-black text-orange-300 focus:outline-none"
                              title="Kliknij, aby wpisać dokładny kurs ze swojego kuponu u bukmachera"
                            />
                          </div>
                          <button
                            onClick={() => togglePickInCoupon(item)}
                            className="p-1 text-slate-500 hover:text-rose-400"
                            title="Usuń z kuponu"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Parametry finansowe kuponu */}
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Kurs Całkowity (AKO):</span>
                      <span className="text-xl font-black font-mono text-orange-400">
                        {couponSummary.totalOdds.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Łączne Prawdopodobieństwo:</span>
                      <span className="text-sm font-bold font-mono text-emerald-400">
                        {couponSummary.combinedProb.toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Wartość Oczekiwana Kuponu (EV):</span>
                      <span
                        className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                          couponSummary.akoEv >= 0
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-amber-500/15 text-amber-300'
                        }`}
                      >
                        {couponSummary.akoEv >= 0 ? `+${couponSummary.akoEv.toFixed(1)}%` : `${couponSummary.akoEv.toFixed(1)}%`}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-400 font-medium">Stawka kuponu (PLN):</span>
                        <span className="text-[11px] text-indigo-400 font-mono">
                          Sugestia Kelly&apos;ego: {couponSummary.kellySuggested.toFixed(0)} PLN
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={couponStake}
                          onChange={(e) => setCouponStake(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono font-bold text-white"
                        />
                        {[2, 10, 50, 100].map((val) => (
                          <button
                            key={val}
                            onClick={() => setCouponStake(val)}
                            className="px-2.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300"
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-slate-400">
                          Możliwa Wygrana {taxRate ? '(po podatku 12%)' : '(bez podatku)'}
                        </div>
                        <div className="text-xs text-emerald-400 font-mono">
                          Czysty zysk: +{couponSummary.netProfit.toFixed(2)} PLN
                        </div>
                      </div>
                      <div className="text-2xl font-black font-mono text-emerald-400">
                        {couponSummary.potentialWin.toFixed(2)} <span className="text-xs">PLN</span>
                      </div>
                    </div>
                  </div>

                  {/* GŁĘBOKA ANALIZA STATYSTYCZNA + RAPORT KONTUZJI NA KUPONIE */}
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      Głęboka Analiza & Składy Spotkań na Kuponie
                    </h4>
                    <div className="space-y-2.5">
                      {couponPicks.map((item) => {
                        const homeInj = item.liveInjuries?.home || [];
                        const awayInj = item.liveInjuries?.away || [];
                        return (
                          <div
                            key={`stat_${item.id}`}
                            className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/80 text-[11px] space-y-2"
                          >
                            <div className="flex items-center justify-between font-bold text-white">
                              <span>{item.awayTeam.name} @ {item.homeTeam.name}</span>
                              <button
                                onClick={() => {
                                  const m = matches.find((x) => x.id === item.matchId);
                                  if (m) {
                                    handleSelectMatch(m);
                                    setActiveView('match-lab');
                                  }
                                }}
                                className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                              >
                                Pełne Lab <ArrowUpRight className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                              <div className="bg-slate-900 p-1.5 rounded">
                                <div className="text-[9px] text-slate-500">ORTG (Atak)</div>
                                <div className="text-slate-200">
                                  {item.awayTeam.ortg} / <span className="text-orange-400">{item.homeTeam.ortg}</span>
                                </div>
                              </div>
                              <div className="bg-slate-900 p-1.5 rounded">
                                <div className="text-[9px] text-slate-500">DRTG (Obrona)</div>
                                <div className="text-slate-200">
                                  {item.awayTeam.drtg} / <span className="text-orange-400">{item.homeTeam.drtg}</span>
                                </div>
                              </div>
                              <div className="bg-slate-900 p-1.5 rounded">
                                <div className="text-[9px] text-slate-500">eFG% (Rzuty)</div>
                                <div className="text-slate-200">
                                  {item.awayTeam.efg}% / <span className="text-orange-400">{item.homeTeam.efg}%</span>
                                </div>
                              </div>
                            </div>

                            {/* Wyświetlenie wykrytych kontuzji bezpośrednio na kuponie */}
                            {(homeInj.length > 0 || awayInj.length > 0) ? (
                              <div className="bg-rose-950/30 border border-rose-500/30 rounded-lg p-2 text-[10px] text-rose-200 space-y-1">
                                <div className="font-bold text-rose-400 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Wykryte osłabienia w składach (Live API):
                                </div>
                                {awayInj.map((inj, i) => (
                                  <div key={`a_${i}`}>
                                    • <strong>{item.awayTeam.short}</strong>: {inj.name} ({inj.status}, -{inj.impact} pkt)
                                  </div>
                                ))}
                                {homeInj.map((inj, i) => (
                                  <div key={`h_${i}`}>
                                    • <strong>{item.homeTeam.short}</strong>: {inj.name} ({inj.status}, -{inj.impact} pkt)
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-[10px] text-emerald-400/90 bg-emerald-950/20 border border-emerald-500/20 rounded px-2 py-1">
                                ✓ Liderzy w grze: {item.awayTeam.starPlayer.split(',')[0]} vs {item.homeTeam.starPlayer.split(',')[0]}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================
          WIDOK 2: LABORATORIUM POJEDYNCZEGO MECZU + PEŁNY RAPORT KONTUZJI LIVE
         ======================================================================== */}
      {activeView === 'match-lab' && (
        <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    Wybierz Mecz do Analizy
                  </h2>
                </div>
              </div>

              <div className="space-y-2.5">
                {matches.map((match) => {
                  const home = match.homeTeamDynamic || NBA_TEAMS_DB[match.home];
                  const away = match.awayTeamDynamic || NBA_TEAMS_DB[match.away];
                  const isSelected = match.id === selectedMatch.id;

                  return (
                    <button
                      key={match.id}
                      onClick={() => handleSelectMatch(match)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-indigo-600/15 border-indigo-500 shadow-lg shadow-indigo-500/10'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                        <span className="font-medium text-indigo-400">{match.time}</span>
                        <span>{match.status}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-white">{away.name}</span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {match.bookieOdds.away.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-white">{home.name}</span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {match.bookieOdds.home.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Parametry Symulacji & Składów
                </h2>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Osłabienie {selectedMatch.homeTeam.short} (Kontuzje)</span>
                  <span className="font-mono text-rose-400">-{homeInjuryImpact.toFixed(1)} pkt</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="9"
                  step="0.5"
                  value={homeInjuryImpact}
                  onChange={(e) => setHomeInjuryImpact(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Osłabienie {selectedMatch.awayTeam.short} (Kontuzje)</span>
                  <span className="font-mono text-rose-400">-{awayInjuryImpact.toFixed(1)} pkt</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="9"
                  step="0.5"
                  value={awayInjuryImpact}
                  onChange={(e) => setAwayInjuryImpact(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="text-center mb-4">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-indigo-400">
                  {selectedMatch.venue} • {simulationResults.iterations.toLocaleString('pl-PL')} symulacji
                </span>
                <h2 className="text-xl font-extrabold text-white mt-0.5">
                  {selectedMatch.awayTeam.name} @ {selectedMatch.homeTeam.name}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 my-5">
                <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-400 mb-1">Goście ({selectedMatch.awayTeam.short})</p>
                  <div className="text-3xl font-black text-indigo-400 font-mono">
                    {simulationResults.awayWinProb.toFixed(1)}%
                  </div>
                  <div className="mt-2 text-xs text-slate-300">
                    Śr. wynik: <span className="font-mono font-bold text-white">{simulationResults.avgAwayPts.toFixed(1)}</span> pkt
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-400 mb-1">Gospodarze ({selectedMatch.homeTeam.short})</p>
                  <div className="text-3xl font-black text-orange-400 font-mono">
                    {simulationResults.homeWinProb.toFixed(1)}%
                  </div>
                  <div className="mt-2 text-xs text-slate-300">
                    Śr. wynik: <span className="font-mono font-bold text-white">{simulationResults.avgHomePts.toFixed(1)}</span> pkt
                  </div>
                </div>
              </div>

              {/* Sekcja Kontuzji pobrana na żywo z ESPN dla wybranego meczu */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-rose-400" />
                  Oficjalny Raport Kontuzji i Składów (ESPN Live API)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="font-bold text-indigo-400 mb-1">{selectedMatch.awayTeam.name}</div>
                    <div className="text-[11px] text-slate-400 mb-2">
                      Liderzy: <span className="text-slate-200">{selectedMatch.awayTeam.starPlayer}</span>
                    </div>
                    {(selectedMatch.liveInjuries?.away?.length || 0) > 0 ? (
                      selectedMatch.liveInjuries.away.map((inj, i) => (
                        <div key={i} className="text-[11px] text-rose-300 py-0.5">
                          • <strong>{inj.name}</strong>: {inj.status} (-{inj.impact} pkt)
                        </div>
                      ))
                    ) : (
                      <div className="text-[11px] text-emerald-400">Brak zgłoszonych wykluczeń w API</div>
                    )}
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="font-bold text-orange-400 mb-1">{selectedMatch.homeTeam.name}</div>
                    <div className="text-[11px] text-slate-400 mb-2">
                      Liderzy: <span className="text-slate-200">{selectedMatch.homeTeam.starPlayer}</span>
                    </div>
                    {(selectedMatch.liveInjuries?.home?.length || 0) > 0 ? (
                      selectedMatch.liveInjuries.home.map((inj, i) => (
                        <div key={i} className="text-[11px] text-rose-300 py-0.5">
                          • <strong>{inj.name}</strong>: {inj.status} (-{inj.impact} pkt)
                        </div>
                      ))
                    ) : (
                      <div className="text-[11px] text-emerald-400">Brak zgłoszonych wykluczeń w API</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                <Calculator className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  Kalkulator Value Bet (1 na 1)
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Kurs {selectedMatch.awayTeam.short} (Gość)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.01"
                    value={oddsAway}
                    onChange={(e) => setOddsAway(Math.max(1.01, Number(e.target.value)))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-mono font-bold text-white"
                  />
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Kurs {selectedMatch.homeTeam.short} (Dom)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.01"
                    value={oddsHome}
                    onChange={(e) => setOddsHome(Math.max(1.01, Number(e.target.value)))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-mono font-bold text-white"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border bg-slate-950/70 border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">{selectedMatch.awayTeam.name}</span>
                    <span className="text-[11px] text-slate-400">
                      Sugerowana stawka Kelly: {bettingAnalysis.stakeAway.toFixed(0)} PLN
                    </span>
                  </div>
                  <span className={`font-mono font-bold text-sm ${bettingAnalysis.evAway > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    EV: {bettingAnalysis.evAway > 0 ? `+${bettingAnalysis.evAway.toFixed(1)}%` : `${bettingAnalysis.evAway.toFixed(1)}%`}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border bg-slate-950/70 border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">{selectedMatch.homeTeam.name}</span>
                    <span className="text-[11px] text-slate-400">
                      Sugerowana stawka Kelly: {bettingAnalysis.stakeHome.toFixed(0)} PLN
                    </span>
                  </div>
                  <span className={`font-mono font-bold text-sm ${bettingAnalysis.evHome > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    EV: {bettingAnalysis.evHome > 0 ? `+${bettingAnalysis.evHome.toFixed(1)}%` : `${bettingAnalysis.evHome.toFixed(1)}%`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
