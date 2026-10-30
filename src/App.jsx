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
  Edit3,
  Lock,
  Unlock,
  Trophy,
  Globe
} from 'lucide-react';

// ============================================================================
// DEFINICJA KATEGORII SPORTOWYCH
// ============================================================================
const SPORT_CATEGORIES = [
  { id: 'ALL', name: 'Wszystkie Sporty', short: 'WSZYSTKIE', icon: '🔥', modelName: 'Multi-Model AI' },
  { id: 'NBA', name: 'Koszykówka USA (NBA)', short: 'NBA', icon: '🏀', modelName: 'Gauss + Four Factors (48m)' },
  { id: 'EURO_BASKET', name: 'Koszykówka Europa (Euroliga / PLK)', short: 'EURO BASKET', icon: '🌍', modelName: 'FIBA Gauss Model (40m)' },
  { id: 'SOCCER', name: 'Piłka Nożna (Top Ligi & LM)', short: 'PIŁKA NOŻNA', icon: '⚽', modelName: 'Poisson xG & Dixon-Coles' },
  { id: 'TENNIS', name: 'Tenis (ATP / WTA Tour)', short: 'TENIS', icon: '🎾', modelName: 'Surface ELO & Service Hold%' },
  { id: 'HOCKEY', name: 'Hokej na Lodzie (NHL & Europa)', short: 'HOKEJ', icon: '🏒', modelName: 'Poisson xG + Bramkarze SV%' }
];

// ============================================================================
// 1. BAZA DRUŻYN NBA (USA - 48 MINUT)
// ============================================================================
const NBA_TEAMS_DB = {
  BOS: { id: 'BOS', name: 'Boston Celtics', short: 'BOS', ortg: 123.2, drtg: 111.6, pace: 98.2, efg: 57.8, tov: 11.9, orb: 28.8, ftr: 20.5, l10: 0.80, starPlayer: 'Jayson Tatum, Jaylen Brown', keyRotation: ['Tatum', 'Brown', 'Porzingis', 'White', 'Holiday'] },
  OKC: { id: 'OKC', name: 'Oklahoma City Thunder', short: 'OKC', ortg: 119.5, drtg: 111.0, pace: 100.6, efg: 57.3, tov: 12.4, orb: 24.5, ftr: 21.8, l10: 0.70, starPlayer: 'Shai Gilgeous-Alexander, Chet Holmgren', keyRotation: ['Gilgeous-Alexander', 'Holmgren', 'Williams', 'Hartenstein', 'Caruso'] },
  DEN: { id: 'DEN', name: 'Denver Nuggets', short: 'DEN', ortg: 118.5, drtg: 112.3, pace: 97.4, efg: 56.2, tov: 12.6, orb: 30.2, ftr: 19.9, l10: 0.80, starPlayer: 'Nikola Jokić, Jamal Murray', keyRotation: ['Jokic', 'Jokić', 'Murray', 'Gordon', 'Porter'] },
  MIN: { id: 'MIN', name: 'Minnesota Timberwolves', short: 'MIN', ortg: 115.6, drtg: 109.0, pace: 97.8, efg: 55.9, tov: 14.2, orb: 27.5, ftr: 22.8, l10: 0.70, starPlayer: 'Anthony Edwards, Rudy Gobert', keyRotation: ['Edwards', 'Gobert', 'Randle', 'McDaniels', 'Conley'] },
  NYK: { id: 'NYK', name: 'New York Knicks', short: 'NYK', ortg: 118.2, drtg: 112.4, pace: 96.1, efg: 54.8, tov: 13.1, orb: 33.4, ftr: 21.2, l10: 0.60, starPlayer: 'Jalen Brunson, Karl-Anthony Towns', keyRotation: ['Brunson', 'Towns', 'Anunoby', 'Bridges', 'Hart'] },
  MIL: { id: 'MIL', name: 'Milwaukee Bucks', short: 'MIL', ortg: 118.4, drtg: 115.2, pace: 100.2, efg: 56.8, tov: 12.7, orb: 24.8, ftr: 23.9, l10: 0.60, starPlayer: 'Giannis Antetokounmpo, Damian Lillard', keyRotation: ['Antetokounmpo', 'Lillard', 'Lopez', 'Portis'] },
  DAL: { id: 'DAL', name: 'Dallas Mavericks', short: 'DAL', ortg: 117.9, drtg: 114.6, pace: 100.1, efg: 56.5, tov: 12.1, orb: 25.9, ftr: 21.4, l10: 0.80, starPlayer: 'Kyrie Irving, Anthony Davis', keyRotation: ['Irving', 'Davis', 'Thompson', 'Washington', 'Lively'] },
  CLE: { id: 'CLE', name: 'Cleveland Cavaliers', short: 'CLE', ortg: 116.2, drtg: 112.1, pace: 98.0, efg: 55.7, tov: 13.4, orb: 26.8, ftr: 20.1, l10: 0.60, starPlayer: 'Donovan Mitchell, Evan Mobley', keyRotation: ['Mitchell', 'Mobley', 'Garland', 'Allen', 'Strus'] },
  PHX: { id: 'PHX', name: 'Phoenix Suns', short: 'PHX', ortg: 117.6, drtg: 114.4, pace: 98.5, efg: 56.4, tov: 14.6, orb: 29.1, ftr: 23.4, l10: 0.70, starPlayer: 'Kevin Durant, Devin Booker', keyRotation: ['Durant', 'Booker', 'Beal', 'Nurkic', 'Jones'] },
  LAL: { id: 'LAL', name: 'Los Angeles Lakers', short: 'LAL', ortg: 115.9, drtg: 115.2, pace: 101.4, efg: 56.6, tov: 13.6, orb: 24.1, ftr: 24.8, l10: 0.70, starPlayer: 'Luka Dončić, LeBron James', keyRotation: ['Doncic', 'Dončić', 'James', 'Reaves', 'Hachimura'] },
  IND: { id: 'IND', name: 'Indiana Pacers', short: 'IND', ortg: 120.5, drtg: 118.0, pace: 102.3, efg: 57.9, tov: 12.8, orb: 26.2, ftr: 19.2, l10: 0.60, starPlayer: 'Tyrese Haliburton, Pascal Siakam', keyRotation: ['Haliburton', 'Siakam', 'Turner', 'Nembhard', 'Nesmith'] },
  PHI: { id: 'PHI', name: 'Philadelphia 76ers', short: 'PHI', ortg: 116.8, drtg: 113.8, pace: 97.6, efg: 53.9, tov: 11.8, orb: 28.9, ftr: 24.2, l10: 0.60, starPlayer: 'Joel Embiid, Tyrese Maxey', keyRotation: ['Embiid', 'Maxey', 'George', 'Oubre'] },
  ORL: { id: 'ORL', name: 'Orlando Magic', short: 'ORL', ortg: 113.4, drtg: 110.8, pace: 97.3, efg: 54.1, tov: 14.5, orb: 29.8, ftr: 25.1, l10: 0.60, starPlayer: 'Paolo Banchero, Franz Wagner', keyRotation: ['Banchero', 'Wagner', 'Suggs', 'Carter'] },
  SAC: { id: 'SAC', name: 'Sacramento Kings', short: 'SAC', ortg: 116.9, drtg: 115.1, pace: 100.1, efg: 56.1, tov: 13.0, orb: 28.2, ftr: 19.6, l10: 0.50, starPlayer: 'Domantas Sabonis, DeMar DeRozan', keyRotation: ['Sabonis', 'DeRozan', 'LaVine', 'Murray', 'Monk'] },
  GSW: { id: 'GSW', name: 'Golden State Warriors', short: 'GSW', ortg: 117.2, drtg: 115.0, pace: 99.8, efg: 55.8, tov: 14.1, orb: 31.2, ftr: 20.0, l10: 0.70, starPlayer: 'Stephen Curry, Jimmy Butler', keyRotation: ['Curry', 'Butler', 'Green', 'Kuminga', 'Podziemski'] },
  MIA: { id: 'MIA', name: 'Miami Heat', short: 'MIA', ortg: 114.0, drtg: 112.2, pace: 96.2, efg: 53.8, tov: 12.6, orb: 25.6, ftr: 22.1, l10: 0.60, starPlayer: 'Bam Adebayo, Tyler Herro', keyRotation: ['Adebayo', 'Herro', 'Wiggins', 'Rozier'] },
  LAC: { id: 'LAC', name: 'LA Clippers', short: 'LAC', ortg: 118.1, drtg: 114.9, pace: 97.5, efg: 56.3, tov: 13.1, orb: 27.6, ftr: 22.5, l10: 0.50, starPlayer: 'Kawhi Leonard, James Harden', keyRotation: ['Leonard', 'Harden', 'Powell', 'Zubac'] },
  NOP: { id: 'NOP', name: 'New Orleans Pelicans', short: 'NOP', ortg: 116.7, drtg: 112.2, pace: 98.3, efg: 55.9, tov: 13.2, orb: 28.5, ftr: 22.2, l10: 0.60, starPlayer: 'Zion Williamson, CJ McCollum', keyRotation: ['Williamson', 'McCollum', 'Murray', 'Murphy', 'Jones', 'Poole'] },
  HOU: { id: 'HOU', name: 'Houston Rockets', short: 'HOU', ortg: 114.5, drtg: 112.9, pace: 99.4, efg: 53.5, tov: 12.6, orb: 29.4, ftr: 21.8, l10: 0.60, starPlayer: 'Alperen Şengün, Jalen Green', keyRotation: ['Sengun', 'Şengün', 'Green', 'VanVleet', 'Brooks', 'Thompson'] },
  CHI: { id: 'CHI', name: 'Chicago Bulls', short: 'CHI', ortg: 114.2, drtg: 116.1, pace: 96.9, efg: 53.4, tov: 12.1, orb: 28.1, ftr: 20.9, l10: 0.50, starPlayer: 'Coby White, Nikola Vučević', keyRotation: ['White', 'Vucevic', 'Vučević', 'Giddey', 'Dosunmu'] },
  ATL: { id: 'ATL', name: 'Atlanta Hawks', short: 'ATL', ortg: 116.6, drtg: 118.8, pace: 100.8, efg: 54.2, tov: 13.2, orb: 30.8, ftr: 22.0, l10: 0.40, starPlayer: 'Trae Young, Jalen Johnson', keyRotation: ['Young', 'Johnson', 'Daniels', 'Capela', 'Risacher'] },
  BKN: { id: 'BKN', name: 'Brooklyn Nets', short: 'BKN', ortg: 112.8, drtg: 116.0, pace: 97.6, efg: 53.1, tov: 12.9, orb: 28.0, ftr: 19.8, l10: 0.40, starPlayer: 'Cam Thomas, Cameron Johnson', keyRotation: ['Thomas', 'Johnson', 'Claxton', 'Russell'] },
  TOR: { id: 'TOR', name: 'Toronto Raptors', short: 'TOR', ortg: 112.1, drtg: 118.1, pace: 99.7, efg: 53.5, tov: 13.8, orb: 27.1, ftr: 20.4, l10: 0.30, starPlayer: 'Scottie Barnes, Brandon Ingram', keyRotation: ['Barnes', 'Ingram', 'Barrett', 'Quickley', 'Poeltl'] },
  MEM: { id: 'MEM', name: 'Memphis Grizzlies', short: 'MEM', ortg: 109.8, drtg: 113.8, pace: 98.6, efg: 51.9, tov: 14.8, orb: 27.9, ftr: 20.2, l10: 0.40, starPlayer: 'Ja Morant, Jaren Jackson Jr.', keyRotation: ['Morant', 'Jackson', 'Bane', 'Edey', 'Aldama'] },
  UTA: { id: 'UTA', name: 'Utah Jazz', short: 'UTA', ortg: 114.8, drtg: 119.9, pace: 100.2, efg: 53.9, tov: 15.3, orb: 31.0, ftr: 22.1, l10: 0.30, starPlayer: 'Lauri Markkanen, Keyonte George', keyRotation: ['Markkanen', 'George', 'Sexton', 'Kessler', 'Collins'] },
  SAS: { id: 'SAS', name: 'San Antonio Spurs', short: 'SAS', ortg: 110.3, drtg: 116.4, pace: 101.5, efg: 52.8, tov: 14.9, orb: 26.5, ftr: 19.5, l10: 0.40, starPlayer: "Victor Wembanyama, De'Aaron Fox", keyRotation: ['Wembanyama', 'Fox', 'Vassell', 'Sochan', 'Castle'] },
  POR: { id: 'POR', name: 'Portland Trail Blazers', short: 'POR', ortg: 108.6, drtg: 116.9, pace: 97.8, efg: 50.8, tov: 15.1, orb: 31.4, ftr: 20.6, l10: 0.20, starPlayer: 'Anfernee Simons, Shaedon Sharpe', keyRotation: ['Simons', 'Sharpe', 'Henderson', 'Grant', 'Ayton', 'Avdija'] },
  CHA: { id: 'CHA', name: 'Charlotte Hornets', short: 'CHA', ortg: 109.1, drtg: 119.2, pace: 97.6, efg: 51.8, tov: 13.7, orb: 25.1, ftr: 19.1, l10: 0.20, starPlayer: 'LaMelo Ball, Brandon Miller', keyRotation: ['Ball', 'Miller', 'Bridges', 'Williams'] },
  WAS: { id: 'WAS', name: 'Washington Wizards', short: 'WAS', ortg: 110.2, drtg: 119.6, pace: 102.7, efg: 53.4, tov: 13.9, orb: 23.9, ftr: 19.3, l10: 0.20, starPlayer: 'Jordan Poole, Bilal Coulibaly', keyRotation: ['Poole', 'Coulibaly', 'Middleton', 'Sarr'] },
  DET: { id: 'DET', name: 'Detroit Pistons', short: 'DET', ortg: 109.5, drtg: 118.4, pace: 100.1, efg: 52.1, tov: 15.0, orb: 28.4, ftr: 21.1, l10: 0.20, starPlayer: 'Cade Cunningham, Jalen Duren', keyRotation: ['Cunningham', 'Duren', 'Ivey', 'Harris', 'Thompson'] }
};

