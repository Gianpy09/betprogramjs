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

app.get('/match/:id/stats', async (req, res) => {
  try {
    const matchId = req.params.id;
    const response = await axios.get(`https://api.football-data.org/v4/matches/${matchId}`, {
      headers: {
        'X-Auth-Token': apiKey,
      },
    });

    const matchStats = response.data.statistics;

    if (!matchStats || !matchStats.shots || !matchStats.shots_on_goal) {
      res.json({ matchStats: {} });
      return;
    }

    res.json({ matchStats });
  } catch (error) {
    console.error('Errore nel recupero delle statistiche dei tiri:', error.message);
    res.status(500).json({ error: 'Errore nel recupero delle statistiche dei tiri' });
  }
});

app.get('/team/:id/average-shots', async (req, res) => {
  try {
    const teamId = req.params.id;
    const response = await axios.get(`https://api.football-data.org/v4/teams/${teamId}`, {
      headers: {
        'X-Auth-Token': apiKey,
      },
    });

    const team = response.data;

    const matchesResponse = await axios.get(`https://api.football-data.org/v4/matches`, {
      headers: {
        'X-Auth-Token': apiKey,
      },
      params: {
        'season': 'current',
        'status': 'FINISHED',
        $or: [
          { 'homeTeam.id': teamId },
          { 'awayTeam.id': teamId },
        ],
      },
    });

    const matches = matchesResponse.data.matches;
    const shotsStats = calculateAverageShots(matches);

    res.json(shotsStats);
  } catch (error) {
    console.error('Errore nel calcolo delle medie dei tiri:', error.message);
    res.status(500).json({ error: 'Errore nel calcolo delle medie dei tiri' });
  }
});

function calculateAverageShots(matches) {
  let totalShots = 0;
  let totalShotsOnTarget = 0;

  matches.forEach(match => {
    if (match.statistics && match.statistics.shots && match.statistics.shots_on_goal) {
      totalShots += match.statistics.shots.total;
      totalShotsOnTarget += match.statistics.shots.onTarget;
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
