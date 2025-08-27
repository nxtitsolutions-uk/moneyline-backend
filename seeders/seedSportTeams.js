// scripts/seedAllSportsAndTeams.js
// Run with: node scripts/seedAllSportsAndTeams.js
require('dotenv').config();
const mongoose = require('mongoose');
const Sport = require('../models/sportModel');
const Team = require('../models/teamModel');

const MONGO_URI = process.env.MONGO_URI;

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const SPORTS = [
  { name: 'NBA', slug: 'nba' },
  { name: 'NFL', slug: 'nfl' },
  { name: 'Soccer', slug: 'soccer' },
  { name: 'Cricket', slug: 'cricket' },
  { name: 'MLB', slug: 'mlb' },
  { name: 'Hockey', slug: 'hockey' }, // NHL
];

/** ========================
 *  COMPLETE TEAMS
 *  ======================== */

/** NBA — all 30 teams */
const NBA_TEAMS = [
  'Atlanta Hawks',
  'Boston Celtics',
  'Brooklyn Nets',
  'Charlotte Hornets',
  'Chicago Bulls',
  'Cleveland Cavaliers',
  'Dallas Mavericks',
  'Denver Nuggets',
  'Detroit Pistons',
  'Golden State Warriors',
  'Houston Rockets',
  'Indiana Pacers',
  'LA Clippers',
  'Los Angeles Lakers',
  'Memphis Grizzlies',
  'Miami Heat',
  'Milwaukee Bucks',
  'Minnesota Timberwolves',
  'New Orleans Pelicans',
  'New York Knicks',
  'Oklahoma City Thunder',
  'Orlando Magic',
  'Philadelphia 76ers',
  'Phoenix Suns',
  'Portland Trail Blazers',
  'Sacramento Kings',
  'San Antonio Spurs',
  'Toronto Raptors',
  'Utah Jazz',
  'Washington Wizards',
].map((name) => ({
  name,
  slug: slugify(name),
  league: 'NBA',
}));

/** Cricket — ICC Full Members + a few Associates (including UAE for your UI) */
const CRICKET_NATIONAL_TEAMS = [
  // ICC Full Members (12)
  'Afghanistan',
  'Australia',
  'Bangladesh',
  'England',
  'India',
  'Ireland',
  'New Zealand',
  'Pakistan',
  'South Africa',
  'Sri Lanka',
  'West Indies',
  'Zimbabwe',
  // Common Associates used in apps
  'United Arab Emirates',
  'Nepal',
  'Scotland',
  'Netherlands',
  'Namibia',
  'Oman',
  'USA',
].map((name) => ({
  name,
  slug: slugify(name),
  league: 'ICC',
  country: name,
}));

/** OPTIONAL placeholders if you later add pickers for these sports:
 *  To keep the message tight, we’re not dumping hundreds of soccer clubs here.
 *  When you need them, add arrays similar to NBA/Cricket and plug them in.
 */
/** ========================
 *  OTHER SPORTS — COMPLETE LISTS
 *  ======================== */

//
// ------- NFL (32) -------
//
const NFL_TEAMS = [
  'Arizona Cardinals','Atlanta Falcons','Baltimore Ravens','Buffalo Bills',
  'Carolina Panthers','Chicago Bears','Cincinnati Bengals','Cleveland Browns',
  'Dallas Cowboys','Denver Broncos','Detroit Lions','Green Bay Packers',
  'Houston Texans','Indianapolis Colts','Jacksonville Jaguars','Kansas City Chiefs',
  'Las Vegas Raiders','Los Angeles Chargers','Los Angeles Rams','Miami Dolphins',
  'Minnesota Vikings','New England Patriots','New Orleans Saints','New York Giants',
  'New York Jets','Philadelphia Eagles','Pittsburgh Steelers','San Francisco 49ers',
  'Seattle Seahawks','Tampa Bay Buccaneers','Tennessee Titans','Washington Commanders',
].map((name) => ({
  name,
  slug: slugify(name),
  league: 'NFL',
  country: 'USA',
}));

//
// ------- MLB (30) -------
const MLB_TEAMS = [
  'Arizona Diamondbacks','Atlanta Braves','Baltimore Orioles','Boston Red Sox',
  'Chicago Cubs','Chicago White Sox','Cincinnati Reds','Cleveland Guardians',
  'Colorado Rockies','Detroit Tigers','Houston Astros','Kansas City Royals',
  'Los Angeles Angels','Los Angeles Dodgers','Miami Marlins','Milwaukee Brewers',
  'Minnesota Twins','New York Mets','New York Yankees','Oakland Athletics',
  'Philadelphia Phillies','Pittsburgh Pirates','San Diego Padres','San Francisco Giants',
  'Seattle Mariners','St. Louis Cardinals','Tampa Bay Rays','Texas Rangers',
  'Toronto Blue Jays','Washington Nationals',
].map((name) => ({
  name,
  slug: slugify(name),
  league: 'MLB',
  country: 'USA/Canada',
}));

