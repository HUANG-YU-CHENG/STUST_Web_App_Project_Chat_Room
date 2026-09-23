CREATE TABLE users(
    id SERIAL PRIMARY KEY, -- 使用者ID
    name VARCHAR(255) NOT NULL, -- 使用者名稱
    password VARCHAR(255) NOT NULL, -- 使用者密碼
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PostgreSQL沒有ON UPDATE CURRENT_TIMESTAMP，改用function+trigger在UPDATE時自動刷新updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

/*
SERIAL：自動遞增的整數，通常用於主鍵
PRIMARY KEY：主鍵，唯一標識每一行資料
VARCHAR(255)：可變長度的字串，最大長度為255個字
TIMESTAMP：時間戳記，表示日期和時間
DEFAULT CURRENT_TIMESTAMP：預設值為當前時間
*/