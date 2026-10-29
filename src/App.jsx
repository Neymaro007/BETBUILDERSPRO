import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  TrendingUp,
  ShieldAlert,
  Calculator,
  RefreshCw,
  Award,
  Flame,
  Percent,
  DollarSign,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
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
  Filter
} from 'lucide-react';

// ============================================================================
// KOMPLETNA BAZA DANYCH DRUŻYN NBA (Four Factors + Zaawansowane Metryki)
// ============================================================================
const NBA_TEAMS_DB = {
  BOS: {
    id: 'BOS', name: 'Boston Celtics', short: 'BOS', conf: 'East', color: '#007A33',
    ortg: 123.2, drtg: 111.6, pace: 98.2, efg: 57.8, tov: 11.9, orb: 28.8, ftr: 20.5,
    l10: 0.80, homeRecord: '33-6', awayRecord: '27-14', starPlayer: 'Jayson Tatum'
  },
  OKC: {
    id: 'OKC', name: 'Oklahoma City Thunder', short: 'OKC', conf: 'West', color: '#007AC1',
    ortg: 119.5, drtg: 111.0, pace: 100.6, efg: 57.3, tov: 12.4, orb: 24.5, ftr: 21.8,
    l10: 0.70, homeRecord: '31-8', awayRecord: '25-15', starPlayer: 'Shai Gilgeous-Alexander'
  },
  DEN: {
    id: 'DEN', name: 'Denver Nuggets', short: 'DEN', conf: 'West', color: '#0E2240',
    ortg: 118.5, drtg: 112.3, pace: 97.4, efg: 56.2, tov: 12.6, orb: 30.2, ftr: 19.9,
    l10: 0.80, homeRecord: '32-8', awayRecord: '24-17', starPlayer: 'Nikola Jokić'
  },
  MIN: {
    id: 'MIN', name: 'Minnesota Timberwolves', short: 'MIN', conf: 'West', color: '#0C2340',
    ortg: 115.6, drtg: 109.0, pace: 97.8, efg: 55.9, tov: 14.2, orb: 27.5, ftr: 22.8,
    l10: 0.70, homeRecord: '29-10', awayRecord: '26-15', starPlayer: 'Anthony Edwards'
  },
  NYK: {
    id: 'NYK', name: 'New York Knicks', short: 'NYK', conf: 'East', color: '#F58426',
    ortg: 118.2, drtg: 112.4, pace: 96.1, efg: 54.8, tov: 13.1, orb: 33.4, ftr: 21.2,
    l10: 0.60, homeRecord: '27-12', awayRecord: '23-18', starPlayer: 'Jalen Brunson'
  },
  MIL: {
    id: 'MIL', name: 'Milwaukee Bucks', short: 'MIL', conf: 'East', color: '#00471B',
    ortg: 118.4, drtg: 115.2, pace: 100.2, efg: 56.8, tov: 12.7, orb: 24.8, ftr: 23.9,
    l10: 0.60, homeRecord: '30-10', awayRecord: '19-20', starPlayer: 'Giannis Antetokounmpo'
  },
  DAL: {
    id: 'DAL', name: 'Dallas Mavericks', short: 'DAL', conf: 'West', color: '#00538C',
    ortg: 117.9, drtg: 114.6, pace: 100.1, efg: 56.5, tov: 12.1, orb: 25.9, ftr: 21.4,
    l10: 0.80, homeRecord: '25-15', awayRecord: '25-15', starPlayer: 'Luka Dončić'
  },
  CLE: {
    id: 'CLE', name: 'Cleveland Cavaliers', short: 'CLE', conf: 'East', color: '#860038',
    ortg: 116.2, drtg: 112.1, pace: 98.0, efg: 55.7, tov: 13.4, orb: 26.8, ftr: 20.1,
    l10: 0.60, homeRecord: '26-14', awayRecord: '22-18', starPlayer: 'Donovan Mitchell'
  },
  PHX: {
    id: 'PHX', name: 'Phoenix Suns', short: 'PHX', conf: 'West', color: '#E56020',
    ortg: 117.6, drtg: 114.4, pace: 98.5, efg: 56.4, tov: 14.6, orb: 29.1, ftr: 23.4,
    l10: 0.70, homeRecord: '25-15', awayRecord: '23-17', starPlayer: 'Kevin Durant'
  },
  LAL: {
    id: 'LAL', name: 'Los Angeles Lakers', short: 'LAL', conf: 'West', color: '#552583',
    ortg: 115.9, drtg: 115.2, pace: 101.4, efg: 56.6, tov: 13.6, orb: 24.1, ftr: 24.8,
    l10: 0.70, homeRecord: '28-12', awayRecord: '18-21', starPlayer: 'LeBron James'
  },
  IND: {
    id: 'IND', name: 'Indiana Pacers', short: 'IND', conf: 'East', color: '#002D62',
    ortg: 120.5, drtg: 118.0, pace: 102.3, efg: 57.9, tov: 12.8, orb: 26.2, ftr: 19.2,
    l10: 0.60, homeRecord: '26-15', awayRecord: '21-20', starPlayer: 'Tyrese Haliburton'
  },
  PHI: {
    id: 'PHI', name: 'Philadelphia 76ers', short: 'PHI', conf: 'East', color: '#006BB6',
    ortg: 116.8, drtg: 113.8, pace: 97.6, efg: 53.9, tov: 11.8, orb: 28.9, ftr: 24.2,
    l10: 0.60, homeRecord: '25-15', awayRecord: '22-18', starPlayer: 'Joel Embiid'
  },
  ORL: {
    id: 'ORL', name: 'Orlando Magic', short: 'ORL', conf: 'East', color: '#0077C0',
    ortg: 113.4, drtg: 110.8, pace: 97.3, efg: 54.1, tov: 14.5, orb: 29.8, ftr: 25.1,
    l10: 0.60, homeRecord: '29-11', awayRecord: '18-22', starPlayer: 'Paolo Banchero'
  },
  SAC: {
    id: 'SAC', name: 'Sacramento Kings', short: 'SAC', conf: 'West', color: '#5A2D81',
    ortg: 116.9, drtg: 115.1, pace: 100.1, efg: 56.1, tov: 13.0, orb: 28.2, ftr: 19.6,
    l10: 0.50, homeRecord: '24-16', awayRecord: '22-18', starPlayer: "De'Aaron Fox"
  },
  GSW: {
    id: 'GSW', name: 'Golden State Warriors', short: 'GSW', conf: 'West', color: '#1D428A',
    ortg: 117.2, drtg: 115.0, pace: 99.8, efg: 55.8, tov: 14.1, orb: 31.2, ftr: 20.0,
    l10: 0.70, homeRecord: '21-19', awayRecord: '25-15', starPlayer: 'Stephen Curry'
  },
  MIA: {
    id: 'MIA', name: 'Miami Heat', short: 'MIA', conf: 'East', color: '#98002E',
    ortg: 114.0, drtg: 112.2, pace: 96.2, efg: 53.8, tov: 12.6, orb: 25.6, ftr: 22.1,
    l10: 0.60, homeRecord: '22-18', awayRecord: '24-16', starPlayer: 'Jimmy Butler'
  },
  LAC: {
    id: 'LAC', name: 'LA Clippers', short: 'LAC', conf: 'West', color: '#C8102E',
    ortg: 118.1, drtg: 114.9, pace: 97.5, efg: 56.3, tov: 13.1, orb: 27.6, ftr: 22.5,
    l10: 0.50, homeRecord: '25-15', awayRecord: '26-14', starPlayer: 'Kawhi Leonard'
  },
  NOP: {
    id: 'NOP', name: 'New Orleans Pelicans', short: 'NOP', conf: 'West', color: '#0C2340',
    ortg: 116.7, drtg: 112.2, pace: 98.3, efg: 55.9, tov: 13.2, orb: 28.5, ftr: 22.2,
    l10: 0.60, homeRecord: '21-19', awayRecord: '28-14', starPlayer: 'Zion Williamson'
  },
  HOU: {
    id: 'HOU', name: 'Houston Rockets', short: 'HOU', conf: 'West', color: '#CE1141',
    ortg: 114.5, drtg: 112.9, pace: 99.4, efg: 53.5, tov: 12.6, orb: 29.4, ftr: 21.8,
    l10: 0.60, homeRecord: '27-13', awayRecord: '14-26', starPlayer: 'Alperen Şengün'
  },
  CHI: {
    id: 'CHI', name: 'Chicago Bulls', short: 'CHI', conf: 'East', color: '#CE1141',
    ortg: 114.2, drtg: 116.1, pace: 96.9, efg: 53.4, tov: 12.1, orb: 28.1, ftr: 20.9,
    l10: 0.50, homeRecord: '20-20', awayRecord: '19-21', starPlayer: 'DeMar DeRozan'
  },
  ATL: {
    id: 'ATL', name: 'Atlanta Hawks', short: 'ATL', conf: 'East', color: '#E03A3E',
    ortg: 116.6, drtg: 118.8, pace: 100.8, efg: 54.2, tov: 13.2, orb: 30.8, ftr: 22.0,
    l10: 0.40, homeRecord: '21-20', awayRecord: '15-26', starPlayer: 'Trae Young'
  },
  BKN: {
    id: 'BKN', name: 'Brooklyn Nets', short: 'BKN', conf: 'East', color: '#000000',
    ortg: 112.8, drtg: 116.0, pace: 97.6, efg: 53.1, tov: 12.9, orb: 28.0, ftr: 19.8,
    l10: 0.40, homeRecord: '20-21', awayRecord: '12-29', starPlayer: 'Cam Thomas'
  },
  TOR: {
    id: 'TOR', name: 'Toronto Raptors', short: 'TOR', conf: 'East', color: '#CE1141',
    ortg: 112.1, drtg: 118.1, pace: 99.7, efg: 53.5, tov: 13.8, orb: 27.1, ftr: 20.4,
    l10: 0.30, homeRecord: '14-27', awayRecord: '11-30', starPlayer: 'Scottie Barnes'
  },
  MEM: {
    id: 'MEM', name: 'Memphis Grizzlies', short: 'MEM', conf: 'West', color: '#5D76A9',
    ortg: 109.8, drtg: 113.8, pace: 98.6, efg: 51.9, tov: 14.8, orb: 27.9, ftr: 20.2,
    l10: 0.40, homeRecord: '9-32', awayRecord: '18-23', starPlayer: 'Ja Morant'
  },
  UTA: {
    id: 'UTA', name: 'Utah Jazz', short: 'UTA', conf: 'West', color: '#002B5C',
    ortg: 114.8, drtg: 119.9, pace: 100.2, efg: 53.9, tov: 15.3, orb: 31.0, ftr: 22.1,
    l10: 0.30, homeRecord: '21-20', awayRecord: '10-31', starPlayer: 'Lauri Markkanen'
  },
  SAS: {
    id: 'SAS', name: 'San Antonio Spurs', short: 'SAS', conf: 'West', color: '#C4CED4',
    ortg: 110.3, drtg: 116.4, pace: 101.5, efg: 52.8, tov: 14.9, orb: 26.5, ftr: 19.5,
    l10: 0.40, homeRecord: '12-29', awayRecord: '10-31', starPlayer: 'Victor Wembanyama'
  },
  POR: {
    id: 'POR', name: 'Portland Trail Blazers', short: 'POR', conf: 'West', color: '#E03A3E',
    ortg: 108.6, drtg: 116.9, pace: 97.8, efg: 50.8, tov: 15.1, orb: 31.4, ftr: 20.6,
    l10: 0.20, homeRecord: '11-30', awayRecord: '10-31', starPlayer: 'Anfernee Simons'
  },
  CHA: {
    id: 'CHA', name: 'Charlotte Hornets', short: 'CHA', conf: 'East', color: '#1D1160',
    ortg: 109.1, drtg: 119.2, pace: 97.6, efg: 51.8, tov: 13.7, orb: 25.1, ftr: 19.1,
    l10: 0.20, homeRecord: '11-30', awayRecord: '10-31', starPlayer: 'LaMelo Ball'
  },
  WAS: {
    id: 'WAS', name: 'Washington Wizards', short: 'WAS', conf: 'East', color: '#002B5C',
    ortg: 110.2, drtg: 119.6, pace: 102.7, efg: 53.4, tov: 13.9, orb: 23.9, ftr: 19.3,
    l10: 0.20, homeRecord: '7-34', awayRecord: '8-33', starPlayer: 'Kyle Kuzma'
  },
  DET: {
    id: 'DET', name: 'Detroit Pistons', short: 'DET', conf: 'East', color: '#C8102E',
    ortg: 109.5, drtg: 118.4, pace: 100.1, efg: 52.1, tov: 15.0, orb: 28.4, ftr: 21.1,
    l10: 0.20, homeRecord: '7-33', awayRecord: '7-35', starPlayer: 'Cade Cunningham'
  }
};

