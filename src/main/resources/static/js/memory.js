const gameBoard = document.getElementById('game-board');
let flippedCards = [];
let matchedCards = [];
let displayedParagraphs = new Set();
let score = 0;
let incorrectAttempts = 0;
const scoreDisplay = document.getElementById('score');
const incorrectAttemptsDisplay = document.getElementById('incorrect-attempts');

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function createCard(wordData) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.text = wordData.form;

    const front = document.createElement('div');
    front.classList.add('front');

    const back = document.createElement('div');
    back.classList.add('back');

    // Check if we have a valid image URL
    if (wordData.link && wordData.link.startsWith('http') && isValidURL(wordData.link)) {
        // Create and configure the image element
        const img = document.createElement('img');
        img.src = wordData.link; // Use the correct image URL
        img.alt = wordData.form;
        img.style.width = '100%'; // Ensure the image fits within the card
        img.style.height = 'auto'; // Maintain aspect ratio
        img.style.display = 'block'; // Remove extra spacing below the image

        // Debug: Log the image creation
        //console.log('Creating image with URL:', img.src);

        // Check if the image is loaded properly
        img.onload = function() {
            //console.log('Image loaded successfully:', img.src);
        };

        img.onerror = function() {
            console.error('Failed to load image:', img.src);
        };

        // Append image to back div
        back.appendChild(img);

        // Add text overlay if applicable
        if (wordData.form) {
            const textOverlay = document.createElement('div');
            textOverlay.classList.add('text-overlay');
            textOverlay.textContent = wordData.form;
            back.appendChild(textOverlay);
        }

        // Log the image appending
        //console.log('Image appended to back.');
    } else {
        // If no valid image URL, just use the text content
        back.textContent = wordData.form;
    }

    // Append front and back to card
    card.appendChild(front);
    card.appendChild(back);

    // Log the card creation
    //console.log('Card created and appended.');

    // Create a new paragraph element if wikiPage is a valid URL
    if (wordData.wikiPage && isValidURL(wordData.wikiPage)) {
        const p = document.createElement("p");
        const imageInfo = wordData.imageInfo || {};
        p.innerHTML = `${wordData.form}: this article uses material from the <a href="${wordData.wikiPage}" target="_blank"> Wikipedia article</a>, which is released under the <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank">Creative Commons Attribution-Share-Alike License 4.0</a> <br>
                        Image Source: <a target="_blank" href="${wordData.link}">Wikimedia Commons</a><br>
                        Author: ${imageInfo.author || 'Unknown'} <br>
                        License: ${imageInfo.license || 'Unknown'}`;
        card.paragraphElement = p;
    }

    // Add click event listener
    card.addEventListener('click', flipCard);

    return card;
}



function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function speakWord(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US'; // Set the language to English (US)
        speechSynthesis.speak(utterance);
    }
}

function flipCard() {
    if (flippedCards.length < 2 && !this.classList.contains('flipped') && !matchedCards.includes(this)) {
        this.classList.add('flipped');
        flippedCards.push(this);

        if (this.paragraphElement && !displayedParagraphs.has(this.paragraphElement)) {
            document.getElementById("memory-attribution").appendChild(this.paragraphElement);
            displayedParagraphs.add(this.paragraphElement);
        }

        speakWord(this.dataset.text);

        if (flippedCards.length === 2) {
            setTimeout(checkForMatch, 1000);
        }
    }
}