//
// ------- NHL (32) -------
const NHL_TEAMS = [
  'Anaheim Ducks','Arizona Coyotes','Boston Bruins','Buffalo Sabres',
  'Calgary Flames','Carolina Hurricanes','Chicago Blackhawks','Colorado Avalanche',
  'Columbus Blue Jackets','Dallas Stars','Detroit Red Wings','Edmonton Oilers',
  'Florida Panthers','Los Angeles Kings','Minnesota Wild','Montreal Canadiens',
  'Nashville Predators','New Jersey Devils','New York Islanders','New York Rangers',
  'Ottawa Senators','Philadelphia Flyers','Pittsburgh Penguins','San Jose Sharks',
  'Seattle Kraken','St. Louis Blues','Tampa Bay Lightning','Toronto Maple Leafs',
  'Vancouver Canucks','Vegas Golden Knights','Washington Capitals','Winnipeg Jets',
].map((name) => ({
  name,
  slug: slugify(name),
  league: 'NHL',
  country: 'USA/Canada',
}));

//
// ------- SOCCER (Top 5 European Leagues) -------
// Keep these grouped so you can filter by league on the client.
//

// Premier League (England) – 20
const EPL = [
  'Arsenal','Aston Villa','Bournemouth','Brentford','Brighton & Hove Albion',
  'Chelsea','Crystal Palace','Everton','Fulham','Liverpool',
  'Luton Town','Manchester City','Manchester United','Newcastle United','Nottingham Forest',
  'Sheffield United','Tottenham Hotspur','West Ham United','Wolverhampton Wanderers','Burnley',
].map((name) => ({ name, league: 'Premier League', country: 'England' }));

// La Liga (Spain) – 20
const LA_LIGA = [
  'Alavés','Athletic Club','Atlético Madrid','Barcelona','Betis',
  'Cádiz','Celta Vigo','Getafe','Girona','Granada',
  'Las Palmas','Mallorca','Osasuna','Rayo Vallecano','Real Madrid',
  'Real Sociedad','Sevilla','Valencia','Villarreal','Almería',
].map((name) => ({ name, league: 'La Liga', country: 'Spain' }));

// Serie A (Italy) – 20
const SERIE_A = [
  'Atalanta','Bologna','Cagliari','Empoli','Fiorentina',
  'Frosinone','Genoa','Inter','Juventus','Lazio',
  'Lecce','Milan','Monza','Napoli','Roma',
  'Salernitana','Sassuolo','Torino','Udinese','Verona',
].map((name) => ({ name, league: 'Serie A', country: 'Italy' }));

// Bundesliga (Germany) – 18
const BUNDESLIGA = [
  'Augsburg','Bayer Leverkusen','Bayern Munich','Bochum','Borussia Dortmund',
  'Borussia Mönchengladbach','Darmstadt','Eintracht Frankfurt','Freiburg','Heidenheim',
  'Hoffenheim','Köln','Mainz','RB Leipzig','Union Berlin',
  'VfB Stuttgart','Werder Bremen','Wolfsburg',
].map((name) => ({ name, league: 'Bundesliga', country: 'Germany' }));

// Ligue 1 (France) – 18
const LIGUE_1 = [
  'Brest','Clermont Foot','Havre AC','Lens','Lille',
  'Lorient','Lyon','Marseille','Metz','Monaco',
  'Montpellier','Nantes','Nice','Paris Saint-Germain','Reims',
  'Rennes','Strasbourg','Toulouse',
].map((name) => ({ name, league: 'Ligue 1', country: 'France' }));

// Combine soccer clubs
const SOCCER_CLUBS = [
  ...EPL, ...LA_LIGA, ...SERIE_A, ...BUNDESLIGA, ...LIGUE_1,
].map(({ name, league, country }) => ({
  name,
  slug: slugify(name),
  league,
  country,
}));

/** ========================
 *  HOOK INTO YOUR SEED FLOW
 *  ======================== */
// After you upsert the sports and have sportDocs available:
// await upsertTeamsForSport(sportDocs['nfl'], NFL_TEAMS);
// await upsertTeamsForSport(sportDocs['mlb'], MLB_TEAMS);
// await upsertTeamsForSport(sportDocs['hockey'], NHL_TEAMS);
// await upsertTeamsForSport(sportDocs['soccer'], SOCCER_CLUBS);

async function upsertSport(s) {
  return Sport.findOneAndUpdate({ slug: s.slug }, s, { new: true, upsert: true });
}

async function upsertTeamsForSport(sportDoc, teams) {
  for (const t of teams) {
    await Team.findOneAndUpdate(
      { sport: sportDoc._id, slug: t.slug },
      { ...t, sport: sportDoc._id },
      { upsert: true }
    );
  }
}

(async function run() {
  try {
    if (!MONGO_URI) throw new Error('MONGO_URI missing in .env');
    await mongoose.connect(MONGO_URI);

    // Upsert sports
    const sportDocs = {};
    for (const s of SPORTS) {
      sportDocs[s.slug] = await upsertSport(s);
    }

    // Seed teams for sports you actually ask the user to pick in onboarding:
    await upsertTeamsForSport(sportDocs['nba'], NBA_TEAMS);
    await upsertTeamsForSport(sportDocs['cricket'], CRICKET_NATIONAL_TEAMS);

    // If you turn on team pickers for other sports later, just uncomment:
    await upsertTeamsForSport(sportDocs['nfl'], NFL_TEAMS);
    await upsertTeamsForSport(sportDocs['mlb'], MLB_TEAMS);
    await upsertTeamsForSport(sportDocs['hockey'], NHL_TEAMS);
    await upsertTeamsForSport(sportDocs['soccer'], SOCCER_CLUBS);

    console.log('✅ Seeded sports and teams successfully');
    process.exit(0);
  } catch (e) {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  }
})();