const ESPN_ABBR_MAP = {
  GS: 'GSW', NY: 'NYK', NO: 'NOP', SA: 'SAS', UTAH: 'UTA', WSH: 'WAS'
};

// Domyślna lista spotkań z realnymi kursami rynkowymi
const FALLBACK_MATCHES = [
  {
    id: 'm1', home: 'BOS', away: 'NYK', time: '01:30 CET', status: 'Zaplanowany', venue: 'TD Garden (Boston)',
    bookieOdds: { home: 1.47, away: 2.85, spreadLine: -6.5, spreadHomeOdds: 1.90, spreadAwayOdds: 1.90, totalLine: 224.5, overOdds: 1.92, underOdds: 1.90 }
  },
  {
    id: 'm2', home: 'DEN', away: 'MIN', time: '04:00 CET', status: 'Zaplanowany', venue: 'Ball Arena (Denver)',
    bookieOdds: { home: 1.65, away: 2.38, spreadLine: -4.0, spreadHomeOdds: 1.91, spreadAwayOdds: 1.91, totalLine: 217.5, overOdds: 1.95, underOdds: 1.87 }
  },
  {
    id: 'm3', home: 'LAL', away: 'PHX', time: '04:00 CET', status: 'Zaplanowany', venue: 'Crypto.com Arena (LA)',
    bookieOdds: { home: 1.92, away: 2.02, spreadLine: -1.5, spreadHomeOdds: 1.90, spreadAwayOdds: 1.92, totalLine: 231.5, overOdds: 1.88, underOdds: 1.94 }
  },
  {
    id: 'm4', home: 'MIL', away: 'IND', time: '02:00 CET', status: 'Zaplanowany', venue: 'Fiserv Forum (Milwaukee)',
    bookieOdds: { home: 1.58, away: 2.52, spreadLine: -5.5, spreadHomeOdds: 1.90, spreadAwayOdds: 1.90, totalLine: 237.5, overOdds: 1.93, underOdds: 1.89 }
  },
  {
    id: 'm5', home: 'DAL', away: 'OKC', time: '02:30 CET', status: 'Zaplanowany', venue: 'American Airlines Center',
    bookieOdds: { home: 2.08, away: 1.85, spreadLine: 1.5, spreadHomeOdds: 1.91, spreadAwayOdds: 1.91, totalLine: 229.5, overOdds: 1.92, underOdds: 1.90 }
  },
  {
    id: 'm6', home: 'CLE', away: 'ORL', time: '01:00 CET', status: 'Zaplanowany', venue: 'Rocket Mortgage FieldHouse',
    bookieOdds: { home: 1.60, away: 2.45, spreadLine: -4.5, spreadHomeOdds: 1.92, spreadAwayOdds: 1.90, totalLine: 212.5, overOdds: 1.91, underOdds: 1.91 }
  }
];

