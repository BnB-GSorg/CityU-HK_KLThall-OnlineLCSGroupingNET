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
const activityFilter = document.getElementById('activity-filter');

// Utility functions for dynamic date generation
function getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
}

function getDayAfterTomorrowDate() {
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    return dayAfterTomorrow.toISOString().split('T')[0];
}

// Sample data for demonstration
function createSampleRooms() {
    return [
        {
            id: 1,
            name: "Chess Tournament",
            type: "board-games",
            host: "Alice Wang",
            location: "Library Study Room 301",
            date: getTomorrowDate(),
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
            date: getDayAfterTomorrowDate(),
            time: "16:30",
            maxParticipants: 10,
            participants: ["Mike Liu", "Sarah Wong", "David Lee"],
            description: "Casual basketball game, all levels welcome!"
        }
    ];
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load sample data with dynamic dates
    const sampleRooms = createSampleRooms();
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
    
    // Filter
    activityFilter.addEventListener('change', handleFilterChange);
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
    
    // Set default date to tomorrow using the same utility function
    const dateInput = document.getElementById('date');
    if (dateInput && !dateInput.value) {
        dateInput.value = getTomorrowDate();
    }
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

function displayRooms(filter = 'all') {
    roomsGrid.innerHTML = '';
    
    // Filter rooms based on activity type
    let filteredRooms = rooms;
    if (filter !== 'all') {
        filteredRooms = rooms.filter(room => room.type === filter);
    }
    
    if (filteredRooms.length === 0) {
        const message = filter === 'all' ? 
            'No rooms available. Create one!' : 
            `No ${formatActivityType(filter)} activities available.`;
        roomsGrid.innerHTML = `<p style="text-align: center; grid-column: 1/-1; color: #666;">${message}</p>`;
        return;
    }
    
    filteredRooms.forEach(room => {
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
    if (confirm('Are you sure you want to delete this room?')) {
        const index = rooms.findIndex(r => r.id === roomId);
        if (index > -1) {
            rooms.splice(index, 1);
            displayRooms();
            hideRoomModal();
            alert('Room deleted successfully.');
        }
    }
}

function handleFilterChange() {
    const selectedFilter = activityFilter.value;
    displayRooms(selectedFilter);
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

// Enhanced Markdown Editor functionality
class SimpleMarkdownParser {
    static parse(markdown) {
        let html = markdown;
        
        // Escape HTML to prevent XSS
        html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // Bold
        html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
        
        // Italic
        html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');
        
        // Code inline
        html = html.replace(/`([^`]*)`/gim, '<code>$1</code>');
        
        // Code blocks
        html = html.replace(/```\n?([\s\S]*?)\n?```/gim, '<pre><code>$1</code></pre>');
        
        // Links
        html = html.replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2">$1</a>');
        
        // Blockquotes
        html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
        
        // Unordered lists
        html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');
        html = html.replace(/<\/ul>\s*<ul>/gim, '');
        
        // Ordered lists
        html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/gims, function(match) {
            if (!match.includes('<ul>')) {
                return '<ol>' + match + '</ol>';
            }
            return match;
        });
        html = html.replace(/<\/ol>\s*<ol>/gim, '');
        
        // Task lists
        html = html.replace(/^\- \[ \] (.*$)/gim, '<li class="task-list-item"><input type="checkbox" disabled> $1</li>');
        html = html.replace(/^\- \[x\] (.*$)/gim, '<li class="task-list-item"><input type="checkbox" checked disabled> $1</li>');
        
        // Line breaks
        html = html.replace(/\n/gim, '<br>');
        
        // Paragraphs
        html = html.replace(/(<br>){2,}/gim, '</p><p>');
        if (html.trim() && !html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<ol') && !html.startsWith('<blockquote')) {
            html = '<p>' + html + '</p>';
        }
        
        return html;
    }
}

class MarkdownEditor {
    constructor() {
        this.textarea = document.getElementById('description');
        this.preview = document.getElementById('description-preview');
        this.tabs = document.querySelectorAll('.tab-btn');
        this.toolbarBtns = document.querySelectorAll('.toolbar-btn');
        this.writePaneEl = document.querySelector('.write-pane');
        this.previewPaneEl = document.querySelector('.preview-pane');
        this.isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        
        if (this.textarea && this.preview) {
            this.init();
        }
    }
    
    init() {
        this.setupEventListeners();
        this.setupPlatformDetection();
        this.updatePreview();
    }
    
    setupEventListeners() {
        // Tab switching
        this.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Toolbar buttons
        this.toolbarBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleToolbarAction(e.target.dataset.action));
        });
        
        // Textarea events
        this.textarea.addEventListener('input', () => this.updatePreview());
        this.textarea.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Prevent form submission when clicking toolbar buttons
        this.toolbarBtns.forEach(btn => {
            btn.addEventListener('click', (e) => e.preventDefault());
        });
    }
    
    setupPlatformDetection() {
        if (this.isMac) {
            document.body.classList.add('platform-mac');
            // Update button titles for Mac
            this.toolbarBtns.forEach(btn => {
                const title = btn.getAttribute('title');
                if (title && title.includes('Alt+')) {
                    btn.setAttribute('title', title.replace('Alt+', 'Option+'));
                }
            });
        }
    }
    
    switchTab(tab) {
        // Update tab buttons
        this.tabs.forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        // Update panes
        this.writePaneEl.classList.toggle('active', tab === 'write');
        this.previewPaneEl.classList.toggle('active', tab === 'preview');
        
        if (tab === 'preview') {
            this.updatePreview();
        }
    }
    
    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        const modifier = this.isMac ? e.metaKey : e.altKey;
        
        if (modifier) {
            switch (key) {
                case 'h':
                    e.preventDefault();
                    this.insertFormatting('heading');
                    break;
                case 'b':
                    e.preventDefault();
                    this.insertFormatting('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    this.insertFormatting('italic');
                    break;
                case 'c':
                    e.preventDefault();
                    this.insertFormatting('quote');
                    break;
                case 'v':
                    e.preventDefault();
                    this.insertFormatting('link');
                    break;
                case 'u':
                    e.preventDefault();
                    this.insertFormatting('unordered-list');
                    break;
                case 'o':
                    e.preventDefault();
                    this.insertFormatting('ordered-list');
                    break;
            }
        }
        
        // Handle slash commands
        if (e.key === '/' && this.textarea.selectionStart === this.textarea.selectionEnd) {
            setTimeout(() => this.handleSlashCommand(), 0);
        }
    }
    
    handleToolbarAction(action) {
        if (!action) return;
        this.insertFormatting(action);
    }
    
    insertFormatting(type) {
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        const selectedText = this.textarea.value.substring(start, end);
        const beforeCursor = this.textarea.value.substring(0, start);
        const afterCursor = this.textarea.value.substring(end);
        
        let insertion = '';
        let cursorOffset = 0;
        
        switch (type) {
            case 'heading':
                insertion = `## ${selectedText || 'Heading'}`;
                cursorOffset = selectedText ? 0 : -7; // Position before 'Heading'
                break;
            case 'bold':
                insertion = `**${selectedText || 'bold text'}**`;
                cursorOffset = selectedText ? 0 : -11;
                break;
            case 'italic':
                insertion = `*${selectedText || 'italic text'}*`;
                cursorOffset = selectedText ? 0 : -12;
                break;
            case 'quote':
                insertion = `> ${selectedText || 'quote'}`;
                cursorOffset = selectedText ? 0 : -5;
                break;
            case 'code':
                if (selectedText.includes('\n')) {
                    insertion = `\`\`\`\n${selectedText || 'code'}\n\`\`\``;
                    cursorOffset = selectedText ? 0 : -9;
                } else {
                    insertion = `\`${selectedText || 'code'}\``;
                    cursorOffset = selectedText ? 0 : -6;
                }
                break;
            case 'link':
                insertion = `[${selectedText || 'link text'}](https://example.com)`;
                cursorOffset = selectedText ? -23 : -33;
                break;
            case 'unordered-list':
                insertion = `- ${selectedText || 'list item'}`;
                cursorOffset = selectedText ? 0 : -9;
                break;
            case 'ordered-list':
                insertion = `1. ${selectedText || 'list item'}`;
                cursorOffset = selectedText ? 0 : -9;
                break;
            case 'task-list':
                insertion = `- [ ] ${selectedText || 'task item'}`;
                cursorOffset = selectedText ? 0 : -9;
                break;
            case 'mention':
                insertion = `@${selectedText || 'username'}`;
                cursorOffset = selectedText ? 0 : -8;
                break;
            case 'save-load':
                this.handleSaveLoad();
                return;
            case 'slash':
                this.showSlashCommands();
                return;
            case 'full-editor':
                this.openFullEditor();
                return;
        }
        
        const newValue = beforeCursor + insertion + afterCursor;
        this.textarea.value = newValue;
        
        // Set cursor position
        const newCursorPos = start + insertion.length + cursorOffset;
        this.textarea.setSelectionRange(newCursorPos, newCursorPos);
        this.textarea.focus();
        
        this.updatePreview();
    }
    
    handleSlashCommand() {
        const text = this.textarea.value;
        const cursorPos = this.textarea.selectionStart;
        const beforeCursor = text.substring(0, cursorPos);
        const lastWord = beforeCursor.split(/\s/).pop();
        
        if (lastWord.startsWith('/')) {
            const command = lastWord.substring(1).toLowerCase();
            let replacement = '';
            
            switch (command) {
                case 'math':
                    replacement = '$\\text{equation}$';
                    break;
                case 'equation':
                    replacement = '$$\n\\text{equation}\n$$';
                    break;
                case 'latex':
                    replacement = '$\\LaTeX$';
                    break;
                default:
                    return;
            }
            
            if (replacement) {
                const start = cursorPos - lastWord.length;
                const newValue = text.substring(0, start) + replacement + text.substring(cursorPos);
                this.textarea.value = newValue;
                this.textarea.setSelectionRange(start + replacement.length, start + replacement.length);
                this.updatePreview();
            }
        }
    }
    
    handleSaveLoad() {
        const content = this.textarea.value;
        if (content.trim()) {
            localStorage.setItem('markdown-draft', content);
            alert('Content saved to local storage!');
        } else {
            const saved = localStorage.getItem('markdown-draft');
            if (saved) {
                this.textarea.value = saved;
                this.updatePreview();
                alert('Content loaded from local storage!');
            } else {
                alert('No saved content found.');
            }
        }
    }
    
    showSlashCommands() {
        const commands = [
            '/math - Insert inline LaTeX math',
            '/equation - Insert block LaTeX equation',
            '/latex - Insert LaTeX symbol'
        ];
        alert('Available slash commands:\n\n' + commands.join('\n'));
    }
    
    openFullEditor() {
        const width = Math.min(1200, window.innerWidth * 0.9);
        const height = Math.min(800, window.innerHeight * 0.9);
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        
        const popup = window.open('', 'markdown-editor', 
            `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`);
        
        if (popup) {
            popup.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Full Markdown Editor</title>
                    <style>
                        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
                        .editor-container { display: flex; height: 100vh; }
                        .editor-pane, .preview-pane { flex: 1; display: flex; flex-direction: column; }
                        .pane-header { background: #f8f9fa; padding: 1rem; border-bottom: 1px solid #e9ecef; font-weight: 600; }
                        textarea { flex: 1; border: none; padding: 1rem; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; resize: none; outline: none; }
                        .preview-content { flex: 1; padding: 1rem; overflow-y: auto; border-left: 1px solid #e9ecef; }
                        .toolbar { background: #f8f9fa; padding: 0.5rem; border-bottom: 1px solid #e9ecef; }
                        button { margin-right: 0.5rem; padding: 0.5rem 1rem; background: white; border: 1px solid #ced4da; border-radius: 4px; cursor: pointer; }
                        button:hover { background: #e9ecef; }
                    </style>
                </head>
                <body>
                    <div class="editor-container">
                        <div class="editor-pane">
                            <div class="pane-header">Markdown Editor</div>
                            <div class="toolbar">
                                <button onclick="insertText('**', '**')">Bold</button>
                                <button onclick="insertText('*', '*')">Italic</button>
                                <button onclick="insertText('> ')">Quote</button>
                                <button onclick="insertText('- ')">List</button>
                                <button onclick="saveAndClose()">Save & Close</button>
                            </div>
                            <textarea id="editor" oninput="updatePreview()">${this.textarea.value}</textarea>
                        </div>
                        <div class="preview-pane">
                            <div class="pane-header">Preview</div>
                            <div id="preview" class="preview-content"></div>
                        </div>
                    </div>
                    <script>
                        ${SimpleMarkdownParser.toString()}
                        
                        function updatePreview() {
                            const content = document.getElementById('editor').value;
                            const html = SimpleMarkdownParser.parse(content);
                            document.getElementById('preview').innerHTML = html;
                        }
                        function insertText(before, after = '') {
                            const textarea = document.getElementById('editor');
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const selectedText = textarea.value.substring(start, end);
                            const replacement = before + selectedText + after;
                            textarea.setRangeText(replacement, start, end, 'end');
                            updatePreview();
                            textarea.focus();
                        }
                        function saveAndClose() {
                            window.opener.document.getElementById('description').value = document.getElementById('editor').value;
                            window.opener.markdownEditor.updatePreview();
                            window.close();
                        }
                        updatePreview();
                    </script>
                </body>
                </html>
            `);
        } else {
            alert('Please allow popups to use the full editor.');
        }
    }
    
    updatePreview() {
        const content = this.textarea.value.trim();
        
        if (!content) {
            this.preview.innerHTML = '<p class="preview-placeholder">Nothing to preview</p>';
            return;
        }
        
        try {
            // Basic LaTeX math support
            let processedContent = content;
            
            // Convert inline LaTeX math
            processedContent = processedContent.replace(/\$([^$]+)\$/g, '<span class="latex-inline">$1</span>');
            
            // Convert block LaTeX math
            processedContent = processedContent.replace(/\$\$\n?([\s\S]*?)\n?\$\$/g, '<div class="latex-block">$1</div>');
            
            const html = SimpleMarkdownParser.parse(processedContent);
            this.preview.innerHTML = html;
        } catch (error) {
            this.preview.innerHTML = '<p class="preview-placeholder">Error rendering preview</p>';
            console.error('Preview error:', error);
        }
    }
}

// Initialize markdown editor when DOM is loaded
let markdownEditor;
document.addEventListener('DOMContentLoaded', function() {
    // ... existing initialization code ...
    
    // Initialize markdown editor after a short delay to ensure DOM is ready
    setTimeout(() => {
        if (document.getElementById('description')) {
            markdownEditor = new MarkdownEditor();
        }
    }, 100);
});