// Application State
let currentUser = null;
let rooms = [];
let nextRoomId = 1;

// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginForm = document.getElementById('login-form');
const userDisplay = document.getElementById('user-display');

const createRoomBtn = document.getElementById('create-room-btn');
const browseRoomsBtn = document.getElementById('browse-rooms-btn');
const createRoomForm = document.getElementById('create-room-form');
const roomForm = document.getElementById('room-form');
const cancelCreateBtn = document.getElementById('cancel-create');

const roomsGrid = document.getElementById('rooms-grid');
const roomModal = document.getElementById('room-modal');
const closeModal = document.querySelector('.close');

// Sample data for demonstration
const sampleRooms = [
    {
        id: 1,
        name: "Chess Tournament",
        type: "board-games",
        host: "Alice Wang",
        location: "Library Study Room 301",
        date: "2024-12-20",
        time: "14:00",
        maxParticipants: 8,
        participants: ["Alice Wang", "Bob Chen"],
        description: "Friendly chess tournament for all skill levels!"
    },
    {
        id: 2,
        name: "Basketball Pickup Game",
        type: "sports",
        host: "Mike Liu",
        location: "CityU Sports Complex Court 2",
        date: "2024-12-21",
        time: "16:30",
        maxParticipants: 10,
        participants: ["Mike Liu", "Sarah Wong", "David Lee"],
        description: "Casual basketball game, all levels welcome!"
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load sample data
    rooms = [...sampleRooms];
    nextRoomId = Math.max(...rooms.map(r => r.id)) + 1;
    
    // Set up event listeners
    setupEventListeners();
    
    // Check if user is already logged in (simulate session)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    } else {
        showLogin();
    }
});

function setupEventListeners() {
    // Login/Logout
    loginForm.addEventListener('submit', handleLogin);
    loginBtn.addEventListener('click', showLogin);
    logoutBtn.addEventListener('click', handleLogout);
    
    // Room creation
    createRoomBtn.addEventListener('click', showCreateRoomForm);
    browseRoomsBtn.addEventListener('click', showRoomsList);
    roomForm.addEventListener('submit', handleCreateRoom);
    cancelCreateBtn.addEventListener('click', hideCreateRoomForm);
    
    // Modal
    closeModal.addEventListener('click', hideRoomModal);
    window.addEventListener('click', function(event) {
        if (event.target === roomModal) {
            hideRoomModal();
        }
    });
}

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    
    if (username && email) {
        currentUser = { username, email };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showDashboard();
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLogin();
    // Reset forms
    loginForm.reset();
    roomForm.reset();
}

function showLogin() {
    loginSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
    loginBtn.classList.add('hidden');
    logoutBtn.classList.add('hidden');
}

function showDashboard() {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    
    userDisplay.textContent = currentUser.username;
    hideCreateRoomForm();
    displayRooms();
}

function showCreateRoomForm() {
    createRoomForm.classList.remove('hidden');
    hideRoomsList();
}

function hideCreateRoomForm() {
    createRoomForm.classList.add('hidden');
    showRoomsList();
}

function showRoomsList() {
    document.getElementById('rooms-list').style.display = 'block';
}

function hideRoomsList() {
    document.getElementById('rooms-list').style.display = 'none';
}

function handleCreateRoom(event) {
    event.preventDefault();
    
    const formData = new FormData(roomForm);
    const newRoom = {
        id: nextRoomId++,
        name: formData.get('activity-name'),
        type: formData.get('activity-type'),
        host: currentUser.username,
        location: formData.get('location'),
        date: formData.get('date'),
        time: formData.get('time'),
        maxParticipants: parseInt(formData.get('max-participants')),
        participants: [currentUser.username],
        description: formData.get('description') || ''
    };
    
    rooms.unshift(newRoom); // Add to beginning of array
    roomForm.reset();
    hideCreateRoomForm();
    displayRooms();
    
    alert('Room created successfully!');
}

function displayRooms() {
    roomsGrid.innerHTML = '';
    
    if (rooms.length === 0) {
        roomsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: #666;">No rooms available. Create one!</p>';
        return;
    }
    
    rooms.forEach(room => {
        const roomCard = createRoomCard(room);
        roomsGrid.appendChild(roomCard);
    });
}

function createRoomCard(room) {
    const card = document.createElement('div');
    card.className = 'room-card';
    card.addEventListener('click', () => showRoomDetails(room));
    
    const isHost = currentUser && room.host === currentUser.username;
    const isParticipant = currentUser && room.participants.includes(currentUser.username);
    const isFull = room.participants.length >= room.maxParticipants;
    
    card.innerHTML = `
        <h4>${room.name}</h4>
        <span class="activity-type">${formatActivityType(room.type)}</span>
        <div class="room-info"><strong>Host:</strong> ${room.host}</div>
        <div class="room-info"><strong>Location:</strong> ${room.location}</div>
        <div class="room-info"><strong>Date:</strong> ${formatDate(room.date)}</div>
        <div class="room-info"><strong>Time:</strong> ${formatTime(room.time)}</div>
        <div class="participants">
            ${room.participants.length}/${room.maxParticipants} participants
            ${isFull ? ' (Full)' : ''}
        </div>
    `;
    
    return card;
}

