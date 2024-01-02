const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 3000;

const cors = require('cors');
app.use(cors());

const apiKey = '49240a09ef5a450296971365ed9a6489';

// Aggiungi un middleware per impostare l'URL di base in base alla richiesta
app.use((req, res, next) => {
  res.locals.baseUrl = `${req.protocol}://${req.get('host')}`;
  next();
});

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

app.get('/matches-list', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'matches-list.html'));
});

app.listen(port, () => {
  console.log(`Server in ascolto sulla porta ${port}`);
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
    const response = await axios.get(`https://api.football-data.org/v4/matches/${matchId}`, {
      headers: {
        'X-Auth-Token': apiKey,
      },
    });

    const matchData = response.data;

    // Verifichiamo che ci siano statistiche sui tiri disponibili
    if (!matchData.statistics || !matchData.statistics.shots || !matchData.statistics.shots.on) {
      res.json({ matchData });
      return;
    }

    res.json({ matchData });
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
    const response = await axios.get(`https://api.football-data.org/v4/teams/${teamId}/matches`, {
      headers: {
        'X-Auth-Token': apiKey,
      },
      params: {
        'status': 'FINISHED',
        'limit': 1,
      },
    });

    const matches = response.data.matches;

    // Verifichiamo che ci siano partite disponibili per la squadra
    if (!matches || matches.length === 0) {
      res.json({ averageShots: 0, averageShotsOnTarget: 0 });
      return;
    }

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
    if (match.statistics && match.statistics.shots && match.statistics.shots.on) {
      totalShots += match.statistics.shots.total;
      totalShotsOnTarget += match.statistics.shots.on;
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
