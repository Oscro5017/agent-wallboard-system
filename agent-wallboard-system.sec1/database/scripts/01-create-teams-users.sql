PRAGMA foreign_keys=OFF;

DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Teams;

PRAGMA foreign_keys=ON;

-- Teams
CREATE TABLE Teams (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  teamCode  TEXT NOT NULL UNIQUE,
  teamName  TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER update_teams_timestamp
AFTER UPDATE ON Teams
FOR EACH ROW
BEGIN
  UPDATE Teams SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Users (FK -> Teams.id)
CREATE TABLE Users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  username    TEXT NOT NULL UNIQUE,
  fullName    TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('Agent','Supervisor','Admin')),
  teamId      INTEGER,
  status      TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Inactive')),
  createdAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lastLoginAt DATETIME,
  deletedAt   DATETIME,
  FOREIGN KEY (teamId) REFERENCES Teams(id)
);
CREATE INDEX idx_users_username  ON Users(username);
CREATE INDEX idx_users_role      ON Users(role);
CREATE INDEX idx_users_status    ON Users(status);
CREATE INDEX idx_users_teamId    ON Users(teamId);
CREATE INDEX idx_users_deletedAt ON Users(deletedAt);
CREATE TRIGGER update_users_timestamp
AFTER UPDATE ON Users
FOR EACH ROW
BEGIN
  UPDATE Users SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
