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

// 初始化数据库表和数据
db.serialize(() => {
  // 创建队伍表
  db.run(`DROP TABLE IF EXISTS matches`);
  db.run(`DROP TABLE IF EXISTS teams`);
  
  db.run(`CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )`);

  // 创建比赛表
  db.run(`CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round INTEGER NOT NULL,
    order_num INTEGER NOT NULL,
    team1_id INTEGER,
    team2_id INTEGER,
    winner_id INTEGER,
    topic TEXT,
    start_time TEXT,
    location TEXT,
    next_match_id INTEGER,
    next_match_slot INTEGER,
    FOREIGN KEY (team1_id) REFERENCES teams(id),
    FOREIGN KEY (team2_id) REFERENCES teams(id),
    FOREIGN KEY (winner_id) REFERENCES teams(id)
  )`);

  // 插入初始队伍数据
  const teams = [
    '法学院队', '医学院队', '机械工程学院队', '电气工程学院队',
    '计算机科学与工程学院队', '土木工程学院队', '化学工程学院队',
    '材料科学与工程学院队', '环境工程学院队', '管理学院队',
    '经济学院队', '外国语学院队', '数学与统计学院队',
    '物理与光电工程学院队', '艺术学院队'
  ];

  const insertTeam = db.prepare('INSERT OR IGNORE INTO teams (name) VALUES (?)');
  teams.forEach(name => insertTeam.run(name));
  insertTeam.finalize();

  // 插入初始比赛数据
  const initialMatches = [
    [1, 1, 1, 2, '初赛第一场', '2025-03-17 09:00', '安徽理工大学图书馆报告厅'],
    [1, 2, 3, 4, '初赛第二场', '2025-03-17 09:00', '安徽理工大学第一会议室'],
    [1, 3, 5, 6, '初赛第三场', '2025-03-17 10:00', '安徽理工大学第二会议室'],
    [1, 4, 7, 8, '初赛第四场', '2025-03-17 10:00', '安徽理工大学第三会议室'],
    [1, 5, 9, 10, '初赛第五场', '2025-03-17 11:00', '安徽理工大学第四会议室'],
    [1, 6, 11, 12, '初赛第六场', '2025-03-17 11:00', '安徽理工大学第五会议室'],
    [1, 7, 13, 14, '初赛第七场', '2025-03-17 12:00', '安徽理工大学第六会议室'],
    [1, 8, 15, null, '初赛第八场', '2025-03-17 12:00', '安徽理工大学第七会议室']
  ];

  const insertMatch = db.prepare(`
    INSERT OR IGNORE INTO matches (round, order_num, team1_id, team2_id, topic, start_time, location)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  initialMatches.forEach(match => insertMatch.run(...match));
  insertMatch.finalize();
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

// 获取所有比赛数据
app.get('/api/matches', (req, res) => {
  const sql = `
    SELECT m.id, m.round, m.order_num, 
           m.team1_id, t1.name as team1_name,
           m.team2_id, t2.name as team2_name,
           m.winner_id,
           m.topic, m.start_time, m.location,
           m.next_match_id, m.next_match_slot
    FROM matches m
    LEFT JOIN teams t1 ON m.team1_id = t1.id
    LEFT JOIN teams t2 ON m.team2_id = t2.id
    ORDER BY m.round, m.order_num
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows });
  });
});

// 创建新比赛
app.post('/api/matches', authenticateToken, (req, res) => {
  const { team1_id, team2_id, round, order, start_time, location, topic } = req.body;
  
  // 添加参数验证
  if (!team1_id || !team2_id || !round || !order) {
    return res.status(400).json({ error: '必填字段不能为空' });
  }

  const sql = `
    INSERT INTO matches (team1_id, team2_id, round, order_num, start_time, location, topic)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(sql, [team1_id, team2_id, round, order, start_time, location, topic], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message });
    }
    
    // 查询新创建的比赛完整信息
    const fetchSql = `
      SELECT m.*, 
             t1.name as team1_name, 
             t2.name as team2_name
      FROM matches m
      LEFT JOIN teams t1 ON m.team1_id = t1.id
      LEFT JOIN teams t2 ON m.team2_id = t2.id
      WHERE m.id = ?
    `;
    
    db.get(fetchSql, [this.lastID], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row);
    });
  });
});

// 更新比赛信息
app.put('/api/matches/:id', authenticateToken, (req, res) => {
  const { team1_id, team2_id, round, order, start_time, location, topic } = req.body;
  
  // Validate required fields
  if (!team1_id || !team2_id || !round || !order) {
    return res.status(400).json({ error: '必填字段不能为空' });
  }

  const sql = `
    UPDATE matches 
    SET team1_id = ?, team2_id = ?, round = ?, order_num = ?, 
        start_time = ?, location = ?, topic = ?
    WHERE id = ?`;
  
  db.run(sql, [team1_id, team2_id, round, order, start_time, location, topic, req.params.id], 
    function(err) {
      if (err) {
        console.error('Update error:', err);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: '比赛不存在' });
      }
      
      // Return updated match data
      const fetchSql = `
        SELECT m.*, 
               t1.name as team1_name, 
               t2.name as team2_name
        FROM matches m
        LEFT JOIN teams t1 ON m.team1_id = t1.id
        LEFT JOIN teams t2 ON m.team2_id = t2.id
        WHERE m.id = ?
      `;
      
      db.get(fetchSql, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
      });
    });
});

app.put('/api/matches/:id/winner', authenticateToken, (req, res) => {
  const matchId = req.params.id;
  const winnerId = req.body.winner_id;
  
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

// 添加删除比赛路由
app.delete('/api/matches/:id', authenticateToken, (req, res) => {
  const { id } = req.params
  const sql = `DELETE FROM matches WHERE id = ?`
  db.run(sql, [id], function(err) {
    if (err) {
      console.error('Delete match error:', err)
      return res.status(500).json({ error: err.message })
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: '比赛不存在' })
    }
    // 返回204表示成功删除，无内容
    res.status(204).end()
  })
})

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
