const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const rooms = { 'GENERAL': 'general' }; // 儲存房間信息，鍵為邀請碼，值為房間ID
let privateRoomCount = 0; // 記錄私人聊天室數量

app.use(express.static('public'));

// Serve login page as the default route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

io.on('connection', (socket) => {
    socket.on('chat message', ({ roomID, message, username }) => {
        io.to(roomID).emit('chat message', { roomID, username, message });
    });

    socket.on('create room', ({ username }) => { //創立房間
        const roomID = uuidv4();
        const inviteCode = generateInviteCode();
        rooms[inviteCode] = roomID;
        privateRoomCount++;
        const roomName = `Private Room ${privateRoomCount}`;
        socket.join(roomID);
        socket.emit('room created', { roomID, inviteCode, roomName });
        io.to(roomID).emit('chat message', { roomID, username: 'System', message: `${username} 創立聊天室` });
    });

    socket.on('join room', ({ inviteCode, username }) => { //加入房間
        const roomID = rooms[inviteCode.toUpperCase()];
        if (roomID) {
            socket.join(roomID);
            const roomName = roomID === 'general' ? 'General Room' : `Private Room ${privateRoomCount}`; // 獲取當前房間名稱
            socket.emit('room joined', { roomID, inviteCode, roomName });
            io.to(roomID).emit('chat message', { roomID, username: 'System', message: `${username} 加入聊天.` });
        } else {
            socket.emit('邀請碼錯誤!!');
        }
    });
});

function generateInviteCode() {//生成邀請碼
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

server.listen(3000, () => {
    console.log('listening on *:3000');
});
