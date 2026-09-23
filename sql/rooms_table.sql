CREATE TABLE rooms(
    id serial PRIMARY KEY, -- 聊天室ID
    name VARCHAR(255) NOT NULL, -- 聊天室名稱
    invite_code VARCHAR(255) NOT NULL UNIQUE, -- 聊天室邀請碼
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS 
$$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_room_updated_at
BEFORE UPDATE ON rooms
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

/*
用上TRIGGER原因是PostgreSQL管理TIMESTAMP欄位時，沒有提供ON UPDATE CURRENT_TIMESTAMP（MySQL語法糖）的功能
，PostgreSQL數據變化觸發邏輯都交給Trigger，因此需要透過TRIGGER來實現自動更新updated_at欄位的功能。
*/

/*
id serial PRIMARY KEY：自動遞增的整數，通常用於主鍵
name VARCHAR(255) NOT NULL：聊天室名稱，最大長度為255個字元，不能為NULL
invite_code VARCHAR(255) NOT NULL：聊天室邀請碼，最大長度為255個字元，不能為NULL
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP：建立時間，預設值為當前時間
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP：更新時間，預設值為當前時間
*/ 