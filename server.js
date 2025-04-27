const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 配置文件上傳
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const rooms = { 'GENERAL': 'general' }; // 儲存房間信息，鍵為邀請碼，值為房間ID
let privateRoomCount = 0; // 記錄私人聊天室數量

app.use(express.static('public'));

// 創建上傳目錄
const fs = require('fs');
if (!fs.existsSync('public/uploads')) {
    fs.mkdirSync('public/uploads', { recursive: true });
}

// Serve login page as the default route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

io.on('connection', (socket) => {
    socket.on('chat message', ({ roomID, message, username, fileUrl }) => {
        io.to(roomID).emit('chat message', { roomID, username, message, fileUrl });
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

// 添加文件上傳路由
app.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        res.json({ url: `/uploads/${req.file.filename}` });
    } else {
        res.status(400).json({ error: '上傳失敗' });
    }
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
