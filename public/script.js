const socket = io();

// 檢查是否已登入，如果沒有則重定向到登入頁面
if (!localStorage.getItem('chatUsername')) {
    window.location.href = '/login.html';
}

const form = document.getElementById('message-form'); //訊息表單
const input = document.getElementById('message-input');//訊息輸入
const messages = document.getElementById('messages');//訊息
const usernameDisplay = document.getElementById('username-display');//使用者名稱顯示
const emojiButton = document.getElementById('emoji-button');//表情按鈕
const emojiPicker = document.getElementById('emoji-picker');//表情選擇
const createRoomButton = document.getElementById('create-room-button');//創立房間按鈕
const inviteCodeDisplay = document.getElementById('invite-code-display');//邀請碼顯示
const joinRoomButton = document.getElementById('join-room-button');//加入房間按鈕
const inviteCodeInput = document.getElementById('invite-code-input');//邀請碼輸入
const roomSelector = document.getElementById('room-selector');//房間選擇器
const logoutButton = document.getElementById('logout-button');//登出按鈕
const fileInput = document.getElementById('file-input');//文件輸入
const uploadButton = document.getElementById('upload-button');//上傳按鈕

let currentRoomID = 'general';
let username = localStorage.getItem('chatUsername') || 'Anonymous';
let currentFile = null;

// 顯示用戶名
usernameDisplay.textContent = `使用者: ${username}`;

// 文件上傳按鈕點擊事件
uploadButton.addEventListener('click', function() {
    fileInput.click();
});

// 文件選擇事件
fileInput.addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
        currentFile = e.target.files[0];
        uploadButton.textContent = currentFile.name;
    }
});

// 發送訊息
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const message = input.value;
    let fileUrl = null;

    if (currentFile) {
        const formData = new FormData();
        formData.append('file', currentFile);
        
        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            fileUrl = data.url;
        } catch (error) {
            console.error('上傳失敗:', error);
            alert('文件上傳失敗');
            return;
        }
    }

    if (username && (message || fileUrl) && currentRoomID) {
        socket.emit('chat message', {
            roomID: currentRoomID,
            message: message,
            username: username,
            fileUrl: fileUrl
        });
        input.value = '';
        currentFile = null;
        fileInput.value = '';
        uploadButton.textContent = '上傳文件';
    }
});

// 接收訊息
socket.on('chat message', function(msg) {
    if (msg.roomID === currentRoomID) {
        const item = document.createElement('li');
        let content = `<strong>${msg.username}:</strong> ${msg.message || ''}`;
        
        if (msg.fileUrl) {
            const fileExtension = msg.fileUrl.split('.').pop().toLowerCase();
            if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
                content += `<br><img src="${msg.fileUrl}" style="max-width: 300px; max-height: 300px;">`;
            } else if (['mp3', 'wav'].includes(fileExtension)) {
                content += `<br><audio controls><source src="${msg.fileUrl}" type="audio/${fileExtension}">您的瀏覽器不支持音頻播放</audio>`;
            } else {
                content += `<br><a href="${msg.fileUrl}" target="_blank">下載文件</a>`;
            }
        }
        
        item.innerHTML = content;
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

    if (rect.bottom < viewportHeight / 2) {//控制選擇器高度
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

// 登出功能
logoutButton.addEventListener('click', function() {
    localStorage.removeItem('chatUsername');
    window.location.href = '/login.html';
});
