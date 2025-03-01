-- 开启外键约束（可选）
PRAGMA foreign_keys = OFF;

-- 创建队伍表
CREATE TABLE teams (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

-- 创建比赛表（包含自引用的下一场比赛指针，用于赛程树）
CREATE TABLE matches (
  id            INTEGER PRIMARY KEY,
  round         INTEGER NOT NULL,
  team1_id      INTEGER,      -- 队伍1（可能为空，表示该槽位待定）
  team2_id      INTEGER,      -- 队伍2
  winner_id     INTEGER,      -- 胜者队伍ID
  next_match_id INTEGER,      -- 下一轮比赛ID（胜者晋级的比赛）
  next_slot     INTEGER,      -- 胜者晋级到下一场的槽位（1或2）
  FOREIGN KEY(team1_id) REFERENCES teams(id),
  FOREIGN KEY(team2_id) REFERENCES teams(id),
  FOREIGN KEY(winner_id) REFERENCES teams(id),
  FOREIGN KEY(next_match_id) REFERENCES matches(id)
);

-- 创建投票表（记录最佳人气奖投票）
CREATE TABLE votes (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER NOT NULL,
  ip      TEXT NOT NULL UNIQUE,  -- 每个IP只能投一票
  FOREIGN KEY(team_id) REFERENCES teams(id)
);

-- 插入初始16支队伍
INSERT INTO teams (name) VALUES 
('Team1'), ('Team2'), ('Team3'), ('Team4'),
('Team5'), ('Team6'), ('Team7'), ('Team8'),
('Team9'), ('Team10'), ('Team11'), ('Team12'),
('Team13'), ('Team14'), ('Team15'), ('Team16');

-- 插入首轮比赛（Round 1，共8场比赛，指定初始对阵队伍）
INSERT INTO matches (id, round, team1_id, team2_id, winner_id, next_match_id, next_slot) VALUES
(1, 1, 1, 2,   NULL, 9,  1),
(2, 1, 3, 4,   NULL, 9,  2),
(3, 1, 5, 6,   NULL, 10, 1),
(4, 1, 7, 8,   NULL, 10, 2),
(5, 1, 9, 10,  NULL, 11, 1),
(6, 1, 11, 12, NULL, 11, 2),
(7, 1, 13, 14, NULL, 12, 1),
(8, 1, 15, 16, NULL, 12, 2);

-- 插入第二轮比赛（Round 2，共4场比赛，先不指定队伍，待上一轮胜者填入）
INSERT INTO matches (id, round, team1_id, team2_id, winner_id, next_match_id, next_slot) VALUES
(9,  2, NULL, NULL, NULL, 13, 1),  -- 比赛1和2的胜者将进入比赛9
(10, 2, NULL, NULL, NULL, 13, 2),  -- 比赛3和4的胜者将进入比赛10
(11, 2, NULL, NULL, NULL, 14, 1),  -- 比赛5和6的胜者将进入比赛11
(12, 2, NULL, NULL, NULL, 14, 2);  -- 比赛7和8的胜者将进入比赛12

-- 插入第三轮比赛（Round 3，半决赛，共2场）
INSERT INTO matches (id, round, team1_id, team2_id, winner_id, next_match_id, next_slot) VALUES
(13, 3, NULL, NULL, NULL, 15, 1),  -- 比赛9和10胜者进入比赛13（半决赛）
(14, 3, NULL, NULL, NULL, 15, 2);  -- 比赛11和12胜者进入比赛14（半决赛）

-- 插入决赛（Round 4，决赛，共1场）
INSERT INTO matches (id, round, team1_id, team2_id, winner_id, next_match_id, next_slot) VALUES
(15, 4, NULL, NULL, NULL, NULL, NULL);  -- 比赛13和14胜者进入比赛15（决赛）
