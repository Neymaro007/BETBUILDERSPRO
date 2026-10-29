import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Activity,
  TrendingUp,
  RefreshCw,
  ShieldAlert,
  Calculator,
  Sliders,
  BarChart3,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  Info,
  Trophy,
  Flame,
  Clock,
  DollarSign,
  Percent,
  Users,
  ChevronRight,
  Lock,
  Sparkles,
  ArrowRightLeft,
  HelpCircle,
  Ticket,
  PlusCircle,
  Trash2,
  Target,
  Award,
  Layers,
  Check,
  Wand2,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  AreaChart,
  Area
} from 'recharts';

// ============================================================================
// BAZA DANYCH 30 DRUŻYN NBA (STATYSTYKI ZAAWANSOWANE - FOUR FACTORS & RATINGS)
// ============================================================================
const NBA_TEAMS_DB = {
  BOS: {
    id: 'BOS', name: 'Boston Celtics', short: 'Celtics', conf: 'East', color: '#007A33',
    ortg: 122.8, drtg: 111.2, pace: 98.4, efg: 57.8, tov: 11.8, orb: 28.9, ftr: 21.5, l10: 8,
    starPlayers: 'J. Tatum, J. Brown'
  },
  OKC: {
    id: 'OKC', name: 'Oklahoma City Thunder', short: 'Thunder', conf: 'West', color: '#007AC1',
    ortg: 120.4, drtg: 110.5, pace: 100.6, efg: 56.9, tov: 12.1, orb: 25.4, ftr: 22.8, l10: 8,
    starPlayers: 'S. Gilgeous-Alexander, C. Holmgren'
  },
  DEN: {
    id: 'DEN', name: 'Denver Nuggets', short: 'Nuggets', conf: 'West', color: '#FEC524',
    ortg: 119.5, drtg: 112.4, pace: 97.2, efg: 56.4, tov: 12.4, orb: 30.2, ftr: 20.9, l10: 7,
    starPlayers: 'N. Jokić, J. Murray'
  },
  NYK: {
    id: 'NYK', name: 'New York Knicks', short: 'Knicks', conf: 'East', color: '#F58426',
    ortg: 118.9, drtg: 112.8, pace: 96.1, efg: 55.2, tov: 12.6, orb: 32.5, ftr: 22.1, l10: 7,
    starPlayers: 'J. Brunson, K. Towns'
  },
  MIN: {
    id: 'MIN', name: 'Minnesota Timberwolves', short: 'Timberwolves', conf: 'West', color: '#236192',
    ortg: 115.6, drtg: 109.4, pace: 97.8, efg: 55.8, tov: 14.1, orb: 27.6, ftr: 23.4, l10: 7,
    starPlayers: 'A. Edwards, R. Gobert'
  },
  DAL: {
    id: 'DAL', name: 'Dallas Mavericks', short: 'Mavericks', conf: 'West', color: '#00538C',
    ortg: 119.1, drtg: 114.2, pace: 100.2, efg: 56.7, tov: 12.2, orb: 26.8, ftr: 22.5, l10: 6,
    starPlayers: 'L. Dončić, K. Irving'
  },
  MIL: {
    id: 'MIL', name: 'Milwaukee Bucks', short: 'Bucks', conf: 'East', color: '#00471B',
    ortg: 118.2, drtg: 114.8, pace: 100.4, efg: 56.5, tov: 12.7, orb: 25.9, ftr: 24.8, l10: 6,
    starPlayers: 'G. Antetokounmpo, D. Lillard'
  },
  PHI: {
    id: 'PHI', name: 'Philadelphia 76ers', short: '76ers', conf: 'East', color: '#006BB6',
    ortg: 117.4, drtg: 113.5, pace: 98.1, efg: 54.6, tov: 11.9, orb: 28.4, ftr: 25.2, l10: 6,
    starPlayers: 'J. Embiid, T. Maxey'
  },
  CLE: {
    id: 'CLE', name: 'Cleveland Cavaliers', short: 'Cavaliers', conf: 'East', color: '#860038',
    ortg: 118.6, drtg: 111.9, pace: 98.5, efg: 56.8, tov: 13.1, orb: 27.5, ftr: 20.6, l10: 8,
    starPlayers: 'D. Mitchell, E. Mobley'
  },
  PHX: {
    id: 'PHX', name: 'Phoenix Suns', short: 'Suns', conf: 'West', color: '#E56020',
    ortg: 117.8, drtg: 114.6, pace: 98.9, efg: 56.1, tov: 14.3, orb: 28.1, ftr: 23.7, l10: 6,
    starPlayers: 'K. Durant, D. Booker'
  },
  IND: {
    id: 'IND', name: 'Indiana Pacers', short: 'Pacers', conf: 'East', color: '#FDBB30',
    ortg: 121.2, drtg: 117.5, pace: 102.3, efg: 57.6, tov: 12.8, orb: 26.2, ftr: 20.1, l10: 6,
    starPlayers: 'T. Haliburton, P. Siakam'
  },
  LAL: {
    id: 'LAL', name: 'Los Angeles Lakers', short: 'Lakers', conf: 'West', color: '#552583',
    ortg: 116.5, drtg: 114.9, pace: 101.1, efg: 56.2, tov: 13.4, orb: 24.8, ftr: 26.1, l10: 6,
    starPlayers: 'L. James, A. Davis'
  },
  GSW: {
    id: 'GSW', name: 'Golden State Warriors', short: 'Warriors', conf: 'West', color: '#1D428A',
    ortg: 117.3, drtg: 113.8, pace: 99.8, efg: 55.9, tov: 13.9, orb: 30.5, ftr: 20.4, l10: 7,
    starPlayers: 'S. Curry, D. Green'
  },
  MIA: {
    id: 'MIA', name: 'Miami Heat', short: 'Heat', conf: 'East', color: '#98002E',
    ortg: 114.2, drtg: 112.1, pace: 96.5, efg: 54.1, tov: 12.5, orb: 26.4, ftr: 22.9, l10: 5,
    starPlayers: 'J. Butler, B. Adebayo'
  },
  ORL: {
    id: 'ORL', name: 'Orlando Magic', short: 'Magic', conf: 'East', color: '#0077C0',
    ortg: 113.4, drtg: 110.2, pace: 97.4, efg: 53.8, tov: 14.4, orb: 29.8, ftr: 25.6, l10: 6,
    starPlayers: 'P. Banchero, F. Wagner'
  },
  SAC: {
    id: 'SAC', name: 'Sacramento Kings', short: 'Kings', conf: 'West', color: '#5A2D81',
    ortg: 116.9, drtg: 114.7, pace: 99.7, efg: 55.7, tov: 13.0, orb: 28.3, ftr: 20.8, l10: 6,
    starPlayers: 'D. Fox, D. Sabonis'
  },
  NOP: {
    id: 'NOP', name: 'New Orleans Pelicans', short: 'Pelicans', conf: 'West', color: '#0C2340',
    ortg: 115.8, drtg: 113.6, pace: 98.6, efg: 55.1, tov: 13.2, orb: 28.7, ftr: 22.7, l10: 5,
    starPlayers: 'Z. Williamson, B. Ingram'
  },
  LAC: {
    id: 'LAC', name: 'LA Clippers', short: 'Clippers', conf: 'West', color: '#C8102E',
    ortg: 116.4, drtg: 114.5, pace: 97.5, efg: 55.4, tov: 13.1, orb: 27.9, ftr: 22.3, l10: 5,
    starPlayers: 'J. Harden, K. Leonard'
  },
  HOU: {
    id: 'HOU', name: 'Houston Rockets', short: 'Rockets', conf: 'West', color: '#CE1141',
    ortg: 114.8, drtg: 111.8, pace: 99.3, efg: 53.6, tov: 12.6, orb: 31.4, ftr: 23.1, l10: 7,
    starPlayers: 'A. Şengün, J. Green'
  },
  MEM: {
    id: 'MEM', name: 'Memphis Grizzlies', short: 'Grizzlies', conf: 'West', color: '#5D76A9',
    ortg: 114.5, drtg: 113.2, pace: 100.5, efg: 54.0, tov: 14.2, orb: 29.6, ftr: 22.4, l10: 6,
    starPlayers: 'J. Morant, J. Jackson Jr.'
  },
  ATL: {
    id: 'ATL', name: 'Atlanta Hawks', short: 'Hawks', conf: 'East', color: '#E03A3E',
    ortg: 116.1, drtg: 117.8, pace: 101.4, efg: 54.5, tov: 13.3, orb: 30.8, ftr: 23.2, l10: 5,
    starPlayers: 'T. Young, J. Johnson'
  },
  CHI: {
    id: 'CHI', name: 'Chicago Bulls', short: 'Bulls', conf: 'East', color: '#CE1141',
    ortg: 113.8, drtg: 116.2, pace: 99.1, efg: 53.7, tov: 12.4, orb: 27.1, ftr: 20.5, l10: 4,
    starPlayers: 'Z. LaVine, C. White'
  },
  SAS: {
    id: 'SAS', name: 'San Antonio Spurs', short: 'Spurs', conf: 'West', color: '#C4CED4',
    ortg: 112.9, drtg: 114.4, pace: 100.8, efg: 53.9, tov: 14.6, orb: 27.4, ftr: 21.2, l10: 5,
    starPlayers: 'V. Wembanyama, D. Vassell'
  },
  TOR: {
    id: 'TOR', name: 'Toronto Raptors', short: 'Raptors', conf: 'East', color: '#CE1141',
    ortg: 112.4, drtg: 116.8, pace: 99.6, efg: 53.4, tov: 13.8, orb: 28.5, ftr: 21.6, l10: 3,
    starPlayers: 'S. Barnes, R. Barrett'
  },
  BKN: {
    id: 'BKN', name: 'Brooklyn Nets', short: 'Nets', conf: 'East', color: '#777D84',
    ortg: 112.1, drtg: 116.4, pace: 97.6, efg: 53.1, tov: 13.1, orb: 28.2, ftr: 20.9, l10: 4,
    starPlayers: 'C. Thomas, D. Schröder'
  },
  UTA: {
    id: 'UTA', name: 'Utah Jazz', short: 'Jazz', conf: 'West', color: '#002B5C',
    ortg: 113.2, drtg: 118.9, pace: 99.9, efg: 53.5, tov: 15.1, orb: 31.1, ftr: 22.6, l10: 3,
    starPlayers: 'L. Markkanen, C. Sexton'
  },
  POR: {
    id: 'POR', name: 'Portland Trail Blazers', short: 'Trail Blazers', conf: 'West', color: '#E03A3E',
    ortg: 109.8, drtg: 116.9, pace: 98.2, efg: 51.2, tov: 14.9, orb: 31.6, ftr: 21.8, l10: 3,
    starPlayers: 'A. Simons, D. Ayton'
  },
  CHA: {
    id: 'CHA', name: 'Charlotte Hornets', short: 'Hornets', conf: 'East', color: '#1D1160',
    ortg: 111.5, drtg: 117.9, pace: 98.4, efg: 52.8, tov: 13.9, orb: 26.9, ftr: 20.3, l10: 3,
    starPlayers: 'L. Ball, B. Miller'
  },
  DET: {
    id: 'DET', name: 'Detroit Pistons', short: 'Pistons', conf: 'East', color: '#C8102E',
    ortg: 111.2, drtg: 116.5, pace: 99.5, efg: 52.6, tov: 14.7, orb: 28.8, ftr: 21.9, l10: 4,
    starPlayers: 'C. Cunningham, J. Ivey'
  },
  WAS: {
    id: 'WAS', name: 'Washington Wizards', short: 'Wizards', conf: 'East', color: '#002B5C',
    ortg: 109.4, drtg: 119.5, pace: 102.7, efg: 52.4, tov: 14.5, orb: 25.1, ftr: 20.2, l10: 2,
    starPlayers: 'J. Poole, K. Kuzma'
  }
};

