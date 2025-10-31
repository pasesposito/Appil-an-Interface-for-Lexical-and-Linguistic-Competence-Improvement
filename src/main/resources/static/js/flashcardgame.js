let quizData = [];
let currentQuestionIndex = 0; // Keeps track of the current question

// Function to initialize the quiz
function initQuiz() {
    // If there are no questions or we've reached the end, stop
    if (quizData.length === 0 || currentQuestionIndex >= quizData.length) {
        document.getElementById('result').innerHTML = 'No more questions available.';
        return;
    }

    const question = quizData[currentQuestionIndex];

    // Check if the Italian term is available
    if (!question.labelIt) {
        // Skip to the next question if the Italian term is not available
        currentQuestionIndex++;
        initQuiz(); // Recurse to load the next question
        return;
    }

    // Set the image and its source
    const imageElement = document.getElementById('quiz-image');
    const imageLinkElement = document.getElementById('image-link');
    imageElement.src = question.img;

    // Show or hide image source based on availability
    if (question.img && question.imgAuthor) {
        imageLinkElement.href = question.img || '#'; // Use a default link if the source is not available
        imageLinkElement.style.display = 'block'; // Ensure the link is visible
        
    }

    // Set detailed image information only if available
    const infoContainer = document.getElementById('info-container');
    if (question.imgAuthor || question.imgTitle || question.imgLicense || question.imgAdditionalInfo) {
        infoContainer.innerHTML = `
            ${question.imgAuthor ? `<p><strong>Author:</strong> ${question.imgAuthor}</p>` : ''}
            ${question.imgTitle ? `<p><strong>Title:</strong> ${question.imgTitle}</p>` : ''}
            ${question.imgLicense ? `<p><strong>License:</strong> ${question.imgLicense}</p>` : ''}
            ${question.imgAdditionalInfo ? `<p><strong>Additional Info:</strong> ${question.imgAdditionalInfo}</p>` : ''}
        `;
        infoContainer.style.display = 'flex'; // Ensure the container is visible and uses flex layout
    } else {
        infoContainer.style.display = 'none'; // Hide the container if no information is available
    }

    // Set the Italian term
    document.getElementById('italian-term').innerText = question.labelIt;

    // Generate options dynamically
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = ''; // Clear previous options
    const options = generateOptions(question.word); // Generate options based on the correct answer
    options.forEach(option => {
        const button = document.createElement('button');
        button.innerText = option;
        button.onclick = () => checkAnswer(option);
        optionsContainer.appendChild(button);
    });
}

// Function to generate multiple-choice options
function generateOptions(correctAnswer) {
    // Get a list of all possible words from quizData, excluding the correct answer
    const allWords = quizData.map(q => q.word).filter(word => word !== correctAnswer);
    const options = [correctAnswer.toUpperCase()]; // Convert the correct answer to uppercase

    // Shuffle and select 3 random words from allWords to make a total of 4 options
    while (options.length < 4) {
        const randomIndex = Math.floor(Math.random() * allWords.length);
        const selectedWord = allWords[randomIndex].toUpperCase(); // Convert selected word to uppercase
        if (!options.includes(selectedWord)) {
            options.push(selectedWord);
        }
    }
    return shuffle(options); // Shuffle options so the correct answer isn't always first
}



// Function to shuffle options
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Function to check the answer
function checkAnswer(answer) {
    const correctAnswer = quizData[currentQuestionIndex].word;
    const resultElement = document.getElementById('result');

    if (answer.toLowerCase() === correctAnswer.toLowerCase()) {
        resultElement.innerHTML = `Correct! The English translation of "${quizData[currentQuestionIndex].labelIt}" is "${correctAnswer}".`;
        resultElement.style.color = 'green';
		
		// Add points if the answer is correct
		        addPointsToUser(10); // Example: adding 10 points

    } else {
        resultElement.innerHTML = 'Incorrect. Try again!';
        resultElement.style.color = 'red';
    }

    // Remove the result message and move to the next question after a brief delay
    setTimeout(() => {
        resultElement.innerHTML = ''; // Clear the result message
        currentQuestionIndex++;
        initQuiz();
    }, 2000); // Adjust the delay as needed
}

// Function to make an API request to add points
// Function to make an API request to add points


function fetchFlashcards() {
    fetch('api/flashcards/all') // Updated endpoint to fetch all flashcards for the authenticated user
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            quizData = shuffle(data); // Shuffle the quiz data
            initQuiz(); // Initialize the quiz with the fetched data
        })
        .catch(error => {
            console.error('Error fetching flashcards:', error);
        });
}


// Function to shuffle the quizData array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}



// Start the quiz
window.onload = fetchFlashcards;
