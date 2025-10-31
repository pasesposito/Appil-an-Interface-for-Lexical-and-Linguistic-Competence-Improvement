document.addEventListener('DOMContentLoaded', () => {
	
	const board = document.getElementById('board');
	    const diceResult = document.getElementById('diceResult');
	    const questionElement = document.getElementById('question');
	    const answerInput = document.getElementById('answerInput');
	    const submitAnswerButton = document.getElementById('submitAnswer');
	    const status = document.getElementById('status');
	    const dice = document.getElementById('dice');
	    const moveCountElement = document.getElementById('moveCount');
	    const pointsElement = document.getElementById('points');
	    const gameVersionSelector = document.getElementById('gameVersion');

	    const boardSize = 10;
	    const totalCells = boardSize * boardSize;
	    const player = document.createElement('div');
	    player.className = 'player';
	    let playerPosition = 0;
	    let moveCount = 0;
	    let points = 0;
	    let diceRolled = false; // Flag to prevent multiple rolls before answering
	    let gameStarted = false; // Flag to track if the game has started

		// Example questions for the board (using "have")
		const questionsHave = [
		    'They ____ three cats.',
		    'I ____ a book.',
		    'She ____ a dog.',
		    'We ____ a car.',
		    'He ____ a pencil.',
		    'You ____ a new phone.',
		    'The children ____ toys.',
		    'My parents ____ a house.',
		    'The cat ____ a collar.',
		    'The teacher ____ a lesson plan.',
		    'They ____ a new project.',
		    'I ____ a big family.',
		    'She ____ a beautiful garden.',
		    'We ____ many friends.',
		    'He ____ a very good idea.',
		    'You ____ some interesting books.',
		    'The dog ____ a bone.',
		    'My brother ____ a bike.',
		    'The baby ____ a blanket.',
		    'The store ____ a sale.',
		    'They ____ a delicious dinner.',
		    'I ____ a cup of coffee.',
		    'She ____ some lovely flowers.',
		    'We ____ a wonderful vacation.',
		    'He ____ a cool jacket.',
		    'You ____ a nice car.',
		    'The library ____ many books.',
		    'My sister ____ a lot of homework.',
		    'The restaurant ____ a special menu.',
		    'The team ____ a new strategy.',
		    'I ____ a fun game.',
		    'She ____ a nice dress.',
		    'We ____ a beautiful view.',
		    'He ____ a good job.',
		    'You ____ a great opportunity.',
		    'The movie ____ an interesting plot.',
		    'My parents ____ a new pet.',
		    'The company ____ a big event.',
		    'The garden ____ lots of vegetables.',
		    'I ____ some new shoes.',
		    'She ____ a special gift.',
		    'We ____ a comfortable couch.',
		    'He ____ some useful advice.',
		    'You ____ a beautiful home.',
		    'The kids ____ many stories.',
		    'My friend ____ a lovely smile.',
		    'The hotel ____ excellent service.',
		    'The bakery ____ fresh bread.',
		    'I ____ some exciting news.',
		    'She ____ a creative project.',
		    'We ____ a relaxing weekend.',
		    'He ____ a challenging task.'
		];

		// Define the correct answers for the "have" questions
		const correctAnswersHave = [
		    'have', // They have three cats.
		    'have', // I have a book.
		    'has',  // She has a dog.
		    'have', // We have a car.
		    'has',  // He has a pencil.
		    'have', // You have a new phone.
		    'have', // The children have toys.
		    'have', // My parents have a house.
		    'has',  // The cat has a collar.
		    'has',  // The teacher has a lesson plan.
		    'have', // They have a new project.
		    'have', // I have a big family.
		    'has',  // She has a beautiful garden.
		    'have', // We have many friends.
		    'has',  // He has a very good idea.
		    'have', // You have some interesting books.
		    'has',  // The dog has a bone.
		    'has',  // My brother has a bike.
		    'has',  // The baby has a blanket.
		    'has',  // The store has a sale.
		    'have', // They have a delicious dinner.
		    'have', // I have a cup of coffee.
		    'has',  // She has some lovely flowers.
		    'have', // We have a wonderful vacation.
		    'has',  // He has a cool jacket.
		    'have', // You have a nice car.
		    'have', // The library has many books.
		    'has',  // My sister has a lot of homework.
		    'has',  // The restaurant has a special menu.
		    'have', // The team has a new strategy.
		    'have', // I have a fun game.
		    'has',  // She has a nice dress.
		    'have', // We have a beautiful view.
		    'has',  // He has a good job.
		    'have', // You have a great opportunity.
		    'has',  // The movie has an interesting plot.
		    'have', // My parents have a new pet.
		    'have', // The company has a big event.
		    'have', // The garden has lots of vegetables.
		    'have', // I have some new shoes.
		    'has',  // She has a special gift.
		    'have', // We have a comfortable couch.
		    'has',  // He has some useful advice.
		    'have', // You have a beautiful home.
		    'have', // The kids have many stories.
		    'has',  // My friend has a lovely smile.
		    'has',  // The hotel has excellent service.
		    'has',  // The bakery has fresh bread.
		    'have', // I have some exciting news.
		    'has',  // She has a creative project.
		    'have', // We have a relaxing weekend.
		    'has'   // He has a challenging task.
		];

		// Questions and Answers for "Do"
		const questionsDo = [
		    'Do they ____ three cats?',
		    'Do I ____ a book?',
		    'Does she ____ a dog?',
		    'Do we ____ a car?',
		    'Does he ____ a pencil?',
		];

		// Define the correct answers for the "do" questions
		const correctAnswersDo = ['have', 'have', 'has', 'have', 'has'];

		// Dice SVG paths
		const diceFaces = {
		    1: '/fontawesome-free-6.6.0-web/svgs/solid/dice-one.svg',
		    2: '/fontawesome-free-6.6.0-web/svgs/solid/dice-two.svg',
		    3: '/fontawesome-free-6.6.0-web/svgs/solid/dice-three.svg',
		    4: '/fontawesome-free-6.6.0-web/svgs/solid/dice-four.svg',
		    5: '/fontawesome-free-6.6.0-web/svgs/solid/dice-five.svg',
		    6: '/fontawesome-free-6.6.0-web/svgs/solid/dice-six.svg'
		};

		// Define traps with their positions and effects
		const traps = {
		    5: 'move-back', // Move back one space
		    10: 'lose-turn', // Lose a turn
		    15: 'move-back', // Move back one space
		    20: 'lose-turn', // Lose a turn
		    25: 'move-back', // Move back one space
		    30: 'lose-turn', // Lose a turn
		    35: 'move-back', // Move back one space
		    40: 'lose-turn', // Lose a turn
		    45: 'move-back'  // Move back one space
		};

		// Initializing the game state variables
		let questions = questionsHave; // Default to "have" questions
		let correctAnswers = correctAnswersHave; // Default to "have" answers


	// Create the board cells
	    for (let i = 0; i < totalCells; i++) {
	        const cell = document.createElement('div');
	        cell.textContent = i + 1; // Cell number
	        board.appendChild(cell);
	    }

	    // Add player to the board
	    board.children[playerPosition].appendChild(player);

	    // Set the questions and answers based on selected version
	    function setGameVersion(version) {
	        if (version === 'have') {
	            questions = questionsHave;
	            correctAnswers = correctAnswersHave;
	        } else {
	            questions = questionsDo;
	            correctAnswers = correctAnswersDo;
	        }
	    }

	    // Event listener for version selection
	    gameVersionSelector.addEventListener('change', (event) => {
	        if (gameStarted) {
	            const confirmChange = confirm("Are you sure you want to change the game version? Your current progress will be reset.");
	            if (confirmChange) {
	                setGameVersion(event.target.value);
	                resetGame(); // Reset the game for the new version
	            } else {
	                // Reset the dropdown to the current game version
	                gameVersionSelector.value = (correctAnswers === correctAnswersHave) ? 'have' : 'do';
	            }
	        } else {
	            setGameVersion(event.target.value);
	        }
	    });

	    function resetGame() {
	        playerPosition = 0;
	        moveCount = 0;
	        points = 0;
	        pointsElement.textContent = `Points: ${points}`;
	        moveCountElement.textContent = `Moves: ${moveCount}`;
	        showQuestion(playerPosition); // Show the question for the starting position
	    }

	    // Function to roll the dice
	    function rollDice() {
	        if (diceRolled) {
	            status.textContent = 'Please provide an answer before rolling the dice again.';
	            return;
	        }

	        // Trigger dice animation
	        dice.classList.add('rolling');

	        // Simulate dice roll result
	        setTimeout(() => {
	            const result = Math.floor(Math.random() * 6) + 1;
	            diceResult.textContent = `You rolled a ${result}!`;
	            diceRolled = true; // Set flag to true after rolling the dice
	            movePlayer(result);
	            dice.classList.remove('rolling'); // Remove animation class after rolling
	        }, 500); // Duration of animation (should match the animation duration in CSS)
	    }

	    // Function to move player
	    function movePlayer(roll) {
	        // Remove player from current position
	        board.children[playerPosition].removeChild(player);

	        // Update player position
	        playerPosition = Math.min(playerPosition + roll, totalCells - 1);
	        moveCount++; // Increment move count

	        // Move player to new position
	        board.children[playerPosition].appendChild(player);

	        // Update move count display
	        moveCountElement.textContent = `Moves: ${moveCount}`;

	        // Show the question for the new position
	        showQuestion(playerPosition);

	        // Set gameStarted to true
	        gameStarted = true;

	        // Check if player has reached the end
	        if (playerPosition >= totalCells - 1) {
	            endGame();
	        }
	    }

	    // Function to show the question based on position
	    function showQuestion(position) {
	        const questionIndex = position % questions.length; // Example: cycle through questions
	        questionElement.textContent = questions[questionIndex];
	        answerInput.value = ''; // Reset answer input
	        diceRolled = false; // Reset dice rolled flag
	    }

	    // Function to check the answer
	    function checkAnswer() {
	        const questionIndex = playerPosition % questions.length; // Get question index based on position
	        const userAnswer = answerInput.value.trim().toLowerCase();

	        if (userAnswer === correctAnswers[questionIndex]) {
	            status.textContent = 'Correct! You stay on the space.';
	            points += 10; // Award points for correct answer
	        } else {
	            status.textContent = 'Incorrect! Move back one space.';
	            points = Math.max(points - 5, 0); // Deduct points for incorrect answer
	            playerPosition = Math.max(playerPosition - 1, 0);
	            board.children[playerPosition + 1].removeChild(player);
	            board.children[playerPosition].appendChild(player);
	            showQuestion(playerPosition); // Show the question for the new position
	        }

	        pointsElement.textContent = `Points: ${points}`;
	        diceRolled = false; // Allow dice rolling again after answering
	    }

	    // Function to handle the end of the game
	    function endGame() {
	        // Calculate final points (e.g., add a bonus for reaching the end)
	        const finalPoints = points + 50; // Example: bonus points for finishing
	        // addPointsToUser(finalPoints); // Assuming this function exists

	        // Display final score
	        status.textContent = `Congratulations! You reached the end in ${moveCount} moves and earned ${finalPoints} points.`;

	        // Disable further gameplay actions
	        dice.removeEventListener('click', rollDice);
	        submitAnswerButton.removeEventListener('click', checkAnswer);
	    }

	    dice.addEventListener('click', rollDice);
	    submitAnswerButton.addEventListener('click', checkAnswer);

	    // Initialize game with default version
	    setGameVersion(gameVersionSelector.value);
});
