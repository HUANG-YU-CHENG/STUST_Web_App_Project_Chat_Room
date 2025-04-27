document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.getElementById('login-button');
    const usernameInput = document.getElementById('login-username');

    // Check if user already has a username stored
    const storedUsername = localStorage.getItem('chatUsername');
    if (storedUsername) {
        // If username exists, redirect to chat page
        window.location.href = '/index.html';
    }

    // Handle login button click
    loginButton.addEventListener('click', function() {
        login();
    });

    // Handle Enter key press
    usernameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });

    function login() {
        const username = usernameInput.value.trim();
        if (username) {
            // Store username in localStorage
            localStorage.setItem('chatUsername', username);
            // Redirect to chat page
            window.location.href = '/index.html';
        } else {
            alert('請輸入使用者名稱');
        }
    }
});