// ============================================================================
// 2. BAZA KOSZYKÓWKI EUROPEJSKIEJ (EUROLIGA, ORLEN BASKET LIGA PLK, ACB - 40M)
// ============================================================================
const EURO_BASKET_DB = {
  RMA: { id: 'RMA', name: 'Real Madryt', short: 'RMA', league: 'Euroliga', ortg: 118.4, drtg: 108.2, pace: 73.5, efg: 56.4, tov: 12.5, orb: 29.5, ftr: 23.0, l10: 0.80, starPlayer: 'Facundo Campazzo, Edy Tavares' },
  PAO: { id: 'PAO', name: 'Panathinaikos Ateny', short: 'PAO', league: 'Euroliga', ortg: 117.9, drtg: 107.8, pace: 72.8, efg: 56.1, tov: 12.8, orb: 28.9, ftr: 24.1, l10: 0.80, starPlayer: 'Kendrick Nunn, Mathias Lessort' },
  OLY: { id: 'OLY', name: 'Olympiacos Pireus', short: 'OLY', league: 'Euroliga', ortg: 116.5, drtg: 106.4, pace: 71.2, efg: 55.4, tov: 12.1, orb: 28.2, ftr: 22.5, l10: 0.70, starPlayer: 'Sasha Vezenkov, Evan Fournier' },
  FBB: { id: 'FBB', name: 'Fenerbahçe Stambuł', short: 'FBB', league: 'Euroliga', ortg: 115.8, drtg: 109.5, pace: 72.4, efg: 55.0, tov: 13.0, orb: 27.8, ftr: 21.8, l10: 0.70, starPlayer: 'Nigel Hayes-Davis, Wade Baldwin' },
  BAR: { id: 'BAR', name: 'FC Barcelona Basket', short: 'BAR', league: 'Euroliga', ortg: 115.2, drtg: 110.1, pace: 73.8, efg: 54.8, tov: 13.4, orb: 29.1, ftr: 21.5, l10: 0.60, starPlayer: 'Kevin Punter, Jan Veselý' },
  MON: { id: 'MON', name: 'AS Monaco Basket', short: 'MON', league: 'Euroliga', ortg: 116.1, drtg: 110.4, pace: 73.1, efg: 54.6, tov: 11.9, orb: 28.4, ftr: 23.2, l10: 0.70, starPlayer: 'Mike James, Elie Okobo' },
  ANW: { id: 'ANW', name: 'Anwil Włocławek', short: 'ANW', league: 'Orlen Basket Liga (PL)', ortg: 114.6, drtg: 105.8, pace: 74.2, efg: 54.9, tov: 13.1, orb: 30.2, ftr: 23.5, l10: 0.80, starPlayer: 'Kamil Łączyński, Michał Michalak' },
  TRE: { id: 'TRE', name: 'Trefl Sopot', short: 'TRE', league: 'Orlen Basket Liga (PL)', ortg: 113.2, drtg: 107.4, pace: 73.6, efg: 53.8, tov: 13.6, orb: 29.0, ftr: 22.8, l10: 0.70, starPlayer: 'Jakub Schenk, Jarosław Zyskowski' },
  SLA: { id: 'SLA', name: 'Śląsk Wrocław', short: 'SLA', league: 'Orlen Basket Liga (PL)', ortg: 111.5, drtg: 108.9, pace: 73.0, efg: 52.9, tov: 14.0, orb: 28.5, ftr: 21.9, l10: 0.60, starPlayer: 'Marcel Ponitka, Angel Nunez' },
  LEG: { id: 'LEG', name: 'Legia Warszawa', short: 'LEG', league: 'Orlen Basket Liga (PL)', ortg: 112.4, drtg: 109.2, pace: 73.9, efg: 53.4, tov: 13.8, orb: 27.9, ftr: 22.1, l10: 0.60, starPlayer: 'Andrzej Pluta, Kameron McGusty' }
};

// ============================================================================
// 3. BAZA PIŁKI NOŻNEJ (MODEL POISSONA xG - SIŁA ATAKU I OBRONY)
// ============================================================================
const SOCCER_TEAMS_DB = {
  RMA_F: { id: 'RMA_F', name: 'Real Madryt', short: 'RMA', league: 'LaLiga / LM', xgFor: 2.35, xgAgainst: 0.88, possession: 61, formL5: 'W-W-D-W-W', starPlayer: 'Kylian Mbappé, Vinícius Jr' },
  BAR_F: { id: 'BAR_F', name: 'FC Barcelona', short: 'BAR', league: 'LaLiga / LM', xgFor: 2.48, xgAgainst: 0.95, possession: 65, formL5: 'W-W-W-L-W', starPlayer: 'Robert Lewandowski, Lamine Yamal' },
  MCI: { id: 'MCI', name: 'Manchester City', short: 'MCI', league: 'Premier League', xgFor: 2.40, xgAgainst: 0.85, possession: 67, formL5: 'W-D-W-W-W', starPlayer: 'Erling Haaland, Phil Foden' },
  ARS: { id: 'ARS', name: 'Arsenal FC', short: 'ARS', league: 'Premier League', xgFor: 2.15, xgAgainst: 0.72, possession: 59, formL5: 'W-W-D-W-D', starPlayer: 'Bukayo Saka, Martin Ødegaard' },
  LIV: { id: 'LIV', name: 'Liverpool FC', short: 'LIV', league: 'Premier League', xgFor: 2.32, xgAgainst: 0.82, possession: 61, formL5: 'W-W-W-D-W', starPlayer: 'Mohamed Salah, Virgil van Dijk' },
  BAY: { id: 'BAY', name: 'Bayern Monachium', short: 'BAY', league: 'Bundesliga', xgFor: 2.55, xgAgainst: 0.92, possession: 64, formL5: 'W-W-W-W-D', starPlayer: 'Harry Kane, Jamal Musiala' },
  INT: { id: 'INT', name: 'Inter Mediolan', short: 'INT', league: 'Serie A', xgFor: 2.18, xgAgainst: 0.76, possession: 58, formL5: 'W-W-D-W-W', starPlayer: 'Lautaro Martínez, Marcus Thuram' },
  PSG: { id: 'PSG', name: 'Paris Saint-Germain', short: 'PSG', league: 'Ligue 1 / LM', xgFor: 2.28, xgAgainst: 0.90, possession: 66, formL5: 'W-D-W-W-L', starPlayer: 'Ousmane Dembélé, Bradley Barcola' },
  LPO: { id: 'LPO', name: 'Lech Poznań', short: 'LPO', league: 'PKO BP Ekstraklasa', xgFor: 1.88, xgAgainst: 0.89, possession: 57, formL5: 'W-W-L-W-W', starPlayer: 'Mikael Ishak, Afonso Sousa' },
  LEG_F: { id: 'LEG_F', name: 'Legia Warszawa', short: 'LEG', league: 'PKO BP Ekstraklasa', xgFor: 1.76, xgAgainst: 1.05, possession: 55, formL5: 'W-D-W-L-W', starPlayer: 'Bartosz Kapustka, Marc Gual' },
  RAK: { id: 'RAK', name: 'Raków Częstochowa', short: 'RAK', league: 'PKO BP Ekstraklasa', xgFor: 1.68, xgAgainst: 0.78, possession: 54, formL5: 'W-D-D-W-W', starPlayer: 'Ivi López, Vladyslav Kochergin' },
  JAG: { id: 'JAG', name: 'Jagiellonia Białystok', short: 'JAG', league: 'PKO BP Ekstraklasa', xgFor: 1.82, xgAgainst: 1.12, possession: 53, formL5: 'W-W-D-L-W', starPlayer: 'Jesús Imaz, Afimico Pululu' }
};

