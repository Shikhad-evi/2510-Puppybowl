// index.js
const COHORT = "YOUR_COHORT_AND_NAME"; // Replace with your cohort + name
const API_URL = `https://fsa-puppy-bowl.herokuapp.com/api/${COHORT}`;

// State
let allPlayers = [];
let allTeams = [];
let selectedPlayer = null;

// DOM Elements
const playerRoster = document.getElementById('player-roster');
const newPlayerForm = document.getElementById('new-player-form');
const playerDetails = document.getElementById('player-details');
const noPlayerSelected = document.getElementById('no-player-selected');
const detailName = document.getElementById('detail-name');
const detailId = document.getElementById('detail-id');
const detailBreed = document.getElementById('detail-breed');
const detailStatus = document.getElementById('detail-status');
const detailTeam = document.getElementById('detail-team');
const detailImage = document.getElementById('detail-image');
const removePlayerButton = document.getElementById('remove-player');
const teamSelect = document.getElementById('team');

// Initialize the application
const init = async () => {
    await fetchAllPlayers();
    await fetchAllTeams();
    renderAllPlayers();
    populateTeamSelect();
    
    // Event Listeners
    newPlayerForm.addEventListener('submit', handleAddPlayer);
    removePlayerButton.addEventListener('click', handleRemovePlayer);
};

// Fetch all players from the API
const fetchAllPlayers = async () => {
    try {
        const response = await fetch(`${API_URL}/players`);
        const result = await response.json();
        if (result.success) {
            allPlayers = result.data.players;
        } else {
            console.error('Failed to fetch players:', result.error);
        }
    } catch (err) {
        console.error('Error fetching players:', err);
    }
};

// Fetch all teams from the API
const fetchAllTeams = async () => {
    try {
        const response = await fetch(`${API_URL}/teams`);
        const result = await response.json();
        if (result.success) {
            allTeams = result.data.teams;
        } else {
            console.error('Failed to fetch teams:', result.error);
        }
    } catch (err) {
        console.error('Error fetching teams:', err);
    }
};

// Render all players to the roster
const renderAllPlayers = () => {
    playerRoster.innerHTML = '';
    
    if (allPlayers.length === 0) {
        playerRoster.innerHTML = '<p>No players in the roster.</p>';
        return;
    }
    
    allPlayers.forEach(player => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';
        playerCard.innerHTML = `
            <img src="${player.imageUrl}" alt="${player.name}">
            <h3>${player.name}</h3>
        `;
        
        playerCard.addEventListener('click', () => selectPlayer(player));
        playerRoster.appendChild(playerCard);
    });
};

// Populate the team select dropdown
const populateTeamSelect = () => {
    // Clear existing options except the default
    while (teamSelect.children.length > 1) {
        teamSelect.removeChild(teamSelect.lastChild);
    }
    
    // Add team options
    allTeams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.id;
        option.textContent = team.name;
        teamSelect.appendChild(option);
    });
};

// Select a player and display details
const selectPlayer = (player) => {
    selectedPlayer = player;
    
    // Update UI to show player details
    noPlayerSelected.classList.add('hidden');
    playerDetails.classList.remove('hidden');
    
    // Populate player details
    detailName.textContent = player.name;
    detailId.textContent = player.id;
    detailBreed.textContent = player.breed;
    detailStatus.textContent = player.status;
    detailImage.src = player.imageUrl;
    detailImage.alt = player.name;
    
    // Display team name or "Unassigned"
    if (player.teamId) {
        const team = allTeams.find(t => t.id === player.teamId);
        detailTeam.textContent = team ? team.name : 'Unknown Team';
    } else {
        detailTeam.textContent = 'Unassigned';
    }
};

// Handle adding a new player
const handleAddPlayer = async (event) => {
    event.preventDefault();
    
    const formData = new FormData(newPlayerForm);
    const name = formData.get('name');
    const breed = formData.get('breed');
    const imageUrl = formData.get('imageUrl');
    const teamId = formData.get('teamId');
    
    const newPlayer = {
        name,
        breed,
        imageUrl
    };
    
    // Only add teamId if it's not empty
    if (teamId) {
        newPlayer.teamId = parseInt(teamId);
    }
    
    try {
        const response = await fetch(`${API_URL}/players`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPlayer),
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Refresh the player list
            await fetchAllPlayers();
            renderAllPlayers();
            
            // Reset the form
            newPlayerForm.reset();
            
            alert('Player added successfully!');
        } else {
            console.error('Failed to add player:', result.error);
            alert('Failed to add player. Please try again.');
        }
    } catch (err) {
        console.error('Error adding player:', err);
        alert('Error adding player. Please try again.');
    }
};

// Handle removing a player
const handleRemovePlayer = async () => {
    if (!selectedPlayer) return;
    
    if (!confirm(`Are you sure you want to remove ${selectedPlayer.name} from the roster?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/players/${selectedPlayer.id}`, {
            method: 'DELETE',
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Refresh the player list
            await fetchAllPlayers();
            renderAllPlayers();
            
            // Clear the selected player
            selectedPlayer = null;
            noPlayerSelected.classList.remove('hidden');
            playerDetails.classList.add('hidden');
            
            alert('Player removed successfully!');
        } else {
            console.error('Failed to remove player:', result.error);
            alert('Failed to remove player. Please try again.');
        }
    } catch (err) {
        console.error('Error removing player:', err);
        alert('Error removing player. Please try again.');
    }
};

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
