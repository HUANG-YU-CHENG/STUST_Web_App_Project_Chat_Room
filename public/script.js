const socket = io();

const form = document.getElementById('message-form');
const input = document.getElementById('message-input');
const messages = document.getElementById('messages');
const usernameInput = document.getElementById('username-input');
const emojiButton = document.getElementById('emoji-button');
const emojiPicker = document.getElementById('emoji-picker');
const createRoomButton = document.getElementById('create-room-button');
const inviteCodeDisplay = document.getElementById('invite-code-display');
const joinRoomButton = document.getElementById('join-room-button');
const inviteCodeInput = document.getElementById('invite-code-input');
const roomSelector = document.getElementById('room-selector');

let currentRoomID = 'general';
let username = 'Anonymous';

// 更新用戶名
usernameInput.addEventListener('input', function() {
    username = usernameInput.value.trim() || 'Anonymous';
    socket.emit('update username', username);
});

// 發送訊息
form.addEventListener('submit', function(e) {
    e.preventDefault();
    const message = input.value;
    if (username && message && currentRoomID) {
        socket.emit('chat message', {
            roomID: currentRoomID,
            message: message,
            username: username
        });
        input.value = '';
    }
});

// 接收訊息
socket.on('chat message', function(msg) {
    if (msg.roomID === currentRoomID) {
        const item = document.createElement('li');
        item.innerHTML = `<strong>${msg.username}:</strong> ${msg.message}`;
        messages.appendChild(item);
        messages.scrollTop = messages.scrollHeight;
    }
});

// 創建房間
createRoomButton.addEventListener('click', function() {
    socket.emit('create room', { username });
});

socket.on('room created', function({ roomID, inviteCode, roomName }) {
    currentRoomID = roomID;
    inviteCodeDisplay.textContent = `邀請碼: ${inviteCode}`;
    const option = document.createElement('option');
    option.value = roomID;
    option.textContent = roomName;
    roomSelector.appendChild(option);
    roomSelector.value = roomID;
    messages.innerHTML = ''; // 清空消息列表
});

// 加入房間
joinRoomButton.addEventListener('click', function() {
    const inviteCode = inviteCodeInput.value.trim().toUpperCase();
    if (inviteCode && username) {
        socket.emit('join room', { inviteCode, username });
    }
});

socket.on('room joined', function({ roomID, inviteCode, roomName }) {
    currentRoomID = roomID;
    messages.innerHTML = ''; // 清空消息列表
    if (!Array.from(roomSelector.options).some(option => option.value === roomID)) {
        const option = document.createElement('option');
        option.value = roomID;
        option.textContent = roomName;
        roomSelector.appendChild(option);
    }
    roomSelector.value = roomID;
});

socket.on('invalid invite code', function() {
    alert('無效的邀請碼!');
});

// 房間選擇器變更
roomSelector.addEventListener('change', function() {
    currentRoomID = roomSelector.value;
    if (currentRoomID === 'general') {
        // 加入公共聊天室
        socket.emit('join room', { inviteCode: 'GENERAL', username: username });
    } else {
        // 加入私人聊天室
        const inviteCode = Object.keys(rooms).find(code => rooms[code] === currentRoomID);
        socket.emit('join room', { inviteCode, username: username });
    }
    messages.innerHTML = ''; // 清空消息列表
});

// 表情符號選擇器切換
emojiButton.addEventListener('click', function() {
    const rect = emojiButton.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    if (rect.bottom < viewportHeight / 2) {
        emojiPicker.style.top = `${rect.bottom + window.scrollY + 10}px`;
        emojiPicker.style.left = `${rect.left + window.scrollX}px`;
    } else {
        emojiPicker.style.top = `${rect.top + window.scrollY - emojiPicker.offsetHeight - 10}px`;
        emojiPicker.style.left = `${rect.left + window.scrollX}px`;
    }

    emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
});

// 添加表情符號到輸入框
emojiPicker.addEventListener('emoji-click', function(event) {
    input.value += event.detail.unicode;
    emojiPicker.style.display = 'none';
});

// 初始加入公共房間
socket.emit('join room', { inviteCode: 'GENERAL', username: username });