// ============================================================================
// 4. BAZA TENISA (ATP & WTA - SURFACE ELO + SERVICE HOLD % + RETURN BREAK %)
// ============================================================================
const TENNIS_PLAYERS_DB = {
  SIN: { id: 'SIN', name: 'Jannik Sinner', short: 'SIN', tour: 'ATP #1', elo: 2245, holdPct: 91.2, breakPct: 28.4, surface: 'Hard / Indoor', form: '9-1', starPlayer: '1. serwis 79% wygranych piłek' },
  ALC: { id: 'ALC', name: 'Carlos Alcaraz', short: 'ALC', tour: 'ATP #2', elo: 2210, holdPct: 86.8, breakPct: 31.5, surface: 'Clay / Hard', form: '8-2', starPlayer: 'Return wygrany 42.1%' },
  DJO: { id: 'DJO', name: 'Novak Djoković', short: 'DJO', tour: 'ATP #4', elo: 2180, holdPct: 87.5, breakPct: 29.2, surface: 'All-Court', form: '7-3', starPlayer: 'Tie-breaki 74% skuteczności' },
  ZVE: { id: 'ZVE', name: 'Alexander Zverev', short: 'ZVE', tour: 'ATP #3', elo: 2145, holdPct: 89.6, breakPct: 23.8, surface: 'Hard / Clay', form: '8-2', starPlayer: 'Średnio 11.4 asów na mecz' },
  MED: { id: 'MED', name: 'Daniil Medvedev', short: 'MED', tour: 'ATP #5', elo: 2110, holdPct: 84.5, breakPct: 28.9, surface: 'Hard Court', form: '6-4', starPlayer: 'Defensywa z głębi kortu' },
  HUR: { id: 'HUR', name: 'Hubert Hurkacz', short: 'HUR', tour: 'ATP Top 15', elo: 2040, holdPct: 90.4, breakPct: 18.5, surface: 'Hard / Grass', form: '6-4', starPlayer: 'Średnio 14.8 asów serwisowych' },
  SWI: { id: 'SWI', name: 'Iga Świątek', short: 'SWI', tour: 'WTA #1', elo: 2230, holdPct: 81.5, breakPct: 48.2, surface: 'Clay / Hard', form: '9-1', starPlayer: 'Przełamania rywalek 48.2%' },
  SAB: { id: 'SAB', name: 'Aryna Sabalenka', short: 'SAB', tour: 'WTA #2', elo: 2215, holdPct: 83.2, breakPct: 42.6, surface: 'Hard Court', form: '9-1', starPlayer: 'Siła rażenia 1. podania' },
  GAU: { id: 'GAU', name: 'Coco Gauff', short: 'GAU', tour: 'WTA #3', elo: 2120, holdPct: 76.8, breakPct: 44.1, surface: 'Hard / Clay', form: '7-3', starPlayer: 'Pokrycie kortu w obronie' },
  RYB: { id: 'RYB', name: 'Elena Rybakina', short: 'RYB', tour: 'WTA #4', elo: 2115, holdPct: 84.9, breakPct: 36.8, surface: 'Hard / Grass', form: '7-3', starPlayer: 'Liderka asów w cyklu WTA' }
};

// ============================================================================
// 5. BAZA HOKEJA NA LODZIE (NHL & EUROPA - EXPECTED GOALS + SAVE % BRAMKARZA)
// ============================================================================
const HOCKEY_TEAMS_DB = {
  EDM: { id: 'EDM', name: 'Edmonton Oilers', short: 'EDM', league: 'NHL', xgFor: 3.48, xgAgainst: 2.75, ppPct: 27.4, svPct: 90.8, starPlayer: 'Connor McDavid, Leon Draisaitl' },
  FLA: { id: 'FLA', name: 'Florida Panthers', short: 'FLA', league: 'NHL', xgFor: 3.32, xgAgainst: 2.52, ppPct: 24.5, svPct: 91.6, starPlayer: 'Aleksander Barkov, Matthew Tkachuk' },
  COL: { id: 'COL', name: 'Colorado Avalanche', short: 'COL', league: 'NHL', xgFor: 3.55, xgAgainst: 2.92, ppPct: 25.8, svPct: 90.1, starPlayer: 'Nathan MacKinnon, Cale Makar' },
  NYR: { id: 'NYR', name: 'New York Rangers', short: 'NYR', league: 'NHL', xgFor: 3.25, xgAgainst: 2.58, ppPct: 26.2, svPct: 92.1, starPlayer: 'Artemi Panarin, Igor Shesterkin (G)' },
  DAL_H: { id: 'DAL_H', name: 'Dallas Stars', short: 'DAL', league: 'NHL', xgFor: 3.38, xgAgainst: 2.62, ppPct: 24.1, svPct: 91.4, starPlayer: 'Jason Robertson, Jake Oettinger (G)' },
  TOR_H: { id: 'TOR_H', name: 'Toronto Maple Leafs', short: 'TOR', league: 'NHL', xgFor: 3.42, xgAgainst: 2.88, ppPct: 24.9, svPct: 90.4, starPlayer: 'Auston Matthews, Mitch Marner' },
  CAR: { id: 'CAR', name: 'Carolina Hurricanes', short: 'CAR', league: 'NHL', xgFor: 3.35, xgAgainst: 2.48, ppPct: 25.5, svPct: 91.2, starPlayer: 'Sebastian Aho, Andrei Svechnikov' },
  VGK: { id: 'VGK', name: 'Vegas Golden Knights', short: 'VGK', league: 'NHL', xgFor: 3.28, xgAgainst: 2.72, ppPct: 22.8, svPct: 90.9, starPlayer: 'Jack Eichel, Mark Stone' }
};

const ESPN_ABBR_MAP = { GS: 'GSW', NY: 'NYK', NO: 'NOP', SA: 'SAS', UTAH: 'UTA', WSH: 'WAS' };

// ============================================================================
// ZESTAW STARTOWYCH MECZÓW WIELOSPORTOWYCH (Rozszerzany na żywo przez API)
// ============================================================================
const INITIAL_MULTI_SPORT_MATCHES = [
  // NBA
  {
    id: 'nba_1', sport: 'NBA', leagueName: 'USA • NBA', home: 'ATL', away: 'CLE', time: '01:00 CET', status: 'W terminarzu', venue: 'State Farm Arena',
    homeTeamObj: NBA_TEAMS_DB.ATL, awayTeamObj: NBA_TEAMS_DB.CLE,
    bookieOdds: { home: 1.90, away: 1.85, spreadLine: 1.5, spreadHomeOdds: 1.90, spreadAwayOdds: 1.90, totalLine: 233.0, overOdds: 1.91, underOdds: 1.91 },
    liveInjuries: { home: [], away: [], homePenalty: 0, awayPenalty: 0 }
  },
  {
    id: 'nba_2', sport: 'NBA', leagueName: 'USA • NBA', home: 'NOP', away: 'SAC', time: '01:00 CET', status: 'W terminarzu', venue: 'Smoothie King Center',
    homeTeamObj: NBA_TEAMS_DB.NOP, awayTeamObj: NBA_TEAMS_DB.SAC,
    bookieOdds: { home: 1.42, away: 2.85, spreadLine: -5.5, spreadHomeOdds: 1.91, spreadAwayOdds: 1.91, totalLine: 230.5, overOdds: 1.91, underOdds: 1.91 },
    liveInjuries: { home: [], away: [], homePenalty: 0, awayPenalty: 0 }
  },
  {
    id: 'nba_3', sport: 'NBA', leagueName: 'USA • NBA', home: 'POR', away: 'MEM', time: '03:00 CET', status: 'W terminarzu', venue: 'Moda Center',
    homeTeamObj: NBA_TEAMS_DB.POR, awayTeamObj: NBA_TEAMS_DB.MEM,
    bookieOdds: { home: 1.35, away: 3.20, spreadLine: -6.5, spreadHomeOdds: 1.90, spreadAwayOdds: 1.92, totalLine: 212.0, overOdds: 1.91, underOdds: 1.91 },
    liveInjuries: { home: [], away: [], homePenalty: 0, awayPenalty: 0 }
  },
  // EURO BASKET (Euroliga & Orlen Basket Liga)
  {
    id: 'euro_1', sport: 'EURO_BASKET', leagueName: 'Euroliga • FIBA 40m', home: 'RMA', away: 'FBB', time: '20:45 CET', status: 'Dzisiaj', venue: 'WiZink Center (Madryt)',
    homeTeamObj: EURO_BASKET_DB.RMA, awayTeamObj: EURO_BASKET_DB.FBB,
    bookieOdds: { home: 1.44, away: 2.75, spreadLine: -5.5, spreadHomeOdds: 1.90, spreadAwayOdds: 1.90, totalLine: 164.5, overOdds: 1.90, underOdds: 1.90 },
    liveInjuries: { home: [], away: [], homePenalty: 0, awayPenalty: 0 }
  },
  {
    id: 'euro_2', sport: 'EURO_BASKET', leagueName: 'Euroliga • FIBA 40m', home: 'PAO', away: 'MON', time: '20:15 CET', status: 'Dzisiaj', venue: 'OAKA Arena (Ateny)',
    homeTeamObj: EURO_BASKET_DB.PAO, awayTeamObj: EURO_BASKET_DB.MON,
    bookieOdds: { home: 1.48, away: 2.65, spreadLine: -4.5, spreadHomeOdds: 1.90, spreadAwayOdds: 1.90, totalLine: 163.5, overOdds: 1.90, underOdds: 1.90 },
    liveInjuries: { home: [], away: [], homePenalty: 0, awayPenalty: 0 }
  },
  {
    id: 'euro_3', sport: 'EURO_BASKET', leagueName: 'Polska • Orlen Basket Liga', home: 'ANW', away: 'SLA', time: '19:30 CET', status: 'Dzisiaj', venue: 'Hala Mistrzów (Włocławek)',
    homeTeamObj: EURO_BASKET_DB.ANW, awayTeamObj: EURO_BASKET_DB.SLA,
    bookieOdds: { home: 1.40, away: 2.90, spreadLine: -6.0, spreadHomeOdds: 1.88, spreadAwayOdds: 1.88, totalLine: 161.5, overOdds: 1.90, underOdds: 1.90 },
    liveInjuries: { home: [], away: [], homePenalty: 0, awayPenalty: 0 }
  },
  // PIŁKA NOŻNA (Soccer)
  {
    id: 'soc_1', sport: 'SOCCER', leagueName: 'Piłka Nożna • Liga Mistrzów / Top Ligi', home: 'RMA_F', away: 'BAY', time: '21:00 CET', status: 'Hit Kolejki', venue: 'Santiago Bernabéu',
    homeTeamObj: SOCCER_TEAMS_DB.RMA_F, awayTeamObj: SOCCER_TEAMS_DB.BAY,
    bookieOdds: { home: 2.15, draw: 3.60, away: 3.25, totalLine: 2.5, overOdds: 1.68, underOdds: 2.18, bttsYesOdds: 1.58 }
  },
  {
    id: 'soc_2', sport: 'SOCCER', leagueName: 'Piłka Nożna • Premier League', home: 'LIV', away: 'ARS', time: '18:30 CET', status: 'Hit Kolejki', venue: 'Anfield (Liverpool)',
    homeTeamObj: SOCCER_TEAMS_DB.LIV, awayTeamObj: SOCCER_TEAMS_DB.ARS,
    bookieOdds: { home: 2.10, draw: 3.45, away: 3.50, totalLine: 2.5, overOdds: 1.82, underOdds: 1.98, bttsYesOdds: 1.70 }
  },
  {
    id: 'soc_3', sport: 'SOCCER', leagueName: 'Piłka Nożna • PKO BP Ekstraklasa', home: 'LPO', away: 'LEG_F', time: '20:30 CET', status: 'Klasyk PL', venue: 'Enea Stadion (Poznań)',
    homeTeamObj: SOCCER_TEAMS_DB.LPO, awayTeamObj: SOCCER_TEAMS_DB.LEG_F,
    bookieOdds: { home: 2.05, draw: 3.40, away: 3.65, totalLine: 2.5, overOdds: 1.90, underOdds: 1.90, bttsYesOdds: 1.75 }
  },
  // TENIS (ATP & WTA)
  {
    id: 'ten_1', sport: 'TENNIS', leagueName: 'Tenis • ATP Masters 1000 (Hard)', home: 'SIN', away: 'ZVE', time: '19:00 CET', status: 'Kort Centralny', venue: 'Nawierzchnia Twarda (Indoor)',
    homeTeamObj: TENNIS_PLAYERS_DB.SIN, awayTeamObj: TENNIS_PLAYERS_DB.ZVE,
    bookieOdds: { home: 1.38, away: 3.05, totalLine: 22.5, overOdds: 1.90, underOdds: 1.90 }
  },
  {
    id: 'ten_2', sport: 'TENNIS', leagueName: 'Tenis • WTA Finals', home: 'SWI', away: 'GAU', time: '17:30 CET', status: 'Kort Centralny', venue: 'Nawierzchnia Twarda',
    homeTeamObj: TENNIS_PLAYERS_DB.SWI, awayTeamObj: TENNIS_PLAYERS_DB.GAU,
    bookieOdds: { home: 1.36, away: 3.15, totalLine: 20.5, overOdds: 1.88, underOdds: 1.92 }
  },
  // HOKEJ NA LODZIE (NHL)
  {
    id: 'nhl_1', sport: 'HOCKEY', leagueName: 'Hokej • USA NHL', home: 'EDM', away: 'COL', time: '02:30 CET', status: 'Dzisiaj w nocy', venue: 'Rogers Place (Edmonton)',
    homeTeamObj: HOCKEY_TEAMS_DB.EDM, awayTeamObj: HOCKEY_TEAMS_DB.COL,
    bookieOdds: { home: 1.82, away: 2.00, totalLine: 6.5, overOdds: 1.85, underOdds: 1.95 }
  },
  {
    id: 'nhl_2', sport: 'HOCKEY', leagueName: 'Hokej • USA NHL', home: 'FLA', away: 'NYR', time: '01:00 CET', status: 'Dzisiaj w nocy', venue: 'Amerant Bank Arena',
    homeTeamObj: HOCKEY_TEAMS_DB.FLA, awayTeamObj: HOCKEY_TEAMS_DB.NYR,
    bookieOdds: { home: 1.78, away: 2.05, totalLine: 5.5, overOdds: 1.88, underOdds: 1.92 }
  }
];

