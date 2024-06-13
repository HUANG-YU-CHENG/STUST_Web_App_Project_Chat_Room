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
let username = '';

// 更新用户名
usernameInput.addEventListener('input', function() {
    username = usernameInput.value.trim() || 'Anonymous';
    socket.emit('update username', username);
});

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

socket.on('chat message', function(msg) {
    if (msg.roomID === currentRoomID) {
        const item = document.createElement('li');
        item.innerHTML = `<strong>${msg.username}:</strong> ${msg.message}`;
        messages.appendChild(item);
        messages.scrollTop = messages.scrollHeight;
    }
});

createRoomButton.addEventListener('click', function() {
    socket.emit('create room', { username });
});

socket.on('room created', function({ roomID, inviteCode, roomName }) {
    currentRoomID = roomID;
    inviteCodeDisplay.textContent = `Invite Code: ${inviteCode}`;
    const option = document.createElement('option');
    option.value = roomID;
    option.textContent = roomName;
    roomSelector.appendChild(option);
    roomSelector.value = roomID;
    messages.innerHTML = ''; // 清空消息列表
});

joinRoomButton.addEventListener('click', function() {
    const inviteCode = inviteCodeInput.value.trim().toUpperCase();
    if (inviteCode && username) {
        socket.emit('join room', { inviteCode, username });
    }
});

socket.on('room joined', function({ roomID, inviteCode, roomName }) {
    currentRoomID = roomID;
    messages.innerHTML = ''; // 清空消息列表，方便显示新房间的消息
    if (!Array.from(roomSelector.options).some(option => option.value === roomID)) {
        const option = document.createElement('option');
        option.value = roomID;
        option.textContent = roomName;
        roomSelector.appendChild(option);
    }
    roomSelector.value = roomID;
});

socket.on('invalid invite code', function() {
    alert('Invalid invite code!');
});

roomSelector.addEventListener('change', function() {
    currentRoomID = roomSelector.value;
    if (currentRoomID === 'general') {
        socket.emit('join room', { inviteCode: 'GENERAL', username: username });
    } else {
        socket.emit('join room', { inviteCode: currentRoomID, username: username });
    }
    messages.innerHTML = ''; // 清空消息列表
});

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

emojiPicker.addEventListener('emoji-click', function(event) {
    input.value += event.detail.unicode;
    emojiPicker.style.display = 'none';
});

// 初始加入公共聊天室
username = 'Anonymous';
socket.emit('join room', { inviteCode: 'GENERAL', username: username });
