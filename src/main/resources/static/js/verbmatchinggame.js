const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
const incorrectAttemptsDisplay = document.getElementById('incorrect-attempts');
let flippedCards = [];
let matchedCards = [];
let score = 0;
let incorrectAttempts = 0;
let wordsData = []; // Initialize wordsData based on user choice

const numPairs = 6;

// Define the data for "to be", "to have", and "to do"
const verbsData = {
    toBe: [
        { form: 'I', verb: 'am' },
        { form: 'You', verb: 'are' },
        { form: 'He', verb: 'is' },
        { form: 'She', verb: 'is' },
        { form: 'It', verb: 'is' },
        { form: 'We', verb: 'are' },
        { form: 'They', verb: 'are' }
    ],
    toHave: [
        { form: 'I', verb: 'have' },
        { form: 'You', verb: 'have' },
        { form: 'He', verb: 'has' },
        { form: 'She', verb: 'has' },
        { form: 'It', verb: 'has' },
        { form: 'We', verb: 'have' },
        { form: 'They', verb: 'have' }
    ],
    toDo: [
        { form: 'I', verb: 'do' },
        { form: 'You', verb: 'do' },
        { form: 'He', verb: 'does' },
        { form: 'She', verb: 'does' },
        { form: 'It', verb: 'does' },
        { form: 'We', verb: 'do' },
        { form: 'They', verb: 'do' }
    ]
};

// Event listeners for practice type selection
document.getElementById('practiceBe').addEventListener('click', () => {
    wordsData = verbsData.toBe;
    resetGame();
});

document.getElementById('practiceHave').addEventListener('click', () => {
    wordsData = verbsData.toHave;
    resetGame();
});

document.getElementById('practiceDo').addEventListener('click', () => {
    wordsData = verbsData.toDo;
    resetGame();
});

// Create the game cards
function createCard(wordData, type) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.text = wordData[type];
    card.dataset.pairId = type === 'form' ? wordData.form : wordData.verb;
    card.dataset.type = type;

    card.classList.add(type === 'form' ? 'form-card' : 'verb-card');

    const front = document.createElement('div');
    front.classList.add('front');

    const back = document.createElement('div');
    back.classList.add('back');
    back.textContent = wordData[type];

    card.appendChild(front);
    card.appendChild(back);

    card.addEventListener('click', flipCard);

    return card;
}

// Initialize the game
function initGame() {
    scoreDisplay.textContent = score;
    incorrectAttemptsDisplay.textContent = incorrectAttempts;

    const pairs = [];

    // Generate pairs of cards based on the selected practice
    wordsData.slice(0, numPairs).forEach(word => {
        pairs.push({ ...word, type: 'form' });
        pairs.push({ ...word, type: 'verb' });
    });

    shuffleArray(pairs);

    const limitedPairs = pairs.slice(0, 12);

    gameBoard.innerHTML = ''; // Clear previous cards
    limitedPairs.forEach(wordData => {
        const card = createCard(wordData, wordData.type);
        gameBoard.appendChild(card);
    });

    gameBoard.style.gridTemplateColumns = 'repeat(4, 1fr)';
    gameBoard.style.gridTemplateRows = 'repeat(3, 1fr)';
}

// Reset the game
function resetGame() {
    // Reset score and attempts
    score = 0;
    incorrectAttempts = 0;
    matchedCards = [];
    flippedCards = [];

    initGame();
}

// Flip card logic
function flipCard() {
    if (flippedCards.length < 2 && !this.classList.contains('flipped') && !matchedCards.includes(this)) {
        this.classList.add('flipped');
        flippedCards.push(this);

        pronounceWord(this.dataset.text);

        if (flippedCards.length === 2) {
            setTimeout(checkForMatch, 1000);
        }
    }
}

// Check for a match
function checkForMatch() {
    const [card1, card2] = flippedCards;

    const isMatch = (card1.dataset.type === 'form' && card2.dataset.type === 'verb' && isMatchingFormVerb(card1, card2)) ||
                    (card1.dataset.type === 'verb' && card2.dataset.type === 'form' && isMatchingFormVerb(card2, card1));

    if (isMatch) {
        matchedCards.push(card1, card2);
        score += 10;
        scoreDisplay.textContent = score;
    } else {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        incorrectAttempts++;
        incorrectAttemptsDisplay.textContent = incorrectAttempts;
    }

    flippedCards = [];

    if (matchedCards.length === document.querySelectorAll('.card').length) {
        gameOver();
    }
}

// Function to determine if form and verb match correctly
function isMatchingFormVerb(formCard, verbCard) {
    const form = formCard.dataset.pairId;
    const verb = verbCard.dataset.pairId;

    const validMatches = {
        'You': ['are', 'have', 'do'],
        'They': ['are', 'have', 'do'],
        'We': ['are', 'have', 'do'],
        'I': ['am', 'have', 'do'],
        'He': ['is', 'has', 'does'],
        'She': ['is', 'has', 'does'],
        'It': ['is', 'has', 'does']
    };

    return validMatches[form]?.includes(verb);
}

// Handle game over
function gameOver() {
    const finalScore = score / (incorrectAttempts || 1);
    addPointsToUser(finalScore);
    const popup = document.createElement('div');
    popup.className = 'game-over-popup';
    popup.innerHTML = `
        <h2>Game Over!</h2>
        <p>Your final score is: ${Math.round(finalScore)}</p>
        <button id="returnButton">Return to Learning</button>
    `;
    document.body.appendChild(popup);

    document.getElementById('returnButton').addEventListener('click', () => {
        window.location.href = '/learningpage'; 
    });
}

// Shuffle function
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