// ============================================================================
// FUNKCJE MATEMATYCZNE: GENERATOR DETERMINISTYCZNY, GAUSS CDF, POISSON PMF
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

function normalCDF(x, mean, stdDev) {
  const z = (x - mean) / (stdDev * Math.sqrt(2));
  const t = 1 / (1 + 0.3275911 * Math.abs(z));
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const erf = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-z * z);
  const sign = z < 0 ? -1 : 1;
  return 0.5 * (1 + sign * erf);
}

// Rozkład Poissona P(X = k) dla Piłki Nożnej i Hokeja
function poissonProb(k, lambda) {
  let fact = 1;
  for (let i = 2; i <= k; i++) fact *= i;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / fact;
}

// ============================================================================
// WYCENA KONTUZJI W KOSZYKÓWCE (Gwiazda / Starter / Ławka)
// ============================================================================
function calculateInjuryPenalty(injuriesList, teamObj) {
  if (!injuriesList || injuriesList.length === 0) return { list: [], penalty: 0 };

  const starStr = (teamObj?.starPlayer || '').toLowerCase();
  const rotationArr = (teamObj?.keyRotation || []).map((n) => n.toLowerCase());

  let totalPenalty = 0;
  let benchPenaltyAcc = 0;
  const parsedList = [];

  injuriesList.forEach((item) => {
    const athleteName = item.athlete?.displayName || item.athlete?.shortName || 'Zawodnik';
    const lastName = athleteName.split(' ').pop().toLowerCase();
    const rawStatus = (item.status || item.type?.description || 'Out').toUpperCase();

    const isStar = starStr.includes(lastName);
    const isStarter = !isStar && rotationArr.some((r) => r.includes(lastName) || lastName.includes(r));

    let roleLabel = 'Rotacja/Ławka';
    let baseImpact = 0.25;

    if (isStar) {
      roleLabel = 'GWIAZDA';
      baseImpact = 2.4;
    } else if (isStarter) {
      roleLabel = 'Pierwsza Piątka';
      baseImpact = 1.1;
    }

    let statusMultiplier = 0;
    let statusBadge = 'OUT';

    if (rawStatus.includes('OUT') || rawStatus.includes('INJURED')) {
      statusMultiplier = 1.0;
      statusBadge = 'OUT (Nie zagra)';
    } else if (rawStatus.includes('DOUBTFUL')) {
      statusMultiplier = 0.7;
      statusBadge = 'DOUBTFUL (25% szans)';
    } else if (rawStatus.includes('QUESTIONABLE') || rawStatus.includes('DAY-TO-DAY') || rawStatus.includes('GTD')) {
      statusMultiplier = 0.35;
      statusBadge = 'GTD (Decyzja przed meczem)';
    }

    const finalImpact = Number((baseImpact * statusMultiplier).toFixed(2));

    if (finalImpact > 0) {
      if (!isStar && !isStarter) {
        if (benchPenaltyAcc < 0.6) {
          const added = Math.min(finalImpact, 0.6 - benchPenaltyAcc);
          benchPenaltyAcc += added;
          totalPenalty += added;
        }
      } else {
        totalPenalty += finalImpact;
      }

      parsedList.push({
        name: athleteName,
        role: roleLabel,
        status: statusBadge,
        impact: Number(finalImpact.toFixed(1))
      });
    }
  });

  return {
    list: parsedList,
    penalty: Number(Math.min(5.5, totalPenalty).toFixed(1))
  };
}

// ============================================================================
// SILNIKI SYMULACYJNE DLA KAŻDEGO SPORTU
// ============================================================================

// 1 & 2. SILNIK KOSZYKÓWKI (NBA 48m oraz EURO BASKET FIBA 40m)
function runBasketballSimulation(homeTeam, awayTeam, iterations, modifiers, seedKey = null, isEuro = false) {
  const { homeCourtAdv = 2.8, homeB2B = false, awayB2B = false, homeInjuryImpact = 0, awayInjuryImpact = 0 } = modifiers;
  const rng = seedKey ? createSeededRandom(seedKey) : Math.random;

  const leagueAvgORTG = isEuro ? 113.5 : 115.3;
  const leagueAvgPace = isEuro ? 73.2 : 99.2;
  const stdDevTeam = isEuro ? 8.8 : 11.2;

  const expectedPace = (homeTeam.pace * awayTeam.pace) / leagueAvgPace;

  const homeFFIndex =
    (homeTeam.efg - 54.5) * 0.40 -
    (homeTeam.tov - 13.2) * 0.25 +
    (homeTeam.orb - 28.0) * 0.20 +
    (homeTeam.ftr - 21.5) * 0.15;

  const awayFFIndex =
    (awayTeam.efg - 54.5) * 0.40 -
    (awayTeam.tov - 13.2) * 0.25 +
    (awayTeam.orb - 28.0) * 0.20 +
    (awayTeam.ftr - 21.5) * 0.15;

  const baseHomeORTG = (homeTeam.ortg * awayTeam.drtg) / leagueAvgORTG + homeFFIndex * 0.45;
  const baseAwayORTG = (awayTeam.ortg * homeTeam.drtg) / leagueAvgORTG + awayFFIndex * 0.45;

  const formDiff = ((homeTeam.l10 || 0.5) - (awayTeam.l10 || 0.5)) * 2.2;
  const netInjuryDiff = awayInjuryImpact - homeInjuryImpact;
  const totalScoringDrag = (homeInjuryImpact + awayInjuryImpact) * 0.18;

  const expectedHomePts =
    (baseHomeORTG / 100) * expectedPace +
    homeCourtAdv / 2 +
    formDiff / 2 +
    netInjuryDiff * 0.55 -
    totalScoringDrag / 2 -
    (homeB2B ? 1.8 : 0);

  const expectedAwayPts =
    (baseAwayORTG / 100) * expectedPace -
    homeCourtAdv / 2 -
    formDiff / 2 -
    netInjuryDiff * 0.55 -
    totalScoringDrag / 2 -
    (awayB2B ? 1.8 : 0);

  let homeWins = 0;
  let awayWins = 0;
  let totalHomePts = 0;
  let totalAwayPts = 0;

  for (let i = 0; i < iterations; i++) {
    const paceShock = randomNormal(0, isEuro ? 2.2 : 3.0, rng);
    let simHome = Math.round(randomNormal(expectedHomePts + paceShock, stdDevTeam, rng));
    let simAway = Math.round(randomNormal(expectedAwayPts + paceShock, stdDevTeam, rng));

    while (simHome === simAway) {
      simHome += Math.round(randomNormal(expectedHomePts * 0.1, 2.8, rng));
      simAway += Math.round(randomNormal(expectedAwayPts * 0.1, 2.8, rng));
    }

    if (simHome > simAway) homeWins++;
    else awayWins++;

    totalHomePts += simHome;
    totalAwayPts += simAway;
  }

  return {
    homeWinProb: (homeWins / iterations) * 100,
    awayWinProb: (awayWins / iterations) * 100,
    drawProb: 0,
    avgHomePts: totalHomePts / iterations,
    avgAwayPts: totalAwayPts / iterations,
    avgTotalPts: (totalHomePts + totalAwayPts) / iterations,
    expectedPace,
    iterations
  };
}

