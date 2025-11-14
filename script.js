// Bihar Election 2025 Government Formation Simulator
// ===================================================
// Data Source: Election Commission of India - November 2025 Results

// Party Data (Actual Bihar Assembly Election 2025 Results)
const partiesData = [
    { id: 1, name: 'Bharatiya Janata Party', seats: 89, abbr: 'BJP' },
    { id: 2, name: 'Janata Dal (United)', seats: 85, abbr: 'JD(U)' },
    { id: 3, name: 'Rashtriya Janata Dal', seats: 25, abbr: 'RJD' },
    { id: 4, name: 'Lok Janshakti Party (Ram Vilas)', seats: 19, abbr: 'LJPRV' },
    { id: 5, name: 'Indian National Congress', seats: 6, abbr: 'INC' },
    { id: 6, name: 'All India Majlis-e-Ittehadul Muslimeen', seats: 5, abbr: 'AIMIM' },
    { id: 7, name: 'Hindustani Awam Morcha (Secular)', seats: 5, abbr: 'HAMS' },
    { id: 8, name: 'Rashtriya Lok Morcha', seats: 4, abbr: 'RLM' },
    { id: 9, name: 'Communist Party of India (ML)(L)', seats: 2, abbr: 'CPI(ML)(L)' },
    { id: 10, name: 'Communist Party of India (Marxist)', seats: 1, abbr: 'CPI(M)' },
    { id: 11, name: 'Bahujan Samaj Party', seats: 1, abbr: 'BSP' },
    { id: 12, name: 'Indian Inclusive Party', seats: 1, abbr: 'IIP' }
];

const TOTAL_SEATS = 243;
const MAJORITY_MARK = 122;

// State Management
let selectedParties = new Set();
let darkModeEnabled = localStorage.getItem('darkMode') === 'true';

// ===========================
// INITIALIZATION
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing app...');
    initializeDarkMode();
    renderParties();
    loadSavedSelection();
    setupEventListeners();
    updateCoalitionStatus();
    renderChart();
    generateSuggestions();
});

// ===========================
// DARK MODE - FIXED
// ===========================
function initializeDarkMode() {
    console.log('Dark mode enabled:', darkModeEnabled);
    if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    updateDarkModeButtonText();
}

function toggleDarkMode() {
    darkModeEnabled = !darkModeEnabled;
    console.log('Dark mode toggled:', darkModeEnabled);
    
    if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    localStorage.setItem('darkMode', darkModeEnabled.toString());
    updateDarkModeButtonText();
}

function updateDarkModeButtonText() {
    const btn = document.getElementById('darkModeToggle');
    if (btn) {
        btn.textContent = darkModeEnabled ? '☀️ Light Mode' : '🌙 Dark Mode';
    }
}

// Add dark mode toggle listener
document.addEventListener('DOMContentLoaded', () => {
    const darkModeBtn = document.getElementById('darkModeToggle');
    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', toggleDarkMode);
    }
});

// ===========================
// RENDER PARTIES - SHOWS FULL NAME + ABBR
// ===========================
function renderParties(filterText = '') {
    const partiesList = document.getElementById('partiesList');
    partiesList.innerHTML = '';

    const filteredParties = partiesData.filter(party =>
        party.name.toLowerCase().includes(filterText.toLowerCase()) ||
        party.abbr.toLowerCase().includes(filterText.toLowerCase())
    );

    filteredParties.forEach(party => {
        const isSelected = selectedParties.has(party.id);
        const partyLabel = document.createElement('label');
        partyLabel.className = 'party-item';

        partyLabel.innerHTML = `
            <input 
                type="checkbox" 
                value="${party.id}" 
                ${isSelected ? 'checked' : ''}
                aria-label="Select ${party.name}"
            >
            <div class="party-info">
                <div class="party-names">
                    <span class="party-full-name">${party.name}</span>
                    <span class="party-abbr">${party.abbr}</span>
                </div>
                <span class="party-badge">${party.seats}</span>
            </div>
        `;

        const checkbox = partyLabel.querySelector('input');
        checkbox.addEventListener('change', (e) => {
            const partyId = parseInt(e.target.value);
            if (e.target.checked) {
                selectedParties.add(partyId);
            } else {
                selectedParties.delete(partyId);
            }
            updateCoalitionStatus();
            renderChart();
            generateSuggestions();
            saveSelection();
        });

        partiesList.appendChild(partyLabel);
    });
}

// ===========================
// SEARCH FUNCTIONALITY
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderParties(e.target.value);
        });
    }
});

// ===========================
// COALITION CALCULATION
// ===========================
function getSelectedSeats() {
    return Array.from(selectedParties).reduce((total, partyId) => {
        const party = partiesData.find(p => p.id === partyId);
        return total + (party ? party.seats : 0);
    }, 0);
}

function updateCoalitionStatus() {
    const selectedSeats = getSelectedSeats();
    const resultMessage = document.getElementById('resultMessage');
    const seatsDisplay = document.querySelector('.selected-seats');

    if (seatsDisplay) seatsDisplay.textContent = selectedSeats;

    if (!resultMessage) return;

    if (selectedSeats === 0) {
        resultMessage.textContent = 'Select parties to form a coalition';
        resultMessage.className = 'result-message';
    } else if (selectedSeats >= MAJORITY_MARK) {
        resultMessage.textContent = `✅ MAJORITY ACHIEVED! (${selectedSeats}/${MAJORITY_MARK})`;
        resultMessage.className = 'result-message success';
    } else {
        const needed = MAJORITY_MARK - selectedSeats;
        resultMessage.textContent = `❌ Not enough seats. Need ${needed} more seats to reach majority.`;
        resultMessage.className = 'result-message danger';
    }
}

