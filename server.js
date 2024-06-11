const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid'); // 用于生成唯一邀请码

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// 存储房间和邀请码的映射
const rooms = {
    general: 'general' // 初始公共聊天室
};

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');

    // 加入公共聊天室
    socket.join('general');
    socket.emit('room joined', 'general');

    // 创建私人房间
    socket.on('create room', () => {
        const roomID = uuidv4(); // 生成唯一房间ID
        const inviteCode = uuidv4(); // 生成唯一邀请码
        rooms[inviteCode] = roomID;
        socket.emit('room created', { roomID, inviteCode });
        console.log(`Room created with ID: ${roomID} and Invite Code: ${inviteCode}`);
    });

    // 用户加入房间
    socket.on('join room', ({ inviteCode, username }) => {
        const roomID = rooms[inviteCode];
        if (roomID) {
            socket.join(roomID);
            console.log(`${username} joined room: ${roomID}`);
            socket.to(roomID).emit('user joined', { username });
            socket.emit('room joined', roomID);
        } else {
            socket.emit('invalid invite code');
            console.log(`Invalid invite code: ${inviteCode}`);
        }
    });

    socket.on('chat message', ({ roomID, message, username }) => {
        io.to(roomID).emit('chat message', { message, username });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