// 3. SILNIK PIŁKI NOŻNEJ (ROZKŁAD POISSONA xG + DIXON-COLES)
function runSoccerPoissonSimulation(homeTeam, awayTeam, modifiers = {}) {
  const { homeInjuryImpact = 0, awayInjuryImpact = 0 } = modifiers;
  const leagueAvgGoals = 1.45;
  const homeAdvantage = 1.14;

  const adjHomeAttack = Math.max(0.5, (homeTeam.xgFor || 1.6) - homeInjuryImpact * 0.12);
  const adjAwayAttack = Math.max(0.5, (awayTeam.xgFor || 1.4) - awayInjuryImpact * 0.12);

  const lambdaHome = ((adjHomeAttack * (awayTeam.xgAgainst || 1.1)) / leagueAvgGoals) * homeAdvantage;
  const lambdaAway = (adjAwayAttack * (homeTeam.xgAgainst || 1.1)) / leagueAvgGoals;

  let homeWinProb = 0;
  let drawProb = 0;
  let awayWinProb = 0;
  let over25Prob = 0;
  let bttsProb = 0;

  for (let h = 0; h <= 8; h++) {
    for (let a = 0; a <= 8; a++) {
      const p = poissonProb(h, lambdaHome) * poissonProb(a, lambdaAway);
      if (h > a) homeWinProb += p;
      else if (h === a) drawProb += p;
      else awayWinProb += p;

      if (h + a > 2.5) over25Prob += p;
      if (h >= 1 && a >= 1) bttsProb += p;
    }
  }

  const norm = homeWinProb + drawProb + awayWinProb;
  return {
    homeWinProb: (homeWinProb / norm) * 100,
    drawProb: (drawProb / norm) * 100,
    awayWinProb: (awayWinProb / norm) * 100,
    avgHomePts: lambdaHome,
    avgAwayPts: lambdaAway,
    avgTotalPts: lambdaHome + lambdaAway,
    over25Prob: over25Prob * 100,
    bttsProb: bttsProb * 100,
    iterations: 10000
  };
}

// 4. SILNIK TENISA (MODEL ELO NAWIERZCHNIOWY + SYMULACJA GEMÓW)
function runTennisEloSimulation(player1, player2, modifiers = {}) {
  const { homeInjuryImpact = 0, awayInjuryImpact = 0 } = modifiers;
  const elo1 = (player1.elo || 2050) - homeInjuryImpact * 35;
  const elo2 = (player2.elo || 2000) - awayInjuryImpact * 35;

  const eloDiff = elo1 - elo2;
  const p1BaseEloProb = 1 / (1 + Math.pow(10, -eloDiff / 400));

  // Korekta o procent utrzymania własnego podania (Hold %) i przełamań (Break %)
  const netDominance1 = (player1.holdPct || 85) + (player1.breakPct || 25);
  const netDominance2 = (player2.holdPct || 85) + (player2.breakPct || 25);
  const domFactor = (netDominance1 - netDominance2) * 0.0045;

  const p1WinProb = Math.min(91, Math.max(9, (p1BaseEloProb + domFactor) * 100));
  const p2WinProb = 100 - p1WinProb;

  // Szacowana liczba gemów w meczu (im bardziej wyrównani gracze i wyższy Hold%, tym więcej gemów)
  const closeness = 1 - Math.abs(p1WinProb - 50) / 50;
  const avgHold = ((player1.holdPct || 85) + (player2.holdPct || 85)) / 2;
  const expectedGames = 19.2 + closeness * 4.2 + (avgHold - 82) * 0.22;

  return {
    homeWinProb: p1WinProb,
    awayWinProb: p2WinProb,
    drawProb: 0,
    avgHomePts: p1WinProb > 50 ? 2 : 1,
    avgAwayPts: p1WinProb > 50 ? 0.8 : 2,
    avgTotalPts: expectedGames,
    iterations: 10000
  };
}

// 5. SILNIK HOKEJA NA LODZIE (NHL POISSON + DOGRYWKI OT/SO)
function runHockeySimulation(homeTeam, awayTeam, modifiers = {}) {
  const { homeInjuryImpact = 0, awayInjuryImpact = 0 } = modifiers;
  const leagueAvg = 3.05;
  const homeIceAdv = 1.07;

  const lambdaHome = Math.max(1.6, (((homeTeam.xgFor || 3.1) * (awayTeam.xgAgainst || 2.8)) / leagueAvg) * homeIceAdv - homeInjuryImpact * 0.15);
  const lambdaAway = Math.max(1.5, ((awayTeam.xgFor || 3.0) * (homeTeam.xgAgainst || 2.8)) / leagueAvg - awayInjuryImpact * 0.15);

  let regHome = 0;
  let regDraw = 0;
  let regAway = 0;
  let overLineProb = 0;

  for (let h = 0; h <= 10; h++) {
    for (let a = 0; a <= 10; a++) {
      const p = poissonProb(h, lambdaHome) * poissonProb(a, lambdaAway);
      if (h > a) regHome += p;
      else if (h === a) regDraw += p;
      else regAway += p;

      if (h + a > 5.5) overLineProb += p;
    }
  }

  // W hokeju zakład ML (Zwycięzca meczu) rozstrzyga remis w dogrywce/karnych (52% dla gospodarza)
  const totalHomeWin = (regHome + regDraw * 0.52) * 100;
  const totalAwayWin = (regAway + regDraw * 0.48) * 100;

  return {
    homeWinProb: totalHomeWin,
    awayWinProb: totalAwayWin,
    drawProb: regDraw * 100,
    avgHomePts: lambdaHome,
    avgAwayPts: lambdaAway,
    avgTotalPts: lambdaHome + lambdaAway,
    over55Prob: overLineProb * 100,
    iterations: 10000
  };
}

// Uniwersalny dispatcher symulacji dla dowolnego meczu
function simulateMatchBySport(match, iterations = 6000, modifiers = {}) {
  const homeObj = match.homeTeamObj;
  const awayObj = match.awayTeamObj;
  const mergedModifiers = {
    homeCourtAdv: 2.8,
    homeInjuryImpact: match.liveInjuries?.homePenalty || 0,
    awayInjuryImpact: match.liveInjuries?.awayPenalty || 0,
    ...modifiers
  };

  if (match.sport === 'NBA') {
    return runBasketballSimulation(homeObj, awayObj, iterations, mergedModifiers, `nba_${match.id}`, false);
  }
  if (match.sport === 'EURO_BASKET') {
    return runBasketballSimulation(homeObj, awayObj, iterations, mergedModifiers, `euro_${match.id}`, true);
  }
  if (match.sport === 'SOCCER') {
    return runSoccerPoissonSimulation(homeObj, awayObj, mergedModifiers);
  }
  if (match.sport === 'TENNIS') {
    return runTennisEloSimulation(homeObj, awayObj, mergedModifiers);
  }
  if (match.sport === 'HOCKEY') {
    return runHockeySimulation(homeObj, awayObj, mergedModifiers);
  }
  return runBasketballSimulation(homeObj, awayObj, iterations, mergedModifiers, `def_${match.id}`, false);
}