// ===========================
// CHART RENDERING
// ===========================
function renderChart() {
    const chartContainer = document.getElementById('seatChart');
    if (!chartContainer) return;
    
    chartContainer.innerHTML = '';

    const maxSeats = Math.max(...partiesData.map(p => p.seats));

    partiesData.forEach(party => {
        const isSelected = selectedParties.has(party.id);
        const percentage = maxSeats > 0 ? (party.seats / maxSeats) * 100 : 0;

        const chartBar = document.createElement('div');
        chartBar.className = 'chart-bar';

        chartBar.innerHTML = `
            <div class="chart-bar-label" title="${party.abbr}">${party.abbr}</div>
            <div class="chart-bar-container">
                <div class="chart-bar-fill ${isSelected ? 'selected' : ''}" style="width: ${percentage}%">
                    ${party.seats > 0 ? party.seats : ''}
                </div>
            </div>
            <div class="chart-bar-value">${party.seats}</div>
        `;

        chartContainer.appendChild(chartBar);
    });
}

// ===========================
// SUGGESTIONS - COALITION COMBINATIONS
// ===========================
function generateSuggestions() {
    const suggestionsContainer = document.getElementById('suggestions');
    if (!suggestionsContainer) return;
    
    suggestionsContainer.innerHTML = '';

    const validCombinations = findValidCoalitions();

    if (validCombinations.length === 0) {
        suggestionsContainer.innerHTML = `
            <div class="suggestion-empty">
                No possible 3-party coalitions reach majority.
            </div>
        `;
        return;
    }

    validCombinations.slice(0, 5).forEach(combination => {
        const totalSeats = combination.seats;
        const partyNames = combination.parties.map(id => {
            return partiesData.find(p => p.id === id)?.abbr || '';
        }).join(' + ');

        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.innerHTML = `
            <strong>${partyNames}</strong> = ${totalSeats} seats
        `;

        suggestionItem.addEventListener('click', () => {
            selectCoalition(combination.parties);
        });

        suggestionsContainer.appendChild(suggestionItem);
    });
}

function findValidCoalitions(maxParties = 3) {
    const validCombinations = [];

    // Generate combinations
    function generateCombinations(start, current, partyIds) {
        if (current.length > maxParties) return;

        const seats = current.reduce((sum, id) => {
            const party = partiesData.find(p => p.id === id);
            return sum + (party ? party.seats : 0);
        }, 0);

        if (current.length > 0 && seats >= MAJORITY_MARK) {
            validCombinations.push({
                parties: [...current],
                seats: seats
            });
        }

        if (current.length === maxParties) return;

        for (let i = start; i < partyIds.length; i++) {
            generateCombinations(i + 1, [...current, partyIds[i]], partyIds);
        }
    }

    const partyIds = partiesData.map(p => p.id);
    generateCombinations(0, [], partyIds);

    // Sort by lowest seats needed (closest to majority)
    return validCombinations.sort((a, b) => a.seats - b.seats);
}

function selectCoalition(partyIds) {
    selectedParties.clear();
    partyIds.forEach(id => selectedParties.add(id));

    // Update UI
    document.querySelectorAll('.party-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = selectedParties.has(parseInt(checkbox.value));
    });

    updateCoalitionStatus();
    renderChart();
    saveSelection();
}

// ===========================
// LOCAL STORAGE
// ===========================
function saveSelection() {
    const selectedArray = Array.from(selectedParties);
    localStorage.setItem('selectedParties', JSON.stringify(selectedArray));
}

function loadSavedSelection() {
    const saved = localStorage.getItem('selectedParties');
    if (saved) {
        try {
            const selectedArray = JSON.parse(saved);
            selectedArray.forEach(id => selectedParties.add(id));
        } catch (e) {
            console.error('Error loading saved selection:', e);
        }
    }
}

// ===========================
// EVENT LISTENERS
// ===========================
function setupEventListeners() {
    // Reset Button
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            selectedParties.clear();
            document.querySelectorAll('.party-item input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });
            updateCoalitionStatus();
            renderChart();
            generateSuggestions();
            localStorage.removeItem('selectedParties');
        });
    }

    // Export Button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportResults);
    }
}

// ===========================
// EXPORT RESULTS
// ===========================
function exportResults() {
    const selectedSeats = getSelectedSeats();
    const selectedPartyNames = Array.from(selectedParties).map(id => {
        const party = partiesData.find(p => p.id === id);
        return party ? `${party.abbr} (${party.seats})` : '';
    }).filter(name => name);

    const hasMajority = selectedSeats >= MAJORITY_MARK;

    const exportText = `
Bihar Election 2025 - Coalition Analysis
==========================================
Generated: ${new Date().toLocaleString('en-IN')}

SELECTED COALITION:
${selectedPartyNames.length > 0 ? selectedPartyNames.join('\n') : 'No parties selected'}

TOTAL SEATS: ${selectedSeats}
MAJORITY REQUIRED: ${MAJORITY_MARK}

STATUS: ${hasMajority ? '✅ MAJORITY REACHED' : '❌ MINORITY'}
${!hasMajority ? `Seats Needed: ${MAJORITY_MARK - selectedSeats}` : ''}

Data Source: Election Commission of India (November 2025)
==========================================
Simulated using Bihar Election 2025 Government Formation Simulator
    `.trim();

    // Copy to clipboard
    navigator.clipboard.writeText(exportText).then(() => {
        alert('Coalition analysis copied to clipboard!');
    }).catch(() => {
        // Fallback: Show in alert
        alert(exportText);
    });
}

// ===========================
// ACCESSIBILITY ENHANCEMENTS
// ===========================
document.addEventListener('keydown', (e) => {
    // Keyboard navigation for Reset button (Escape key)
    if (e.key === 'Escape') {
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.click();
        }
    }
});