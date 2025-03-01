const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 连接SQLite数据库（假定数据库文件名为 debate.db）
const db = new sqlite3.Database('./debate.db');

// 管理员账号和JWT密钥配置
const ADMIN_USER = 'cxy';
const ADMIN_PASS = 'cxy';
const SECRET_KEY = 'mysecretkey';

// 中间件：验证JWT令牌（用于需要管理员权限的接口）
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: '令牌无效或已过期' });
    // 如果需要，可以在此检查 user 的角色
    next();
  });
}

// **管理员登录接口**
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // 验证通过，签发 JWT
    const token = jwt.sign({ username: ADMIN_USER }, SECRET_KEY, { expiresIn: '8h' });
    return res.json({ token });
  }
  return res.status(401).json({ error: '用户名或密码错误' });
});

// **队伍列表查询接口（公开）**
app.get('/api/teams', (req, res) => {
  const sql = `SELECT id, name FROM teams ORDER BY id`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// **新增队伍接口（管理员）**
app.post('/api/teams', authenticateToken, (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: '队伍名称不能为空' });
  }
  const sql = `INSERT INTO teams(name) VALUES(?)`;
  db.run(sql, [name], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    // 返回新增的队伍信息
    res.json({ id: this.lastID, name });
  });
});

// **更新队伍信息接口（管理员）**
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

// **赛程查询接口（公开）** - 获取所有比赛及其队伍信息，用于前端赛程树展示
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

// **设置比赛胜者接口（管理员）** - 设置指定比赛的胜者，自动晋级
app.put('/api/matches/:id', authenticateToken, (req, res) => {
  const matchId = req.params.id;
  const winnerId = req.body.winner;
  if (!winnerId) {
    return res.status(400).json({ error: '缺少胜者ID' });
  }
  // 查找比赛以验证并获取 next_match 信息
  const querySql = `SELECT * FROM matches WHERE id = ?`;
  db.get(querySql, [matchId], (err, match) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!match) {
      return res.status(404).json({ error: '比赛不存在' });
    }
    // 确认提交的胜者ID属于该场比赛的队伍之一
    if (winnerId !== match.team1_id && winnerId !== match.team2_id) {
      return res.status(400).json({ error: '胜者ID无效' });
    }
    // 更新比赛的胜者
    const updateWinnerSql = `UPDATE matches SET winner_id = ? WHERE id = ?`;
    db.run(updateWinnerSql, [winnerId, matchId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      // 若该场比赛有下一轮（即不是最后决赛），则将胜者ID填入下一场比赛的相应队伍槽位
      if (match.next_match_id) {
        const nextSlotCol = match.next_slot === 1 ? 'team1_id' : 'team2_id';
        const updateNextSql = `UPDATE matches SET ${nextSlotCol} = ? WHERE id = ?`;
        db.run(updateNextSql, [winnerId, match.next_match_id], function(err2) {
          if (err2) return res.status(500).json({ error: err2.message });
          return res.json({ message: '胜者已晋级' });
        });
      } else {
        // 没有下一场比赛，说明该胜者为最终冠军
        return res.json({ message: '胜者已更新' });
      }
    });
  });
});

// **投票结果查询接口（公开）** - 查询最佳人气奖投票排行榜
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

// **提交投票接口（公开）** - 提交最佳人气奖投票，每个IP限投一次
app.post('/api/votes/popularity', (req, res) => {
  const teamId = req.body.teamId;
  if (!teamId) {
    return res.status(400).json({ error: '缺少队伍ID' });
  }
  const ip = req.ip;  // 获取用户IP地址
  // 检查该IP是否已经投过票
  const checkSql = `SELECT id FROM votes WHERE ip = ?`;
  db.get(checkSql, [ip], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) {
      return res.status(403).json({ error: '每个IP只能投一票' });
    }
    // 未投过票，则插入新投票记录
    const insertSql = `INSERT INTO votes(team_id, ip) VALUES(?, ?)`;
    db.run(insertSql, [teamId, ip], function(err2) {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: '投票成功' });
    });
  });
});

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