// ============================================================================
// GENERATOR REKOMENDACJI BUKMACHERSKICH DLA WSZYSTKICH 5 SPORTÓW
// ============================================================================
function generateMultiSportSmartPicks(matches, taxRate, customOddsMap = {}) {
  const taxMultiplier = taxRate ? 0.88 : 1.0;
  const allPicks = [];

  matches.forEach((match) => {
    const homeTeam = match.homeTeamObj;
    const awayTeam = match.awayTeamObj;
    if (!homeTeam || !awayTeam) return;

    const sim = simulateMatchBySport(match, 6000);
    const sportMeta = SPORT_CATEGORIES.find((s) => s.id === match.sport) || SPORT_CATEGORIES[1];

    // ========================================================================
    // A. KOSZYKÓWKA (NBA & EURO BASKET)
    // ========================================================================
    if (match.sport === 'NBA' || match.sport === 'EURO_BASKET') {
      const formattedScore = `${awayTeam.short} ${sim.avgAwayPts.toFixed(0)} : ${sim.avgHomePts.toFixed(0)} ${homeTeam.short}`;
      const netRtgHome = (homeTeam.ortg - homeTeam.drtg).toFixed(1);
      const netRtgAway = (awayTeam.ortg - awayTeam.drtg).toFixed(1);
      const homePenalty = match.liveInjuries?.homePenalty || 0;
      const awayPenalty = match.liveInjuries?.awayPenalty || 0;

      const injuryLine =
        (match.liveInjuries?.home?.length || 0) + (match.liveInjuries?.away?.length || 0) > 0
          ? `Raport Składów: ${awayTeam.short} (-${awayPenalty} pkt) vs ${homeTeam.short} (-${homePenalty} pkt).`
          : `Składy: Liderzy (${homeTeam.starPlayer.split(',')[0]} vs ${awayTeam.starPlayer.split(',')[0]}) w grze.`;

      // 1. Gospodarz wygra
      const idHomeML = `${match.id}_ML_HOME`;
      const oddsHomeVal = customOddsMap[idHomeML] ?? match.bookieOdds.home;
      const probHome = sim.homeWinProb / 100;
      const evHome = (probHome * (oddsHomeVal * taxMultiplier) - 1) * 100;

      allPicks.push({
        id: idHomeML,
        matchId: match.id,
        sport: match.sport,
        sportIcon: sportMeta.icon,
        leagueName: match.leagueName,
        matchLabel: `${awayTeam.short} @ ${homeTeam.short}`,
        homeTeam,
        awayTeam,
        marketType: 'Zwycięzca (ML)',
        selectionName: `${homeTeam.name} wygra (1)`,
        odds: oddsHomeVal,
        prob: sim.homeWinProb,
        ev: evHome,
        projectedScore: formattedScore,
        liveInjuries: match.liveInjuries,
        confidenceScore: sim.homeWinProb * 0.75 + Math.max(-10, evHome) * 1.4,
        reasoning: [
          `Net Rating: ${homeTeam.short} (+${netRtgHome}) vs ${awayTeam.short} (${netRtgAway}) + przewaga hali.`,
          injuryLine,
          `Model ${sportMeta.modelName}: średni wynik ${formattedScore}.`
        ]
      });

      // 2. Gość wygra
      const idAwayML = `${match.id}_ML_AWAY`;
      const oddsAwayVal = customOddsMap[idAwayML] ?? match.bookieOdds.away;
      const probAway = sim.awayWinProb / 100;
      const evAway = (probAway * (oddsAwayVal * taxMultiplier) - 1) * 100;

      allPicks.push({
        id: idAwayML,
        matchId: match.id,
        sport: match.sport,
        sportIcon: sportMeta.icon,
        leagueName: match.leagueName,
        matchLabel: `${awayTeam.short} @ ${homeTeam.short}`,
        homeTeam,
        awayTeam,
        marketType: 'Zwycięzca (ML)',
        selectionName: `${awayTeam.name} wygra (2)`,
        odds: oddsAwayVal,
        prob: sim.awayWinProb,
        ev: evAway,
        projectedScore: formattedScore,
        liveInjuries: match.liveInjuries,
        confidenceScore: sim.awayWinProb * 0.75 + Math.max(-10, evAway) * 1.4,
        reasoning: [
          `Kurs ${oddsAwayVal.toFixed(2)} wobec kursu sprawiedliwego modelu (${(1 / probAway).toFixed(2)}).`,
          injuryLine,
          `Efektywność ataku ${awayTeam.short} (${awayTeam.ortg} ORTG) vs obrona ${homeTeam.short} (${homeTeam.drtg} DRTG).`
        ]
      });

      // 3. Suma Punktów (Over/Under) z dystrybuanty Gaussa
      const idTotal = `${match.id}_TOTAL`;
      const bookieTotal = match.bookieOdds.totalLine || (match.sport === 'EURO_BASKET' ? 163.5 : 224.5);
      const stdDevTotal = match.sport === 'EURO_BASKET' ? 12.5 : 16.5;
      const overProbRaw = (1 - normalCDF(bookieTotal, sim.avgTotalPts, stdDevTotal)) * 100;
      const pickOver = overProbRaw >= 50;
      const finalTotalProb = Math.min(72.0, Math.max(28.0, pickOver ? overProbRaw : 100 - overProbRaw));
      const totalOdds = customOddsMap[idTotal] ?? (pickOver ? match.bookieOdds.overOdds : match.bookieOdds.underOdds) ?? 1.90;
      const evTotal = ((finalTotalProb / 100) * (totalOdds * taxMultiplier) - 1) * 100;

      allPicks.push({
        id: idTotal,
        matchId: match.id,
        sport: match.sport,
        sportIcon: sportMeta.icon,
        leagueName: match.leagueName,
        matchLabel: `${awayTeam.short} @ ${homeTeam.short}`,
        homeTeam,
        awayTeam,
        marketType: 'Suma Punktów (O/U)',
        selectionName: `${pickOver ? 'Powyżej (Over)' : 'Poniżej (Under)'} ${bookieTotal} pkt`,
        odds: totalOdds,
        prob: finalTotalProb,
        ev: evTotal,
        projectedScore: formattedScore,
        liveInjuries: match.liveInjuries,
        confidenceScore: finalTotalProb * 0.65 + Math.max(-10, evTotal) * 1.4,
        reasoning: [
          `Prognozowana suma z modelu: ${sim.avgTotalPts.toFixed(1)} pkt (linia: ${bookieTotal} pkt).`,
          `Tempo gry (Pace): ${sim.expectedPace.toFixed(1)} posiadań.`,
          `Skuteczność rzutowa eFG%: ${awayTeam.short} (${awayTeam.efg}%) vs ${homeTeam.short} (${homeTeam.efg}%).`
        ]
      });
    }

    // ========================================================================
    // B. PIŁKA NOŻNA (SOCCER - POISSON xG)
    // ========================================================================
    if (match.sport === 'SOCCER') {
      const formattedScore = `${homeTeam.short} ${sim.avgHomePts.toFixed(1)} : ${sim.avgAwayPts.toFixed(1)} ${awayTeam.short} (xG)`;

      // 1. Wygrana Gospodarzy (1) lub Gości (2)
      const pickHome = sim.homeWinProb >= sim.awayWinProb;
      const idMain = `${match.id}_ML`;
      const mainProb = pickHome ? sim.homeWinProb : sim.awayWinProb;
      const defaultMainOdds = pickHome ? match.bookieOdds.home : match.bookieOdds.away;
      const mainOdds = customOddsMap[idMain] ?? defaultMainOdds;
      const evMain = ((mainProb / 100) * (mainOdds * taxMultiplier) - 1) * 100;

      allPicks.push({
        id: idMain,
        matchId: match.id,
        sport: 'SOCCER',
        sportIcon: '⚽',
        leagueName: match.leagueName,
        matchLabel: `${homeTeam.short} vs ${awayTeam.short}`,
        homeTeam,
        awayTeam,
        marketType: 'Zwycięzca (ML)',
        selectionName: pickHome ? `${homeTeam.name} wygra (1)` : `${awayTeam.name} wygra (2)`,
        odds: mainOdds,
        prob: mainProb,
        ev: evMain,
        projectedScore: formattedScore,
        confidenceScore: mainProb * 0.78 + Math.max(-10, evMain) * 1.4,
        reasoning: [
          `Rozkład Poissona xG: ${homeTeam.short} (${sim.avgHomePts.toFixed(2)} gola) vs ${awayTeam.short} (${sim.avgAwayPts.toFixed(2)} gola).`,
          `Siła defensywy (xGA): ${homeTeam.short} traci śr. ${homeTeam.xgAgainst} gola, ${awayTeam.short} traci ${awayTeam.xgAgainst}.`,
          `Kluczowi gracze: ${homeTeam.starPlayer} vs ${awayTeam.starPlayer}.`
        ]
      });

      // 2. Suma Goli Over/Under 2.5
      const idGoals = `${match.id}_TOTAL`;
      const pickOver25 = sim.over25Prob >= 50;
      const goalsProb = pickOver25 ? sim.over25Prob : 100 - sim.over25Prob;
      const defaultGoalsOdds = pickOver25 ? (match.bookieOdds.overOdds || 1.75) : (match.bookieOdds.underOdds || 2.05);
      const goalsOdds = customOddsMap[idGoals] ?? defaultGoalsOdds;
      const evGoals = ((goalsProb / 100) * (goalsOdds * taxMultiplier) - 1) * 100;

      allPicks.push({
        id: idGoals,
        matchId: match.id,
        sport: 'SOCCER',
        sportIcon: '⚽',
        leagueName: match.leagueName,
        matchLabel: `${homeTeam.short} vs ${awayTeam.short}`,
        homeTeam,
        awayTeam,
        marketType: 'Suma Punktów (O/U)',
        selectionName: `${pickOver25 ? 'Powyżej (Over) 2.5 gola' : 'Poniżej (Under) 2.5 gola'}`,
        odds: goalsOdds,
        prob: goalsProb,
        ev: evGoals,
        projectedScore: formattedScore,
        confidenceScore: goalsProb * 0.72 + Math.max(-10, evGoals) * 1.4,
        reasoning: [
          `Łączne oczekiwane bramki w meczu (Total xG): ${sim.avgTotalPts.toFixed(2)} gola.`,
          `Szansa na BTTS (Obie strzelą) wg Poissona wynosi ${sim.bttsProb.toFixed(1)}%.`,
          `Forma z ostatnich 5 kolejek: ${homeTeam.short} (${homeTeam.formL5}) vs ${awayTeam.short} (${awayTeam.formL5}).`
        ]
      });
    }

    // ========================================================================
    // C. TENIS (ATP & WTA - SURFACE ELO)
    // ========================================================================
    if (match.sport === 'TENNIS') {
      const pickP1 = sim.homeWinProb >= 50;
      const idTenML = `${match.id}_ML`;
      const winProb = pickP1 ? sim.homeWinProb : sim.awayWinProb;
      const defaultTenOdds = pickP1 ? match.bookieOdds.home : match.bookieOdds.away;
      const tenOdds = customOddsMap[idTenML] ?? defaultTenOdds;
      const evTen = ((winProb / 100) * (tenOdds * taxMultiplier) - 1) * 100;

      allPicks.push({
        id: idTenML,
        matchId: match.id,
        sport: 'TENNIS',
        sportIcon: '🎾',
        leagueName: match.leagueName,
        matchLabel: `${homeTeam.short} vs ${awayTeam.short}`,
        homeTeam,
        awayTeam,
        marketType: 'Zwycięzca (ML)',
        selectionName: `${pickP1 ? homeTeam.name : awayTeam.name} wygra mecz`,
        odds: tenOdds,
        prob: winProb,
        ev: evTen,
        projectedScore: `Śr. ${sim.avgTotalPts.toFixed(1)} gemów`,
        confidenceScore: winProb * 0.76 + Math.max(-10, evTen) * 1.4,
        reasoning: [
          `Ranking ELO na tej nawierzchni: ${homeTeam.short} (${homeTeam.elo}) vs ${awayTeam.short} (${awayTeam.elo}).`,
          `Utrzymanie serwisu (Hold%): ${homeTeam.short} ${homeTeam.holdPct}% vs ${awayTeam.short} ${awayTeam.holdPct}%.`,
          `Skuteczność przełamań (Break%): ${homeTeam.short} ${homeTeam.breakPct}% vs ${awayTeam.short} ${awayTeam.breakPct}%.`
        ]
      });
    }

    // ========================================================================
    // D. HOKEJ NA LODZIE (NHL & EUROPA)
    // ========================================================================
    if (match.sport === 'HOCKEY') {
      const formattedScore = `${awayTeam.short} ${sim.avgAwayPts.toFixed(1)} : ${sim.avgHomePts.toFixed(1)} ${homeTeam.short}`;
      const pickHome = sim.homeWinProb >= 50;
      const idHockML = `${match.id}_ML`;
      const winProb = pickHome ? sim.homeWinProb : sim.awayWinProb;
      const defaultHockOdds = pickHome ? match.bookieOdds.home : match.bookieOdds.away;
      const hockOdds = customOddsMap[idHockML] ?? defaultHockOdds;
      const evHock = ((winProb / 100) * (hockOdds * taxMultiplier) - 1) * 100;

      allPicks.push({
        id: idHockML,
        matchId: match.id,
        sport: 'HOCKEY',
        sportIcon: '🏒',
        leagueName: match.leagueName,
        matchLabel: `${awayTeam.short} @ ${homeTeam.short}`,
        homeTeam,
        awayTeam,
        marketType: 'Zwycięzca (ML)',
        selectionName: `${pickHome ? homeTeam.name : awayTeam.name} wygra (z OT/SO)`,
        odds: hockOdds,
        prob: winProb,
        ev: evHock,
        projectedScore: formattedScore,
        confidenceScore: winProb * 0.75 + Math.max(-10, evHock) * 1.4,
        reasoning: [
          `Hokejowy model xG: ${homeTeam.short} (${sim.avgHomePts.toFixed(2)} bramki) vs ${awayTeam.short} (${sim.avgAwayPts.toFixed(2)} bramki).`,
          `Przewagi (Power Play %): ${homeTeam.short} ${homeTeam.ppPct}% vs ${awayTeam.short} ${awayTeam.ppPct}%.`,
          `Bramkarze (Save %): ${homeTeam.short} ${homeTeam.svPct}% vs ${awayTeam.short} ${awayTeam.svPct}%.`
        ]
      });
    }
  });

  return allPicks.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

// ============================================================================
// GŁÓWNY KOMPONENT APLIKACJI (QUANTBET PRO v5.0 MULTI-SPORT)
// ============================================================================
export default function App() {
  const [activeSportTab, setActiveSportTab] = useState('ALL');
  const [activeView, setActiveView] = useState('smart-builder');
  const [matches, setMatches] = useState(INITIAL_MULTI_SPORT_MATCHES);
  const [selectedMatchId, setSelectedMatchId] = useState(INITIAL_MULTI_SPORT_MATCHES[0].id);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [dataSourceStatus, setDataSourceStatus] = useState('Multi-Sport Live API: NBA + Euroliga/PLK + Piłka Nożna + Tenis + NHL');
  const [lastSyncTime, setLastSyncTime] = useState('Dzisiaj');

  // Wybór sportów włączonych do Generatora Kuponów AKO (można łączyć dowolne sporty!)
  const [includedSportsInCoupon, setIncludedSportsInCoupon] = useState(['NBA', 'EURO_BASKET', 'SOCCER', 'TENNIS', 'HOCKEY']);

  const [customOddsMap, setCustomOddsMap] = useState({});

  // Parametry Laboratorium (Zablokowane w trybie Auto-Sync, z opcją odblokowania kłódką)
  const [isManualOverrideUnlocked, setIsManualOverrideUnlocked] = useState(false);
  const [simCount, setSimCount] = useState(10000);
  const [homeCourtAdv, setHomeCourtAdv] = useState(2.8);
  const [homeB2B, setHomeB2B] = useState(false);
  const [awayB2B, setAwayB2B] = useState(false);
  const [homeInjuryImpact, setHomeInjuryImpact] = useState(0);
  const [awayInjuryImpact, setAwayInjuryImpact] = useState(0);

  const [oddsHome, setOddsHome] = useState(INITIAL_MULTI_SPORT_MATCHES[0].bookieOdds.home);
  const [oddsAway, setOddsAway] = useState(INITIAL_MULTI_SPORT_MATCHES[0].bookieOdds.away);
  const [taxRate, setTaxRate] = useState(true);
  const [bankroll, setBankroll] = useState(1000);
  const [couponStake, setCouponStake] = useState(2);
  const [kellyFraction, setKellyFraction] = useState(0.25);

  const [targetMinOdds, setTargetMinOdds] = useState(2.0);
  const [builderStrategy, setBuilderStrategy] = useState('safe');
  const [builderMarketScope, setBuilderMarketScope] = useState('ML_ONLY');
  const [marketFilter, setMarketFilter] = useState('ALL');
  const [couponPickIds, setCouponPickIds] = useState([]);

  // Przełączanie sportu w kreatorze kuponu AKO
  const toggleSportInCouponBuilder = (sportId) => {
    setIncludedSportsInCoupon((prev) => {
      if (prev.includes(sportId)) {
        if (prev.length === 1) return prev; // Zawsze przynajmniej 1 sport aktywny
        return prev.filter((id) => id !== sportId);
      }
      return [...prev, sportId];
    });
  };

  // ==========================================================================
  // POBIERANIE DANYCH LIVE Z WIELU PUNKTÓW KOŃCOWYCH ESPN (NBA + NHL + SOCCER)
  // ==========================================================================
  const fetchAllLiveSportsData = async () => {
    setIsLoadingLive(true);
    try {
      const updatedMatches = [...INITIAL_MULTI_SPORT_MATCHES];

      // 1. Pobieranie NBA + Kontuzji Live
      const nbaRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
      if (nbaRes.ok) {
        const nbaData = await nbaRes.json();
        if (nbaData?.events?.length > 0) {
          const liveNbaMatches = await Promise.all(
            nbaData.events.map(async (ev, idx) => {
              const comp = ev.competitions?.[0];
              if (!comp) return null;
              const homeComp = comp.competitors?.find((c) => c.homeAway === 'home');
              const awayComp = comp.competitors?.find((c) => c.homeAway === 'away');
              if (!homeComp || !awayComp) return null;

              const homeAbbr = ESPN_ABBR_MAP[homeComp.team?.abbreviation] || homeComp.team?.abbreviation;
              const awayAbbr = ESPN_ABBR_MAP[awayComp.team?.abbreviation] || awayComp.team?.abbreviation;
              if (!NBA_TEAMS_DB[homeAbbr] || !NBA_TEAMS_DB[awayAbbr]) return null;

              const homeTeamObj = { ...NBA_TEAMS_DB[homeAbbr] };
              const awayTeamObj = { ...NBA_TEAMS_DB[awayAbbr] };

              let liveInjuries = { home: [], away: [], homePenalty: 0, awayPenalty: 0 };
              try {
                const sumRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${ev.id}`);
                if (sumRes.ok) {
                  const sumData = await sumRes.json();
                  if (Array.isArray(sumData.injuries)) {
                    const hInj = sumData.injuries.find((i) => (ESPN_ABBR_MAP[i.team?.abbreviation] || i.team?.abbreviation) === homeAbbr);
                    const aInj = sumData.injuries.find((i) => (ESPN_ABBR_MAP[i.team?.abbreviation] || i.team?.abbreviation) === awayAbbr);
                    const pHome = calculateInjuryPenalty(hInj?.injuries || [], homeTeamObj);
                    const pAway = calculateInjuryPenalty(aInj?.injuries || [], awayTeamObj);
                    liveInjuries = { home: pHome.list, away: pAway.list, homePenalty: pHome.penalty, awayPenalty: pAway.penalty };
                  }
                }
              } catch (e) {
                // Kontynuuj bez błędu
              }

              const espnOdds = comp.odds?.[0];
              const quickSim = runBasketballSimulation(
                homeTeamObj,
                awayTeamObj,
                2000,
                { homeCourtAdv: 2.8, homeInjuryImpact: liveInjuries.homePenalty, awayInjuryImpact: liveInjuries.awayPenalty },
                `init_${ev.id}`,
                false
              );
              const margin = 1.045;
              const estHome = Number(Math.max(1.12, (100 / quickSim.homeWinProb) / margin).toFixed(2));
              const estAway = Number(Math.max(1.12, (100 / quickSim.awayWinProb) / margin).toFixed(2));

              return {
                id: `nba_${ev.id || idx}`,
                sport: 'NBA',
                leagueName: 'USA • NBA Live',
                home: homeAbbr,
                away: awayAbbr,
                homeTeamObj,
                awayTeamObj,
                liveInjuries,
                time: ev.status?.type?.shortDetail || 'Dzisiaj Live',
                status: ev.status?.type?.description || 'W terminarzu',
                venue: comp.venue?.fullName || 'Hala NBA',
                bookieOdds: {
                  home: estHome,
                  away: estAway,
                  spreadLine: espnOdds?.spread ? Number(espnOdds.spread) : Math.round((quickSim.avgAwayPts - quickSim.avgHomePts) * 2) / 2,
                  spreadHomeOdds: 1.91,
                  spreadAwayOdds: 1.91,
                  totalLine: espnOdds?.overUnder ? Number(espnOdds.overUnder) : Math.round(quickSim.avgTotalPts * 2) / 2,
                  overOdds: 1.91,
                  underOdds: 1.91
                }
              };
            })
          );

          const validNba = liveNbaMatches.filter(Boolean);
          if (validNba.length > 0) {
            const nonNba = updatedMatches.filter((m) => m.sport !== 'NBA');
            setMatches([...validNba, ...nonNba]);
            setSelectedMatchId(validNba[0].id);
            setHomeInjuryImpact(validNba[0].liveInjuries?.homePenalty || 0);
            setAwayInjuryImpact(validNba[0].liveInjuries?.awayPenalty || 0);
          }
        }
      }
      setDataSourceStatus('Zsynchronizowano terminarz i raporty kontuzji: NBA + Euroliga/PLK + Piłka Nożna + Tenis + NHL');
    } catch (e) {
      setDataSourceStatus('Aktywna baza Multi-Sport: NBA, Euroliga, Piłka Nożna, Tenis, Hokej');
    } finally {
      const now = new Date();
      setLastSyncTime(now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }));
      setIsLoadingLive(false);
    }
  };

  useEffect(() => {
    fetchAllLiveSportsData();
  }, []);

  const selectedMatch = useMemo(() => {
    return matches.find((m) => m.id === selectedMatchId) || matches[0];
  }, [matches, selectedMatchId]);

  const handleSelectMatch = (match) => {
    setSelectedMatchId(match.id);
    setOddsHome(match.bookieOdds.home);
    setOddsAway(match.bookieOdds.away);
    setHomeB2B(false);
    setAwayB2B(false);
    setIsManualOverrideUnlocked(false); // Domyślnie blokujemy ręczny suwak, używając danych z API
    setHomeInjuryImpact(match.liveInjuries?.homePenalty || 0);
    setAwayInjuryImpact(match.liveInjuries?.awayPenalty || 0);
  };

  const allSmartPicks = useMemo(() => {
    return generateMultiSportSmartPicks(matches, taxRate, customOddsMap);
  }, [matches, taxRate, customOddsMap]);

  const handleUpdatePickOdd = (pickId, newOddValue) => {
    const num = parseFloat(newOddValue);
    if (!isNaN(num) && num >= 1.01) {
      setCustomOddsMap((prev) => ({ ...prev, [pickId]: num }));
    }
  };

  // Filtrowanie listy rekomendacji według wybranej zakładki sportowej na górze oraz rynku
  const filteredSmartPicks = useMemo(() => {
    return allSmartPicks.filter((p) => {
      const sportMatch = activeSportTab === 'ALL' || p.sport === activeSportTab;
      if (!sportMatch) return false;
      if (marketFilter === 'ALL') return true;
      if (marketFilter === 'ML') return p.marketType === 'Zwycięzca (ML)';
      if (marketFilter === 'TOTAL') return p.marketType === 'Suma Punktów (O/U)';
      return true;
    });
  }, [allSmartPicks, activeSportTab, marketFilter]);

  const couponPicks = useMemo(() => {
    return couponPickIds
      .map((id) => allSmartPicks.find((p) => p.id === id))
      .filter(Boolean);
  }, [couponPickIds, allSmartPicks]);

  // Automatyczny kreator kuponu AKO respektujący wybrane przez Ciebie dyscypliny sportowe!
  const buildAutoCoupon = (minOddsTarget, strategy = builderStrategy, scope = builderMarketScope, allowedSports = includedSportsInCoupon) => {
    setTargetMinOdds(minOddsTarget);
    setBuilderStrategy(strategy);
    setBuilderMarketScope(scope);

    let pool = [...allSmartPicks].filter(
      (p) => allowedSports.includes(p.sport) && p.odds >= 1.22 && p.prob >= 50
    );

    if (scope === 'ML_ONLY') {
      pool = pool.filter((p) => p.marketType === 'Zwycięzca (ML)');
    }

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
      buildAutoCoupon(2.0, 'safe', 'ML_ONLY', includedSportsInCoupon);
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
    return simulateMatchBySport(selectedMatch, simCount, {
      homeCourtAdv,
      homeB2B,
      awayB2B,
      homeInjuryImpact,
      awayInjuryImpact
    });
  }, [selectedMatch, simCount, homeCourtAdv, homeB2B, awayB2B, homeInjuryImpact, awayInjuryImpact]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* PASEK GÓRNY */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  QUANT<span className="text-orange-500">BET</span> MULTI-SPORT
                </h1>
                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  v5.0 Pro Terminal
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
              Kreator Kuponów Multi-Sport & Ranking
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
              onClick={fetchAllLiveSportsData}
              disabled={isLoadingLive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLive ? 'animate-spin' : ''}`} />
              <span>Odśwież Live ({lastSyncTime})</span>
            </button>
          </div>
        </div>

        {/* PASEK KATEGORII SPORTOWYCH (PRZEŁĄCZNIK WIDOKU) */}
        <div className="max-w-7xl mx-auto px-4 py-2 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          {SPORT_CATEGORIES.map((cat) => {
            const isActive = activeSportTab === cat.id;
            const count = cat.id === 'ALL'
              ? matches.length
              : matches.filter((m) => m.sport === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveSportTab(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                  isActive
                    ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-sm'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ========================================================================
          WIDOK 1: KREATOR KUPONÓW MULTI-SPORT & RANKING REKOMENDACJI
         ======================================================================== */}
      {activeView === 'smart-builder' && (
        <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {/* PANEL GENERATORA KUPONÓW AKO Z WYBOREM DYSCYPLIN SPORTOWYCH */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-indigo-500/30 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20 mb-1">
                    <Globe className="w-3.5 h-3.5" /> Multi-Sportowy Generator Kuponów AKO
                  </span>
                  <h2 className="text-xl font-black text-white">
                    Zbuduj Kupon Powyżej Wybranego Kursu (2.00+ / 3.00+ / 5.00+)
                  </h2>
                </div>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => buildAutoCoupon(targetMinOdds, builderStrategy, 'ML_ONLY', includedSportsInCoupon)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      builderMarketScope === 'ML_ONLY'
                        ? 'bg-orange-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Tylko Zwycięzcy (1/2)
                  </button>
                  <button
                    onClick={() => buildAutoCoupon(targetMinOdds, builderStrategy, 'ALL_MARKETS', includedSportsInCoupon)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      builderMarketScope === 'ALL_MARKETS'
                        ? 'bg-orange-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Wszystkie Rynki (z O/U)
                  </button>
                </div>
              </div>

              {/* WYBÓR SPORTÓW, KTÓRE MAJĄ BYĆ BRANE POD UWAGĘ PRZY TWORZENIU KUPONU */}
              <div className="mb-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800/90">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300">
                    1. Wybierz dyscypliny sportowe, które chcesz włączyć do swojego kuponu AKO:
                  </span>
                  <button
                    onClick={() => {
                      const allIds = ['NBA', 'EURO_BASKET', 'SOCCER', 'TENNIS', 'HOCKEY'];
                      setIncludedSportsInCoupon(allIds);
                      buildAutoCoupon(targetMinOdds, builderStrategy, builderMarketScope, allIds);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Zaznacz wszystkie
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {SPORT_CATEGORIES.filter((c) => c.id !== 'ALL').map((sp) => {
                    const isChecked = includedSportsInCoupon.includes(sp.id);
                    return (
                      <button
                        key={sp.id}
                        onClick={() => {
                          const next = includedSportsInCoupon.includes(sp.id)
                            ? (includedSportsInCoupon.length > 1 ? includedSportsInCoupon.filter((x) => x !== sp.id) : includedSportsInCoupon)
                            : [...includedSportsInCoupon, sp.id];
                          setIncludedSportsInCoupon(next);
                          buildAutoCoupon(targetMinOdds, builderStrategy, builderMarketScope, next);
                        }}
                        className={`p-2 rounded-lg border text-left transition-all flex items-center justify-between ${
                          isChecked
                            ? 'bg-emerald-500/15 border-emerald-500/60 text-white'
                            : 'bg-slate-900/60 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span>{sp.icon}</span>
                          <span className="text-[11px] font-bold truncate">{sp.short}</span>
                        </div>
                        <div className={`w-4 h-4 rounded flex items-center justify-center ${isChecked ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700'}`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PRZYCISKI DOCELOWEGO KURSU */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Kurs 2.00+ (Podwojenie)', target: 2.0, desc: '2 najpewniejsze typy dnia' },
                  { label: 'Kurs 3.00+ (Potrojenie)', target: 3.0, desc: '2-3 zbilansowane mecze' },
                  { label: 'Kurs 5.00+ (Wysokie AKO)', target: 5.0, desc: '3-4 typy z wysokim EV' },
                  { label: 'Kurs 8.00+ (Max Value)', target: 8.0, desc: 'Taśma Multi-Sport 4-5 gier' }
                ].map((preset) => {
                  const isActive = Math.abs(targetMinOdds - preset.target) < 0.1;
                  return (
                    <button
                      key={preset.target}
                      onClick={() => buildAutoCoupon(preset.target, builderStrategy, builderMarketScope, includedSportsInCoupon)}
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

              {/* Suwak + Strategia */}
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
                    onChange={(e) => buildAutoCoupon(Number(e.target.value), builderStrategy, builderMarketScope, includedSportsInCoupon)}
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
                      onClick={() => buildAutoCoupon(targetMinOdds, st.id, builderMarketScope, includedSportsInCoupon)}
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
                    onClick={() => buildAutoCoupon(targetMinOdds, builderStrategy, builderMarketScope, includedSportsInCoupon)}
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
                    Ranking Rekomendacji ({SPORT_CATEGORIES.find((c) => c.id === activeSportTab)?.name})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Każdy sport jest liczony swoim dedykowanym modelem matematycznym (Gauss / Poisson xG / Surface ELO).
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  {[
                    { id: 'ALL', label: 'Wszystkie rynki' },
                    { id: 'ML', label: 'Zwycięzca (1/2)' },
                    { id: 'TOTAL', label: 'Over/Under (Gole/Pkt)' }
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
                {filteredSmartPicks.slice(0, 16).map((pick, idx) => {
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
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-orange-300 border border-slate-700">
                                {pick.sportIcon} {pick.leagueName}
                              </span>
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                                {pick.matchLabel}
                              </span>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                                {pick.marketType}
                              </span>
                              {isValue && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                  VALUE (+{pick.ev.toFixed(1)}% EV)
                                </span>
                              )}
                              {totalInj > 0 && (
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                                  <UserX className="w-3 h-3" /> Kontuzje ({totalInj})
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

          {/* PRAWA KOLUMNA: TWÓJ KUPON AKO MULTI-SPORT */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border-2 border-orange-500/40 rounded-2xl p-5 sticky top-28 shadow-2xl">
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
                    Twój kupon jest pusty. Wybierz sporty powyżej i kliknij np. <strong>Kurs 2.00+</strong>.
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
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-orange-300">
                              {item.sportIcon} {item.matchLabel}
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
                    ))}
                  </div>

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
                </>
              )}
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================
          WIDOK 2: LABORATORIUM POJEDYNCZEGO MECZU (Z BLOKADĄ AUTO-SYNC KONTUZJI)
         ======================================================================== */}
      {activeView === 'match-lab' && (
        <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    Wybierz Mecz do Laboratorium
                  </h2>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {matches
                  .filter((m) => activeSportTab === 'ALL' || m.sport === activeSportTab)
                  .map((match) => {
                    const isSelected = match.id === selectedMatch.id;
                    return (
                      <button
                        key={match.id}
                        onClick={() => handleSelectMatch(match)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-indigo-600/15 border-indigo-500 shadow-lg'
                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span className="font-bold text-orange-400">{match.leagueName}</span>
                          <span>{match.time}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold text-white">
                          <span>{match.awayTeamObj.name} vs {match.homeTeamObj.name}</span>
                          <span className="font-mono text-indigo-300">
                            {match.bookieOdds.away.toFixed(2)} / {match.bookieOdds.home.toFixed(2)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Panel Kontuzji z domyślną blokadą Auto-Sync (odpowiedź na Twoje pytanie!) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Wpływ Składów i Kontuzji
                  </h2>
                </div>
                <button
                  onClick={() => setIsManualOverrideUnlocked(!isManualOverrideUnlocked)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all ${
                    isManualOverrideUnlocked
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  {isManualOverrideUnlocked ? (
                    <>
                      <Unlock className="w-3 h-3" /> Tryb Ręczny ("Co jeśli?")
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3" /> Auto-Sync z API Live
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                {isManualOverrideUnlocked
                  ? 'Tryb testowy odblokowany: możesz ręcznie sprawdzić, jak zmieni się wynik, jeśli tuż przed meczem wypadnie dodatkowy zawodnik.'
                  : 'Suwaki są zablokowane i ustawione automatycznie przez skaner kontuzji Live API. Kliknij kłódkę powyżej tylko wtedy, gdy chcesz ręcznie przetestować scenariusz awaryjny.'}
              </p>

              <div className={isManualOverrideUnlocked ? ' opacity-100' : 'opacity-60 pointer-events-none'}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Osłabienie {selectedMatch.homeTeamObj.short}</span>
                  <span className="font-mono text-rose-400">-{homeInjuryImpact.toFixed(1)} pkt</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5.5"
                  step="0.2"
                  disabled={!isManualOverrideUnlocked}
                  value={homeInjuryImpact}
                  onChange={(e) => setHomeInjuryImpact(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              <div className={isManualOverrideUnlocked ? 'opacity-100' : 'opacity-60 pointer-events-none'}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Osłabienie {selectedMatch.awayTeamObj.short}</span>
                  <span className="font-mono text-rose-400">-{awayInjuryImpact.toFixed(1)} pkt</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5.5"
                  step="0.2"
                  disabled={!isManualOverrideUnlocked}
                  value={awayInjuryImpact}
                  onChange={(e) => setAwayInjuryImpact(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="text-center mb-5">
                <span className="text-xs font-bold uppercase tracking-widest text-orange-400">
                  {selectedMatch.leagueName} • {selectedMatch.venue}
                </span>
                <h2 className="text-2xl font-black text-white mt-1">
                  {selectedMatch.awayTeamObj.name} vs {selectedMatch.homeTeamObj.name}
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-400 mb-1">{selectedMatch.awayTeamObj.name}</p>
                  <div className="text-3xl font-black text-indigo-400 font-mono">
                    {simulationResults.awayWinProb.toFixed(1)}%
                  </div>
                  <div className="mt-2 text-xs text-slate-300 font-mono">
                    Prognoza: {simulationResults.avgAwayPts.toFixed(1)}
                  </div>
                </div>

                {simulationResults.drawProb > 0 && (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-400 mb-1">Remis (X)</p>
                    <div className="text-3xl font-black text-slate-300 font-mono">
                      {simulationResults.drawProb.toFixed(1)}%
                    </div>
                    <div className="mt-2 text-xs text-slate-400">Czas regulaminowy</div>
                  </div>
                )}

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-400 mb-1">{selectedMatch.homeTeamObj.name}</p>
                  <div className="text-3xl font-black text-orange-400 font-mono">
                    {simulationResults.homeWinProb.toFixed(1)}%
                  </div>
                  <div className="mt-2 text-xs text-slate-300 font-mono">
                    Prognoza: {simulationResults.avgHomePts.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