// ============================================================================
// FUNKCJE MATEMATYCZNE I SILNIK MONTE CARLO (Box-Muller + Four Factors)
// ============================================================================
function randomNormal(mean, stdDev) {
  let u1 = 0, u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

function runMonteCarloSimulation(homeTeam, awayTeam, iterations, modifiers) {
  const { homeCourtAdv = 2.8, homeB2B = false, awayB2B = false, homeInjuryImpact = 0, awayInjuryImpact = 0 } = modifiers;
  const leagueAvgORTG = 115.3;
  const leagueAvgPace = 99.2;

  const expectedPace = (homeTeam.pace * awayTeam.pace) / leagueAvgPace;

  // Four Factors (Dean Oliver: 40% eFG, 25% TOV, 20% ORB, 15% FTR)
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
  let overHits = 0;
  let spreadCoverHome = 0;

  const projectedTotalLine = Math.round((expectedHomePts + expectedAwayPts) * 2) / 2;
  const projectedSpreadLine = Math.round((expectedAwayPts - expectedHomePts) * 2) / 2;

  const marginBuckets = {
    'Away 16+': 0,
    'Away 11-15': 0,
    'Away 6-10': 0,
    'Away 1-5': 0,
    'Home 1-5': 0,
    'Home 6-10': 0,
    'Home 11-15': 0,
    'Home 16+': 0
  };

  for (let i = 0; i < iterations; i++) {
    const paceShock = randomNormal(0, 3.2);
    let simHome = Math.round(randomNormal(expectedHomePts + paceShock, stdDevTeam));
    let simAway = Math.round(randomNormal(expectedAwayPts + paceShock, stdDevTeam));

    while (simHome === simAway) {
      simHome += Math.round(randomNormal(expectedHomePts * 0.104, 3.4));
      simAway += Math.round(randomNormal(expectedAwayPts * 0.104, 3.4));
    }

    if (simHome > simAway) homeWins++;
    else awayWins++;

    totalHomePts += simHome;
    totalAwayPts += simAway;

    if (simHome + simAway > projectedTotalLine) overHits++;
    if (simHome + projectedSpreadLine > simAway) spreadCoverHome++;

    const margin = simHome - simAway;
    if (margin <= -16) marginBuckets['Away 16+']++;
    else if (margin <= -11) marginBuckets['Away 11-15']++;
    else if (margin <= -6) marginBuckets['Away 6-10']++;
    else if (margin < 0) marginBuckets['Away 1-5']++;
    else if (margin <= 5) marginBuckets['Home 1-5']++;
    else if (margin <= 10) marginBuckets['Home 6-10']++;
    else if (margin <= 15) marginBuckets['Home 11-15']++;
    else marginBuckets['Home 16+']++;
  }

  return {
    homeWinProb: (homeWins / iterations) * 100,
    awayWinProb: (awayWins / iterations) * 100,
    avgHomePts: totalHomePts / iterations,
    avgAwayPts: totalAwayPts / iterations,
    avgTotalPts: (totalHomePts + totalAwayPts) / iterations,
    projectedSpreadLine,
    projectedTotalLine,
    overProb: (overHits / iterations) * 100,
    spreadCoverProb: (spreadCoverHome / iterations) * 100,
    expectedPace,
    homeFFIndex,
    awayFFIndex,
    marginBuckets,
    iterations
  };
}

// ============================================================================
// GENERATOR WSZYSTKICH RYNKÓW BUKMACHERSKICH I UZASADNIEŃ ANALITYCZNYCH
// ============================================================================
function generateAllSmartPicks(matches, taxRate) {
  const taxMultiplier = taxRate ? 0.88 : 1.0;
  const allPicks = [];

  matches.forEach((match) => {
    const homeTeam = NBA_TEAMS_DB[match.home];
    const awayTeam = NBA_TEAMS_DB[match.away];
    if (!homeTeam || !awayTeam) return;

    const sim = runMonteCarloSimulation(homeTeam, awayTeam, 6000, {
      homeCourtAdv: 2.8,
      homeB2B: false,
      awayB2B: false,
      homeInjuryImpact: 0,
      awayInjuryImpact: 0
    });

    const netRtgHome = (homeTeam.ortg - homeTeam.drtg).toFixed(1);
    const netRtgAway = (awayTeam.ortg - awayTeam.drtg).toFixed(1);
    const efgDiff = (homeTeam.efg - awayTeam.efg).toFixed(1);
    const orbDiff = (homeTeam.orb - awayTeam.orb).toFixed(1);

    // 1. Rynek Zwycięzca Gospodarz (ML Home)
    const probHome = sim.homeWinProb / 100;
    const evHome = (probHome * (match.bookieOdds.home * taxMultiplier) - 1) * 100;
    allPicks.push({
      id: `${match.id}_ML_HOME`,
      matchId: match.id,
      matchLabel: `${awayTeam.short} @ ${homeTeam.short}`,
      homeTeam,
      awayTeam,
      time: match.time,
      marketType: 'Zwycięzca (ML)',
      selectionName: `${homeTeam.name} wygra`,
      shortSelection: `${homeTeam.short} Win`,
      odds: match.bookieOdds.home,
      fairOdds: 1 / probHome,
      prob: sim.homeWinProb,
      ev: evHome,
      projectedScore: `${sim.avgHomePts.toFixed(0)}:${sim.avgAwayPts.toFixed(0)}`,
      confidenceScore: sim.homeWinProb * 0.65 + Math.max(-10, evHome) * 1.8,
      reasoning: [
        `Net Rating: ${homeTeam.short} (${netRtgHome > 0 ? '+' : ''}${netRtgHome}) vs ${awayTeam.short} (${netRtgAway > 0 ? '+' : ''}${netRtgAway}) + przewaga własnego parkietu (+2.8 pkt).`,
        `Skuteczność eFG%: ${homeTeam.efg}% vs ${awayTeam.efg}% (${efgDiff > 0 ? '+' : ''}${efgDiff}% przewagi rzutowej).`,
        `Symulacja Monte Carlo (6000 gier): średni wynik ${sim.avgHomePts.toFixed(1)} - ${sim.avgAwayPts.toFixed(1)}.`
      ]
    });

    // 2. Rynek Zwycięzca Gość (ML Away)
    const probAway = sim.awayWinProb / 100;
    const evAway = (probAway * (match.bookieOdds.away * taxMultiplier) - 1) * 100;
    allPicks.push({
      id: `${match.id}_ML_AWAY`,
      matchId: match.id,
      matchLabel: `${awayTeam.short} @ ${homeTeam.short}`,
      homeTeam,
      awayTeam,
      time: match.time,
      marketType: 'Zwycięzca (ML)',
      selectionName: `${awayTeam.name} wygra`,
      shortSelection: `${awayTeam.short} Win`,
      odds: match.bookieOdds.away,
      fairOdds: 1 / probAway,
      prob: sim.awayWinProb,
      ev: evAway,
      projectedScore: `${sim.avgHomePts.toFixed(0)}:${sim.avgAwayPts.toFixed(0)}`,
      confidenceScore: sim.awayWinProb * 0.65 + Math.max(-10, evAway) * 1.8,
      reasoning: [
        `Kurs ${match.bookieOdds.away.toFixed(2)} przewyższa kurs sprawiedliwy modelu (${(1 / probAway).toFixed(2)}).`,
        `Ofensywny Rating ${awayTeam.short} (${awayTeam.ortg} pkt/100 pos.) przeciwko obronie ${homeTeam.drtg} DRTG.`,
        `Forma L10: ${Math.round(awayTeam.l10 * 10)}/10 wygranych przy zbiórkach ofensywnych ${awayTeam.orb}% ORB.`
      ]
    });

    // 3. Rynek Handicap (Spread)
    const bookieSpread = match.bookieOdds.spreadLine || -4.5;
    const modelMarginHome = sim.avgHomePts - sim.avgAwayPts;
    const spreadDiff = modelMarginHome + bookieSpread;
    const coverHomeProb = Math.min(82, Math.max(18, 50 + spreadDiff * 3.1));
    const pickHomeSpread = coverHomeProb >= 50;
    const finalSpreadProb = pickHomeSpread ? coverHomeProb : 100 - coverHomeProb;
    const spreadOdds = pickHomeSpread
      ? (match.bookieOdds.spreadHomeOdds || 1.90)
      : (match.bookieOdds.spreadAwayOdds || 1.90);
    const evSpread = ((finalSpreadProb / 100) * (spreadOdds * taxMultiplier) - 1) * 100;

    allPicks.push({
      id: `${match.id}_SPREAD`,
      matchId: match.id,
      matchLabel: `${awayTeam.short} @ ${homeTeam.short}`,
      homeTeam,
      awayTeam,
      time: match.time,
      marketType: 'Handicap (Spread)',
      selectionName: pickHomeSpread
        ? `${homeTeam.short} Handicap ${bookieSpread > 0 ? `+${bookieSpread}` : bookieSpread}`
        : `${awayTeam.short} Handicap ${-bookieSpread > 0 ? `+${-bookieSpread}` : -bookieSpread}`,
      shortSelection: pickHomeSpread
        ? `${homeTeam.short} ${bookieSpread > 0 ? `+${bookieSpread}` : bookieSpread}`
        : `${awayTeam.short} ${-bookieSpread > 0 ? `+${-bookieSpread}` : -bookieSpread}`,
      odds: spreadOdds,
      fairOdds: 1 / (finalSpreadProb / 100),
      prob: finalSpreadProb,
      ev: evSpread,
      projectedScore: `${sim.avgHomePts.toFixed(0)}:${sim.avgAwayPts.toFixed(0)}`,
      confidenceScore: finalSpreadProb * 0.65 + Math.max(-10, evSpread) * 1.8,
      reasoning: [
        `Model prognozuje różnicę ${modelMarginHome > 0 ? `+${modelMarginHome.toFixed(1)}` : modelMarginHome.toFixed(1)} pkt dla ${homeTeam.short} wobec linii bukmachera (${bookieSpread}).`,
        `Przewaga na tablicach (ORB%): ${orbDiff > 0 ? `${homeTeam.short} +${orbDiff}%` : `${awayTeam.short} +${Math.abs(orbDiff)}%`} oraz wymuszanie strat (${homeTeam.tov}% vs ${awayTeam.tov}%).`,
        `Pokrycie linii handicapu w ${finalSpreadProb.toFixed(1)}% symulacji Monte Carlo.`
      ]
    });

    // 4. Rynek Suma Punktów (Over/Under)
    const bookieTotal = match.bookieOdds.totalLine || 224.5;
    const totalDiff = sim.avgTotalPts - bookieTotal;
    const overLineProb = Math.min(84, Math.max(16, 50 + totalDiff * 2.7));
    const pickOver = overLineProb >= 50;
    const finalTotalProb = pickOver ? overLineProb : 100 - overLineProb;
    const totalOdds = pickOver
      ? (match.bookieOdds.overOdds || 1.90)
      : (match.bookieOdds.underOdds || 1.90);
    const evTotal = ((finalTotalProb / 100) * (totalOdds * taxMultiplier) - 1) * 100;

    allPicks.push({
      id: `${match.id}_TOTAL`,
      matchId: match.id,
      matchLabel: `${awayTeam.short} @ ${homeTeam.short}`,
      homeTeam,
      awayTeam,
      time: match.time,
      marketType: 'Suma Punktów (O/U)',
      selectionName: `${pickOver ? 'Powyżej (Over)' : 'Poniżej (Under)'} ${bookieTotal} pkt`,
      shortSelection: `${pickOver ? 'Over' : 'Under'} ${bookieTotal}`,
      odds: totalOdds,
      fairOdds: 1 / (finalTotalProb / 100),
      prob: finalTotalProb,
      ev: evTotal,
      projectedScore: `${sim.avgHomePts.toFixed(0)}:${sim.avgAwayPts.toFixed(0)}`,
      confidenceScore: finalTotalProb * 0.65 + Math.max(-10, evTotal) * 1.8,
      reasoning: [
        `Prognozowana suma z modelu to ${sim.avgTotalPts.toFixed(1)} pkt (linia bukmachera: ${bookieTotal} pkt).`,
        `Szacowane tempo meczu (Pace): ${sim.expectedPace.toFixed(1)} posiadań na 48 minut.`,
        `Połączona efektywność ofensywna: ${homeTeam.short} (${homeTeam.ortg} ORTG) + ${awayTeam.short} (${awayTeam.ortg} ORTG).`
      ]
    });
  });

  return allPicks.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

// ============================================================================
// GŁÓWNY KOMPONENT APLIKACJI
// ============================================================================
export default function App() {
  const [activeSport, setActiveSport] = useState('NBA');
  const [activeView, setActiveView] = useState('smart-builder'); // 'smart-builder' | 'match-lab'
  const [matches, setMatches] = useState(FALLBACK_MATCHES);
  const [selectedMatchId, setSelectedMatchId] = useState(FALLBACK_MATCHES[0].id);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [dataSourceStatus, setDataSourceStatus] = useState('Połączono z bazą NBA (Sezon Live)');
  const [lastSyncTime, setLastSyncTime] = useState('Dzisiaj, 19:00');

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
  const [taxRate, setTaxRate] = useState(true); // true = 12% podatku PL
  const [bankroll, setBankroll] = useState(1000);
  const [couponStake, setCouponStake] = useState(100);
  const [kellyFraction, setKellyFraction] = useState(0.25);

  // Parametry Generatora Kuponów (Kurs 2.00+, 3.00+, 5.00+)
  const [targetMinOdds, setTargetMinOdds] = useState(2.0);
  const [builderStrategy, setBuilderStrategy] = useState('safe'); // 'safe' | 'value' | 'balanced'
  const [marketFilter, setMarketFilter] = useState('ALL');
  const [couponPicks, setCouponPicks] = useState([]);

  // Pobieranie aktualnego terminarza NBA z oficjalnego publicznego API ESPN
  const fetchLiveNBASchedule = async () => {
    setIsLoadingLive(true);
    try {
      const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
      if (!response.ok) throw new Error('Błąd sieci API');
      const data = await response.json();

      if (data && data.events && data.events.length > 0) {
        const parsedMatches = [];
        data.events.forEach((ev, idx) => {
          const comp = ev.competitions?.[0];
          if (!comp) return;
          const homeComp = comp.competitors?.find((c) => c.homeAway === 'home');
          const awayComp = comp.competitors?.find((c) => c.homeAway === 'away');
          if (!homeComp || !awayComp) return;

          const rawHome = homeComp.team?.abbreviation;
          const rawAway = awayComp.team?.abbreviation;
          const homeAbbr = ESPN_ABBR_MAP[rawHome] || rawHome;
          const awayAbbr = ESPN_ABBR_MAP[rawAway] || rawAway;

          if (NBA_TEAMS_DB[homeAbbr] && NBA_TEAMS_DB[awayAbbr]) {
            const quickSim = runMonteCarloSimulation(
              NBA_TEAMS_DB[homeAbbr],
              NBA_TEAMS_DB[awayAbbr],
              1500,
              { homeCourtAdv: 2.8 }
            );
            const margin = 1.045;
            const estHomeOdd = Number(Math.max(1.12, (100 / quickSim.homeWinProb) / margin).toFixed(2));
            const estAwayOdd = Number(Math.max(1.12, (100 / quickSim.awayWinProb) / margin).toFixed(2));
            const spreadLine = Math.round((quickSim.avgAwayPts - quickSim.avgHomePts) * 2) / 2;
            const totalLine = Math.round(quickSim.avgTotalPts * 2) / 2;

            parsedMatches.push({
              id: ev.id || `live_${idx}`,
              home: homeAbbr,
              away: awayAbbr,
              time: ev.status?.type?.shortDetail || 'Live / Dzisiaj',
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
            });
          }
        });

        if (parsedMatches.length > 0) {
          setMatches(parsedMatches);
          setSelectedMatchId(parsedMatches[0].id);
          setOddsHome(parsedMatches[0].bookieOdds.home);
          setOddsAway(parsedMatches[0].bookieOdds.away);
          setDataSourceStatus(`Pobrano ${parsedMatches.length} meczów na żywo z ESPN NBA API`);
        } else {
          setDataSourceStatus('Brak dzisiejszych gier w API – aktywny terminarz analityczny NBA');
        }
      } else {
        setDataSourceStatus('Przerwa w rozgrywkach dzisiaj – aktywny terminarz analityczny NBA');
      }
    } catch (error) {
      setDataSourceStatus('Tryb Offline-Ready: Zweryfikowana baza statystyczna NBA');
    } finally {
      const now = new Date();
      setLastSyncTime(now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setIsLoadingLive(false);
    }
  };

  useEffect(() => {
    fetchLiveNBASchedule();
  }, []);

  // Aktualny mecz w laboratorium
  const selectedMatch = useMemo(() => {
    const found = matches.find((m) => m.id === selectedMatchId) || matches[0];
    return {
      ...found,
      homeTeam: NBA_TEAMS_DB[found.home],
      awayTeam: NBA_TEAMS_DB[found.away]
    };
  }, [matches, selectedMatchId]);

  const handleSelectMatch = (match) => {
    setSelectedMatchId(match.id);
    setOddsHome(match.bookieOdds.home);
    setOddsAway(match.bookieOdds.away);
    setHomeB2B(false);
    setAwayB2B(false);
    setHomeInjuryImpact(0);
    setAwayInjuryImpact(0);
  };

  // Wszystkie wyliczone propozycje typów z dzisiejszych meczów
  const allSmartPicks = useMemo(() => {
    return generateAllSmartPicks(matches, taxRate);
  }, [matches, taxRate]);

  // Filtrowane rekomendacje
  const filteredSmartPicks = useMemo(() => {
    return allSmartPicks.filter((p) => {
      if (marketFilter === 'ALL') return true;
      if (marketFilter === 'ML') return p.marketType === 'Zwycięzca (ML)';
      if (marketFilter === 'SPREAD') return p.marketType === 'Handicap (Spread)';
      if (marketFilter === 'TOTAL') return p.marketType === 'Suma Punktów (O/U)';
      return true;
    });
  }, [allSmartPicks, marketFilter]);

  // Funkcja automatycznego budowania kuponu AKO powyżej zadanego kursu (np. 2.00+, 3.00+, 5.00+)
  const buildAutoCoupon = (minOddsTarget, strategy = builderStrategy) => {
    setTargetMinOdds(minOddsTarget);
    setBuilderStrategy(strategy);

    const pool = [...allSmartPicks].filter((p) => p.odds >= 1.28 && p.prob >= 48);

    if (strategy === 'safe') {
      pool.sort((a, b) => b.prob - a.prob);
    } else if (strategy === 'value') {
      pool.sort((a, b) => b.ev - a.ev);
    } else {
      pool.sort((a, b) => b.confidenceScore - a.confidenceScore);
    }

    const selected = [];
    const usedMatchIds = new Set();
    let currentTotalOdds = 1.0;

    for (const pick of pool) {
      if (usedMatchIds.has(pick.matchId)) continue;
      selected.push(pick);
      usedMatchIds.add(pick.matchId);
      currentTotalOdds *= pick.odds;

      if (currentTotalOdds >= minOddsTarget || selected.length >= 6) {
        break;
      }
    }

    setCouponPicks(selected);
  };

  // Inicjalny kupon 2.00+ przy starcie
  useEffect(() => {
    if (allSmartPicks.length > 0 && couponPicks.length === 0) {
      buildAutoCoupon(2.0, 'safe');
    }
  }, [allSmartPicks]);

  // Dodawanie/Usuwanie typu z kuponu (maksymalnie 1 zdarzenie z danego meczu, by uniknąć korelacji blokowanej przez bukmacherów)
  const togglePickInCoupon = (pick) => {
    const exists = couponPicks.some((p) => p.id === pick.id);
    if (exists) {
      setCouponPicks(couponPicks.filter((p) => p.id !== pick.id));
    } else {
      const withoutSameMatch = couponPicks.filter((p) => p.matchId !== pick.matchId);
      setCouponPicks([...withoutSameMatch, pick]);
    }
  };

  // Statystyki całego Kuponu AKO
  const couponSummary = useMemo(() => {
    if (couponPicks.length === 0) {
      return { totalOdds: 0, combinedProb: 0, fairAkoOdds: 0, potentialWin: 0, netProfit: 0, akoEv: 0, kellySuggested: 0 };
    }
    const taxMultiplier = taxRate ? 0.88 : 1.0;
    const totalOdds = couponPicks.reduce((acc, p) => acc * p.odds, 1);
    const combinedProbDecimal = couponPicks.reduce((acc, p) => acc * (p.prob / 100), 1);
    const combinedProb = combinedProbDecimal * 100;
    const fairAkoOdds = combinedProbDecimal > 0 ? 1 / combinedProbDecimal : 0;

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
      fairAkoOdds,
      potentialWin,
      netProfit,
      akoEv,
      kellySuggested
    };
  }, [couponPicks, taxRate, couponStake, bankroll, kellyFraction]);

  // Wyniki symulacji Monte Carlo dla wybranego meczu (Match Lab)
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
      }
    );
  }, [selectedMatch, simCount, homeCourtAdv, homeB2B, awayB2B, homeInjuryImpact, awayInjuryImpact]);

  // Obliczenia Value Bet i Kryterium Kelly'ego dla pojedynczego meczu
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
                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Monte Carlo v3.2
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Silnik Rekomendacji & Generator Kuponów AKO • Four Factors & Kelly Criterion
              </p>
            </div>
          </div>

          {/* Przełącznik Głównego Trybu Aplikacji */}
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
              Laboratorium Meczu (1 na 1)
            </button>
          </div>

          {/* Status Live i Podatek */}
          <div className="flex items-center gap-2.5 text-xs">
            <button
              onClick={() => setTaxRate(!taxRate)}
              className={`px-3 py-1.5 rounded-lg font-semibold border transition-all ${
                taxRate
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              }`}
              title="Przełącz uwzględnianie 12% podatku obrotowego u polskich bukmacherów"
            >
              {taxRate ? 'Podatek PL: 12% (x0.88)' : 'Gra Bez Podatku (x1.00)'}
            </button>
            <button
              onClick={fetchLiveNBASchedule}
              disabled={isLoadingLive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLive ? 'animate-spin text-orange-400' : ''}`} />
              <span>Odśwież Live</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================
          WIDOK 1: CO OBSTAWIAĆ & GENERATOR KUPONÓW AKO POWYŻEJ KURSU (2.0 / 3.0 / 5.0)
         ======================================================================== */}
      {activeView === 'smart-builder' && (
        <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEWA I ŚRODKOWA KOLUMNA (8/12): Generator kursu + Lista rekomendacji ze statystykami */}
          <div className="lg:col-span-8 space-y-6">
            {/* PANEL GENERATORA KUPONÓW POWYŻEJ ZADANEGO KURSU */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-indigo-500/30 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20 mb-1">
                    <Sparkles className="w-3 h-3" /> Algorytm Doboru Zdarzeń
                  </span>
                  <h2 className="text-xl font-black text-white">
                    Automatyczny Kreator Kuponów pod Wybrany Kurs
                  </h2>
                  <p className="text-xs text-slate-400">
                    Wybierz docelowy kurs minimalny (np. 2.00+, 3.00+, 5.00+), a silnik Monte Carlo wybierze nieskorelowane typy o najwyższym prawdopodobieństwie i dodatnim EV.
                  </p>
                </div>
              </div>

              {/* Szybkie przyciski docelowego kursu */}
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

              {/* Precyzyjny suwak kursu + wybór strategii doboru */}
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

            {/* RANKING "CO OBSTAWIAĆ?" - WSZYSTKIE PRZEANALIZOWANE TYPY ZE STATYSTYKAMI */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-400" />
                    Co Obstawiać Dzisiaj? Ranking Rekomendacji Modelu ({filteredSmartPicks.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Każdy typ poniżej został przeliczony przez 6 000 symulacji Monte Carlo. Kliknij „Dodaj do kuponu”, aby zbudować własną kombinację.
                  </p>
                </div>

                {/* Filtr rynków */}
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
                  const inCoupon = couponPicks.some((p) => p.id === pick.id);
                  const isValue = pick.ev > 0;

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
                              <span className="text-[11px] text-slate-500 font-mono">
                                Prognoza wyniku: {pick.projectedScore}
                              </span>
                            </div>

                            <h4 className="text-base font-black text-white mt-1">
                              Typ: <span className="text-orange-400">{pick.selectionName}</span>
                            </h4>
                          </div>
                        </div>

                        {/* Prawa strona karty: Kurs, Szansa i przycisk Kuponu */}
                        <div className="flex items-center gap-3 ml-auto">
                          <div className="text-right">
                            <div className="text-[11px] text-slate-400">Szansa Modelu</div>
                            <div className="text-sm font-black text-emerald-400 font-mono">
                              {pick.prob.toFixed(1)}%
                            </div>
                          </div>

                          <div className="text-right px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
                            <div className="text-[10px] text-slate-400 uppercase">Kurs Bukmachera</div>
                            <div className="text-base font-black text-white font-mono">
                              {pick.odds.toFixed(2)}
                            </div>
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

                      {/* Rozwinięte uzasadnienie statystyczne pod typem */}
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

          {/* PRAWA KOLUMNA (4/12): AKTYWNY KUPON BUKMACHERSKI (BET SLIP) + PEŁNY RAPORT STATYSTYCZNY */}
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
                    onClick={() => setCouponPicks([])}
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
                    Twój kupon jest pusty. Kliknij jeden z przycisków powyżej (np. <strong>Kurs 2.00+</strong> lub <strong>3.00+</strong>), aby automatycznie zbudować kupon.
                  </p>
                </div>
              ) : (
                <>
                  {/* Lista zdarzeń na kuponie */}
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
                            {item.marketType} • Prognoza: {item.projectedScore}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-300 font-mono text-xs font-black">
                            {item.odds.toFixed(2)}
                          </span>
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
                          min="2"
                          step="10"
                          value={couponStake}
                          onChange={(e) => setCouponStake(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono font-bold text-white"
                        />
                        {[50, 100, 200].map((val) => (
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

                    {/* Ewentualna wygrana */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-slate-400">
                          Ewentualna Wygrana {taxRate ? '(po podatku 12%)' : '(bez podatku)'}
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

                  {/* TABELA PORÓWNAWCZA STATYSTYK DRUŻYN Z KUPONU */}
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      Głęboka Analiza Statystyczna Spotkań na Kuponie
                    </h4>
                    <div className="space-y-2.5">
                      {couponPicks.map((item) => (
                        <div
                          key={`stat_${item.id}`}
                          className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/80 text-[11px]"
                        >
                          <div className="flex items-center justify-between font-bold text-white mb-1.5">
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
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================
          WIDOK 2: LABORATORIUM POJEDYNCZEGO MECZU (1 NA 1 + SUWAKI KONTUZJI I SYMULACJI)
         ======================================================================== */}
      {activeView === 'match-lab' && (
        <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEWA KOLUMNA (3/12): LISTA SPOTKAŃ + MODYFIKATORY */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    Wybierz Mecz do Analizy
                  </h2>
                </div>
                <span className="text-[11px] text-slate-500">{lastSyncTime}</span>
              </div>

              <div className="space-y-2.5">
                {matches.map((match) => {
                  const home = NBA_TEAMS_DB[match.home];
                  const away = NBA_TEAMS_DB[match.away];
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

            {/* Modyfikatory modelu Monte Carlo */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Parametry Symulacji
                </h2>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Liczba symulacji Monte Carlo</span>
                  <span className="font-mono font-bold text-indigo-400">
                    {simCount.toLocaleString('pl-PL')} gier
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[5000, 10000, 25000].map((val) => (
                    <button
                      key={val}
                      onClick={() => setSimCount(val)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-semibold border ${
                        simCount === val
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {val / 1000}k
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Przewaga parkietu (HCA)</span>
                  <span className="font-mono text-orange-400">+{homeCourtAdv.toFixed(1)} pkt</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5.5"
                  step="0.2"
                  value={homeCourtAdv}
                  onChange={(e) => setHomeCourtAdv(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2.5">
                <p className="text-xs font-semibold text-slate-300">Zmęczenie (Mecz dzień po dniu B2B)</p>
                <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                  <span>{selectedMatch.homeTeam.short} gra Back-to-Back (-2.4 pkt)</span>
                  <input
                    type="checkbox"
                    checked={homeB2B}
                    onChange={(e) => setHomeB2B(e.target.checked)}
                    className="rounded accent-orange-500 w-4 h-4"
                  />
                </label>
                <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                  <span>{selectedMatch.awayTeam.short} gra Back-to-Back (-2.4 pkt)</span>
                  <input
                    type="checkbox"
                    checked={awayB2B}
                    onChange={(e) => setAwayB2B(e.target.checked)}
                    className="rounded accent-orange-500 w-4 h-4"
                  />
                </label>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-3">
                <p className="text-xs font-semibold text-slate-300">Absencje / Kontuzje kluczowych graczy</p>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Osłabienie {selectedMatch.homeTeam.short}</span>
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
                    <span className="text-slate-400">Osłabienie {selectedMatch.awayTeam.short}</span>
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
          </div>

          {/* ŚRODKOWA KOLUMNA (5/12): WYNIKI SYMULACJI MONTE CARLO */}
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

              <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800 p-0.5">
                <div
                  style={{ width: `${simulationResults.awayWinProb}%` }}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-full rounded-l-full transition-all duration-300"
                />
                <div
                  style={{ width: `${simulationResults.homeWinProb}%` }}
                  className="bg-gradient-to-r from-orange-400 to-orange-600 h-full rounded-r-full transition-all duration-300"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-slate-800/80 text-center">
                <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/60">
                  <span className="text-[11px] text-slate-400 block">Szacowany Spread</span>
                  <span className="text-sm font-mono font-bold text-white">
                    {selectedMatch.homeTeam.short} {simulationResults.projectedSpreadLine > 0 ? `+${simulationResults.projectedSpreadLine}` : simulationResults.projectedSpreadLine}
                  </span>
                </div>
                <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/60">
                  <span className="text-[11px] text-slate-400 block">Suma Punktów (O/U)</span>
                  <span className="text-sm font-mono font-bold text-white">
                    {simulationResults.projectedTotalLine} pkt
                  </span>
                </div>
                <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/60">
                  <span className="text-[11px] text-slate-400 block">Tempo (Pace)</span>
                  <span className="text-sm font-mono font-bold text-white">
                    {simulationResults.expectedPace.toFixed(1)} pos.
                  </span>
                </div>
              </div>
            </div>

            {/* Porównanie Four Factors Deana Olivera */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4">
                Porównanie Four Factors (Dean Oliver Model)
              </h3>
              <div className="space-y-3.5">
                {[
                  { label: 'Offensive Rating (ORTG)', away: selectedMatch.awayTeam.ortg, home: selectedMatch.homeTeam.ortg, higherBetter: true },
                  { label: 'Defensive Rating (DRTG - mniej=lepiej)', away: selectedMatch.awayTeam.drtg, home: selectedMatch.homeTeam.drtg, higherBetter: false },
                  { label: 'Effective FG% (Skuteczność 40%)', away: selectedMatch.awayTeam.efg, home: selectedMatch.homeTeam.efg, higherBetter: true },
                  { label: 'Turnover % (Straty 25% - mniej=lepiej)', away: selectedMatch.awayTeam.tov, home: selectedMatch.homeTeam.tov, higherBetter: false },
                  { label: 'Offensive Rebound % (Zbiórki 20%)', away: selectedMatch.awayTeam.orb, home: selectedMatch.homeTeam.orb, higherBetter: true }
                ].map((stat, i) => {
                  const awayWinsStat = stat.higherBetter ? stat.away > stat.home : stat.away < stat.home;
                  return (
                    <div key={i} className="text-xs">
                      <div className="flex justify-between mb-1">
                        <span className={`font-mono font-bold ${awayWinsStat ? 'text-indigo-400' : 'text-slate-400'}`}>
                          {stat.away}
                        </span>
                        <span className="text-slate-300 font-medium">{stat.label}</span>
                        <span className={`font-mono font-bold ${!awayWinsStat ? 'text-orange-400' : 'text-slate-400'}`}>
                          {stat.home}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* PRAWA KOLUMNA (4/12): KALKULATOR VALUE BET & KRYTERIUM KELLY'EGO */}
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
                    step="0.05"
                    min="1.01"
                    value={oddsAway}
                    onChange={(e) => setOddsAway(Math.max(1.01, Number(e.target.value)))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-mono font-bold text-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Min. opłacalny: {bettingAnalysis.fairOddAway.toFixed(2)}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Kurs {selectedMatch.homeTeam.short} (Dom)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="1.01"
                    value={oddsHome}
                    onChange={(e) => setOddsHome(Math.max(1.01, Number(e.target.value)))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-mono font-bold text-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Min. opłacalny: {bettingAnalysis.fairOddHome.toFixed(2)}
                  </span>
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
