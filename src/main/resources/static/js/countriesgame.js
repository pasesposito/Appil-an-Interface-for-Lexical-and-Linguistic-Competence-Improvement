// Embedded JavaScript for the game functionality
       const flagImg = document.getElementById('flag-img');
       const optionsContainer = document.getElementById('options-container');
       const feedbackDiv = document.getElementById('feedback');
       const nextBtn = document.getElementById('next-btn');

       let countries; // Will hold the fetched JSON data
       let currentCountry; // Will hold the current country object
       let options = []; // Will hold the options for the current country
	   
	   
	   var countryData = {}; // Object to store country data
	      
	      $.getJSON('lesson1/geo/world/countries/en/world.json', function(data) {
	          data.forEach(function(country) {
	              countryData[country.name] = {
	                  nationality: country.nationality
	              };
	          });
	      }).fail(function(jqxhr, textStatus, error) {
	          var err = textStatus + ", " + error;
	          console.error("Error loading world.json: " + err);
	      });

       // Fetch JSON data for countries
       fetch('lesson1/geo/world/countries/en/world.json')
           .then(response => response.json())
           .then(data => {
               countries = data;
               loadCountry(); // Start the game after data is loaded
           })
           .catch(error => console.error('Error fetching countries:', error));

       // Function to load a new country and its options
       function loadCountry() {
           // Randomly select a country from the countries array
           currentCountry = getRandomCountry();

           // Set flag image
           const flagURL = `lesson1/geo/world/flags/64x64/${currentCountry.alpha2.toLowerCase()}.png`;
           flagImg.src = flagURL;

           // Generate options (shuffle for randomness)
           options = generateOptions();

           // Clear previous options
           optionsContainer.innerHTML = '';

           // Append new options
           options.forEach(option => {
               const button = document.createElement('button');
               button.textContent = option.name;
               button.classList.add('option-btn');
               button.addEventListener('click', () => {
                   checkAnswer(option.name);
               });
               optionsContainer.appendChild(button);
           });
       }

       // Function to randomly select a country from the countries array
       function getRandomCountry() {
           const randomIndex = Math.floor(Math.random() * countries.length);
           return countries[randomIndex];
       }

       // Function to generate random options excluding the current country
       function generateOptions() {
           const tempOptions = [...countries]; // Create a copy of the countries array
           const correctCountryIndex = tempOptions.findIndex(c => c.name === currentCountry.name);
           tempOptions.splice(correctCountryIndex, 1); // Remove current country from options

           // Shuffle array
           shuffleArray(tempOptions);

           // Select 3 random countries from the shuffled array
           const options = tempOptions.slice(0, 3);

           // Add the correct country as an option
           options.push(currentCountry);

           // Shuffle options array to randomize the order
           shuffleArray(options);

           return options;
       }

       // Function to shuffle an array (Fisher-Yates algorithm)
       function shuffleArray(array) {
           for (let i = array.length - 1; i > 0; i--) {
               const j = Math.floor(Math.random() * (i + 1));
               [array[i], array[j]] = [array[j], array[i]];
           }
       }

       // Function to check if selected option is correct
       function checkAnswer(selectedCountry) {
           const correctCountry = currentCountry.name;
           if (selectedCountry === correctCountry) {
               // Show correct feedback
               showFeedback(true, correctCountry);
               // Speak the correct country name
               speakCountryName(correctCountry);
           } else {
               // Show incorrect feedback
               showFeedback(false, correctCountry);
           }

           // Load next country
           loadCountry();
       }

       // Function to display feedback
	   function showFeedback(isCorrect, correctCountry) {
	       const feedbackDiv = document.getElementById('feedback'); // Ensure this matches your actual ID
	       const feedback = isCorrect ? `Correct! It's ${correctCountry}.` : `Wrong! Correct answer was ${correctCountry}.`;

	       feedbackDiv.textContent = feedback;

	       // Set background color based on correctness
	       if (isCorrect) {
	           feedbackDiv.style.backgroundColor = '#b2f2b0'; // Green for correct
	       } else {
	           feedbackDiv.style.backgroundColor = 'lightcoral'; // Red for incorrect
	       }

	       feedbackDiv.style.color = 'black'; // Ensure text is visible
		   feedbackDiv.style.fontWeight = 'bold';
	       feedbackDiv.style.display = 'block'; // Show feedback
		   feedbackDiv.style.margin = '10px';
		   
	       // Reset feedback after 2 seconds
	       setTimeout(() => {
	           feedbackDiv.style.display = 'none';
	       }, 3200);
	   }


       // Function to speak the country name using SpeechSynthesis API
       function speakCountryName(countryName) {
           const speech = new SpeechSynthesisUtterance(countryName);
		   
		   var nationality = getNationality(countryName); // Retrieve nationality based on country name
		       if (nationality) {
		           speech.text = "If I come from" + countryName + ", I am" + nationality; // Speak nationality followed by country name
		       } else {
		           speech.text = countryName;
		       }
           speech.lang = 'en-US';
           speech.volume = 1; // 0 to 1
           speech.rate = 1; // 0.1 to 10
           speech.pitch = 1; // 0 to 2

           window.speechSynthesis.speak(speech);
       }

       // Event listener for next button
       nextBtn.addEventListener('click', loadCountry);

       // Initial load
       loadCountry();
	   
	


	   function getNationality(countryName) {
	       if (countryData[countryName]) {
	           return countryData[countryName].nationality;
	       } else {
	           return null; // Handle case where country name doesn't exist in data
	       }
	   }
