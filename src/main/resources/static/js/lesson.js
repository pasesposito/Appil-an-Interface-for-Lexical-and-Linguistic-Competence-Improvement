	$(document).on('click', '.clickOnWiki', function(e) {
		var title = $(this).attr('value');
		const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&format=json&titles=${encodeURIComponent(title)}&origin=*`;
	
		// Promise to fetch and set localStorage values
		const fetchAndSetLocalStorage = new Promise((resolve, reject) => {
			fetch(apiUrl)
				.then(response => {
					if (!response.ok) {
						throw new Error('Network response was not ok: ' + response.statusText);
					}
					return response.json();
				})
				.then(data => {
					const pages = data.query.pages;
					const pageid = Object.keys(pages)[0]; // Get the pageid from the first (and usually only) page returned
					const page = pages[pageid];
					const pageTitle = page.title;
					const pageText = page.extract;
	
					// Set localStorage values
					localStorage.setItem("fromWiki", true);
					localStorage.setItem("text", pageText);
					localStorage.setItem("title", pageTitle);
	
					// Resolve the Promise once localStorage is set
					resolve();
				})
				.catch(error => {
					console.error('Error fetching page content:', error);
					reject(error); // Reject the Promise if there's an error
				});
		});
	
		// After setting localStorage, navigate to another page or update the same page
		fetchAndSetLocalStorage.then(() => {
			// Check the current page URL
			const currentUrl = window.location.href;
	
			if (currentUrl.includes("home")) {
				// Redirect to learningPage if on home.jsp
				window.location.href = "/learningpage";
			} else if (currentUrl.includes("pronunciationgame") || currentUrl.includes("audio.jsp")) {
				// Update the same page if on alphabetPron.jsp
				var wikiText = localStorage.getItem("text");
				var wikiTitle = localStorage.getItem("title");
				var fromWiki = localStorage.getItem("fromWiki");
	
				if (wikiText) {
					document.getElementById("result").innerText = wikiText;
				}
	
				if (fromWiki) {
	
					$("#attribution").empty();
					$("#result").after('<p id="attribution" style="color:black; font-size: 12px; font-style: italic">This article uses material from the Wikipedia article <a href="https://en.wikipedia.org/wiki/' + encodeURIComponent(wikiTitle) + '" target="_blank">' + wikiTitle + '</a>, which is released under the <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank">Creative Commons Attribution-Share-Alike License 4.0</a></p>');
	
	
					$("#results").empty();
					// Clear the localStorage values
					localStorage.removeItem("title");
					localStorage.removeItem("text");
					localStorage.removeItem("fromWiki");
				}
			}
		}).catch(error => {
			console.error('Error setting localStorage:', error);
			// Handle error gracefully if needed
		});
	});
	
	
	let currentIndex = 0;
	const sections = document.querySelectorAll('.text-container');
	
	function updateProgress() {
		const progress = document.getElementById('progress');
		const progressPercentage = ((currentIndex + 1) / sections.length) * 100;
		progress.style.width = progressPercentage + '%';
	}
	
	function scrollToNext() {
		if (currentIndex < sections.length - 1) {
			const currentSection = sections[currentIndex];
			currentSection.classList.add('previous');
			currentSection.classList.remove('active');
			currentIndex++;
			const nextSection = sections[currentIndex];
			nextSection.classList.add('active');
			nextSection.classList.remove('next');
			updateProgress();
		}
	}
	
	function scrollToPrevious() {
		if (currentIndex > 0) {
			const currentSection = sections[currentIndex];
			currentSection.classList.add('next');
			currentSection.classList.remove('active');
			currentIndex--;
			const previousSection = sections[currentIndex];
			previousSection.classList.add('active');
			previousSection.classList.remove('previous');
			updateProgress();
		}
	}
	
	// Initialize sections
	sections.forEach((section, index) => {
		if (index !== 0) {
			section.classList.add('next');
		}
	});
	
	updateProgress();
	
	
	
	
	$(document).ready(function() {
		var totalSections = $('.text-container').length; // Total number of sections
	
		// Populate sidebar with section names
		$('.text-container').each(function(index) {
			var sectionName = $(this).find('h1').text();
			var existingSection = $('#section-list .section-name:contains("' + sectionName + '")');
	
			if (existingSection.length === 0) { // Only add if not already in the list
				$('#section-list').append('<div class="section-name" data-index="' + index + '">' + sectionName + '</div>');
			}
		});
	
		var currentIndex = 0; // Keep track of the current section
	
		// Function to update progress bar, section name, and sidebar on scroll
		function updateProgressBar() {
			const progress = document.getElementById('progress');
			const progressPercentage = ((currentIndex + 1) / totalSections) * 100;
			progress.style.width = progressPercentage + '%';
	
			// Update section name
			var sectionName = $('.text-container').eq(currentIndex).find('h1').text();
			$('#result').html('<div class="section-name">' + sectionName + '</div>');
	
			// Highlight current section in sidebar
			$('.section-name').removeClass('active');
			$('.section-name[data-index="' + currentIndex + '"]').addClass('active');
		}
	
		// Update progress bar, section name, and sidebar on initial load
		updateProgressBar();
	
		// Scroll to section on sidebar click
		const sidebar = document.querySelector('.sidebar-lessons');
		const textContainers = document.querySelectorAll('.text-container');
	
		sidebar.addEventListener('click', function(event) {
			const clickedItem = event.target.closest('.section-name');
			if (!clickedItem) return; // Not a sidebar item
	
			const targetIndex = parseInt(clickedItem.getAttribute('data-index'));
	
			// Update currentIndex to the clicked section's index
			currentIndex = targetIndex;
	
			updateSectionsVisibility();
			updateProgressBar();
		});
	
		// Function to update sections visibility based on currentIndex
		function updateSectionsVisibility() {
			textContainers.forEach((container, index) => {
				if (index < currentIndex) {
					container.classList.remove('next');
					container.classList.remove('active');
					container.classList.add('previous');
				} else if (index === currentIndex) {
					container.classList.remove('previous');
					container.classList.add('active');
					container.classList.remove('next');
				} else {
					container.classList.remove('previous');
					container.classList.remove('active');
					container.classList.add('next');
				}
			});
		}
	
		// Scroll to next section
		function scrollToNext() {
			if (currentIndex < totalSections - 1) {
				currentIndex++;
				updateSectionsVisibility();
				updateProgressBar();
			}
		}
	
		// Scroll to previous section
		function scrollToPrevious() {
			if (currentIndex > 0) {
				currentIndex--;
				updateSectionsVisibility();
				updateProgressBar();
			}
		}
	
		// Event listeners for arrow navigation
		$('#arrow-next').click(scrollToNext);
		$('#arrow-previous').click(scrollToPrevious);
	});
	


	let currentUtterance = null;

	function read(word) {
	    if (selectedVoice) {
	        // If there's an ongoing utterance, stop it
	        if (speechSynthesis.speaking) {
	            speechSynthesis.cancel(); // Stop any ongoing speech
	        }

	        currentUtterance = new SpeechSynthesisUtterance(word);
	        currentUtterance.voice = selectedVoice;
	        currentUtterance.lang = 'en-US'; // Set language to English (United States)

	        // Event listeners for speech synthesis
	        currentUtterance.onend = () => {
	            toggleButtons(true); // Show the "Read Aloud" button when speech ends
	        };
	        currentUtterance.onerror = (event) => {
	            console.error('Speech error:', event.error);
	            toggleButtons(true); // Show the "Read Aloud" button on error
	        };

	        speechSynthesis.speak(currentUtterance);
	        toggleButtons(false); // Show the "Stop" button while speaking
	    } else {
	        console.error("No voice selected.");
	    }
	}

	function stopReading() {
	    if (speechSynthesis.speaking) {
	        speechSynthesis.cancel(); // Stops any ongoing speech
	        toggleButtons(true); // Show the "Read Aloud" button
	    }
	}

	function toggleButtons(showReadAloud) {
	    const readAloudButtons = document.querySelectorAll('#readAloud');
	    const stopReadingButtons = document.querySelectorAll('#stopReading');

	    readAloudButtons.forEach(button => {
	        button.style.display = showReadAloud ? 'inline-block' : 'none';
	    });

	    stopReadingButtons.forEach(button => {
	        button.style.display = showReadAloud ? 'none' : 'inline-block';
	    });
	}

	// Initialize the buttons on page load
	document.addEventListener('DOMContentLoaded', () => {
	    toggleButtons(true); // Initially show the "Read Aloud" button
	});


	function readCurrentSection() {
	    const activeSection = sections[currentIndex];
	    const textElements = activeSection.querySelectorAll('p, ul, li'); // Select <p>, <ul>, and <li> tags

	    if (textElements.length > 0) {
	        // Collect text from all selected elements
	        let fullText = '';
	        textElements.forEach(element => {
	            fullText += element.textContent + '\n'; // Append text from each element
	        });

	        if (fullText.trim()) {
	            read(fullText); // Start reading the combined text
	        } else {
	            console.error('No text found to read.');
	        }
	    } else {
	        console.error('No text elements found in the current section.');
	    }
	}



	function readSection(sectionId) {
				const section = document.getElementById(sectionId);
				if (section) {
					const text = section.innerText || section.textContent;
					if (text) {
						pronounceWord(text);
					} else {
						console.error("No text found in the section.");
					}
				} else {
					console.error("Section not found.");
				}
			}