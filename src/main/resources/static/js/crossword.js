const gridSize = 10;
let grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));
let placedWords = [];
let playerPoints = 0;
const letterCost = 5; // Cost of one letter in points 

// Function to deduct points
async function deductPoints(points) {
    try {
        const response = await fetch(`api/points/subtract/${points}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [csrfHeader]: csrfToken // Set CSRF token header
            }
        });

        // Check if the response is OK (status in the range 200-299)
        if (!response.ok) {
            const errorText = await response.text(); // Read the plain text error message
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }

        const data = await response.text(); // Adjust this if the response is JSON
        //console.log(data);

        if (data === "Points successfully subtracted.") {
            playerPoints -= points;
            document.getElementById('player-credits').textContent = playerPoints;
        } else {
            console.error('Error from server:', data);
            alert(data); // Show error message to the user
        }

    } catch (error) {
        console.error('Error deducting points:', error);
        document.getElementById('player-credits').textContent = 'Error updating points.';
    }
}

// Function to show the "Buy Letter" button
function showBuyLetterButton(row, col) {
    document.getElementById('buyLetterButton').style.display = 'inline';
    document.getElementById('buyLetterRow').value = row;
    document.getElementById('buyLetterCol').value = col;
}

// Function to handle buying a letter
async function buyLetter() {
    const row = document.getElementById('buyLetterRow').value;
    const col = document.getElementById('buyLetterCol').value;
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"] input`);

    if (playerPoints < letterCost) {
        alert("You don't have enough points to buy a letter.");
        return;
    }

    if (cell && cell.dataset.correct) {
        cell.value = cell.dataset.correct;
        cell.style.backgroundColor = 'lightgreen';
        await deductPoints(letterCost);
        document.getElementById('buyLetterButton').style.display = 'none'; // Hide button after purchase
    }
}

// Function to fetch flashcards and setup the grid
function fetchNouns() {
    fetch('api/flashcards/all')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const validFlashcards = data.filter(flashcard => flashcard.idLevel !== null);
            const shuffledFlashcards = validFlashcards.sort(() => 0.5 - Math.random());
            const selectedFlashcards = shuffledFlashcards.slice(0, 12);

            const wordsWithHints = selectedFlashcards.map(flashcard => {
                const word = flashcard.word.toUpperCase();
                const hint = flashcard.abs.replace(new RegExp(word, 'gi'), '____').split('. ')[0] || "No hint available";
                return { word, hint };
            });

            function canPlaceWord(grid, word, row, col, direction) {
                if (direction === 0 && col + word.length > gridSize) return false;
                if (direction === 1 && row + word.length > gridSize) return false;

                for (let i = 0; i < word.length; i++) {
                    let currentCell = direction === 0 ? grid[row][col + i] : grid[row + i][col];
                    if (currentCell !== '' && currentCell !== word[i]) {
                        return false;
                    }
                }
                return true;
            }

            function placeWord(grid, word, row, col, direction) {
                for (let i = 0; i < word.length; i++) {
                    let cellContent = word[i] + (placedWords.length + 1) + (direction === 0 ? 'H' : 'V');
                    grid[row][col] = cellContent;
                    if (i === 0) {  // Mark the starting cell
                        grid[row][col] = cellContent + 'S';
                    }
                    if (i === word.length - 1) {  // Mark the last cell
                        grid[row][col] = cellContent + 'L';  // Add 'L' for last letter
                    }
                    if (direction === 0) col++;
                    else row++;
                }
            }

            function tryPlaceWord(grid, wordObj) {
                const { word, hint } = wordObj;
                let attempts = 0;
                while (attempts < 100) {
                    const direction = Math.floor(Math.random() * 2);
                    const row = Math.floor(Math.random() * gridSize);
                    const col = Math.floor(Math.random() * gridSize);

                    if (canPlaceWord(grid, word, row, col, direction)) {
                        placeWord(grid, word, row, col, direction);
                        placedWords.push({ word, hint, row, col, direction });
                        return true;
                    }
                    attempts++;
                }
                return false;
            }

            wordsWithHints.forEach(wordObj => {
                tryPlaceWord(grid, wordObj);
            });

            const horizontalHintsList = document.getElementById('horizontalHintsList');
            const verticalHintsList = document.getElementById('verticalHintsList');

            horizontalHintsList.innerHTML = '';
            verticalHintsList.innerHTML = '';

            placedWords.forEach((wordObj, index) => {
                const listItem = document.createElement('li');
                listItem.textContent = `${index + 1}. ${wordObj.hint}`;
                if (wordObj.direction === 0) {
                    horizontalHintsList.appendChild(listItem);
                } else {
                    verticalHintsList.appendChild(listItem);
                }
            });

            const crosswordContainer = document.getElementById('crossword');
            grid.forEach((row, rowIndex) => {
                row.forEach((cell, colIndex) => {
                    const cellElement = document.createElement('div');
                    cellElement.classList.add('cell');
                    cellElement.dataset.row = rowIndex;
                    cellElement.dataset.col = colIndex;

                    if (cell !== '') {
                        const inputElement = document.createElement('input');
                        inputElement.maxLength = 1;

                        if (cell.length > 1) {
                            const number = document.createElement('span');
                            number.textContent = cell.slice(1, -1);
                            number.classList.add('cell-number');
                            cellElement.appendChild(number);

                            inputElement.dataset.correct = cell[0];  // The letter
                        } else {
                            inputElement.dataset.correct = cell;  // The letter
                        }

                        if (cell.endsWith('S')) {
                            cellElement.classList.add('starting-letter');  // Add class for starting letter
                        }
                        if (cell.endsWith('L')) {
                            cellElement.classList.add('last-letter');  // Add class for last letter
                        }

                        cellElement.appendChild(inputElement);
                        cellElement.addEventListener('click', () => showBuyLetterButton(rowIndex, colIndex));
                    } else {
                        cellElement.classList.add('black-cell');
                    }

                    crosswordContainer.appendChild(cellElement);
                });
            });

            document.querySelectorAll('.cell input').forEach(input => {
                input.addEventListener('input', (e) => {
                    if (e.target.value.toUpperCase() === e.target.dataset.correct) {
                        e.target.style.backgroundColor = '#004D1A';
                        e.target.style.color = 'white';
                        e.target.disabled = true;  // Lock cell after correct input
                        e.target.parentElement.classList.add('locked'); // Add locked class to parent cell element
                    } else {
                        e.target.style.backgroundColor = 'lightcoral';
                    }
                });
            });

            document.getElementById('showSolutions').addEventListener('click', () => {
                document.querySelectorAll('.cell input').forEach(input => {
                    input.value = input.dataset.correct;
                    input.style.backgroundColor = '#004D1A';
                    input.disabled = true;  // Lock cell when showing solutions
                    input.parentElement.classList.add('locked'); // Add locked class to parent cell element
                });
            });
        })
        .catch(error => {
            console.error('Error fetching flashcards:', error);
        });
}

