CREATE TABLE message_record(
    user_id INT NOT NULL REFERENCES users(id), -- 使用者ID
    room_id INT NOT NULL REFERENCES rooms(id), -- 聊天室ID
    content TEXT NOT NULL, -- 訊息內容
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 訊息建立時間
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 訊息更新時間
    primary key (user_id, room_id, created_at) -- 組合主鍵，確保同一個使用者在同一個聊天室的訊息不會重複
)

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
CREATE TRIGGER trg_message_record_updated_at
BEFORE UPDATE ON message_record
FOR EACH ROW EXECUTE FUNCTION set_updated_at();