// Mapowanie skrótów ESPN na nasze ID w bazie
const ESPN_ABBR_MAP = {
  GS: 'GSW',
  NO: 'NOP',
  NY: 'NYK',
  SA: 'SAS',
  UTAH: 'UTA',
  WSH: 'WAS'
};

// ============================================================================
// DOMYŚLNE MECZE FALLBACK (GDY BRAK MECZÓW W API LUB BŁĄD POŁĄCZENIA)
// ============================================================================
const FALLBACK_GAMES = [
  {
    id: 'fallback-1',
    homeTeam: 'BOS',
    awayTeam: 'NYK',
    time: '01:30 CET',
    status: 'Zaplanowany (Hit Dnia)',
    venue: 'TD Garden, Boston',
    bookieOdds: { home: 1.48, away: 2.75 }
  },
  {
    id: 'fallback-2',
    homeTeam: 'LAL',
    awayTeam: 'PHX',
    time: '04:00 CET',
    status: 'Zaplanowany',
    venue: 'Crypto.com Arena, Los Angeles',
    bookieOdds: { home: 1.88, away: 1.98 }
  },
  {
    id: 'fallback-3',
    homeTeam: 'DEN',
    awayTeam: 'OKC',
    time: '02:30 CET',
    status: 'Zaplanowany (Szczyt Zachodu)',
    venue: 'Ball Arena, Denver',
    bookieOdds: { home: 1.82, away: 2.05 }
  },
  {
    id: 'fallback-4',
    homeTeam: 'MIL',
    awayTeam: 'CLE',
    time: '01:00 CET',
    status: 'Zaplanowany',
    venue: 'Fiserv Forum, Milwaukee',
    bookieOdds: { home: 1.92, away: 1.92 }
  },
  {
    id: 'fallback-5',
    homeTeam: 'DAL',
    awayTeam: 'MIN',
    time: '01:30 CET',
    status: 'Zaplanowany',
    venue: 'American Airlines Center, Dallas',
    bookieOdds: { home: 1.85, away: 2.00 }
  },
  {
    id: 'fallback-6',
    homeTeam: 'GSW',
    awayTeam: 'SAC',
    time: '04:00 CET',
    status: 'Zaplanowany',
    venue: 'Chase Center, San Francisco',
    bookieOdds: { home: 1.72, away: 2.18 }
  }
];