function checkForMatch() {
    const [card1, card2] = flippedCards;
    if (card1.dataset.text === card2.dataset.text) {
        matchedCards.push(card1, card2);
        flippedCards = [];

        if (card1.paragraphElement && displayedParagraphs.has(card1.paragraphElement)) {
            document.getElementById("attribution").removeChild(card1.paragraphElement);
            displayedParagraphs.delete(card1.paragraphElement);
        }
        if (card2.paragraphElement && displayedParagraphs.has(card2.paragraphElement)) {
            document.getElementById("attribution").removeChild(card2.paragraphElement);
            displayedParagraphs.delete(card2.paragraphElement);
        }
        if (card1.paragraphElement && !displayedParagraphs.has(card1.paragraphElement)) {
            document.getElementById("attribution").appendChild(card1.paragraphElement);
            displayedParagraphs.add(card1.paragraphElement);
        }
        
        score += 10; 
        scoreDisplay.textContent = score; 
    } else {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');

        if (card1.paragraphElement && displayedParagraphs.has(card1.paragraphElement)) {
            document.getElementById("memory-attribution").removeChild(card1.paragraphElement);
            displayedParagraphs.delete(card1.paragraphElement);
        }

        if (card2.paragraphElement && displayedParagraphs.has(card2.paragraphElement)) {
            document.getElementById("memory-attribution").removeChild(card2.paragraphElement);
            displayedParagraphs.delete(card2.paragraphElement);
        }
        
        incorrectAttempts++; 
        incorrectAttemptsDisplay.textContent = incorrectAttempts; 
        flippedCards = [];
    }
    
    if (matchedCards.length === selectedWords.length) {
        gameOver();
    }
}

function gameOver() {
    const finalScore = score / (incorrectAttempts || 1); 
   addPointsToUser(Math.round(finalScore));

    const popup = document.createElement('div');
    popup.className = 'game-over-popup'; 
    popup.innerHTML = `
        <h2>Game Over!</h2>
        <p>Your final score is: ${Math.round(finalScore)}</p>
        <button id="returnButton">Return to Learning</button>
    `;
    document.body.appendChild(popup);

    const returnButton = document.getElementById('returnButton');
    returnButton.addEventListener('click', () => {
        window.location.href = '/learningpage'; 
    });
}


function selectRandomPairs(wordsData, pairCount) {
    // Separate image cards with valid links, image cards without valid links, and text cards
    const imageCardsWithLink = wordsData.filter(word => word.link && word.link.startsWith('http') && word.link && isValidURL(word.link));
    const imageCardsWithoutLink = wordsData.filter(word => word.link && word.link.startsWith('http') && (!word.link || !isValidURL(word.link)));
    const textCards = wordsData.filter(word => !word.link || !word.link.startsWith('http'));

    shuffleArray(imageCardsWithLink); // Shuffle image cards with valid links
    shuffleArray(imageCardsWithoutLink); // Shuffle image cards without valid links
    shuffleArray(textCards); // Shuffle text cards

    let selectedPairs = [];
    let selectedImages = new Set();

    // Prefer image cards with valid links first
    while (selectedPairs.length < pairCount && imageCardsWithLink.length > 0) {
        const imageCard = imageCardsWithLink.pop();
        if (imageCard) {
            selectedPairs.push(imageCard, { ...imageCard });
            selectedImages.add(imageCard.image);
        }
    }

    // Then add image cards without valid links
    while (selectedPairs.length < pairCount && imageCardsWithoutLink.length > 0) {
        const imageCard = imageCardsWithoutLink.pop();
        if (imageCard) {
            selectedPairs.push(imageCard, { ...imageCard });
        }
    }

    // Finally, add text cards if needed
    while (selectedPairs.length < pairCount && textCards.length > 0) {
        const textCard = textCards.pop();
        if (textCard) {
            selectedPairs.push(textCard, { ...textCard });
        }
    }

    shuffleArray(selectedPairs); // Shuffle pairs to ensure randomness

    return selectedPairs;
}


function initGame() {
    const storageData = localStorage.getItem('words');
    //console.log(storageData);

    if (storageData) {
        const wordsData = JSON.parse(storageData);
        //console.log(wordsData);

        scoreDisplay.textContent = 0;
        incorrectAttemptsDisplay.textContent = incorrectAttempts;

        let selectedWords = selectRandomPairs(wordsData, 12);
        shuffleArray(selectedWords);

        (async () => {
            for (const wordData of selectedWords) {
                const card = await createCard(wordData);
                gameBoard.appendChild(card);
            }
        })();
    } else {
        console.error('No game data found in local storage.');
    }
}

initGame();

