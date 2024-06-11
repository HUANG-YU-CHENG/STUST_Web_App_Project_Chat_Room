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

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = usernameInput.value.trim();
    if (username && input.value && currentRoomID) {
        socket.emit('chat message', {
            roomID: currentRoomID,
            message: input.value,
            username: username
        });
        input.value = '';
    }
});

socket.on('chat message', function(msg) {
    const item = document.createElement('li');
    item.innerHTML = `<strong>${msg.username}:</strong> ${msg.message}`;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

createRoomButton.addEventListener('click', function() {
    socket.emit('create room');
});

socket.on('room created', function({ roomID, inviteCode }) {
    currentRoomID = roomID;
    inviteCodeDisplay.textContent = `Invite Code: ${inviteCode}`;
    const option = document.createElement('option');
    option.value = roomID;
    option.textContent = `Room ${roomID}`;
    roomSelector.appendChild(option);
    roomSelector.value = roomID;
});

joinRoomButton.addEventListener('click', function() {
    const inviteCode = inviteCodeInput.value.trim();
    const username = usernameInput.value.trim();
    if (inviteCode && username) {
        socket.emit('join room', { inviteCode, username });
    }
});

socket.on('room joined', function(roomID) {
    currentRoomID = roomID;
    messages.innerHTML = ''; // 清空消息列表，方便显示新房间的消息
});

socket.on('invalid invite code', function() {
    alert('Invalid invite code!');
});

roomSelector.addEventListener('change', function() {
    currentRoomID = roomSelector.value;
    socket.emit('join room', { inviteCode: currentRoomID, username: usernameInput.value.trim() });
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
socket.emit('join room', { inviteCode: 'general', username: 'Anonymous' });
