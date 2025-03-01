const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./debate.db');

const ADMIN_USER = 'cxy';
const ADMIN_PASS = 'cxy';
const SECRET_KEY = 'mysecretkey';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: '令牌无效或已过期' });
    next();
  });
}

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ username: ADMIN_USER }, SECRET_KEY, { expiresIn: '8h' });
    return res.json({ token });
  }
  return res.status(401).json({ error: '用户名或密码错误' });
});

app.get('/api/teams', (req, res) => {
  const sql = `SELECT id, name FROM teams ORDER BY id`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/teams', authenticateToken, (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: '队伍名称不能为空' });
  }
  const sql = `INSERT INTO teams(name) VALUES(?)`;
  db.run(sql, [name], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name });
  });
});

app.put('/api/teams/:id', authenticateToken, (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  if (!name) {
    return res.status(400).json({ error: '队伍名称不能为空' });
  }
  const sql = `UPDATE teams SET name = ? WHERE id = ?`;
  db.run(sql, [name, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: '找不到该队伍' });
    }
    res.json({ id: Number(id), name });
  });
});

app.get('/api/matches', (req, res) => {
  const sql = `
    SELECT m.id, m.round, m.team1_id, t1.name AS team1_name,
           m.team2_id, t2.name AS team2_name,
           m.winner_id
    FROM matches m
    LEFT JOIN teams t1 ON m.team1_id = t1.id
    LEFT JOIN teams t2 ON m.team2_id = t2.id
    ORDER BY m.round, m.id`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put('/api/matches/:id', authenticateToken, (req, res) => {
  const matchId = req.params.id;
  const winnerId = req.body.winner;
  if (!winnerId) {
    return res.status(400).json({ error: '缺少胜者ID' });
  }
  const querySql = `SELECT * FROM matches WHERE id = ?`;
  db.get(querySql, [matchId], (err, match) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!match) {
      return res.status(404).json({ error: '比赛不存在' });
    }
    if (winnerId !== match.team1_id && winnerId !== match.team2_id) {
      return res.status(400).json({ error: '胜者ID无效' });
    }
    const updateWinnerSql = `UPDATE matches SET winner_id = ? WHERE id = ?`;
    db.run(updateWinnerSql, [winnerId, matchId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (match.next_match_id) {
        const nextSlotCol = match.next_slot === 1 ? 'team1_id' : 'team2_id';
        const updateNextSql = `UPDATE matches SET ${nextSlotCol} = ? WHERE id = ?`;
        db.run(updateNextSql, [winnerId, match.next_match_id], function(err2) {
          if (err2) return res.status(500).json({ error: err2.message });
          return res.json({ message: '胜者已晋级' });
        });
      } else {
        return res.json({ message: '胜者已更新' });
      }
    });
  });
});

app.get('/api/votes/popularity', (req, res) => {
  const sql = `
    SELECT teams.id, teams.name,
           COALESCE(vcount.votes, 0) AS votes
    FROM teams
    LEFT JOIN (
      SELECT team_id, COUNT(*) AS votes 
      FROM votes 
      GROUP BY team_id
    ) AS vcount
    ON teams.id = vcount.team_id
    ORDER BY votes DESC, teams.id;
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/votes/popularity', (req, res) => {
  const teamId = req.body.teamId;
  if (!teamId) {
    return res.status(400).json({ error: '缺少队伍ID' });
  }
  const ip = req.ip;

  const checkSql = `SELECT id FROM votes WHERE ip = ?`;
  db.get(checkSql, [ip], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) {
      return res.status(403).json({ error: '每个IP只能投一票' });
    }
    const insertSql = `INSERT INTO votes(team_id, ip) VALUES(?, ?)`;
    db.run(insertSql, [teamId, ip], function(err2) {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: '投票成功' });
    });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
