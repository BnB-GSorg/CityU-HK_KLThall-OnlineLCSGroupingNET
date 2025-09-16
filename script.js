// Dynamic date functionality for LCS grouping website
// This replaces pre-generated/hardcoded dates with dynamic Date() calls

// Function to format date and time
function formatDateTime(date) {
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
}

// Function to format date only
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Function to update current time display
function updateCurrentTime() {
    // Only run in browser environment
    if (typeof document === 'undefined') return;
    
    const now = new Date(); // Using dynamic Date() instead of hardcoded date
    const currentTimeElement = document.getElementById('current-time');
    if (currentTimeElement) {
        currentTimeElement.textContent = `Current Time: ${formatDateTime(now)}`;
    }
}

// Function to initialize page timestamps
function initializePageTimestamps() {
    // Only run in browser environment
    if (typeof document === 'undefined') return;
    
    const now = new Date(); // Using dynamic Date() instead of hardcoded date
    
    // Set session date (today)
    const sessionDateElement = document.getElementById('session-date');
    if (sessionDateElement) {
        sessionDateElement.textContent = formatDate(now);
    }
    
    // Set last updated time
    const lastUpdatedElement = document.getElementById('last-updated');
    if (lastUpdatedElement) {
        lastUpdatedElement.textContent = formatDateTime(now);
    }
    
    // Set page generation time
    const pageGeneratedElement = document.getElementById('page-generated');
    if (pageGeneratedElement) {
        pageGeneratedElement.textContent = formatDateTime(now);
    }
}

// Function to generate sample teams with dynamic dates
function generateTeams() {
    // Only run in browser environment
    if (typeof document === 'undefined') return;
    
    const teamsContainer = document.getElementById('teams-container');
    if (!teamsContainer) return;
    
    const teams = [
        { name: 'Team Alpha', members: 5, created: new Date() },
        { name: 'Team Beta', members: 4, created: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Yesterday
        { name: 'Team Gamma', members: 5, created: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } // 2 days ago
    ];
    
    teamsContainer.innerHTML = '';
    
    teams.forEach(team => {
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card';
        teamCard.innerHTML = `
            <h4>${team.name}</h4>
            <p>Members: ${team.members}/5</p>
            <p>Created: <span class="timestamp">${formatDateTime(team.created)}</span></p>
        `;
        teamsContainer.appendChild(teamCard);
    });
}

// Function to generate schedule with dynamic dates
function generateSchedule() {
    // Only run in browser environment
    if (typeof document === 'undefined') return;
    
    const scheduleContainer = document.getElementById('schedule-container');
    if (!scheduleContainer) return;
    
    const now = new Date();
    const matches = [
        {
            title: 'Team Alpha vs Team Beta',
            date: new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours from now
        },
        {
            title: 'Team Gamma vs TBD',
            date: new Date(now.getTime() + 24 * 60 * 60 * 1000) // Tomorrow
        },
        {
            title: 'Finals',
            date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // Next week
        }
    ];
    
    scheduleContainer.innerHTML = '';
    
    matches.forEach(match => {
        const matchCard = document.createElement('div');
        matchCard.className = 'match-card';
        matchCard.innerHTML = `
            <h4>${match.title}</h4>
            <p>Scheduled: <span class="timestamp">${formatDateTime(match.date)}</span></p>
        `;
        scheduleContainer.appendChild(matchCard);
    });
}

// Function to refresh all dynamic content
function refreshContent() {
    updateCurrentTime();
    initializePageTimestamps();
    generateTeams();
    generateSchedule();
}

// Initialize everything when the page loads (browser only)
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        // Initial load
        refreshContent();
        
        // Update current time every second
        setInterval(updateCurrentTime, 1000);
        
        // Refresh content every 30 seconds to show live updates
        setInterval(function() {
            const lastUpdatedElement = document.getElementById('last-updated');
            if (lastUpdatedElement) {
                lastUpdatedElement.textContent = formatDateTime(new Date());
            }
        }, 30000);
    });
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatDateTime,
        formatDate,
        updateCurrentTime,
        initializePageTimestamps,
        generateTeams,
        generateSchedule,
        refreshContent
    };
}