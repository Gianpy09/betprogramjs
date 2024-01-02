const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 3000;

const cors = require('cors');
app.use(cors());

const apiKey = '49240a09ef5a450296971365ed9a6489';

app.use(express.static(path.join(__dirname, 'public')));

async function getMatchData(matchId) {
  try {
    const response = await axios.get(`https://api.football-data.org/v4/matches/${matchId}`, {
      headers: {
        'X-Auth-Token': apiKey,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Errore nel recupero dei dati della partita:', error.message);
    throw error;
  }
}

// Nuova route per ottenere le partite in formato JSON
app.get('/matches-json', async (req, res) => {
  try {
    const response = await axios.get('https://api.football-data.org/v4/matches', {
      headers: {
        'X-Auth-Token': apiKey,
      },
    });

    const footballData = response.data;
    res.json(footballData);
  } catch (error) {
    console.error('Errore nel recupero dei dati delle partite:', error.message);
    res.status(500).json({ error: 'Errore nel recupero dei dati delle partite' });
  }
});

app.get('/match/:id', async (req, res) => {
  try {
    const matchId = req.params.id;
    const matchData = await getMatchData(matchId);
    res.json(matchData);
  } catch (error) {
    console.error('Errore nel recupero dei dati della partita:', error.message);
    res.status(500).json({ error: 'Errore nel recupero dei dati della partita' });
  }
});

app.get('/team/:id/average-shots', async (req, res) => {
  try {
    const teamId = req.params.id;

    // Ottenere tutte le partite in cui la squadra è di casa
    const homeMatchesResponse = await axios.get(`https://api.football-data.org/v4/matches`, {
      headers: {
        'X-Auth-Token': apiKey,
      },
      params: {
        'season': 'current', // Puoi aggiungere altri parametri per filtrare le partite
        'homeTeam': teamId,
      },
    });

    // Ottenere tutte le partite in cui la squadra è ospite
    const awayMatchesResponse = await axios.get(`https://api.football-data.org/v4/matches`, {
      headers: {
        'X-Auth-Token': apiKey,
      },
      params: {
        'season': 'current', // Puoi aggiungere altri parametri per filtrare le partite
        'awayTeam': teamId,
      },
    });

    // Calcolare la media dei tiri totali e in porta per la squadra di casa
    const homeMatches = homeMatchesResponse.data.matches;
    const homeShotsStats = calculateAverageShots(homeMatches);

    // Calcolare la media dei tiri totali e in porta per la squadra ospite
    const awayMatches = awayMatchesResponse.data.matches;
    const awayShotsStats = calculateAverageShots(awayMatches);

    res.json({
      homeTeam: homeShotsStats,
      awayTeam: awayShotsStats,
    });
  } catch (error) {
    console.error('Errore nel calcolo delle medie dei tiri:', error.message);
    res.status(500).json({ error: 'Errore nel calcolo delle medie dei tiri' });
  }
});

// Funzione di supporto per calcolare la media dei tiri totali e in porta
function calculateAverageShots(matches) {
  let totalShots = 0;
  let totalShotsOnTarget = 0;

  matches.forEach(match => {
    // Assicurati che le statistiche dei tiri siano disponibili
    if (match.statistics && match.statistics.shots && match.statistics.shots_on_goal) {
      totalShots += match.statistics.shots;
      totalShotsOnTarget += match.statistics.shots_on_goal;
    }
  });

  const averageShots = totalShots / matches.length;
  const averageShotsOnTarget = totalShotsOnTarget / matches.length;

  return {
    averageShots,
    averageShotsOnTarget,
  };
}


app.get('/matches-list', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'matches-list.html'));
});

app.listen(port, () => {
  console.log(`Server in ascolto sulla porta ${port}`);
});