// ============================================================================
// FUNKCJE POMOCNICZE MATEMATYCZNE (ROZKŁAD GAUSSA BOX-MULLER)
// ============================================================================
function randomGaussian(mean, stdDev) {
  let u1 = 0, u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

// Funkcja uruchamiająca symulację Monte Carlo oraz generująca rynki i uzasadnienia dla pojedynczego meczu
function analyzeMatchupMonteCarlo(game, iterations = 8000, taxRate = 0.12) {
  const homeTeam = NBA_TEAMS_DB[game.homeTeam] || NBA_TEAMS_DB.BOS;
  const awayTeam = NBA_TEAMS_DB[game.awayTeam] || NBA_TEAMS_DB.NYK;

  const leagueAvgPace = 99.2;
  const hcaPoints = 2.8;
  const estimatedPace = (homeTeam.pace * awayTeam.pace) / leagueAvgPace;

  // Indeks Four Factors Deana Olivera
  const homeFF =
    (homeTeam.efg - 54.5) * 0.40 -
    (homeTeam.tov - 13.2) * 0.25 +
    (homeTeam.orb - 28.0) * 0.20 +
    (homeTeam.ftr - 22.0) * 0.15;

  const awayFF =
    (awayTeam.efg - 54.5) * 0.40 -
    (awayTeam.tov - 13.2) * 0.25 +
    (awayTeam.orb - 28.0) * 0.20 +
    (awayTeam.ftr - 22.0) * 0.15;

  let expectedHomeOrtg = (homeTeam.ortg + awayTeam.drtg) / 2 + (homeFF - awayFF) * 0.35 + (homeTeam.l10 - 5) * 0.45;
  let expectedAwayOrtg = (awayTeam.ortg + homeTeam.drtg) / 2 + (awayFF - homeFF) * 0.35 + (awayTeam.l10 - 5) * 0.45;

  const meanHome = expectedHomeOrtg * (estimatedPace / 100) + hcaPoints / 2;
  const meanAway = expectedAwayOrtg * (estimatedPace / 100) - hcaPoints / 2;

  // Linie bukmacherskie (Spread i Total) zaokrąglone do .5
  const rawExpectedMargin = meanHome - meanAway; // dodatni = gospodarz faworytem
  // Bukmacher wystawia linię nieco bardziej konserwatywną niż czysty model
  const bookieSpreadHome = Math.round((rawExpectedMargin * 0.85) - 0.5) + 0.5; // np. +4.5 -> linia -4.5 na gospodarza
  const spreadLineHome = -bookieSpreadHome; // ujemny gdy gospodarz faworytem
  const spreadLineAway = bookieSpreadHome;

  const rawExpectedTotal = meanHome + meanAway;
  const bookieTotalLine = Math.round(rawExpectedTotal * 0.985) + 0.5;

  const stdDev = 11.2;
  let homeWins = 0;
  let homeSpreadCovers = 0;
  let overHits = 0;
  let sumHome = 0;
  let sumAway = 0;

  for (let i = 0; i < iterations; i++) {
    const tempoShock = randomGaussian(0, 3.5);
    let h = Math.round(randomGaussian(meanHome + tempoShock, stdDev));
    let a = Math.round(randomGaussian(meanAway + tempoShock, stdDev));
    while (h === a) {
      h += Math.round(randomGaussian(11.0, 3.2));
      a += Math.round(randomGaussian(10.6, 3.2));
    }
    if (h > a) homeWins++;
    if (h + spreadLineHome > a) homeSpreadCovers++;
    if (h + a > bookieTotalLine) overHits++;
    sumHome += h;
    sumAway += a;
  }

  const pHome = homeWins / iterations;
  const pAway = 1 - pHome;
  const pHomeSpread = homeSpreadCovers / iterations;
  const pAwaySpread = 1 - pHomeSpread;
  const pOver = overHits / iterations;
  const pUnder = 1 - pOver;

  const avgHome = sumHome / iterations;
  const avgAway = sumAway / iterations;
  const avgTotal = avgHome + avgAway;
  const avgMargin = avgHome - avgAway;

  // Wyliczenie realistycznych kursów bukmacherskich dla rynków dodatkowych
  const oddHomeML = game.bookieOdds?.home || Number((1 / (pHome * 1.045)).toFixed(2));
  const oddAwayML = game.bookieOdds?.away || Number((1 / (pAway * 1.045)).toFixed(2));
  const oddHomeSpread = 1.90;
  const oddAwaySpread = 1.90;
  const oddOver = 1.90;
  const oddUnder = 1.90;

  // Generowanie automatycznych wniosków statystycznych (Factors Reasoning)
  const efgDiff = (homeTeam.efg - awayTeam.efg).toFixed(1);
  const orbDiff = (homeTeam.orb - awayTeam.orb).toFixed(1);
  const netHome = (homeTeam.ortg - homeTeam.drtg).toFixed(1);
  const netAway = (awayTeam.ortg - awayTeam.drtg).toFixed(1);

  const reasons = {
    homeML: `Net Rating ${homeTeam.short} (+${netHome}) vs ${awayTeam.short} (${netAway}) oraz przewaga własnego parkietu (+2.8 pkt). Skuteczność eFG%: ${homeTeam.efg}% vs ${awayTeam.efg}%.`,
    awayML: `${awayTeam.short} dysponuje silnym ORTG (${awayTeam.ortg} pkt/100 pos.) i formą L10 (${awayTeam.l10}/10 wygranych), co daje niedoszacowane przez rynek szanse wyjazdowe.`,
    homeSpread: `Symulacja Monte Carlo prognozuje średnią różnicę +${avgMargin.toFixed(1)} pkt dla ${homeTeam.short} (eFG% ${efgDiff > 0 ? '+' : ''}${efgDiff}%, ORB% ${orbDiff > 0 ? '+' : ''}${orbDiff}%).`,
    awaySpread: `Model wskazuje na zacięty pojedynek (średni margines ${avgMargin.toFixed(1)} pkt). Obrona ${awayTeam.short} (DRTG ${awayTeam.drtg}) pozwala utrzymać dodatni handicap.`,
    over: `Wysokie tempo spotkania (${estimatedPace.toFixed(1)} posiadań) oraz łączna efektywność ofensywna generują w symulacji średnio ${avgTotal.toFixed(1)} pkt (linia ${bookieTotalLine}).`,
    under: `Defensywny profil starcia (DRTG: ${homeTeam.drtg} vs ${awayTeam.drtg}) oraz kontrola tempa (${estimatedPace.toFixed(1)}) sprzyjają wynikowi poniżej ${bookieTotalLine} pkt.`
  };

  const netMult = 1 - taxRate;

  const createMarketPick = (marketId, marketType, selectionName, prob, odd, reasonText) => {
    const ev = (prob * (odd * netMult) - 1) * 100;
    const rawEdge = (prob - (1 / odd)) * 100; // przewaga czystego prawdopodobieństwa nad kursem
    const confidence = Math.min(99, Math.max(40, Math.round(prob * 100 + rawEdge * 1.2)));

    return {
      pickId: `${game.id}-${marketId}`,
      gameId: game.id,
      homeTeam: homeTeam,
      awayTeam: awayTeam,
      gameTitle: `${awayTeam.short} @ ${homeTeam.short}`,
      gameTime: game.time,
      marketType,
      selectionName,
      prob: Number((prob * 100).toFixed(1)),
      odd: Number(odd.toFixed(2)),
      ev: Number(ev.toFixed(2)),
      edge: Number(rawEdge.toFixed(1)),
      confidence,
      reason: reasonText,
      statsSnapshot: {
        avgScore: `${avgAway.toFixed(1)} : ${avgHome.toFixed(1)}`,
        avgTotal: avgTotal.toFixed(1),
        avgMargin: avgMargin.toFixed(1),
        pace: estimatedPace.toFixed(1),
        homeFF: homeFF.toFixed(2),
        awayFF: awayFF.toFixed(2)
      }
    };
  };

  const markets = [
    createMarketPick('ML_HOME', 'Zwycięzca (ML)', `${homeTeam.name} (Wygrana)`, pHome, oddHomeML, reasons.homeML),
    createMarketPick('ML_AWAY', 'Zwycięzca (ML)', `${awayTeam.name} (Wygrana)`, pAway, oddAwayML, reasons.awayML),
    createMarketPick(
      'SPREAD_HOME',
      'Handicap (Spread)',
      `${homeTeam.short} ${spreadLineHome > 0 ? `+${spreadLineHome}` : spreadLineHome} pkt`,
      pHomeSpread,
      oddHomeSpread,
      reasons.homeSpread
    ),
    createMarketPick(
      'SPREAD_AWAY',
      'Handicap (Spread)',
      `${awayTeam.short} ${spreadLineAway > 0 ? `+${spreadLineAway}` : spreadLineAway} pkt`,
      pAwaySpread,
      oddAwaySpread,
      reasons.awaySpread
    ),
    createMarketPick('TOTAL_OVER', 'Suma Punktów (O/U)', `Powyżej ${bookieTotalLine} pkt`, pOver, oddOver, reasons.over),
    createMarketPick('TOTAL_UNDER', 'Suma Punktów (O/U)', `Poniżej ${bookieTotalLine} pkt`, pUnder, oddUnder, reasons.under)
  ];

  // Wybór najlepszego typu z tego konkretnego meczu (najwyższy wskaźnik łączony: prawdopodobieństwo + EV)
  const bestPickForGame = [...markets].sort((a, b) => (b.ev + b.prob * 0.35) - (a.ev + a.prob * 0.35))[0];

  return {
    gameId: game.id,
    homeTeam,
    awayTeam,
    avgHome: avgHome.toFixed(1),
    avgAway: avgAway.toFixed(1),
    avgTotal: avgTotal.toFixed(1),
    avgMargin: avgMargin.toFixed(1),
    pace: estimatedPace.toFixed(1),
    spreadLineHome,
    bookieTotalLine,
    markets,
    bestPickForGame
  };
}

// ============================================================================
// GŁÓWNY KOMPONENT APLIKACJI
// ============================================================================
export default function App() {
  // Główna zakładka nawigacyjna: 'simulator' | 'picks' | 'ako_builder'
  const [mainTab, setMainTab] = useState('picks');

  // Stan meczów i API
  const [games, setGames] = useState(FALLBACK_GAMES);
  const [selectedGameId, setSelectedGameId] = useState(FALLBACK_GAMES[0].id);
  const [apiStatus, setApiStatus] = useState({ loading: false, live: false, lastSync: null, message: 'Inicjalizacja...' });
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customHome, setCustomHome] = useState('BOS');
  const [customAway, setCustomAway] = useState('DEN');

  // Parametry korekcyjne modelu (Suwaki użytkownika)
  const [hcaPoints, setHcaPoints] = useState(2.8); // Przewaga parkietu (punkty)
  const [homeRest, setHomeRest] = useState(0);     // -1: Back-to-Back, 0: Normalny, +1: 3+ dni odpoczynku
  const [awayRest, setAwayRest] = useState(0);
  const [homeInjuryImpact, setHomeInjuryImpact] = useState(0); // Obniżenie ORTG/DRTG przez kontuzje (0 do 8 pkt)
  const [awayInjuryImpact, setAwayInjuryImpact] = useState(0);
  const [includeRecentForm, setIncludeRecentForm] = useState(true);
  const [simIterations, setSimIterations] = useState(10000);
  const [simTrigger, setSimTrigger] = useState(0); // Licznik wymuszający ponowne przeliczenie Monte Carlo

  // Stan Modułu Bukmacherskiego
  const [oddsHome, setOddsHome] = useState(1.48);
  const [oddsAway, setOddsAway] = useState(2.75);
  const [overUnderLine, setOverUnderLine] = useState(224.5);
  const [spreadLine, setSpreadLine] = useState(-4.5); // Spread na gospodarza
  const [taxRate, setTaxRate] = useState(0.12); // 0.12 = 12% podatek PL, 0 = bez podatku
  const [bankroll, setBankroll] = useState(2000);
  const [kellyFraction, setKellyFraction] = useState(0.25); // Ćwierć Kelly'ego dla bezpieczeństwa
  const [activeChartTab, setActiveChartTab] = useState('spread'); // 'spread' | 'total' | 'factors'

  // ============================================================================
  // STAN KUPONU BUKMACHERSKIEGO (BET SLIP) & GENERATORA AKO
  // ============================================================================
  const [betSlip, setBetSlip] = useState([]);
  const [akoStake, setAkoStake] = useState(100);
  const [targetAkoOdd, setTargetAkoOdd] = useState(2.50); // Docelowy kurs minimalny np. 2.00, 3.00, 5.00
  const [akoStrategy, setAkoStrategy] = useState('safe'); // 'safe' | 'value' | 'balanced'
  const [picksFilter, setPicksFilter] = useState('all'); // 'all' | 'ML' | 'SPREAD' | 'TOTAL'
  const [expandedSlipAnalysis, setExpandedSlipAnalysis] = useState(true);

  // ============================================================================
  // POBIERANIE DANYCH LIVE Z API ESPN NBA SCOREBOARD
  // ============================================================================
  const fetchLiveGames = useCallback(async () => {
    setApiStatus(prev => ({ ...prev, loading: true, message: 'Łączenie z ESPN NBA Live API...' }));
    try {
      const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
      if (!response.ok) throw new Error('Błąd odpowiedzi serwera ESPN');
      const data = await response.json();

      const events = data?.events || [];
      const parsedGames = [];

      events.forEach((ev, idx) => {
        const comp = ev.competitions?.[0];
        if (!comp) return;
        const competitors = comp.competitors || [];
        const homeComp = competitors.find(c => c.homeAway === 'home');
        const awayComp = competitors.find(c => c.homeAway === 'away');

        if (homeComp && awayComp) {
          let rawHome = homeComp.team?.abbreviation?.toUpperCase();
          let rawAway = awayComp.team?.abbreviation?.toUpperCase();
          const homeId = ESPN_ABBR_MAP[rawHome] || rawHome;
          const awayId = ESPN_ABBR_MAP[rawAway] || rawAway;

          // Sprawdzamy czy obie drużyny są w naszej bazie 30 zespołów NBA
          if (NBA_TEAMS_DB[homeId] && NBA_TEAMS_DB[awayId]) {
            const hTeam = NBA_TEAMS_DB[homeId];
            const aTeam = NBA_TEAMS_DB[awayId];

            // Szacowanie realistycznych kursów wyjściowych na podstawie Net Ratingu
            const netDiff = (hTeam.ortg - hTeam.drtg) - (aTeam.ortg - aTeam.drtg) + 2.8;
            const estHomeProb = Math.min(0.88, Math.max(0.12, 1 / (1 + Math.pow(10, -netDiff / 11))));
            const estAwayProb = 1 - estHomeProb;
            // Kursy z marżą bukmachera ~4.5%
            const calcHomeOdd = Number((1 / (estHomeProb * 1.045)).toFixed(2));
            const calcAwayOdd = Number((1 / (estAwayProb * 1.045)).toFixed(2));

            const eventDate = new Date(ev.date);
            const timeStr = eventDate.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) + ' CET';
            const statusDesc = ev.status?.type?.detail || 'Zaplanowany';

            parsedGames.push({
              id: ev.id || `live-${idx}`,
              homeTeam: homeId,
              awayTeam: awayId,
              time: timeStr,
              status: statusDesc,
              venue: comp.venue?.fullName || 'NBA Arena',
              bookieOdds: {
                home: Math.max(1.08, calcHomeOdd),
                away: Math.max(1.08, calcAwayOdd)
              },
              liveScores: {
                home: homeComp.score,
                away: awayComp.score
              }
            });
          }
        }
      });

      const nowStr = new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      if (parsedGames.length > 0) {
        setGames(parsedGames);
        setSelectedGameId(parsedGames[0].id);
        setOddsHome(parsedGames[0].bookieOdds.home);
        setOddsAway(parsedGames[0].bookieOdds.away);
        setApiStatus({
          loading: false,
          live: true,
          lastSync: nowStr,
          message: `Pobrano ${parsedGames.length} meczów na żywo z ESPN API`
        });
      } else {
        // Jeśli dzisiaj w kalendarzu ESPN nie ma meczów (np. przerwa w terminarzu), używamy zestawu Fallback
        setGames(FALLBACK_GAMES);
        setSelectedGameId(FALLBACK_GAMES[0].id);
        setApiStatus({
          loading: false,
          live: true,
          lastSync: nowStr,
          message: 'API aktywne (Brak meczów dziś w terminarzu — załadowano zestaw symulacyjny NBA)'
        });
      }
    } catch (error) {
      const nowStr = new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setGames(FALLBACK_GAMES);
      setApiStatus({
        loading: false,
        live: false,
        lastSync: nowStr,
        message: 'Tryb Offline / Fallback (Załadowano zweryfikowaną bazę sezonową NBA)'
      });
    }
  }, []);

  useEffect(() => {
    fetchLiveGames();
  }, [fetchLiveGames]);

  // Aktualny wybrany pojedynek
  const currentMatchup = useMemo(() => {
    if (isCustomMode) {
      return {
        id: 'custom',
        homeTeam: customHome,
        awayTeam: customAway,
        time: 'Symulacja Niestandardowa',
        status: 'Kreator Własny',
        venue: `Parkiet Gospodarza (${NBA_TEAMS_DB[customHome]?.short})`,
        bookieOdds: { home: oddsHome, away: oddsAway }
      };
    }
    return games.find(g => g.id === selectedGameId) || games[0];
  }, [isCustomMode, customHome, customAway, games, selectedGameId, oddsHome, oddsAway]);

  const homeTeamData = NBA_TEAMS_DB[currentMatchup.homeTeam] || NBA_TEAMS_DB.BOS;
  const awayTeamData = NBA_TEAMS_DB[currentMatchup.awayTeam] || NBA_TEAMS_DB.NYK;

  // Zmiana wybranego meczu z listy aktualizuje domyślne kursy oraz linie
  const handleSelectGame = (game) => {
    setIsCustomMode(false);
    setSelectedGameId(game.id);
    setOddsHome(game.bookieOdds.home);
    setOddsAway(game.bookieOdds.away);
    // Resetujemy indywidualne kontuzje/zmęczenie przy zmianie meczu
    setHomeInjuryImpact(0);
    setAwayInjuryImpact(0);
    setHomeRest(0);
    setAwayRest(0);
  };

  // ============================================================================
  // SILNIK MATEMATYCZNY (DEAN OLIVER'S FOUR FACTORS + SYMULACJA MONTE CARLO)
  // ============================================================================
  const simulationResults = useMemo(() => {
    const leagueAvgOrtg = 115.4;
    const leagueAvgPace = 99.2;

    // 1. Estymacja liczby posiadań (Pace) metodą interakcyjną
    const estimatedPace = (homeTeamData.pace * awayTeamData.pace) / leagueAvgPace;

    // 2. Obliczanie przewagi w Four Factors Deana Olivera
    // Wagi Deana Olivera: Shooting (40%), Turnovers (25%), Rebounding (20%), Free Throws (15%)
    const homeFourFactorIndex =
      (homeTeamData.efg - 54.5) * 0.40 -
      (homeTeamData.tov - 13.2) * 0.25 +
      (homeTeamData.orb - 28.0) * 0.20 +
      (homeTeamData.ftr - 22.0) * 0.15;

    const awayFourFactorIndex =
      (awayTeamData.efg - 54.5) * 0.40 -
      (awayTeamData.tov - 13.2) * 0.25 +
      (awayTeamData.orb - 28.0) * 0.20 +
      (awayTeamData.ftr - 22.0) * 0.15;

    // 3. Bazowa efektywność ofensywna w tym konkretnym matchupie (na 100 posiadań)
    let expectedHomeOrtg = (homeTeamData.ortg + awayTeamData.drtg) / 2 + (homeFourFactorIndex - awayFourFactorIndex) * 0.35;
    let expectedAwayOrtg = (awayTeamData.ortg + homeTeamData.drtg) / 2 + (awayFourFactorIndex - homeFourFactorIndex) * 0.35;

    // 4. Uwzględnienie czynników korekcyjnych (Forma L10, Kontuzje)
    if (includeRecentForm) {
      expectedHomeOrtg += (homeTeamData.l10 - 5) * 0.45;
      expectedAwayOrtg += (awayTeamData.l10 - 5) * 0.45;
    }

    expectedHomeOrtg -= homeInjuryImpact * 1.15;
    expectedAwayOrtg -= awayInjuryImpact * 1.15;

    // 5. Przeliczenie na oczekiwane punkty w meczu (z uwzględnieniem Pace, HCA i Zmęczenia)
    const restImpactHome = homeRest === -1 ? -2.2 : homeRest === 1 ? 1.1 : 0;
    const restImpactAway = awayRest === -1 ? -2.4 : awayRest === 1 ? 1.1 : 0;

    const meanHomeScore = (expectedHomeOrtg * (estimatedPace / 100)) + (hcaPoints / 2) + restImpactHome;
    const meanAwayScore = (expectedAwayOrtg * (estimatedPace / 100)) - (hcaPoints / 2) + restImpactAway;

    // Odchylenie standardowe wyniku drużyny NBA (ok. 11.2 punktów na mecz)
    const teamStdDev = 11.2;

    // 6. Pętla symulacji Monte Carlo
    let homeWins = 0;
      individualKellyPct: recommendedPctAway.toFixed(2),
      stakeHome,
      stakeAway,
      fairOddHome,
      fairOddAway
    };
  }, [oddsHome, oddsAway, taxRate, simulationResults, bankroll, kellyFraction]);

  // ============================================================================
  // GLOBALNY SKANER WSZYSTKICH SPOTKAŃ (DLA REKOMENDACJI AI I GENERATORA AKO)
  // ============================================================================
  const allGamesAnalysis = useMemo(() => {
    return games.map(game => analyzeMatchupMonteCarlo(game, 8000, taxRate));
  }, [games, taxRate, simTrigger]);

  // Wszystkie dostępne rynki ze wszystkich dzisiejszych meczów posortowane wg atrakcyjności
  const allRecommendedPicks = useMemo(() => {
    const flatPicks = [];
    allGamesAnalysis.forEach(ga => {
      ga.markets.forEach(m => {
        flatPicks.push(m);
      });
    });

    // Filtrowanie po typie rynku jeśli wybrano
    const filtered = flatPicks.filter(p => {
      if (picksFilter === 'ML') return p.pickId.includes('ML_');
      if (picksFilter === 'SPREAD') return p.pickId.includes('SPREAD_');
      if (picksFilter === 'TOTAL') return p.pickId.includes('TOTAL_');
      return true;
    });

    // Sortowanie od najlepszych rekomendacji (kombinacja wysokiego prawdopodobieństwa i dodatniego Edge/EV)
    return filtered.sort((a, b) => (b.prob * 0.65 + b.edge * 1.8) - (a.prob * 0.65 + a.edge * 1.8));
  }, [allGamesAnalysis, picksFilter]);

  // Dodawanie / usuwanie zdarzenia z kuponu AKO (maksymalnie 1 zdarzenie z tego samego meczu na kuponie AKO)
  const togglePickInSlip = useCallback((pick) => {
    setBetSlip(prev => {
      const existsExact = prev.some(item => item.pickId === pick.pickId);
      if (existsExact) {
        return prev.filter(item => item.pickId !== pick.pickId);
      }
      // Zastąp inny typ z tego samego meczu, aby nie duplikować skorelowanych zdarzeń na jednym kuponie AKO
      const withoutSameGame = prev.filter(item => item.gameId !== pick.gameId);
      return [...withoutSameGame, pick];
    });
  }, []);

  // ============================================================================
  // ALGORYTMICZNY GENERATOR KUPONÓW AKO POD DOCELOWY KURS (NP. >2.00, >3.00)
  // ============================================================================
  const generateSmartAkoSlip = useCallback((customTargetOdd = null, customStrategy = null) => {
    const target = customTargetOdd !== null ? customTargetOdd : targetAkoOdd;
    const strat = customStrategy !== null ? customStrategy : akoStrategy;

    // Dla każdego meczu wybieramy najlepszego kandydata zgodnie ze strategią
    const candidatesPerGame = allGamesAnalysis.map(ga => {
      const validMarkets = ga.markets.filter(m => m.odd >= 1.22 && m.prob >= 51.0);
      const pool = validMarkets.length > 0 ? validMarkets : ga.markets;

      const sorted = [...pool].sort((a, b) => {
        if (strat === 'safe') {
          // Maksymalizacja prawdopodobieństwa wejścia przy rozsądnym kursie
          return b.prob - a.prob;
        } else if (strat === 'value') {
          // Maksymalizacja przewagi matematycznej nad bukmacherem (EV% / Edge)
          return b.ev - a.ev;
        } else {
          // Zbalansowany (Score łączący prawdopodobieństwo oraz EV)
          return (b.prob * 0.6 + b.ev * 2.0) - (a.prob * 0.6 + a.ev * 2.0);
        }
      });

      return sorted[0];
    });

    // Sortujemy najlepszych kandydatów z poszczególnych meczów
    const sortedCandidates = [...candidatesPerGame].sort((a, b) => {
      if (strat === 'safe') return b.prob - a.prob;
      if (strat === 'value') return b.ev - a.ev;
      return (b.prob * 0.6 + b.ev * 2.0) - (a.prob * 0.6 + a.ev * 2.0);
    });

    // Dokładamy kolejne mecze aż iloczyn kursów (AKO) osiągnie lub przekroczy docelowy kurs użytkownika
    const selectedSlip = [];
    let currentTotalOdd = 1.0;

    for (const candidate of sortedCandidates) {
      if (!candidate) continue;
      selectedSlip.push(candidate);
      currentTotalOdd *= candidate.odd;
      if (currentTotalOdd >= target && selectedSlip.length >= 2) {
        break;
      }
    }

    // Jeśli po dodaniu najlepszych nadal brakuje kursu (np. wysoki cel 8.00+ a niskie kursy faworytów),
    // dobieramy rynki z wyższym kursem (Spread / Total ~1.90)
    if (currentTotalOdd < target) {
      const highOddCandidates = allGamesAnalysis.map(ga => {
        return [...ga.markets]
          .filter(m => m.odd >= 1.75)
          .sort((a, b) => b.prob - a.prob)[0];
      }).sort((a, b) => b.prob - a.prob);

      selectedSlip.length = 0;
      currentTotalOdd = 1.0;
      for (const cand of highOddCandidates) {
        if (!cand) continue;
        selectedSlip.push(cand);
        currentTotalOdd *= cand.odd;
        if (currentTotalOdd >= target) break;
      }
    }

    setBetSlip(selectedSlip);
  }, [allGamesAnalysis, targetAkoOdd, akoStrategy]);

  // Inicjalne wygenerowanie przykładowego kuponu przy pierwszym załadowaniu
  useEffect(() => {
    if (betSlip.length === 0 && allGamesAnalysis.length >= 2) {
      generateSmartAkoSlip(2.50, 'balanced');
    }
  }, [allGamesAnalysis.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // OBLICZENIA DLA AKTUALNEGO KUPONU BUKMACHERSKIEGO (BET SLIP)
  // ============================================================================
  const slipMetrics = useMemo(() => {
    if (betSlip.length === 0) {
      return {
        totalOdd: 1.0,
        effectiveOdd: 1.0,
        combinedProb: 0,
        potentialWin: 0,
        netProfit: 0,
        evPct: 0,
        kellyStake: 0,
        kellyPct: 0
      };
    }

    const totalOdd = betSlip.reduce((acc, item) => acc * item.odd, 1.0);
    const combinedProbFraction = betSlip.reduce((acc, item) => acc * (item.prob / 100), 1.0);
    const netMultiplier = 1 - taxRate;
    const effectiveOdd = totalOdd * netMultiplier;

    const potentialWin = akoStake * effectiveOdd;
    const netProfit = potentialWin - akoStake;
    const evPct = (combinedProbFraction * effectiveOdd - 1) * 100;

    // Kryterium Kelly'ego dla całego kuponu AKO
    const b = effectiveOdd - 1;
    const rawKelly = b > 0 ? (b * combinedProbFraction - (1 - combinedProbFraction)) / b : 0;
    const kellyPct = Math.max(0, rawKelly * kellyFraction * 100);
    const kellyStake = Math.round((kellyPct / 100) * bankroll);

    return {
      totalOdd: totalOdd.toFixed(2),
      effectiveOdd: effectiveOdd.toFixed(2),
      combinedProb: (combinedProbFraction * 100).toFixed(1),
      potentialWin: potentialWin.toFixed(2),
      netProfit: netProfit.toFixed(2),
      evPct: evPct.toFixed(2),
      isPositiveEv: evPct > 0,
      kellyStake,
      kellyPct: kellyPct.toFixed(2)
    };
  }, [betSlip, taxRate, akoStake, kellyFraction, bankroll]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500 selection:text-white">
      {/* =====================================================================
          GÓRNY PASEK NAWIGACJI I WYBORU KATEGORII SPORTOWEJ
      ===================================================================== */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Logo i Tytuł */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  QUANT<span className="text-orange-500">BET</span> PRO
                </h1>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  Monte Carlo v4.2
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Zaawansowany Silnik Predykcyjny NBA & Kalkulator Value Bet
              </p>
            </div>
          </div>

          {/* Kafelki Kategorii Sportowych */}
          <nav className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setIsCustomMode(false)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-orange-500/20 to-blue-500/20 text-white border border-orange-500/50 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Koszykówka: NBA
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-orange-500 text-slate-950 font-bold">
                AKTYWNE
              </span>
            </button>

            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-900/60 text-slate-500 border border-slate-800/70 cursor-not-allowed select-none">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              Piłka Nożna (UEFA)
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-slate-800 text-slate-400">
                Wkrótce
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-900/60 text-slate-500 border border-slate-800/70 cursor-not-allowed select-none">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              Tenis (ATP/WTA)
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-slate-800 text-slate-400">
                Wkrótce
              </span>
            </div>

            <div className="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-900/60 text-slate-500 border border-slate-800/70 cursor-not-allowed select-none">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              E-sport (CS2/LoL)
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-slate-800 text-slate-400">
                Wkrótce
              </span>
            </div>
          </nav>

          {/* Status API i przycisk odświeżania */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col items-end text-right">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <span
                  className={`w-2 h-2 rounded-full ${
                    apiStatus.loading
                      ? 'bg-amber-400 animate-ping'
                      : apiStatus.live
                      ? 'bg-emerald-400'
                      : 'bg-blue-400'
                  }`}
                />
                <span className="text-slate-300">
                  {apiStatus.live ? 'Dane Live (ESPN API)' : 'Baza Sezonowa NBA'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                {apiStatus.lastSync ? `Sync: ${apiStatus.lastSync}` : apiStatus.message}
              </span>
            </div>

            <button
              onClick={fetchLiveGames}
              disabled={apiStatus.loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${apiStatus.loading ? 'animate-spin text-orange-400' : 'text-orange-400'}`} />
              <span>Odśwież Live</span>
            </button>
          </div>
        </div>

        {/* ===================================================================
            PODRZĘDNY PASEK NAWIGACJI MODUŁÓW (3 GŁÓWNE WIDOKI DLA GRACZA)
        =================================================================== */}
        <div className="bg-slate-900/90 border-t border-slate-800/80">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 py-2.5">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setMainTab('picks')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  mainTab === 'picks'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-950/70 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <BrainCircuit className="w-4 h-4" />
                <span>Co Obstawiać? (Rekomendacje AI)</span>
                <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-extrabold ${
                  mainTab === 'picks' ? 'bg-slate-950 text-emerald-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  TOP VALUE
                </span>
              </button>

              <button
                onClick={() => setMainTab('ako_builder')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  mainTab === 'ako_builder'
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-slate-950/70 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <Wand2 className="w-4 h-4" />
                <span>Kreator Kuponów AKO (Kurs 2.0+ / 3.0+)</span>
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 font-mono">
                  {betSlip.length} typów ({slipMetrics.totalOdd})
                </span>
              </button>

              <button
                onClick={() => setMainTab('simulator')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  mainTab === 'simulator'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/20'
                    : 'bg-slate-950/70 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Głęboki Symulator Meczu (25 000 gier)</span>
              </button>
            </div>

            {/* Szybki podgląd aktualnego kuponu w pasku */}
            <div className="flex items-center gap-3 ml-auto">
              <div className="hidden xl:flex items-center gap-2 text-xs bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <Ticket className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-400">Twój Kupon AKO:</span>
                <strong className="text-white font-mono">Kurs {slipMetrics.totalOdd}</strong>
                <span className="text-slate-600">|</span>
                <span className="text-emerald-400 font-mono font-semibold">
                  Szansa: {slipMetrics.combinedProb}%
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-amber-400 font-mono font-semibold">
                  Wygrana: {slipMetrics.potentialWin} PLN
                </span>
              </div>
              {mainTab !== 'ako_builder' && (
                <button
                  onClick={() => setMainTab('ako_builder')}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 transition-all flex items-center gap-1.5"
                >
                  <span>Otwórz Kupon ({betSlip.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================================
          WIDOK 1: CO OBSTAWIAĆ? (REKOMENDACJE AI & SKANER VALUE BETS)
      ===================================================================== */}
      {mainTab === 'picks' && (
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEWA CZĘŚĆ (8/12): REKOMENDACJE I ANALIZA MECZÓW */}
          <div className="lg:col-span-8 space-y-6">
            {/* Baner informacyjny skanera */}
            <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500 text-slate-950 uppercase tracking-wider">
                    Skaner Monte Carlo Aktywny
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Przeanalizowano {games.length * 8000} wirtualnych spotkań
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Co dzisiaj obstawiać? Najlepsze Typy Statystyczne & Value Bets
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl">
                  Poniżej znajdują się typy wyselekcjonowane przez model Four Factors Deana Olivera oraz symulacje rozkładu wyników. Kliknij <strong>„+ Dodaj do kuponu”</strong> przy dowolnym typie lub przejdź do kreatora, aby automatycznie zbudować kupon powyżej kursu 2.00 lub 3.00.
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-2 shrink-0">
                <button
                  onClick={() => {
                    setTargetAkoOdd(2.05);
                    setAkoStrategy('safe');
                    generateSmartAkoSlip(2.05, 'safe');
                    setMainTab('ako_builder');
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Zbuduj Kupon Kurs 2.00+</span>
                </button>
                <button
                  onClick={() => {
                    setTargetAkoOdd(3.15);
                    setAkoStrategy('balanced');
                    generateSmartAkoSlip(3.15, 'balanced');
                    setMainTab('ako_builder');
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4" />
                  <span>Zbuduj Kupon Kurs 3.00+</span>
                </button>
              </div>
            </div>

            {/* Pasek filtrów rynków */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-300">Filtruj rynek bukmacherski:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'Wszystkie Najlepsze Typy' },
                  { id: 'ML', label: 'Zwycięzca Meczu (1/2)' },
                  { id: 'SPREAD', label: 'Handicapy Punktowe (Spread)' },
                  { id: 'TOTAL', label: 'Suma Punktów (Over/Under)' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setPicksFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      picksFilter === tab.id
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista Najlepszych Rekomendowanych Typów ze szczegółowym uzasadnieniem */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allRecommendedPicks.slice(0, 12).map((pick, idx) => {
                const inSlip = betSlip.some(item => item.pickId === pick.pickId);
                const isTop3 = idx < 3;

                return (
                  <div
                    key={pick.pickId}
                    className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                      inSlip
                        ? 'bg-indigo-950/30 border-indigo-500 shadow-lg shadow-indigo-500/10'
                        : isTop3
                        ? 'bg-slate-900/95 border-emerald-500/50 shadow-xl'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Nagłówek karty typu */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          {isTop3 && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500 text-slate-950 uppercase">
                              TOP #{idx + 1} PEWNIAK
                            </span>
                          )}
                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800">
                            {pick.marketType}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">{pick.gameTime}</span>
                      </div>

                      {/* Spotkanie i główny typ */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="text-xs text-slate-400 font-medium">
                            {pick.awayTeam.name} @ {pick.homeTeam.name}
                          </div>
                          <h3 className="text-base font-extrabold text-white mt-0.5 flex items-center gap-2">
                            <span>Typ: {pick.selectionName}</span>
                          </h3>
                        </div>
                        <div className="text-right shrink-0 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Kurs Bukm.</span>
                          <span className="text-lg font-mono font-black text-amber-400">{pick.odd.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Pasek Prawdopodobieństwa i Przewagi (Edge / Confidence) */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/80 mb-3 text-center">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Szansa Monte Carlo</span>
                          <span className="text-sm font-mono font-bold text-emerald-400">{pick.prob}%</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Przewaga (Edge)</span>
                          <span className={`text-sm font-mono font-bold ${pick.edge > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                            {pick.edge > 0 ? `+${pick.edge}%` : `${pick.edge}%`}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Indeks Pewności</span>
                          <span className="text-sm font-mono font-bold text-indigo-400">{pick.confidence}/100</span>
                        </div>
                      </div>

                      {/* Uzasadnienie statystyczne z modelu Four Factors */}
                      <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 text-xs text-slate-300 space-y-1.5 mb-4">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono border-b border-slate-800/80 pb-1">
                          <span>Prognoza: <strong className="text-slate-200">{pick.statsSnapshot.avgScore}</strong></span>
                          <span>Suma: <strong className="text-slate-200">{pick.statsSnapshot.avgTotal} pkt</strong></span>
                          <span>Tempo: <strong className="text-slate-200">{pick.statsSnapshot.pace}</strong></span>
                        </div>
                        <p className="leading-relaxed text-[11px] text-slate-300 pt-0.5">
                          <strong className="text-emerald-400">Analiza AI: </strong>
                          {pick.reason}
                        </p>
                      </div>
                    </div>

                    {/* Przyciski akcji na karcie typu */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => togglePickInSlip(pick)}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          inSlip
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40'
                        }`}
                      >
                        {inSlip ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Dodano na Kupon AKO (Usuń)</span>
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-4 h-4" />
                            <span>Dodaj do Kuponu AKO</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          const targetGame = games.find(g => g.id === pick.gameId);
                          if (targetGame) handleSelectGame(targetGame);
                          setMainTab('simulator');
                        }}
                        className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                        title="Otwórz w głębokim symulatorze"
                      >
                        Symulator
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PRAWA CZĘŚĆ (4/12): PODGLĄD KUPONU BUKMACHERSKIEGO NA ŻYWO */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-28 bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Twój Kupon AKO ({betSlip.length})</h3>
                    <p className="text-[11px] text-slate-400">Kalkulacja prawdopodobieństwa i zysku na żywo</p>
                  </div>
                </div>
                {betSlip.length > 0 && (
                  <button
                    onClick={() => setBetSlip([])}
                    className="text-xs text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Wyczyść
                  </button>
                )}
              </div>

              {/* Szybkie generatory kursu 2.00+ / 3.00+ / 5.00+ bezpośrednio na kuponie */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                  <span>Szybki Auto-Generator Kuponu AKO:</span>
                  <span className="text-indigo-400 font-mono">AI Smart Pick</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setTargetAkoOdd(2.05);
                      generateSmartAkoSlip(2.05, 'safe');
                    }}
                    className="py-2 px-2 rounded-lg bg-slate-900 hover:bg-emerald-500/20 border border-slate-800 hover:border-emerald-500/50 text-xs font-bold text-emerald-400 transition-all"
                  >
                    Kurs ≥ 2.00
                    <span className="block text-[9px] text-slate-400 font-normal">Podwojenie</span>
                  </button>
                  <button
                    onClick={() => {
                      setTargetAkoOdd(3.10);
                      generateSmartAkoSlip(3.10, 'balanced');
                    }}
                    className="py-2 px-2 rounded-lg bg-slate-900 hover:bg-indigo-500/20 border border-slate-800 hover:border-indigo-500/50 text-xs font-bold text-indigo-400 transition-all"
                  >
                    Kurs ≥ 3.00
                    <span className="block text-[9px] text-slate-400 font-normal">Potrojenie</span>
                  </button>
                  <button
                    onClick={() => {
                      setTargetAkoOdd(5.20);
                      generateSmartAkoSlip(5.20, 'value');
                    }}
                    className="py-2 px-2 rounded-lg bg-slate-900 hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/50 text-xs font-bold text-amber-400 transition-all"
                  >
                    Kurs ≥ 5.00
                    <span className="block text-[9px] text-slate-400 font-normal">Wysokie AKO</span>
                  </button>
                </div>
              </div>

              {/* Lista wybranych zdarzeń na kuponie */}
              {betSlip.length === 0 ? (
                <div className="text-center py-8 px-4 border border-dashed border-slate-800 rounded-xl">
                  <Ticket className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-300">Kupon jest obecnie pusty</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Dodaj typy z listy po lewej stronie lub kliknij jeden z przycisków powyżej, aby wygenerować optymalny kupon.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {betSlip.map((item, i) => (
                    <div
                      key={item.pickId}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-indigo-400">
                          #{i + 1} • {item.gameTitle}
                        </span>
                        <button
                          onClick={() => togglePickInSlip(item)}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">{item.selectionName}</div>
                          <div className="text-[10px] text-slate-400">
                            {item.marketType} • Szansa modelu: <strong className="text-emerald-400">{item.prob}%</strong>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 font-mono text-xs font-black text-amber-400">
                          {item.odd.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Podsumowanie finansowe i matematyczne kuponu */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Stawka Kuponu (PLN):</label>
                    <input
                      type="number"
                      min="2"
                      step="10"
                      value={akoStake}
                      onChange={(e) => setAkoStake(Math.max(1, parseFloat(e.target.value) || 0))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono font-bold text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Podatek Bukmacherski:</label>
                    <select
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-semibold"
                    >
                      <option value={0.12}>Polska 12% (x0.88)</option>
                      <option value={0}>Bez podatku 0% (x1.00)</option>
                    </select>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-950 to-indigo-950/30 border border-indigo-500/30 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kurs Całkowity (AKO):</span>
                    <span className="font-mono font-black text-base text-amber-400">{slipMetrics.totalOdd}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Łączna Szansa Trafienia (Monte Carlo):</span>
                    <span className="font-mono font-bold text-emerald-400">{slipMetrics.combinedProb}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Wartość Oczekiwana Kuponu (EV):</span>
                    <span className={`font-mono font-bold ${slipMetrics.isPositiveEv ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {Number(slipMetrics.evPct) > 0 ? `+${slipMetrics.evPct}%` : `${slipMetrics.evPct}%`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800/80 text-sm">
                    <span className="font-bold text-slate-200">Ewentualna Wygrana:</span>
                    <span className="font-mono font-black text-emerald-400">{slipMetrics.potentialWin} PLN</span>
                  </div>
                </div>

                <button
                  onClick={() => setMainTab('ako_builder')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  <span>Otwórz Pełną Analizę Statystyczną Kuponu</span>
                </button>
              </div>
            </div>
          </aside>
        </main>
      )}

      {/* =====================================================================
          WIDOK 2: GENERATOR KUPONÓW AKO (KURS 2.0+ / 3.0+ / SUWAK) & RAPORT
      ===================================================================== */}
      {mainTab === 'ako_builder' && (
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Panel Sterowania Generatorem AKO */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Opis i Szybkie Presety Kursowe */}
              <div className="lg:col-span-5 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold">
                  <Wand2 className="w-3.5 h-3.5" />
                  Smart AKO Optimizer • Monte Carlo Engine
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Generator Kuponów Powyżej Wybranego Kursu
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Wybierz docelowy kurs minimalny (np. podwojenie <strong>2.00+</strong> lub potrojenie <strong>3.00+</strong>) oraz strategię matematyczną. Algorytm przeskanuje wszystkie dzisiejsze mecze NBA i wybierze kombinację o najwyższym łącznym prawdopodobieństwie trafienia.
                </p>

                <div className="pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Szybki wybór progu kursowego:
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Kurs 2.00+', val: 2.05, desc: 'Podwojenie' },
                      { label: 'Kurs 3.00+', val: 3.10, desc: 'Potrojenie' },
                      { label: 'Kurs 5.00+', val: 5.15, desc: 'Wysokie AKO' },
                      { label: 'Kurs 8.00+', val: 8.20, desc: 'Taśma Pro' }
                    ].map(preset => (
                      <button
                        key={preset.val}
                        onClick={() => {
                          setTargetAkoOdd(preset.val);
                          generateSmartAkoSlip(preset.val, akoStrategy);
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          Math.abs(targetAkoOdd - preset.val) < 0.2
                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/25'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-black font-mono">{preset.label}</div>
                        <div className="text-[10px] opacity-80">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suwak docelowego kursu i wybór strategii */}
              <div className="lg:col-span-4 bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="font-bold text-slate-300">Docelowy Kurs Minimalny:</span>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/40 font-mono text-base font-black text-indigo-300">
                      ≥ {targetAkoOdd.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.50"
                    max="12.00"
                    step="0.25"
                    value={targetAkoOdd}
                    onChange={(e) => setTargetAkoOdd(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                    <span>1.50</span>
                    <span>2.00</span>
                    <span>3.00</span>
                    <span>5.00</span>
                    <span>12.00+</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Strategia Doboru Spotkań przez Algorytm:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'safe', name: 'Pewniaki', desc: 'Max Szansa %' },
                      { id: 'balanced', name: 'Zbalansowany', desc: 'Optymalny' },
                      { id: 'value', name: 'Value Hunter', desc: 'Max Przewaga EV' }
                    ].map(st => (
                      <button
                        key={st.id}
                        onClick={() => {
                          setAkoStrategy(st.id);
                          generateSmartAkoSlip(targetAkoOdd, st.id);
                        }}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          akoStrategy === st.id
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-bold">{st.name}</div>
                        <div className="text-[10px] opacity-75">{st.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => generateSmartAkoSlip(targetAkoOdd, akoStrategy)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Wygeneruj Optymalny Kupon (Kurs ≥ {targetAkoOdd.toFixed(2)})</span>
                </button>
              </div>

              {/* Karta Wynikowa Wygenerowanego Kuponu */}
              <div className="lg:col-span-3 bg-slate-950 p-5 rounded-2xl border border-indigo-500/40 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-slate-400 uppercase">Parametry Kuponu</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500 text-white">
                    {betSlip.length} Zdarzenia
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Kurs Całkowity AKO</span>
                    <span className="text-xl font-mono font-black text-amber-400">{slipMetrics.totalOdd}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Szansa Trafienia AKO</span>
                    <span className="text-xl font-mono font-black text-emerald-400">{slipMetrics.combinedProb}%</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stawka:</span>
                    <span className="font-mono font-bold text-white">{akoStake} PLN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sugerowany Kelly ({kellyFraction * 100}%):</span>
                    <span className="font-mono font-bold text-indigo-400">{slipMetrics.kellyStake} PLN ({slipMetrics.kellyPct}%)</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-800">
                    <span className="font-bold text-slate-200">Do Wypłaty:</span>
                    <span className="font-mono font-black text-emerald-400">{slipMetrics.potentialWin} PLN</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================================
              SZCZEGÓŁOWA ANALIZA STATYSTYCZNA KAŻDEGO MECZU NA KUPONIE AKO
          ================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Lista analizowanych spotkań wchodzących w skład kuponu (8/12) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <span>Głęboki Raport Analityczny Spotkań na Kuponie ({betSlip.length})</span>
                </h3>
                <span className="text-xs text-slate-400">
                  Każdy typ zweryfikowany przez 8 000 iteracji Monte Carlo i model Four Factors
                </span>
              </div>

              {betSlip.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
                  <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                  <h4 className="text-base font-bold text-white">Brak wybranych spotkań na kuponie</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Użyj przycisku „Wygeneruj Optymalny Kupon” powyżej lub wybierz ręcznie dowolny typ z tabeli wszystkich dzisiejszych spotkań obok.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {betSlip.map((pick, index) => {
                    const hTeam = pick.homeTeam;
                    const aTeam = pick.awayTeam;

                    return (
                      <div
                        key={pick.pickId}
                        className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4"
                      >
                        {/* Górny pasek pojedynczego meczu na kuponie */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-mono font-black text-sm flex items-center justify-center">
                              #{index + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">
                                  {aTeam.name} @ {hTeam.name}
                                </span>
                                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 font-mono">
                                  {pick.gameTime}
                                </span>
                              </div>
                              <div className="text-xs text-emerald-400 font-bold mt-0.5">
                                Wybrany Typ: {pick.selectionName} ({pick.marketType})
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                              <span className="text-[10px] text-slate-400 block">Szansa Modelu</span>
                              <span className="text-sm font-mono font-black text-emerald-400">{pick.prob}%</span>
                            </div>
                            <div className="text-right bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                              <span className="text-[10px] text-slate-400 block">Kurs Typu</span>
                              <span className="text-sm font-mono font-black text-amber-400">{pick.odd.toFixed(2)}</span>
                            </div>
                            <button
                              onClick={() => togglePickInSlip(pick)}
                              className="p-2 rounded-xl bg-slate-950 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 transition-all"
                              title="Usuń z kuponu"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Szczegółowa tabela porównawcza statystyk obu drużyn w tym meczu */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                          {/* Metryki Drużynowe i Four Factors (7/12) */}
                          <div className="md:col-span-7 bg-slate-950/90 p-3.5 rounded-xl border border-slate-800/80 space-y-2.5">
                            <div className="flex justify-between text-[11px] font-bold text-slate-400 border-b border-slate-800 pb-1.5">
                              <span className="text-blue-400">{aTeam.short} (Gość)</span>
                              <span>Kluczowe Statystyki (Four Factors)</span>
                              <span className="text-orange-400">{hTeam.short} (Dom)</span>
                            </div>

                            {[
                              { name: 'ORTG (Atak / 100 pos.)', a: aTeam.ortg, h: hTeam.ortg, highBetter: true },
                              { name: 'DRTG (Obrona / 100 pos.)', a: aTeam.drtg, h: hTeam.drtg, highBetter: false },
                              { name: 'eFG% (Skuteczność z gry)', a: `${aTeam.efg}%`, h: `${hTeam.efg}%`, rawA: aTeam.efg, rawH: hTeam.efg, highBetter: true },
                              { name: 'ORB% (Zbiórki ofensywne)', a: `${aTeam.orb}%`, h: `${hTeam.orb}%`, rawA: aTeam.orb, rawH: hTeam.orb, highBetter: true },
                              { name: 'TOV% (Straty piłki)', a: `${aTeam.tov}%`, h: `${hTeam.tov}%`, rawA: aTeam.tov, rawH: hTeam.tov, highBetter: false },
                              { name: 'Forma (Ostatnie 10 gier)', a: `${aTeam.l10}-` + (10 - aTeam.l10), h: `${hTeam.l10}-` + (10 - hTeam.l10), rawA: aTeam.l10, rawH: hTeam.l10, highBetter: true }
                            ].map((row, rIdx) => {
                              const valA = row.rawA !== undefined ? row.rawA : row.a;
                              const valH = row.rawH !== undefined ? row.rawH : row.h;
                              const homeBetter = row.highBetter ? valH > valA : valH < valA;

                              return (
                                <div key={rIdx} className="flex items-center justify-between text-xs font-mono">
                                  <span className={!homeBetter ? 'text-blue-400 font-bold' : 'text-slate-400'}>
                                    {row.a}
                                  </span>
                                  <span className="text-[11px] font-sans text-slate-300">{row.name}</span>
                                  <span className={homeBetter ? 'text-orange-400 font-bold' : 'text-slate-400'}>
                                    {row.h}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Wnioski z symulacji Monte Carlo dla tego zdarzenia (5/12) */}
                          <div className="md:col-span-5 bg-slate-950/90 p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between h-full space-y-3">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                                Werdykt Symulacji Monte Carlo
                              </span>
                              <div className="grid grid-cols-2 gap-2 my-2">
                                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
                                  <span className="text-[10px] text-slate-400 block">Średni Wynik</span>
                                  <span className="text-xs font-mono font-bold text-white">{pick.statsSnapshot.avgScore}</span>
                                </div>
                                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
                                  <span className="text-[10px] text-slate-400 block">Śr. Suma Pkt</span>
                                  <span className="text-xs font-mono font-bold text-emerald-400">{pick.statsSnapshot.avgTotal} pkt</span>
                                </div>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                                {pick.reason}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                              <span className="text-slate-400">Liderzy ({hTeam.id}): <strong className="text-slate-200">{hTeam.starPlayers}</strong></span>
                              <button
                                onClick={() => {
                                  const targetGame = games.find(g => g.id === pick.gameId);
                                  if (targetGame) handleSelectGame(targetGame);
                                  setMainTab('simulator');
                                }}
                                className="text-orange-400 hover:underline font-semibold shrink-0 ml-2"
                              >
                                Wykresy meczu →
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Prawa Kolumna w Kreatorze (4/12): Szybkie ręczne podmienianie i dodawanie rynków z dzisiejszych meczów */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                <span>Wszystkie Mecze i Rynki (Dodaj ręcznie)</span>
              </h3>

              <div className="space-y-3 max-h-[780px] overflow-y-auto pr-1">
                {allGamesAnalysis.map((ga) => (
                  <div
                    key={ga.gameId}
                    className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div>
                        <div className="text-sm font-bold text-white">
                          {ga.awayTeam.short} @ {ga.homeTeam.short}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Prognoza: <strong className="text-slate-200">{ga.avgAway} : {ga.avgHome}</strong> (Suma: {ga.avgTotal})
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        Tempo {ga.pace}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {ga.markets.map((m) => {
                        const isSelected = betSlip.some(item => item.pickId === m.pickId);
                        return (
                          <button
                            key={m.pickId}
                            onClick={() => togglePickInSlip(m)}
                            className={`p-2 rounded-xl border text-left transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-400 text-white'
                                : 'bg-slate-950/80 border-slate-800/90 hover:border-slate-700 text-slate-200'
                            }`}
                          >
                            <div className="truncate pr-1">
                              <div className="text-[11px] font-bold truncate">{m.selectionName}</div>
                              <div className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-emerald-400'}`}>
                                Szansa: {m.prob}%
                              </div>
                            </div>
                            <span className={`font-mono text-xs font-black px-1.5 py-0.5 rounded ${
                              isSelected ? 'bg-indigo-800 text-amber-300' : 'bg-slate-900 text-amber-400'
                            }`}>
                              {m.odd.toFixed(2)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* =====================================================================
          WIDOK 3: GŁĘBOKI SYMULATOR POJEDYNCZEGO MECZU (3 KOLUMNY ANALITYCZNE)
      ===================================================================== */}
      {mainTab === 'simulator' && (
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* -------------------------------------------------------------------
              LEWA KOLUMNA (3/12): LISTA SPOTKAŃ LIVE ORAZ KREATOR WŁASNY
          ------------------------------------------------------------------- */}
          <aside className="lg:col-span-3 space-y-6">
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {bettingAnalysis.isValueHome ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    )}
                    <span className="text-xs font-bold text-white">
                      Typ na: {homeTeamData.name}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                      bettingAnalysis.isValueHome
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {bettingAnalysis.isValueHome ? 'VALUE BET!' : 'Brak Value'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs mt-3 pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Szansa Modelu</span>
                    <span className="font-mono font-bold text-white">{simulationResults.homeWinProb.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Expected Value (EV)</span>
                    <span
                      className={`font-mono font-bold ${
                        bettingAnalysis.isValueHome ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {Number(bettingAnalysis.evHome) > 0 ? `+${bettingAnalysis.evHome}%` : `${bettingAnalysis.evHome}%`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Stawka Kelly</span>
                    <span className="font-mono font-bold text-amber-400">
                      {bettingAnalysis.stakeHome} PLN ({bettingAnalysis.recommendedPctHome}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Zarządzanie Kapitałem (Bankroll & Ułamkowy Kelly) */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Zarządzanie Kapitałem (Kryterium Kelly'ego)
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Twój Kapitał (PLN):</label>
                  <input
                    type="number"
                    step="100"
                    min="50"
                    value={bankroll}
                    onChange={(e) => setBankroll(Math.max(10, parseInt(e.target.value, 10) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono font-bold text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Strategia Kelly'ego:</label>
                  <select
                    value={kellyFraction}
                    onChange={(e) => setKellyFraction(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200"
                  >
                    <option value={0.125}>1/8 Kelly (Bardzo ostrożna)</option>
                    <option value={0.25}>1/4 Kelly (Zalecana Pro)</option>
                    <option value={0.5}>1/2 Kelly (Dynamiczna)</option>
                    <option value={1.0}>Pełny Kelly (Agresywna)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Marża Bukmachera (Overround):</span>
                <span className="font-mono font-semibold text-slate-200">{bettingAnalysis.bookieMargin}%</span>
              </div>
            </div>
          </div>
        </aside>
      </main>
      )}

      {/* =====================================================================
          PASEK ODPOWIEDZIALNEJ GRY I INFORMACJI O MODELU
      ===================================================================== */}
      <footer className="max-w-[1600px] mx-auto px-4 sm:px-6 pb-8 pt-2">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <p>
              <strong className="text-slate-200">Informacja o Ryzyku i Odpowiedzialnej Grze:</strong> Symulacje Monte Carlo oraz model Four Factors szacują prawdopodobieństwo statystyczne na podstawie danych historycznych i bieżących, co nie stanowi gwarancji wyniku sportowego. Graj odpowiedzialnie i stosuj rygorystyczne zarządzanie kapitałem (Bankroll Management).
            </p>
          </div>
          <div className="text-[11px] text-slate-500 shrink-0 font-mono">
            NBA Engine v4.2 • 18+
          </div>
        </div>
      </footer>
    </div>
  );
}