// Fetch player points and setup crossword
fetchPoints()
    .then(points => {
        playerPoints = points;
        //console.log('Player Points:', playerPoints);
        fetchNouns();
    })
    .catch(error => {
        console.error('Error fetching player points:', error);
    });

// Attach event listener for buying a letter
document.getElementById('buyLetterButton').addEventListener('click', buyLetter);


/* const gridSize = 10;
let grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));
let placedWords = [];
let playerPoints = 0;
const letterCost = 5; // Cost of one letter in points 

async function deductPoints(points) {
	
    try {
        
        const response = await fetch(`api/points/subtract/${points}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [csrfHeader]: csrfToken // Set CSRF token header
            }
        });

        // Check if the response is OK (status in the range 200-299)
        if (!response.ok) {
            const errorText = await response.text(); // Read the plain text error message
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }

        // Assuming server responds with plain text or JSON
        const data = await response.text(); // Adjust this if the response is JSON
		//console.log(data);
        // Handle server response based on your controller's response
        if (data === "Points successfully subtracted.") {
            playerPoints -= points;
            document.getElementById('player-credits').textContent = playerPoints;
        } else {
            console.error('Error from server:', data);
            alert(data); // Show error message to the user
        }
		
    } catch (error) {
        console.error('Error deducting points:', error);
        document.getElementById('player-credits').textContent = 'Error updating points.';
    }
}


function showBuyLetterButton(row, col) {
    document.getElementById('buyLetterButton').style.display = 'inline';
    document.getElementById('buyLetterRow').value = row;
    document.getElementById('buyLetterCol').value = col;
}

async function buyLetter() {
	
    const row = document.getElementById('buyLetterRow').value;
    const col = document.getElementById('buyLetterCol').value;
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"] input`);

    if (playerPoints < letterCost) {
        alert("You don't have enough points to buy a letter.");
        return;
    }

    if (cell && cell.dataset.correct) {
        cell.value = cell.dataset.correct;
        cell.style.backgroundColor = 'lightgreen';
        await deductPoints(letterCost);
        document.getElementById('buyLetterButton').style.display = 'none'; // Hide button after purchase
    }
}

function fetchNouns() {
    fetch('api/flashcards/all')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Filter to only include flashcards where idLevel is not null
            const validFlashcards = data.filter(flashcard => flashcard.idLevel !== null);

            // Randomly shuffle the flashcards array
            const shuffledFlashcards = validFlashcards.sort(() => 0.5 - Math.random());

            // Select the first 12 words from the shuffled flashcards
            const selectedFlashcards = shuffledFlashcards.slice(0, 12);

            // Map the selected flashcards to words and hints with the word replaced by '____'
            const wordsWithHints = selectedFlashcards.map(flashcard => {
                const word = flashcard.word.toUpperCase();
                const hint = flashcard.abs.replace(new RegExp(word, 'gi'), '____').split('. ')[0] || "No hint available";
                return { word, hint };
            });

            function canPlaceWord(grid, word, row, col, direction) {
                if (direction === 0 && col + word.length > gridSize) return false;
                if (direction === 1 && row + word.length > gridSize) return false;

                for (let i = 0; i < word.length; i++) {
                    let currentCell = direction === 0 ? grid[row][col + i] : grid[row + i][col];
                    if (currentCell !== '' && currentCell !== word[i]) {
                        return false;
                    }
                }
                return true;
            }

            function placeWord(grid, word, row, col, direction) {
                for (let i = 0; i < word.length; i++) {
                    let cellContent = word[i] + (placedWords.length + 1) + (direction === 0 ? 'H' : 'V');
                    grid[row][col] = cellContent;
                    if (i === 0) {  // Mark the starting cell
                        grid[row][col] = cellContent + 'S';
                    }
                    if (i === word.length - 1) {  // Mark the last cell
                        grid[row][col] = cellContent + 'L';  // Add 'L' for last letter
                    }
                    if (direction === 0) col++;
                    else row++;
                }
            }

            function tryPlaceWord(grid, wordObj) {
                const { word, hint } = wordObj;
                let attempts = 0;
                while (attempts < 100) {
                    const direction = Math.floor(Math.random() * 2);
                    const row = Math.floor(Math.random() * gridSize);
                    const col = Math.floor(Math.random() * gridSize);

                    if (canPlaceWord(grid, word, row, col, direction)) {
                        placeWord(grid, word, row, col, direction);
                        placedWords.push({ word, hint, row, col, direction });
                        return true;
                    }
                    attempts++;
                }
                return false;
            }

            wordsWithHints.forEach(wordObj => {
                tryPlaceWord(grid, wordObj);
            });

            // Separate lists for horizontal and vertical hints
            const horizontalHintsList = document.getElementById('horizontalHintsList');
            const verticalHintsList = document.getElementById('verticalHintsList');

            horizontalHintsList.innerHTML = '';
            verticalHintsList.innerHTML = '';

            placedWords.forEach((wordObj, index) => {
                const listItem = document.createElement('li');
                listItem.textContent = `${index + 1}. ${wordObj.hint}`;
                if (wordObj.direction === 0) {
                    horizontalHintsList.appendChild(listItem);
                } else {
                    verticalHintsList.appendChild(listItem);
                }
            });

            const crosswordContainer = document.getElementById('crossword');
            grid.forEach((row, rowIndex) => {
                row.forEach((cell, colIndex) => {
                    const cellElement = document.createElement('div');
                    cellElement.classList.add('cell');
                    cellElement.dataset.row = rowIndex;
                    cellElement.dataset.col = colIndex;

                    if (cell !== '') {
                        const inputElement = document.createElement('input');
                        inputElement.maxLength = 1;

                        if (cell.length > 1) {
                            const number = document.createElement('span');
                            number.textContent = cell.slice(1, -1);
                            number.classList.add('cell-number');
                            cellElement.appendChild(number);

                            inputElement.dataset.correct = cell[0];  // The letter
                        } else {
                            inputElement.dataset.correct = cell;  // The letter
                        }

                        if (cell.endsWith('S')) {
                            cellElement.classList.add('starting-letter');  // Add class for starting letter
                        }
                        if (cell.endsWith('L')) {
                            cellElement.classList.add('last-letter');  // Add class for last letter
                        }

                        cellElement.appendChild(inputElement);
                        cellElement.addEventListener('click', () => showBuyLetterButton(rowIndex, colIndex));
                    } else {
                        cellElement.classList.add('black-cell');
                    }

                    crosswordContainer.appendChild(cellElement);
                });
            });

            document.querySelectorAll('.cell input').forEach(input => {
                input.addEventListener('input', (e) => {
                    if (e.target.value.toUpperCase() === e.target.dataset.correct) {
                        e.target.style.backgroundColor = '#004D1A';
						e.target.style.color = 'white';
                        e.target.disabled = true;  // Lock cell after correct input
                        e.target.parentElement.classList.add('locked'); // Add locked class to parent cell element
                    } else {
                        e.target.style.backgroundColor = 'lightcoral';
                    }
                });
            });

            document.getElementById('showSolutions').addEventListener('click', () => {
                document.querySelectorAll('.cell input').forEach(input => {
                    input.value = input.dataset.correct;
                    input.style.backgroundColor = '#004D1A';
                    input.disabled = true;  // Lock cell when showing solutions
                    input.parentElement.classList.add('locked'); // Add locked class to parent cell element
                });
            });
        })
        .catch(error => {
            console.error('Error fetching flashcards:', error);
        });
}




playerPoints = fetchPoints();
//console.log(playerPoints);
fetchNouns();

document.getElementById('buyLetterButton').addEventListener('click', buyLetter); */