function showRoomDetails(room) {
    const isHost = currentUser && room.host === currentUser.username;
    const isParticipant = currentUser && room.participants.includes(currentUser.username);
    const isFull = room.participants.length >= room.maxParticipants;
    
    let actionButton = '';
    if (currentUser) {
        if (isHost) {
            actionButton = '<button class="leave-btn" onclick="deleteRoom(' + room.id + ')">Delete Room</button>';
        } else if (isParticipant) {
            actionButton = '<button class="leave-btn" onclick="leaveRoom(' + room.id + ')">Leave Room</button>';
        } else if (!isFull) {
            actionButton = '<button class="join-btn" onclick="joinRoom(' + room.id + ')">Join Room</button>';
        }
    }
    
    const participantsList = room.participants.map(participant => {
        const isRoomHost = participant === room.host;
        return `<div class="participant ${isRoomHost ? 'host' : ''}">${participant}${isRoomHost ? ' (Host)' : ''}</div>`;
    }).join('');
    
    document.getElementById('room-details').innerHTML = `
        <h3>${room.name}</h3>
        <span class="activity-type">${formatActivityType(room.type)}</span>
        
        <div style="margin: 1.5rem 0;">
            <div class="room-info"><strong>Host:</strong> ${room.host}</div>
            <div class="room-info"><strong>Location:</strong> ${room.location}</div>
            <div class="room-info"><strong>Date:</strong> ${formatDate(room.date)}</div>
            <div class="room-info"><strong>Time:</strong> ${formatTime(room.time)}</div>
            <div class="room-info"><strong>Max Participants:</strong> ${room.maxParticipants}</div>
            ${room.description ? '<div class="room-info"><strong>Description:</strong> ' + room.description + '</div>' : ''}
        </div>
        
        <div class="participants-list">
            <h5>Participants (${room.participants.length}/${room.maxParticipants}):</h5>
            ${participantsList}
        </div>
        
        ${actionButton}
    `;
    
    roomModal.classList.remove('hidden');
}

function hideRoomModal() {
    roomModal.classList.add('hidden');
}

function joinRoom(roomId) {
    if (!currentUser) {
        alert('Please login first');
        return;
    }
    
    const room = rooms.find(r => r.id === roomId);
    if (room && !room.participants.includes(currentUser.username) && room.participants.length < room.maxParticipants) {
        room.participants.push(currentUser.username);
        displayRooms();
        showRoomDetails(room);
        alert('Successfully joined the room!');
    }
}

function leaveRoom(roomId) {
    const room = rooms.find(r => r.id === roomId);
    if (room && currentUser) {
        const index = room.participants.indexOf(currentUser.username);
        if (index > -1) {
            room.participants.splice(index, 1);
            displayRooms();
            hideRoomModal();
            alert('You have left the room.');
        }
    }
}

function deleteRoom(roomId) {
    showConfirmationModal(
        'Delete Room',
        'Are you sure you want to delete this room? This action cannot be undone.',
        function() {
            // Confirm callback
            const index = rooms.findIndex(r => r.id === roomId);
            if (index > -1) {
                rooms.splice(index, 1);
                displayRooms();
                hideRoomModal();
                alert('Room deleted successfully.');
            }
        },
        function() {
            // Cancel callback - do nothing
        }
    );
}

// Custom accessible confirmation modal
function showConfirmationModal(title, message, confirmCallback, cancelCallback) {
    // Create modal elements
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'confirmation-title');
    modal.setAttribute('aria-describedby', 'confirmation-message');
    
    const modalContent = document.createElement('div');
    modalContent.className = 'confirmation-modal-content';
    
    const titleElement = document.createElement('h3');
    titleElement.id = 'confirmation-title';
    titleElement.textContent = title;
    
    const messageElement = document.createElement('p');
    messageElement.id = 'confirmation-message';
    messageElement.textContent = message;
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'confirmation-modal-buttons';
    
    const confirmButton = document.createElement('button');
    confirmButton.className = 'confirm-btn';
    confirmButton.textContent = 'Delete';
    confirmButton.setAttribute('aria-describedby', 'confirmation-message');
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'cancel-btn';
    cancelButton.textContent = 'Cancel';
    
    // Event handlers
    confirmButton.addEventListener('click', function() {
        hideConfirmationModal();
        if (confirmCallback) confirmCallback();
    });
    
    cancelButton.addEventListener('click', function() {
        hideConfirmationModal();
        if (cancelCallback) cancelCallback();
    });
    
    // Keyboard event handler for accessibility
    modal.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideConfirmationModal();
            if (cancelCallback) cancelCallback();
        } else if (e.key === 'Tab') {
            // Trap focus within modal
            trapFocus(e, [cancelButton, confirmButton]);
        }
    });
    
    // Click outside to close
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideConfirmationModal();
            if (cancelCallback) cancelCallback();
        }
    });
    
    // Assemble modal
    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(confirmButton);
    
    modalContent.appendChild(titleElement);
    modalContent.appendChild(messageElement);
    modalContent.appendChild(buttonsContainer);
    
    modal.appendChild(modalContent);
    
    // Add to DOM
    document.body.appendChild(modal);
    
    // Store reference for cleanup
    window.currentConfirmationModal = modal;
    
    // Focus management
    const previouslyFocusedElement = document.activeElement;
    window.confirmationModalPreviousFocus = previouslyFocusedElement;
    
    // Focus the cancel button by default (safer option)
    setTimeout(() => {
        cancelButton.focus();
    }, 10);
}

function hideConfirmationModal() {
    if (window.currentConfirmationModal) {
        document.body.removeChild(window.currentConfirmationModal);
        window.currentConfirmationModal = null;
        
        // Restore focus to previously focused element
        if (window.confirmationModalPreviousFocus) {
            window.confirmationModalPreviousFocus.focus();
            window.confirmationModalPreviousFocus = null;
        }
    }
}

function trapFocus(e, focusableElements) {
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
        if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
        }
    } else {
        if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
        }
    }
}

// Utility functions
function formatActivityType(type) {
    const types = {
        'board-games': 'Board Games',
        'sports': 'Sports',
        'study-group': 'Study Group',
        'gaming': 'Gaming',
        'music': 'Music',
        'other': 'Other'
    };
    return types[type] || type;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
}