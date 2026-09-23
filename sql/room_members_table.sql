CREATE TABLE rooms_members(
    user_id INT NOT NULL REFERENCES users(id), -- 使用者ID
    room_id INT NOT NULL REFERENCES rooms(id), -- 聊天室ID
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (room_id, user_id)
);


/*
rom_id INT NOT NULL REFERENCES rooms(id)：聊天室ID，外鍵參照rooms表的id欄位
user_id INT NOT NULL REFERENCES users(id)：使用者ID，外鍵參照users表的id欄位
joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP：加入時間，預設值為當前時間
PRIMARY KEY (room_id, user_id)：組合主鍵，由room_id和user_id組成，確保同一個使用者不能重複加入同一個聊天室
*/