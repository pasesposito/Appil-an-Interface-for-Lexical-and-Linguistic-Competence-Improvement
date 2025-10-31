
var control = {};
var currentAjaxRequest = null; // Global variable to store the current AJAX request

const enhance = {};
let removedWords = [];
var clozeActive = false;
var readAloud = "";

var headset = false;
var thumbUp = false;
var thumbDown = false;

let values;
let relations;
let cards = [];
let cardsInfo = [];
let words = [];
let abstracts;
let result = "";
let resultWithEnhancements = "";
let enhancedWords;

let fruit;
let title;


let wikiText = "";

if (localStorage.getItem("text")) {
	
	wikiText = localStorage.getItem("text").trim();
}

jQuery(document).ready(function($) {
	// Hide elements initially
	$("#loading").hide();
	$(".toolsButtons").hide();
	$(".buttons-container").hide();

	addTextAreaListener();
	initializeTools();
	stopProcessing();
	keypress();
	handleAnalyzeClick();
});

function handleAnalyzeClick() {
	$("#analyze").click(function() {
		if ($("#txtarea").val() !== "" && $("#result").html() !== "") {
			$("#attribution").empty(); // Clear the content of the element with id 'attribution'
		}

		let modified = ($("#txtarea").val()).trim() === wikiText ? "falseFromWiki" : "false";

		$("#analyze").hide();

		if ($("#txtarea").val() == null || $("#txtarea").val() === "") {
			$("#analyze").show();
			$("#txtarea").attr("placeholder", "INSERISCI PRIMA UN TESTO O UNA PAROLA");
		} else {
			processText(modified);
		}
	});
}

function processText(modified) {
	
	$("#relations").empty();
	$(".scroll-container").empty();
	$("#relations").hide();
	$("#result").empty();

	fruit = $('#txtarea').val();
	title = localStorage.getItem("title");

	currentAjaxRequest = $.ajax({
		beforeSend: function(xhr) {
			beforeAjaxSend();
		},
		type: "POST",
		url: "/api/ajax/handleRequest",
		data: {
			'action': "doPost",
			'fruit': fruit,
			'apple': title,
			'wikiPage': 'https://en.wikipedia.org/wiki/' + title,
			'modified': modified
		},
		headers: {
			[csrfHeader]: csrfToken
		},
		success: function(data) {
			handleAjaxSuccess(data);
		},
		error: function(xhr, status, error) {
			console.error("AJAX request failed:", status, error);
			$("#loading").hide();
			$("#stopButton").hide();
			$("#analyze").show();
		}
	});
}


// Function to extract words that need enhancement
function getWordsToEnhance(data) {
    let wordsToEnhance = [];

    data.forEach(item => {
        if (item.toEnhance) {
            wordsToEnhance.push(item.form);
        }
    });

    return wordsToEnhance;
}



function beforeAjaxSend() {
	$("#loading").show();
	$("#recognizeButton").hide();
	$(".toolsButtons").hide();
	$(".buttons-container").hide();
	$("#stopButton").show();
}

function handleAjaxSuccess(values) {
	$(".toolsButtons").show();
	readAloud = $("#txtarea").val();
	$("#txtarea").val("");
	//$("#attribution, attribution-modified").hide();
	
	$(".buttons-container").show();

	localStorage.setItem("fromWiki", "false");
	$("#analyze, #generateCloze").show();
	localStorage.setItem("title", "");
	localStorage.setItem("text", "");

	////console.log("Received data:", values);

	try {
		// Parse JSON data
		
		$("#loading, #stopButton").hide();
		
		result = values.text;
		
		$("#result").html(values.text);
		$("#playtheMemory, #togglePronounce").show();
		$("#sendData").show();

	
		// Store the `cards` JSON string in localStorage
		localStorage.setItem('words', JSON.stringify(values.words)); 

		// Parse `relations` string into an object (if necessary)
		let relations = values.relations; 
		console.log(relations);

		// `words` is already an object, no need to parse
		words = values.words; 
				
		enhancedWords = getWordsToEnhance(words);
		//console.log(enhancedWords);
	

		// Log the data to the console
		//console.log("Words:", words);
		////console.log("Relations:", relations);
		////console.log("Cards:", cards);
		////console.log("Cards Info:", cardsInfo);


		// Additional processing
		removeTextAreaListener();
		selectEnhanceble();
		generateCloze();
		enhanceText();
		addGlossToEntities();
		stopProcessing();
		requestEnhancement();
		removeClickOnATags();
		
	
		relationGraph(relations);
		$("#relations").show();

	} catch (e) {
		console.error("Failed to handle response:", e);
		// Optionally show an error message to the user
	}
}



function keypress() {

	document.addEventListener('keypress', function(e) {
		if (e.key === 'Enter') {

			if (!clozeActive)
				$("#analyze").click();

			if (clozeActive)
				$("#checkAnswers").click();
		}
	});
}


// Debounce function to limit the rate of function execution
function debounce(func, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}

// Optimized handleInput function
const handleInput = debounce(function() {
    const currentValue = $(this).val().trim();
    const attributionElement = document.getElementById('attribution');
    const attributionModified = document.getElementById('attribution-modified');

    if (currentValue.length >= 1) {
        if (currentValue === wikiText) {
            modified = "falseFromWiki";
            if (attributionElement.style.display !== 'block') {
                attributionElement.style.display = 'block';
                attributionModified.style.display = 'none';
            }
        } else if (wikiText.toLowerCase().includes(currentValue.toLowerCase())) { // Efficient substring check
            modified = "trueFromWiki";
            if (attributionElement.style.display !== 'none') {
                attributionElement.style.display = 'none';
                attributionModified.style.display = 'block';
            }
        } else {
            modified = "false";
            if (attributionElement.style.display !== 'none') {
                attributionElement.style.display = 'none';
                attributionModified.style.display = 'none';
            }
        }
    } else {
        if (attributionElement.style.display !== 'none') {
            attributionElement.style.display = 'none';
            attributionModified.style.display = 'none';
        }
    }
}, 300); // Adjust delay as needed

// Function to add the input listener
function addTextAreaListener() {
    $("#txtarea").on('input', handleInput);
}

// Function to remove the input listener
function removeTextAreaListener() {
    $("#txtarea").off('input', handleInput);
}

// Initialize the listener
addTextAreaListener();

// Example of how you might remove the listener, if needed
// removeTextAreaListener();



// Define the event handler function separately
function handleClickEventOnEnhc() {
	let word = this.textContent.trim();  // Get the text content of the clicked element
	this.classList.toggle('active');

	if (this.classList.contains('active')) {
		this.style.backgroundColor = 'red';
		if (!clickedWords.includes(word)) {
			clickedWords.push(word);  // Add the word to the array if it's not already included
		}
	} else {
		this.style.backgroundColor = '';
		let wordIndex = clickedWords.indexOf(word);
		if (wordIndex !== -1) {
			clickedWords.splice(wordIndex, 1);  // Remove the word from the array if toggled off
		}
	}
}

// Variables to store elements and state
let enhancebles;
let clickedWords = [];  // Array to store the active words

// Function to add event listeners
function selectEnhanceble() {
	enhancebles = document.querySelectorAll('.enhanced .enhanceble');

	enhancebles.forEach((link) => {
		link.addEventListener('click', handleClickEventOnEnhc);
	});
}

// Function to remove event listeners
function removeEnhancebleListeners() {
	if (enhancebles) {
		enhancebles.forEach((link) => {
			link.removeEventListener('click', handleClickEventOnEnhc);
		});
	}
}


function scrambleWord(word) {
    if (word.length <= 3) {
        return word; // No scrambling for words of length 3 or less
    }

    const firstLetter = word[0];
    const lastLetter = word[word.length - 1];
    const middle = word.slice(1, -1);
    let scrambledMiddle = shuffleString(middle);

    // Retry mechanism with a maximum number of retries to avoid infinite loop
    const maxRetries = 100; // Limit the number of retries
    let retries = 0;

    while (scrambledMiddle === middle && retries < maxRetries) {
        scrambledMiddle = shuffleString(middle);
        retries++;
    }

    // Return the original word if no valid scramble was found
    return firstLetter + (scrambledMiddle === middle ? middle : scrambledMiddle) + lastLetter;
}

function shuffleString(str) {
    const array = str.split('');
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array.join('');
}


function generateCloze() {
	
    document.getElementById('generateCloze').addEventListener('click', function() {
        $("#generateCloze").hide();
        $("#txtarea").val("");

        removedWords = [];
        let elementsArray = document.querySelectorAll(".enhanced");
        let index = 0;

        function processNextElement() {
            if (index >= elementsArray.length) {
                $("#checkAnswers").show();
                $("#resetCloze").show();
                clozeActive = true;
                return;
            }

            let elem = elementsArray[index];
            let word = elem.textContent.trim();
            let wordObj = { id: index, word: word };
            removedWords.push(wordObj);

            let scrambledWord = scrambleWord(word);

            let inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.placeholder = scrambledWord;
            inputField.classList.add('cloze-input');
            inputField.dataset.id = index;

            let clozeContainer = document.createElement('div');
            clozeContainer.classList.add('cloze-container');

            let speakerIcon = document.createElement('span');
            speakerIcon.innerHTML = '&#128266;';
            speakerIcon.classList.add('speaker-icon');

            let resetIcon = document.createElement('span');
            resetIcon.innerHTML = '&#x21BA;';
            resetIcon.classList.add('reset-icon');
            resetIcon.style.display = 'none';

            speakerIcon.addEventListener('click', function() {
                if (typeof pronounceWord === 'function') {
                    pronounceWord(word);
                } else {
                    console.error('pronounceWord function is not defined.');
                }
            });

            resetIcon.addEventListener('click', function() {
                inputField.value = '';
                resetIcon.style.display = 'none';
            });

            inputField.addEventListener('input', function() {
                resetIcon.style.display = 'inline';
            });

            clozeContainer.appendChild(inputField);
            clozeContainer.appendChild(speakerIcon);
            clozeContainer.appendChild(resetIcon);

            // Use a DocumentFragment to accumulate changes
            let fragment = document.createDocumentFragment();
            fragment.appendChild(clozeContainer);

            elem.parentNode.replaceChild(fragment, elem);

            index++;
            requestAnimationFrame(processNextElement); // Schedule the next element processing
        }

        processNextElement();
    });
}






// Function to reset the cloze exercise

function resetCloze() {
   
	$("#result").html(resultWithEnhancements);
	
	addEventListenersEnhanced();
    // Show the generate cloze button and hide other buttons
    $("#generateCloze").show();
    $("#checkAnswers").hide();
    $("#resetCloze").hide();

    // Clear the removed words array and set clozeActive to false
    removedWords = [];
    clozeActive = false;   
  
    
}


/*
function resetCloze() {

	let clozeContainers = document.querySelectorAll('.cloze-container');
	clozeContainers.forEach(function(container) {
		let inputField = container.querySelector('input');
		let originalWordObj = removedWords.find(wordObj => wordObj.id == inputField.dataset.id);
		let originalSpan = document.createElement('span');
		originalSpan.classList.add('enhanced');
		originalSpan.textContent = originalWordObj.word;

		container.parentNode.replaceChild(originalSpan, container);
	});

	$("#generateCloze").show();
	$("#checkAnswers").hide();
	$("#resetCloze").hide();
	removedWords = [];
	clozeActive = false;
	
	addEventListenersEnhanced();
} */


// Send word data to the server
function postWordsToServer() {

	const xhr = new XMLHttpRequest();
	xhr.open("POST", "WordHandler", true);
	xhr.setRequestHeader(csrfHeader, csrfHeader);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

	// Prepare data to send
	const data = {
		action: "submitWords",
		wordsILike: JSON.stringify(wordsILike),
		wordsIDontLike: JSON.stringify(wordsIDontLike)
	};

	// Convert data object to URL-encoded string
	const urlEncodedData = Object.keys(data).map(key => {
		return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
	}).join('&');

	xhr.onreadystatechange = function() {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			if (xhr.status === 200) {
				const response = JSON.parse(xhr.responseText);
				if (response.status === "success") {
					////console.log("Words posted successfully");
				} else {
					////console.log("Error posting words");
				}
			} else {
				////console.log("Server error");
			}
		}
	};

	xhr.send(urlEncodedData);
}

function requestEnhancement() {
	document.getElementById('sendData').addEventListener('click', function() {
		////console.log("Sending data to server...");
		postWordsToServer();
	});
}
/*document.getElementById('sendData').addEventListener('click', function() {
		    
			$("#sendData").hide();
			////////console.log("emptying...");			       
			$("#result").empty(); 
			$("#loading").show();
			  // Confirm this appears in the //console when the button is clicked
			var xhr = new XMLHttpRequest();  // Create new instance of XMLHttpRequest
			xhr.open("POST", "Enhance", true);  // Set the request type as POST and direct it to the servlet URL
			xhr.setRequestHeader("Content-Type", "application/json");  // Set the content type of the request to JSON
		    
			xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {  // Ensure the request is complete
				$("#loading").hide();  // Hide the loading indicator regardless of the response status
				if (xhr.status === 200) {
					//////console.log("Response from server:", xhr.responseText);
					//////console.log("SUCCESS");
		
					// Correctly parse the JSON response text
					var enhancements = JSON.parse(xhr.responseText);
					$("#result").html(enhancements.text);  // Update the result div with the message from the JSON
					$("#sendData").show();
				} else {
					////////console.log("Failed to receive valid response:", xhr.status);
					$("#result").html("Error loading results");  // Display error in result div
				}
			}
		};
		    
			// Construct the JSON object to be sent
			enhance.text = currentText;
			enhance.words = clickedWords;
		   
			var data = JSON.stringify(enhance);  // Convert the JSON object to a string
			xhr.send(data);  // Send the JSON string to the server
		   
			  // Send the JSON string to the server
			////////console.log("Data sent:", data);  // Optionally log the sent data to the //console
		    
		let elementsArray = document.querySelectorAll(".enhanced");
		
		elementsArray.forEach(function(elem) {
			let popup = document.createElement("div");
			var Id = elem.getAttribute("id");
			popup.setAttribute("class","popup");
			popup.setAttribute("height", "200px");
			popup.setAttribute("id", "popup" + elem.getAttribute("id"));
			popup.innerHTML = '<img width="50px" height="50px" src="https://upload.wikimedia.org/wikipedia/commons/8/83/Emergency_Light.gif"> </img><p id="definition"></p>';
		    
			elem.after(popup);
	
			var linkText = elem.innerText;
			var linkTitle = elem.getAttribute('title');
	
			//////console.log(linkText);
			//////console.log(linkTitle);
	
			$.ajax({
				type: "POST",
				url: 'DefHandler',
				data: {
					'action': "doPost",
					'fruit': linkText,
					'apple': linkTitle,
					'subtract': "false"
				},
				success: function(data) {
					////////console.log("Data from Servlet--------" + data);
					document.getElementById("popup"+Id).querySelector("#definition").innerHTML = data;
				},
				error: function(error) {
					//console.error("Errore durante la chiamata AJAX: ", error);
				}
			});
			
		});
	    
	    
		    
	});
	*/

	/*
	async function enhanceText() {
	    let elementsArray = document.querySelectorAll(".enhanced");

	    elementsArray.forEach(async function (elem) {
	        let Id = elem.getAttribute("id");
	        let linkText = elem.innerText.trim();

	        // Find data item for the word
	        let dataItem = words.find(item => item.form === linkText);

	        // Default values for missing data
	        let imageUrl = dataItem?.imageInfo?.link || null;
	        let imageTitle = dataItem?.imageInfo?.title || "Untitled";
	        let artist = dataItem?.imageInfo?.author || 'Unknown';
	        let license = dataItem?.imageInfo?.license || 'Unknown';
	        let abstract = dataItem?.abs || "";
	        let definition = '<p  style="text-decoration:none; "><a href="https://wordnet.princeton.edu/" style="text-decoration:none; font-weight:bold;"> WordNet <a> definition: ' + dataItem?.definition + "</p>"|| "";
	        let graph = dataItem?.relationGraph || "";

	        // Skip creating a popup if both image, description, graph, and abstract are absent
	        if (!imageUrl && !abstract && !definition && !graph) {
	            return; // Do not create or show the popup
	        }

	        let popup = document.createElement("div");
	        popup.setAttribute("class", "popup");
	        popup.style.top = "50%";	
			popup.style.left="50%";
			popup.style.transform= "translate(-50%, -50%)"; /* Offset by half the element's width and height to truly center it 
			     
	        popup.style.overflowY = "auto";
	        popup.style.backgroundColor = "#f9f9f9";
	        popup.style.border = "1px solid #ccc";
	        popup.style.borderRadius = "8px";
	        popup.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.1)";
	        popup.style.padding = "15px";
	        popup.style.position = "absolute";
	        popup.style.zIndex = "1000";
	        popup.style.display = "none"; // Initially hidden
	        popup.setAttribute("id", "popup" + Id);

	        // Construct the inner HTML
	        let attributionHtml = imageUrl ? `
	            <div id="attribution" style="font-size: 0.8em; color: #555; text-align: left; margin-top: 10px; width: 100%;">
	                <strong>${imageTitle}</strong><br>
	                Image by ${artist}<br>
	                License: ${license}<br>
	                <a target="_blank" href="${imageUrl}">View image on Wikimedia Commons</a><br>
	                <a target="_blank" href="${dataItem?.wikiPage || '#'}">Article on Wikipedia: ${linkText}</a>
	            </div>` : '';

	        popup.innerHTML = `
			<div style="
			    display: flex;
			    flex-direction: row;
			    width: 80vw; /* Adjust width as needed 
			    height: 80vh;  Adjust height as needed 
			    box-sizing: border-box;
			    position: relative;
			    overflow: hidden;  Hide overflow from the main container 
			">
			    <!-- Information Column -->
			    <div style="
			        flex: 1;
			        padding: 10px;
			        box-sizing: border-box;
			        overflow-y: auto; /* Allow vertical scrolling
			        max-height: 100%;
			    ">
			        <div style="
			            display: flex;
			            align-items: center;
			            margin-bottom: 10px;
			        ">
			            <div style="
			                font-weight: bold;
			                font-size: 1.2em;
			                flex: 1 0 auto;
			            ">${linkText}</div>
			            <button onclick="pronounceWord('${linkText}')" id="togglePronounce" style="
			                background: none;
			                border: none;
			                cursor: pointer;
			            ">
			                <img src="/imgs/volume_up_40dp.svg" alt="Pronounce" style="
			                    width: 24px;
			                    height: 24px;
			                "/>
			            </button>
			        </div>
			        ${imageUrl ? `<img id="help" src="${imageUrl}" width="200px" height="200px" alt="Image of ${linkText}" style="
			            margin-bottom: 10px;
			            border-radius: 5px;
			            max-width: 100%;
			            height: auto;
			        "/>` : ''}
			        <div style="
			            margin-bottom: 10px;
			        ">${abstract}</div>
			        <p style="
			            margin-top: 10px;
			        ">${definition}</p>
			        ${attributionHtml}
			    </div>
			    
			    <!-- Graph Column -->
			    <div style="
			        flex: 1;
			        padding: 10px;
			        box-sizing: border-box;
			        overflow: hidden;
			        border-left: 1px solid #ccc;
			        display: flex;
			        flex-direction: column;
			    ">
			        <div id="popup-relation-graph-${Id}" style="
			            height: 100%;
			            width: 100%;
			            overflow: auto; /* Make the graph container scrollable if needed 
			            border: 1px solid #ccc;
			            border-radius: 5px;
			        "></div>
			    </div>

			    <!-- Close Button -->
			    <span onclick="closePopup('popup${Id}')" style="
			        position: absolute;
			        top: 10px;
			        right: 10px;
			        cursor: pointer;
			        font-weight: bold;
			        font-size: 1.2em;
			    ">X</span>
			</div>

	        `;
			
			

	        // Insert the popup after the current element
	        elem.after(popup);
			
			
	        // Call the function to render the relation graph inside the popup, if present
	        if (graph) {
	            onWordGraph(graph, `#popup-relation-graph-${Id}`); // Pass the unique ID of the graph container
	        }

	        // Add event listeners for the popup
	        addEventListenersEnhanced();
	    });
	} */
	
	function addGlossToEntities() {
	    // Define glosses for different entity types
		
		    const glosses = {
		        PERSON: "A person's name, typically a human being.",
		        ORGANIZATION: "An organization such as a company, institution, or non-profit group.",
		        LOCATION: "A geographical location, including cities, countries, and landmarks.",
		        DATE: "A specific day, month, or year, or a range of dates.",
		        TIME: "A specific time of day or a period of time.",
		        MONEY: "Monetary values, such as dollars, euros, or any other currency.",
		        PERCENT: "A percentage representing a proportion out of 100.",
		        FACILITY: "Buildings or infrastructure like airports, hospitals, or highways.",
		        GPE: "Geopolitical entities, including countries, cities, and states.",
		        ORG: "Organizations, which can be an alternative annotation for ORG.",
		        NORP: "Nationalities, religious groups, or political affiliations.",
		        EVENT: "Events such as conferences, festivals, or historical occurrences.",
		        LANGUAGE: "Languages spoken or written, such as English, Spanish, or Mandarin.",
		        PRODUCT: "Products like gadgets, cars, or other commercial items.",
		        WORK_OF_ART: "Artistic creations, including paintings, sculptures, and literature.",
		        LAW: "Legal documents, laws, or regulations.",
		        ORDINAL: "Ordinal numbers indicating position or order, like first, second, or third.",
		        CARDINAL: "Cardinal numbers representing quantities, like one, two, or three."
		        // Add more glosses as needed
		    };

	    // Select all elements with class 'entity'
	    const entities = document.querySelectorAll('.entity');

	    entities.forEach(entity => {
	        // Get the entity type
	        const entityType = entity.getAttribute('data-entity-type');

	        // Create a tooltip element if the entity type is recognized
	        if (entityType && glosses[entityType]) {
	            // Create a tooltip container
	            const tooltip = document.createElement('span');
	            tooltip.className = 'tooltiptext';
	            tooltip.textContent = glosses[entityType];

	            // Append the tooltip to the entity
	            entity.classList.add('tooltip');
	            entity.appendChild(tooltip);
	        }
	    });
	}
	
	async function enhanceText() {
		
	    let elementsArray = document.querySelectorAll(".enhanced");

	    elementsArray.forEach(async function (elem) {
	        let Id = elem.getAttribute("id");
	        let linkText = elem.innerText.trim();

	        // Find data item for the word
	        let dataItem = words.find(item => item.form === linkText);

	        // Default values for missing data
	        let imageUrl = dataItem?.imageInfo?.link || null;
	        let imageTitle = dataItem?.imageInfo?.title || "Untitled";
	        let artist = dataItem?.imageInfo?.author || 'Unknown';
	        let license = dataItem?.imageInfo?.license || 'Unknown';
	        let abstract = dataItem?.abs && dataItem.abs !== "Sorry, no enhancement" ? dataItem.abs : "";
			let definition = dataItem?.definition && dataItem.definition !== "Definition not available"
			    ? `<p style="text-decoration:none;">
			          <a href="https://wordnet.princeton.edu/" style="text-decoration:none; font-weight:bold;">
			            WordNet
			          </a> definition: ${dataItem.definition}
			      </p>`
			    : "";

	        let graph = dataItem?.relationGraph || "";

	        // Skip creating a popup if both image, description, graph, and abstract are absent
	        if (!imageUrl && !abstract && !definition && !graph) {
	            return; 
	        }

	        // Skip showing the image if the image URL is "Sorry, no enhancement" or "No image link available"
	        let showImage = imageUrl && imageUrl !== "Sorry, no enhancement" && imageUrl !== "No image link available";

	        // Construct the inner HTML for the popup
	        let popup = document.createElement("div");
	        popup.setAttribute("class", "popup");
	        popup.style.top = "50%";	
	        popup.style.left = "50%";
	        popup.style.transform = "translate(-50%, -50%)"; /* Offset by half the element's width and height to truly center it */
	        popup.style.overflowY = "auto";
	        popup.style.backgroundColor = "#f9f9f9";
	        popup.style.border = "1px solid #ccc";
	        popup.style.borderRadius = "8px";
	        popup.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.1)";
	        popup.style.padding = "15px";
	        popup.style.position = "absolute";
	        popup.style.zIndex = "1000";
	        popup.style.display = "none"; // Initially hidden
			
	        popup.setAttribute("id", "popup" + Id);

	        popup.innerHTML = `
	        <div style="
	            display: flex;
	            flex-direction: row;
	            width: 80vw; /* Adjust width as needed */
	            height: 80vh; /* Adjust height as needed */
	            box-sizing: border-box;
	            position: relative;
	            overflow: hidden; /* Hide overflow from the main container */
	        ">
	            <!-- Information Column -->
	            <div style="
	                flex: 1;
	                padding: 10px;
	                box-sizing: border-box;
	                overflow-y: auto; /* Allow vertical scrolling */
	                max-height: 100%;
	            ">
	                <div style="
	                    display: flex;
	                    align-items: center;
	                    margin-bottom: 10px;
	                ">
	                    <div style="
	                        font-weight: bold;
	                        font-size: 1.2em;
	                        flex: 1 0 auto;
	                    ">${linkText}</div>
	                    <button onclick="pronounceWord('${linkText}')" id="togglePronounce" style="
	                        background: none;
	                        border: none;
	                        cursor: pointer;
	                    ">
	                        <img src="imgs/volume_up_40dp.svg" alt="Pronounce" style="
	                            width: 24px;
	                            height: 24px;
	                        "/>
	                    </button>
	                </div>
	                ${showImage ? `<img id="help" src="${imageUrl}" width="200px" height="200px" alt="Image of ${linkText}" style="
	                    margin-bottom: 10px;
	                    border-radius: 5px;
	                    max-width: 100%;
	                    height: auto;
	                "/>` : ''}
	                ${abstract ? `<div style="margin-bottom: 10px;">${abstract}</div>` : ''}
	                <p style="margin-top: 10px;">${definition}</p>
	                ${showImage ? `
	                <div id="attribution" style="font-size: 0.8em; color: #555; text-align: left; margin-top: 10px; width: 100%;">
	                    <strong>${imageTitle}</strong><br>
	                    Image by ${artist}<br>
	                    License: ${license}<br>
	                    <a target="_blank" href="${imageUrl}">View image on Wikimedia Commons</a><br>
	                    <a target="_blank" href="${dataItem?.wikiPage || '#'}">Article on Wikipedia: ${linkText}</a>
	                </div>` : ''}
	            </div>
	            
	            <!-- Graph Column -->
	            <div style="
	                flex: 1;
	                padding: 10px;
	                box-sizing: border-box;
	                overflow: hidden;
	                border-left: 1px solid #ccc;
	                display: flex;
	                flex-direction: column;
	            ">
	                <div id="popup-relation-graph-${Id}" style="
	                    height: 100%;
	                    width: 100%;
	                    overflow: auto; /* Make the graph container scrollable if needed */
	                    border: 1px solid #ccc;
	                    border-radius: 5px;
	                "></div>
	            </div>

	            <!-- Close Button -->
	            <span onclick="closePopup('popup${Id}')" style="
	                position: absolute;
	                top: 10px;
	                right: 10px;
	                cursor: pointer;
	                font-weight: bold;
	                font-size: 1.2em;
	            ">X</span>
	        </div>
	        `;

	        // Insert the popup after the current element
	        elem.after(popup);
	        
	        // Call the function to render the relation graph inside the popup, if present
	        if (graph) {
	            onWordGraph(graph, `#popup-relation-graph-${Id}`); // Pass the unique ID of the graph container
	        }

	        // Add event listeners for the popup
	        addEventListenersEnhanced();
			// Select the element with id="result"
			var resultElement = document.getElementById('result');

			// Get the inner HTML, including the element itself
			resultWithEnhancements = resultElement.innerHTML;
	    });
	}


	// Named functions for event listeners
	function handleTouchStart(event) {
	    this.touchStartTime = Date.now();
	}

	function handleTouchEnd(event) {
	    const touchEndTime = Date.now();
	    const touchDuration = touchEndTime - this.touchStartTime;

	    if (touchDuration < 500) {
	        event.preventDefault();
	        // Implement your popup open/close logic here
	        const popup = document.querySelector(`#popup${this.id}`);
	        if (popup) {
	            handlePopupDisplay(popup);
	        }
	    }
	}

	let hoverTimeoutId;
	let currentPopup = null;

	function addEventListenersEnhanced() {
		
	    document.querySelectorAll('.enhanced').forEach(elem => {
	        elem.addEventListener('touchstart', handleTouchStart);
	        elem.addEventListener('touchend', handleTouchEnd);
	        elem.addEventListener('mouseenter', handleMouseEnter);
	        elem.addEventListener('mouseleave', handleMouseLeave);

	        const popup = document.querySelector(`#popup${elem.id}`);
	        if (popup) {
	            popup.addEventListener('mouseleave', handlePopupMouseLeave);
	            popup.addEventListener('mouseenter', handlePopupMouseEnter);
	        }
	    });

	    // Handle touch events outside popups
	    document.addEventListener('touchstart', handleTouchOutsidePopup);
	}
	
	
	function removeEventListenersEnhanced() {
	    // Remove event listeners from all elements with the 'enhanced' class
	    document.querySelectorAll('.enhanced').forEach(elem => {
	        // Remove touch and mouse events from each element
	        elem.removeEventListener('touchstart', handleTouchStart);
	        elem.removeEventListener('touchend', handleTouchEnd);
	        elem.removeEventListener('mouseenter', handleMouseEnter);
	        elem.removeEventListener('mouseleave', handleMouseLeave);

	        // Find the corresponding popup for each element and remove events if it exists
	        const popup = document.querySelector(`#popup${elem.id}`);
	        if (popup) {
	            popup.removeEventListener('mouseleave', handlePopupMouseLeave);
	            popup.removeEventListener('mouseenter', handlePopupMouseEnter);
	        }
	    });

	    // Remove the touch event listener from the document
	    document.removeEventListener('touchstart', handleTouchOutsidePopup);
	}



	function handleMouseEnter(event) {
	    const popup = document.querySelector(`#popup${this.id}`);
	    if (popup) {
	        clearTimeout(hoverTimeoutId);

	        hoverTimeoutId = setTimeout(() => {
	            handlePopupDisplay(popup);
	        }, 300);  // 300ms delay before showing the popup
	    }
	}

	function handleMouseLeave(event) {
	    const popup = document.querySelector(`#popup${this.id}`);
	    if (popup) {
	        clearTimeout(hoverTimeoutId);

	        hoverTimeoutId = setTimeout(() => {
	            popup.style.display = 'none';
	        }, 300);  // Close the popup quickly if mouse leaves the trigger element
	    }
	}

	function handlePopupMouseLeave(event) {
	    clearTimeout(hoverTimeoutId);
	    hoverTimeoutId = setTimeout(() => {
	        if (currentPopup) {
	            currentPopup.style.display = 'none';
	            currentPopup = null;
	        }
	    }, 300);  // Hide the popup after 300ms if the mouse leaves the popup
	}

	function handlePopupMouseEnter(event) {
	    clearTimeout(hoverTimeoutId);  // Prevent the popup from closing if the mouse re-enters it
	}

	function handlePopupDisplay(popup) {
	    if (currentPopup && currentPopup !== popup) {
	        currentPopup.style.display = 'none';
	    }

	    // Center the popup in the viewport
	    const viewportWidth = window.innerWidth;
	    const viewportHeight = window.innerHeight;
	    const popupWidth = popup.offsetWidth;
	    const popupHeight = popup.offsetHeight;

	    // Calculate the position to center the popup
	    const top = (viewportHeight / 2) - (popupHeight / 2);
	    const left = (viewportWidth / 2) - (popupWidth / 2);

	    // Set the position of the popup
	    popup.style.position = 'fixed'; // Use fixed positioning to ensure it stays centered in the viewport
	    popup.style.top = `${top}px`;
	    popup.style.left = `${left}px`;

	    // Ensure the popup is displayed
	    popup.style.display = 'block';
	    currentPopup = popup;
	}

	function handleTouchOutsidePopup(event) {
	    // Check if the touch event is outside the current popup
	    if (currentPopup && !currentPopup.contains(event.target)) {
	        currentPopup.style.display = 'none';
	        currentPopup = null;
	    }
	}





function stopProcessing() {

	$("#stopButton").click(function() {
		if (currentAjaxRequest) {
			currentAjaxRequest.abort(); // Abort the current AJAX request
			currentAjaxRequest = null; // Reset the global variable
			$("#loading").hide(); // Hide the loading gif
			$("#recognizeButton").show();
			$("#stopButton").hide();
			$("#analyze").show();
		}
	});
}

function openModal() {
	var modal = document.getElementById("myModal");
	modal.style.display = "block";
}

function closeModal() {
	var modal = document.getElementById("myModal");
	modal.style.display = "none";
}

function getPulsanti(crediti) {
	var buttons = [
		{ id: 'generateGraph', text: 'Ottieni connessioni (-30)', creditiNecessari: 30, function: 'graph' },
		{ id: 'getDefinition', text: 'Ottieni la definizione (-50)', creditiNecessari: 50, function: 'def' },
		{ id: 'getTranslation', text: 'Ottieni la traduzione (-80)', creditiNecessari: 80, function: 'translation' },
		{ id: 'getInformation', text: 'Ottieni informazioni (-70)', creditiNecessari: 70, function: 'information' }
	];

	// Rimuovi i pulsanti con crediti necessari superiori a quelli disponibili
	buttons = buttons.filter(function(button) {
		return button.creditiNecessari <= crediti;
	});

	return buttons;
}

function creaFinestraModale(credits, title) {
	var finestraModaleEsistente = document.getElementById('myModal');
	if (finestraModaleEsistente) {
		document.body.removeChild(finestraModaleEsistente);
	}

	var nuovaFinestraModale = document.createElement('div');
	nuovaFinestraModale.id = 'myModal';
	nuovaFinestraModale.className = 'modal';

	var imgElement = document.createElement('img');
	imgElement.id = 'alarm';
	imgElement.width = 30;
	imgElement.height = 30;
	imgElement.src = 'https://upload.wikimedia.org/wikipedia/commons/8/83/Emergency_Light.gif';

	var spanClose = document.createElement('span');
	spanClose.className = 'close';
	spanClose.innerHTML = '&times;';
	spanClose.addEventListener('click', function() {
		nuovaFinestraModale.style.display = 'none'; // Hide modal
	});

	var bElement = document.createElement('b');
	bElement.id = title;
	bElement.innerHTML = title + "<br>";

	var modalContent = document.createElement('div');
	modalContent.className = 'modal-content';
	modalContent.appendChild(imgElement);
	modalContent.appendChild(bElement);
	modalContent.appendChild(spanClose);

	buttons = getPulsanti(credits);

	buttons.forEach(function(button) {
		var buttonElement = document.createElement('button');
		buttonElement.id = button.id;
		buttonElement.className = 'modalButton';
		buttonElement.innerHTML = button.text;

		buttonElement.addEventListener('click', function() {
			////////console.log('Hai cliccato su ' + button.id);
		});

		modalContent.appendChild(buttonElement);
	});

	var columnElement = document.createElement('div');
	columnElement.className = 'column';
	columnElement.appendChild(modalContent);

	nuovaFinestraModale.appendChild(columnElement);

	document.body.appendChild(nuovaFinestraModale);
	nuovaFinestraModale.style.display = 'block'; // Show modal
}






async function getImageInfo(fileUrl) {

	// Extract file name from the URL
	const fileName = fileUrl.split('/').pop().split('?')[0];

	// Construct API endpoint for metadata
	const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${fileName}&prop=imageinfo&iiprop=extmetadata&format=json`;
	////////console.log("--------------------------" + fileName);
	// Fetch data from Wikimedia Commons API
	fetch(apiUrl)
		.then(response => response.json())
		.then(data => {
			// Extract relevant information from API response
			const pages = data.query.pages;
			const pageId = Object.keys(pages)[0]; // Assuming there's only one page in the response
			const metadata = pages[pageId].imageinfo[0].extmetadata;

			// Access license and author information
			const license = metadata.LicenseShortName.value;
			const author = metadata.Artist.value;

			// Log or use the retrieved information
			//////console.log(`Author: ${author}`);*/
		})
		.catch(error => {
			// //console.error('Error fetching data:', error);
		});
}



function generateClozeExercise(htmlText) {
	
	removeEventListenersEnhanced();
	
	// Regular expression to match anchor tags with specific attributes
	const regex = /<a\s+id="\d+"\s+class="(enhanceble|enhanced)"\s+(href="[^"]*"\s+)?(title="[^"]*"\s+)?target="_blank"\s+value="([^"]*)">([^<]*)<\/a>/g;

	// Replace matched elements with blanks where necessary
	const clozeExercise = htmlText.replace(regex, (match, className, hrefAttr, titleAttr, valueAttr, content) => {
		// Determine if to replace with a blank based on className and valueAttr
		if (className === 'enhanceble') {
			return `<span class="gap">[_____] </span>`;
		} else {
			return content; // Keep the original content if no replacement is needed
		}
	});

	return clozeExercise;
}



function closePopup(popupId) {
	const popup = document.getElementById(popupId);
	if (popup) {
		popup.style.display = 'none';
	}
}

function handleInteraction(event) {
	const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

	if (isTouchDevice) {
		handleTouch(event);
	} else {
		handleClick(event);
	}
}


function handleGenerateGraph(creditsElement, popupId) {

	if (parseInt(creditsElement.innerHTML) > 49) {
		$(".scroll-container").empty().show();

		var linkText = $(document).data('linkText');
		var linkTitle = $(document).data('linkTitle');

		$.ajax({
			type: "POST",
			url: 'GraphHandler',
			data: {
				'action': "doPost",
				'fruit': linkText,
				'apple': linkTitle
			},
			success: function(data) {
				localStorage.setItem("graph", data);
				creditsElement.innerHTML = parseInt(creditsElement.innerHTML) - 30;
				window.open('graph.jsp', '_blank');
				closeModal();
			},
			error: function(error) {
				//console.error("Error during AJAX call: ", error);
			}
		});
	}
}

function handleGetDefinition(creditsElement, popupId) {
	if (parseInt(creditsElement.innerHTML) > 49) {
		var linkText = $(document).data('linkText');
		var linkTitle = $(document).data('linkTitle');

		$.ajax({
			type: "POST",
			url: 'DefHandler',
			data: {
				'action': "doPost",
				'fruit': linkText,
				'apple': linkTitle,
				'subtract': "true"
			},
			success: function(data) {
				document.getElementById("popup" + popupId).querySelector("#definition").innerHTML = data;
				creditsElement.innerHTML = parseInt(creditsElement.innerHTML) - 50;
				closeModal();
			},
			error: function(error) {
				//console.error("Error during AJAX call: ", error);
			}
		});
	} else {
		alert("Il tuo credito non è sufficiente. Devi avere almeno 50 crediti per eseguire questa azione.");
	}
}



async function fetchWikimediaAttributionFromUrl(imageUrl) {

	try {
		const filename = imageUrl.split('/').pop().split('?')[0];

		const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=File:${filename}&prop=imageinfo&iiprop=extmetadata&format=json&origin=*`;

		//////console.log(filename);

		const response = await fetch(apiUrl);
		const data = await response.json();

		const pages = data.query.pages;
		const pageId = Object.keys(pages)[0];
		const imageInfo = pages[pageId].imageinfo;

		if (imageInfo && imageInfo.length > 0) {
			const metadata = imageInfo[0].extmetadata;
			const artist = metadata.Artist ? metadata.Artist.value : 'Unknown';
			const license = metadata.LicenseShortName ? metadata.LicenseShortName.value : 'Unknown';
			const attributionUrl = metadata.AttributionRequired ? metadata.AttributionRequired.value : imageUrl;
			const description = metadata.ImageDescription ? metadata.ImageDescription.value : 'No description';
			const credit = metadata.Credit ? metadata.Credit.value : 'No credit';
			const title = metadata.ObjectName ? metadata.ObjectName.value : 'No title';

			return {
				title: title,
				artist: artist,
				license: license,
				attributionUrl: attributionUrl,
				description: description,
				credit: credit
			};
		} else {
			//console.warn('No imageinfo found in response'); // Log if imageinfo is not found
			return null;
		}
	} catch (error) {
		console.error('Error fetching Wikimedia attribution:', error);
		return null;
	}
}



// Global variable to track IDs of correct answers that have already been sent to the servlet
var sentCorrectAnswers = new Set();
var clozeScore = 0;


function checkAnswers() {
	var userAnswers = [];
	var inputFields = document.querySelectorAll(".cloze-input");

	$("#resetCloze").show();

	// Gather user answers
	inputFields.forEach(function(inputField) {
		var id = inputField.dataset.id;
		var answer = inputField.value.trim();
		userAnswers.push({ id: parseInt(id), word: answer });
	});

	// Reset clozeScore and clear countedCorrectAnswers
	var countedCorrectAnswers = new Set();
	var newAnswer = 0;

	// Compare userAnswers with removedWords and color the input fields
	userAnswers.forEach(function(userAnswer) {
		var correctAnswer = removedWords.find(wordObj => wordObj.id === userAnswer.id);
		var inputField = document.querySelector(`.cloze-input[data-id='${userAnswer.id}']`);
		var resetIcon = inputField.nextElementSibling.nextElementSibling; // The reset icon

		if (correctAnswer && correctAnswer.word.toLowerCase() === userAnswer.word.toLowerCase() && !countedCorrectAnswers.has(correctAnswer.id)) {
			inputField.style.backgroundColor = 'lightgreen';
			newAnswer++;
			inputField.readOnly = true; // Make input field read-only once correct
			clozeScore += 5; // Add 5 points for each correct answer
			countedCorrectAnswers.add(correctAnswer.id); // Mark as counted
			resetIcon.style.display = 'none'; // Hide the reset icon if the answer is correct
		} else {
			inputField.style.backgroundColor = 'lightcoral';
			resetIcon.style.display = 'inline'; // Show the reset icon if the answer is incorrect
		}
	});

	addPointsToUser(5 * newAnswer);
	
	if(newAnswer >0)
	showNotification('Points successfully added.');
}




function sendScoreToServlet(finalScore) {

	if (finalScore > 0) {

		const xhr = new XMLHttpRequest();
		xhr.open("POST", `/api/add/${finalScore}`, true); // Use PathVariable in URL
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.onreadystatechange = function() {
			if (xhr.readyState === XMLHttpRequest.DONE) {
				if (xhr.status === 200) {
					//console.log("Points successfully added.");
				} else {
					console.error("Failed to add points. Server responded with status:", xhr.status);
				}
			}
		};
		xhr.send(); // No body needed since points are in the URL
	}
}


function read() {


	startReading(readAloud);


}


function handleLinkATagClick(event) {

	event.preventDefault();  // Prevent the default link behavior

}

function removeClickOnATags() {
	// Add event listener to all <a> tags within .result
	document.querySelectorAll('#result a').forEach(anchor => {
		anchor.addEventListener('click', handleLinkATagClick);
	});

}

let removedListeners = [];

function handleEnhancedClick(event) {

	event.preventDefault();

	const credits = document.getElementById("player-credits");
	const linkText = this.innerText.trim();
	const linkTitle = this.getAttribute("title");
	const popupId = this.getAttribute("id");

	creaFinestraModale(credits.innerHTML, linkText);
	openModal();

	// Store linkText and linkTitle in document data
	document.data = {
		linkText: linkText,
		linkTitle: linkTitle
	};

	// Example handlers for buttons
	document.getElementById("generateGraph").addEventListener('click', () => handleGenerateGraph(credits, popupId));
	document.getElementById("getDefinition").addEventListener('click', () => handleGetDefinition(credits, popupId));
}


// Add event listeners
function richiesta() {
	document.querySelectorAll('.enhanced').forEach(elem => {
		elem.addEventListener('click', handleEnhancedClick);
	});
}

// Remove event listeners
function removeEventListenersRequest() {
	document.querySelectorAll('.enhanced').forEach(elem => {
		elem.removeEventListener('click', handleEnhancedClick);
		removedListeners.push({
			element: elem,
			handler: handleEnhancedClick
		});
	});
}

// Re-add all previously removed event listeners
function readdRemovedListeners() {
	removedListeners.forEach(listener => {
		listener.element.addEventListener('click', listener.handler);
	});

	// Clear the removed listeners list after re-adding
	removedListeners = [];
}

function startReading() {
	const textElement = document.getElementById('result');
	const stop = document.getElementById('stopReading');
	const start = document.getElementById('readTextAloud');

	stop.style.display = 'block';
	start.style.display = 'none';

	// Select all the text within the element, including punctuation
	const spans = textElement.querySelectorAll('a.enhanceble, a.enhanced, a.entity');
	let index = 0;

	// Use .innerText to ensure punctuation is included in the speech text
	const fullText = textElement.innerText; // This will capture punctuation

	const utterance = new SpeechSynthesisUtterance(fullText); // Speak the full text, including punctuation
	utterance.voice = selectedVoice;
	utterance.lang = 'en-US'; // Set language to English (United States)

	let highlightTimeout;

	utterance.onboundary = function(event) {
		// Remove previous highlights
		spans.forEach(span => span.classList.remove('highlight'));

		// Clear previous timeout
		if (highlightTimeout) {
			clearTimeout(highlightTimeout);
		}

		// Determine which span to highlight
		let cumulativeIndex = 0;
		spans.forEach(span => {
			const spanText = span.innerText; // Use .innerText for visible text
			const spanLength = spanText.length;
			if (event.charIndex >= cumulativeIndex && event.charIndex < cumulativeIndex + spanLength) {
				highlightTimeout = setTimeout(() => {
					span.classList.add('highlight');
					
				}, 100); // Adjust the delay as needed
			}
			cumulativeIndex += spanLength + 1; // +1 for the space between words and punctuation
		});
	};

	utterance.onend = function() {
		// Remove all highlights when done
		spans.forEach(span => span.classList.remove('highlight'));
		start.style.display = 'block';
		stop.style.display = 'none';
	};

	// Listen for page changes and stop the reading when the page is unloaded
	window.addEventListener('beforeunload', function() {
		speechSynthesis.cancel(); // Stop reading
	});

	speechSynthesis.speak(utterance);
}


function stopReading() {
	// Cancel any ongoing speech synthesis
	speechSynthesis.cancel();

	// Remove all highlights
	const spans = document.querySelectorAll('#result a.enhanceable, #result a.enhanced');
	spans.forEach(span => span.classList.remove('highlight'));

	// Show the start button and hide the stop button
	const stop = document.getElementById('stopReading');
	const start = document.getElementById('readTextAloud');
	start.style.display = 'block';
	stop.style.display = 'none';
}

window.addEventListener('beforeunload', function() {
		speechSynthesis.cancel(); // Stop reading
	});


let pronounceMode = false;
let thumbUpMode = false;
let thumbDownMode = false;

const wordsILike = [];
const wordsIDontLike = [];

// Store the original color state of elements
const originalStyles = new Map();

// Function to update the cursor based on the active mode
function updateCursor() {
	const elements = document.querySelectorAll('.enhanceble, .enhanced');
	elements.forEach(element => {
		if (pronounceMode) {
			document.body.style.cursor = 'url(\'volume_up_40dp.svg\'), auto';
			element.style.cursor = 'url(\'volume_up_40dp.svg\'), auto';
			removeEventListenersEnhanced();
			removeEventListenersRequest()
		} else if (thumbUpMode) {
			document.body.style.cursor = 'url(\'fontawesome-free-6.6.0-web/svgs/solid/thumbs-up.svg\'), auto';
			element.style.cursor = 'url(\'fontawesome-free-6.6.0-web/svgs/solid/thumbs-up.svg\'), auto';
			removeEventListenersEnhanced();
			removeEventListenersRequest()
		} else if (thumbDownMode) {
			document.body.style.cursor = 'url(\'fontawesome-free-6.6.0-web/svgs/solid/thumbs-down.svg\'), auto';
			element.style.cursor = 'url(\'fontawesome-free-6.6.0-web/svgs/solid/thumbs-down.svg\'), auto';
			removeEventListenersEnhanced();
			removeEventListenersRequest()
		} else {
			document.body.style.cursor = 'default';
			element.style.cursor = 'help';
			addEventListenersEnhanced()
			richiesta();

		}
	});
}






function handleClick(event) {
	
	event.preventDefault();  // Prevent the default action (like navigation)
	event.stopPropagation(); // Stop the event from bubbling up to parent elements
		
		
	const element = event.target;
	const word = element.textContent.trim();

	// Remove any previous styling
	element.style.backgroundColor = '';
	element.style.color = '';

	// Check the current state and update accordingly
	if (thumbUpMode) {
		if (wordsIDontLike.includes(word)) {
			// Neutralize from dislike list first
			addWordsToList('neutral', [element]);
		}
		if (!wordsILike.includes(word)) {
			// Add to like list and apply styling
			addWordsToList('like', [element]);
			element.style.backgroundColor = 'green';
			element.style.color = 'white';
		} else {
			// If already liked, remove from like list and reset styling
			addWordsToList('neutral', [element]);
		}
	} else if (thumbDownMode) {
		if (wordsILike.includes(word)) {
			// Neutralize from like list first
			addWordsToList('neutral', [element]);
		}
		if (!wordsIDontLike.includes(word)) {
			// Add to dislike list and apply styling
			addWordsToList('dislike', [element]);
			element.style.backgroundColor = 'red';
			element.style.color = 'white';
		} else {
			// If already disliked, remove from dislike list and reset styling
			addWordsToList('neutral', [element]);
		}
	} else {
		// In neutral mode, simply reset styling and remove from both lists
		addWordsToList('neutral', [element]);
		// No specific styling applied here since it's neutral
	}
}

// Add click event listeners to .enhanceble elements
function setupClickListeners() {
	document.body.addEventListener('click', function(event) {
		// Check if the clicked element has either 'enhanceble' or 'enhanced' class
		if (event.target.classList.contains('enhanceble') || event.target.classList.contains('enhanced')) {
			handleClick(event);
		}
	});
}

function addWordsToList(type, elements) {
	elements.forEach(element => {
		const word = element.textContent.trim();

		if (type === 'like') {
			if (wordsIDontLike.includes(word)) {
				const index = wordsIDontLike.indexOf(word);
				if (index > -1) {
					wordsIDontLike.splice(index, 1);
				}
			}
			if (!wordsILike.includes(word)) {
				wordsILike.push(word);
			}
		} else if (type === 'dislike') {
			if (wordsILike.includes(word)) {
				const index = wordsILike.indexOf(word);
				if (index > -1) {
					wordsILike.splice(index, 1);
				}
			}
			if (!wordsIDontLike.includes(word)) {
				wordsIDontLike.push(word);
			}
		} else if (type === 'neutral') {
			if (wordsILike.includes(word)) {
				const index = wordsILike.indexOf(word);
				if (index > -1) {
					wordsILike.splice(index, 1);
				}
			}
			if (wordsIDontLike.includes(word)) {
				const index = wordsIDontLike.indexOf(word);
				if (index > -1) {
					wordsIDontLike.splice(index, 1);
				}
			}
		}
	});
}


// Reset all modes and highlight states
function resetModes() {

	pronounceMode = false;
	thumbUpMode = false;
	thumbDownMode = false;

	const pronounceButton = document.getElementById("togglePronounce");
	const thumbUpButton = document.getElementById("toggle-thumb-up");
	const thumbDownButton = document.getElementById("toggle-thumb-down");

	if (pronounceButton) {
		pronounceButton.style.backgroundColor = '';
	}
	if (thumbUpButton) {
		thumbUpButton.style.backgroundColor = '';
	}
	if (thumbDownButton) {
		thumbDownButton.style.backgroundColor = '';
	}

	// Update cursor based on the current mode without resetting element colors
	updateCursor();
}


// Function to store the original style of each element
function storeOriginalStyles() {
	document.querySelectorAll('.enhanceble').forEach(element => {
		if (!originalStyles.has(element)) {
			originalStyles.set(element, {
				backgroundColor: element.style.backgroundColor,
				color: element.style.color
			});
		}
	});
}

// Function to initialize MutationObserver
function initializeMutationObserver() {
	const observer = new MutationObserver((mutations) => {
		mutations.forEach((mutation) => {
			if (mutation.addedNodes.length) {
				storeOriginalStyles();
			}
		});
	});

	// Observe the document body for added nodes
	observer.observe(document.body, { childList: true, subtree: true });
}

// Call this function to set up the observer



// Setup event listeners for mode toggles
function setupPronounceToggle() {
	const pronounceButton = document.getElementById("togglePronounce");
	if (pronounceButton) {
		pronounceButton.addEventListener("click", function() {
			if (!pronounceMode) {
				resetModes();
				pronounceMode = true;
				this.style.backgroundColor = 'green';
				updateCursor();
			} else {
				resetModes();
			}
		});
	}
}

function setupThumbUpToggle() {
	const thumbUpButton = document.getElementById("toggle-thumb-up");
	if (thumbUpButton) {
		thumbUpButton.addEventListener("click", function() {
			if (!thumbUpMode) {
				resetModes();
				thumbUpMode = true;
				this.style.backgroundColor = 'green';
				updateCursor();
			} else {
				resetModes();
			}
		});
	}
}

function setupThumbDownToggle() {
	const thumbDownButton = document.getElementById("toggle-thumb-down");
	if (thumbDownButton) {
		thumbDownButton.addEventListener("click", function() {
			if (!thumbDownMode) {
				resetModes();
				thumbDownMode = true;
				this.style.backgroundColor = 'red';
				updateCursor();
			} else {
				resetModes();
			}
		});
	}
}
// Initialize event listeners and store original styles
function initializeTools() {

	setupPronounceToggle();
	setupThumbUpToggle();
	setupThumbDownToggle();
	setupClickListeners();
	initializeMutationObserver();


}




let selectedVoice = null;


function loadVoices() {
	
	const voices = window.speechSynthesis.getVoices();
	////console.log(voices);

	const aaronVoice = voices.find(voice => voice.name.includes('Aaron'));
	const arthurVoice = voices.find(voice => voice.name.includes('Arthur'));

	if (aaronVoice) {
		selectedVoice = aaronVoice;
		//console.log(`Selected Aaron Voice: ${selectedVoice.name} (${selectedVoice.lang})`);
	} else if (arthurVoice) {
		selectedVoice = arthurVoice;
		//console.log(`Selected Arthur Voice: ${selectedVoice.name} (${selectedVoice.lang})`);
	} else {
		selectedVoice = voices.find(voice => voice.lang.startsWith('en')) || voices[0];
		if (selectedVoice) {
			//console.log(`Fallback Voice: ${selectedVoice.name} (${selectedVoice.lang})`);
		} else {
			console.error("No suitable voice found.");
		}
	}
}

window.speechSynthesis.onvoiceschanged = function() {
	loadVoices();
};

function pronounceWord(word) {
	if (selectedVoice) {
		const utterance = new SpeechSynthesisUtterance(word);
		utterance.voice = selectedVoice;
		utterance.lang = 'en-US'; // Set language to English (United States)
		speechSynthesis.speak(utterance);
	} else {
		console.error("No voice selected.");
	}
}




async function fetchWikimediaAttributionFromUrl(imageUrl) {

	try {
		const filename = imageUrl.split('/').slice(-2).join('/').split('-').slice(1).join('-')
		const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=File:${filename}&prop=imageinfo&iiprop=extmetadata&format=json&origin=*`;

		const response = await fetch(apiUrl);
		const data = await response.json();

		////console.log('API Response:', data); // Log the full API response

		const pages = data.query.pages;
		const pageId = Object.keys(pages)[0];
		const imageInfo = pages[pageId].imageinfo;

		if (imageInfo && imageInfo.length > 0) {
			const metadata = imageInfo[0].extmetadata;
			const artist = metadata.Artist ? metadata.Artist.value : 'Unknown';
			const license = metadata.LicenseShortName ? metadata.LicenseShortName.value : 'Unknown';
			const attributionUrl = metadata.AttributionRequired ? metadata.AttributionRequired.value : imageUrl;


			return {
				artist: artist,
				license: license,
				attributionUrl: attributionUrl
			};
		} else {
			//console.warn('No imageinfo found in response'); // Log if imageinfo is not found
			return null;
		}
	} catch (error) {
		//console.error('Error fetching Wikimedia attribution:', error);
		return null;
	}
}





function removeDuplicateRelations(links) {
    let relationsSet = new Set();
    let uniqueLinks = [];
    let linkCount = {};
    let linkIndex = {};

    for (let link of links) {
        let forwardRelationKey = `${link.source}-${link.target}-${link.relation}`;
        let backwardRelationKey = `${link.target}-${link.source}-${link.relation}`;

        if (!relationsSet.has(forwardRelationKey) && !relationsSet.has(backwardRelationKey)) {
            relationsSet.add(forwardRelationKey);
            relationsSet.add(backwardRelationKey);
            uniqueLinks.push(link);
        }

        let nodePairKey = `${link.source}-${link.target}`;
        if (!linkCount[nodePairKey]) {
            linkCount[nodePairKey] = 0;
            linkIndex[nodePairKey] = 0;
        }
        linkCount[nodePairKey]++;
        linkCount[`${link.target}-${link.source}`] = linkCount[nodePairKey];
    }

    uniqueLinks.forEach(link => {
        let nodePairKey = `${link.source}-${link.target}`;
        link.index = linkIndex[nodePairKey]++;
    });

    return uniqueLinks;
}


async function fetchPoints() {

	try {
		// Make a GET request to the /retrieve endpoint
		const response = await fetch('api/points/retrieve', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		// Check if the response is OK (status in the range 200-299)
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		// Parse the response JSON
		const data = await response.json();
		
		// Assuming data is an object with a property 'points'
		const points = Number(data);
		       
		
		// Update the DOM with the points
		document.getElementById('player-credits').textContent = data;
		
		return points;
		
	} catch (error) {
		console.error('Error fetching points:', error);
		document.getElementById('player-credits').textContent = 'Error retrieving points.';
	}
}




/*function onWordGraph(jsonData) {
	
	const width = window.innerWidth * 0.9;  // Adjust width
	const height = window.innerHeight * 0.9;  // Adjust height
	
	// Create SVG element
	const svg = d3.select("#popup-relation-graph").append("svg")
		.attr("width", width)
		.attr("height", height);
	
	// Set up D3 force simulation
	const simulation = d3.forceSimulation()
		.force("link", d3.forceLink().id(d => d.id).distance(100))
		.force("charge", d3.forceManyBody().strength(-500))
		.force("center", d3.forceCenter(width / 2, height / 2));
	
	// Data for nodes and links
	const graph = jsonData;
	
	// Create link elements
	const link = svg.append("g")
		.attr("class", "links")
		.selectAll("line")
		.data(graph.links)
		.enter().append("line")
		.attr("stroke", "#999")
		.attr("stroke-opacity", 0.6)
		.attr("stroke-width", 1);
	
	// Create node elements
	const node = svg.append("g")
		.attr("class", "nodes")
		.selectAll("g")
		.data(graph.words)
		.enter().append("g")
		.attr("class", "node")
		.call(d3.drag()
			.on("start", dragstarted)
			.on("drag", dragged)
			.on("end", dragended));
	
	// Add circles to nodes
	node.append("circle")
		.attr("r", d => d.isCore ? 12 : 8)
		.attr("fill", "AliceBlue");
	
	// Add labels to nodes
	node.append("text")
		.attr("dx", 15)
		.attr("dy", ".35em")
		.text(d => d.label);
	
	// Add relation labels to links
	svg.append("g")
		.attr("class", "labels")
		.selectAll("text")
		.data(graph.links)
		.enter().append("text")
		.attr("x", d => (d.source.x + d.target.x) / 2)
		.attr("y", d => (d.source.y + d.target.y) / 2)
		.attr("class", "relation-label")
		.text(d => d.relation);
	
	// Start the simulation
	simulation.nodes(graph.words).on("tick", ticked);
	simulation.force("link").links(graph.links);
	
	// Update positions on each tick
	function ticked() {
		link
			.attr("x1", d => d.source.x)
			.attr("y1", d => d.source.y)
			.attr("x2", d => d.target.x)
			.attr("y2", d => d.target.y);
	
		node
			.attr("transform", d => `translate(${d.x},${d.y})`);
	
		svg.selectAll(".relation-label")
			.attr("x", d => (d.source.x + d.target.x) / 2)
			.attr("y", d => (d.source.y + d.target.y) / 2);
	}
	
	// Dragging functions
	function dragstarted(event, d) {
		if (!event.active) simulation.alphaTarget(0.3).restart();
		d.fx = d.x;
		d.fy = d.y;
	}
	
	function dragged(event, d) {
		d.fx = event.x;
		d.fy = event.y;
	}
	
	function dragended(event, d) {
		if (!event.active) simulation.alphaTarget(0);
		d.fx = null;
		d.fy = null;
	}
	
	// Handle window resize
	window.addEventListener("resize", () => {
		const newWidth = window.innerWidth * 0.9;
		const newHeight = window.innerHeight * 0.9;
	
		svg.attr("width", newWidth)
		   .attr("height", newHeight);
	
		simulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2));
		simulation.restart();
	});
}*/






/*var cards = [];
var control = {};
var currentAjaxRequest = null; // Global variable to store the current AJAX request
	
const enhance = {};
let removedWords = [];
var clozeActive = false;
	
let wikiText = localStorage.getItem("text").trim();
	
	
jQuery(document).ready(function($) {
	
	$("#loading, #relations, #checkAnswers").hide();
	 $("#sendData").hide();
	 $("#playtheMemory, #togglePronounce, #generateCloze").hide();
	 var attributionElement = document.getElementById('attribution');
	 var attributionModified = document.getElementById('attribution-modified');
	 
	
		 
	 $("#txtarea").on('input', function() {
		 var currentValue = $(this).val().trim();
		 
		 if (currentValue.length >= 1) {
			 if (currentValue === wikiText) {
				 modified = "falseFromWiki";
				 attributionElement.style.display = 'block';
				 attributionModified.style.display = 'none';
			 } else {
				 // Creiamo una regex per verificare se currentValue è contenuto in wikiText, anche se con modifiche
				 var regex = new RegExp(currentValue.split('').join('.*'), 'i');
				 if (regex.test(wikiText)) {
					 modified = "trueFromWiki";
					 attributionElement.style.display = 'none';
					 attributionModified.style.display = 'block';
				 } else {
					 modified = "false";
					 attributionElement.style.display = 'none';
					 attributionModified.style.display = 'none';
				 }
			 }
		 } else {
			 attributionElement.style.display = 'none';
			 attributionModified.style.display = 'none';
		 }
	 });
	
	
	
			$("#txtarea").on('input', function() {
									
					var currentValue = $(this).val().trim();	
								
				if(currentValue.length >= 1) {		
								
									
					if (!currentText.includes(currentValue) && localStorage.getItem("fromWiki") == "true") {
											
						modified = "true";					
					attributionElement.style.display = 'none';
					attributionModified.style.display = 'block';
					
					} 
						
				
				else if (currentText.includes(currentValue)){
					
					modified = "falseFromWiki";
					attributionElement.style.display = 'block';
					attributionModified.style.display = 'none';
					
				}
								
				else {
					
					modified = "false";
				}
				}
				
				if (currentValue.length < 1){
					
					
					attributionElement.style.display = 'none';
					attributionModified.style.display = 'none';
				}
				});
  
	
		document.addEventListener('keypress', function (e) {
			if (e.key === 'Enter') {
				
				if(!clozeActive)
				$("#analyze").click();
	
				if(clozeActive)
				$("#checkAnswers").click();
			}
		});
		
	
	$("#analyze").click(function() {
	if (($("#txtarea").val()).trim() === wikiText) modified = "falseFromWiki";
	else modified = "false";
    
	$("#analyze").hide();
    
	if ($("#txtarea").val() == null || $("#txtarea").val() == "") {
		$("#analyze").show();
		$("#txtarea").attr("placeholder", "INSERISCI PRIMA UN TESTO O UNA PAROLA");
		return;
	}
    
	$("#relations").empty();
	$(".scroll-container").empty();
	$("#relations, #playtheMemory").hide(); 
	$("#result").empty();
	$("#sendData").hide();
	
	var fruit = $('#txtarea').val();
	var title = localStorage.getItem("title");
	var urlJavaText = "AjaxHandler";
	
	// Abort any previous AJAX request
	if (currentAjaxRequest) {
		currentAjaxRequest.abort();
	}
	
	// Store the current AJAX request in the global variable
	currentAjaxRequest = $.ajax({
		beforeSend: function(xhr) {
			$("#loading").show();
			$("#recognizeButton").hide();
			$("#stopButton").show();
		},
		type: "POST",
		url: urlJavaText,
		data: {
			'action': "doPost",
			'fruit': fruit,
			'apple': title,
			'wikiPage': 'https://en.wikipedia.org/wiki/' + title,
			'modified': modified
		},
		success: function(data) {
			// Ensure the AJAX request is properly handled
			handleAnalyzeSuccess(data);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (textStatus !== "abort") {
				console.error("AJAX Error: ", textStatus, errorThrown);
				$("#result").html("Error during AJAX request.");
				$("#analyze").show();
			}
		},
		complete: function() {
			currentAjaxRequest = null; // Reset the current AJAX request
		}
	});
});
	
function handleAnalyzeSuccess(data) {
	$("#txtarea").val("");
	localStorage.setItem("fromWiki", "false");
	$("#analyze, #generateCloze").show();
	localStorage.setItem("title", "");
	localStorage.setItem("text", "");
    
	var values = JSON.parse(data);
	$("#loading, #stopButton").hide();
	$("#result").html(values.text);
	$("#playtheMemory, #togglePronounce").show();
	$("#sendData").show();
    
	localStorage.setItem('cardsData', values.cards);
	cards = JSON.parse(values.cards);
    
	var relations = values.relations;
	relationGraph(relations);
    
	setupEnhancebles(values);
}
	
function setupEnhancebles(values) {
	let enhancebles = document.querySelectorAll('.enhanceble');
	let clickedWords = [];
	
	enhancebles.forEach((link, index) => {
		link.addEventListener('click', function() {
			let word = this.textContent.trim();
			this.classList.toggle('active');
	
			if (this.classList.contains('active')) { 
				this.style.backgroundColor = 'red';
				if (!clickedWords.includes(word)) {
					clickedWords.push(word);
				}
			} else {
				this.style.backgroundColor = '';
				let wordIndex = clickedWords.indexOf(word);
				if (wordIndex !== -1) {
					clickedWords.splice(wordIndex, 1);
				}
			}
		});
	});
	
	document.getElementById('generateCloze').addEventListener('click', function() {
		generateCloze(clickedWords);
	});
}
	
function generateCloze(clickedWords) {
	$("#generateCloze").hide();
	$("#checkAnswers").show();
	$("#txtarea").val("");
	
	let elementsArray = document.querySelectorAll(".enhanced");
    
	elementsArray.forEach(function(elem, index) {
		var word = elem.textContent.trim();
		var wordObj = { id: index, word: word };
		removedWords.push(wordObj);
	
		function scrambleWord(word) {
			if (word.length <= 3) {
				return word; // No scrambling for short words
			}
			let middle = word.slice(1, -1).split('').sort(() => 0.5 - Math.random()).join('');
			while (middle === word.slice(1, -1)) {
				middle = word.slice(1, -1).split('').sort(() => 0.5 - Math.random()).join('');
			}
			return word[0] + middle + word[word.length - 1];
		}
	
		var scrambledWord = scrambleWord(word);
		var inputField = document.createElement('input');
		inputField.type = 'text';
		inputField.classList.add('input-element');
		inputField.setAttribute('style', 'width:200px');
		inputField.style.display = "inline";
		inputField.placeholder = scrambledWord;
		inputField.classList.add('cloze-input');
		inputField.dataset.id = index;
	
		elem.parentNode.replaceChild(inputField, elem);
	});
	
	clozeActive = true;
}
	
	
	$("#stopButton").click(function() {
		if (currentAjaxRequest) {
			currentAjaxRequest.abort();
			currentAjaxRequest = null;
			$("#loading").hide();
			$("#recognizeButton").show();
			$("#stopButton").hide();
			$("#analyze").show();
		}
	});
	
	
	
	$(document).ready(function() {
		// Event handler for clicking on elements with class 'enhanced'
		$(document).on('click', '.enhanced', function(e) {
			e.preventDefault();
	
			var credits = document.getElementById("player-credits");
			var linkText = $(this).text();
			var linkTitle = $(this).attr("title");
			var popupId = $(this).attr("id");
	
			creaFinestraModale(credits.innerHTML, linkText);
			openModal();
	
			// Store linkText and linkTitle in document data
			$(document).data('linkText', linkText);
			$(document).data('linkTitle', linkTitle);
	
			// Handler for clicking on #generateGraph button
			$("#generateGraph").off('click').on('click', function() {
				handleGenerateGraph(credits, popupId);
			});
	
			// Handler for clicking on #getDefinition button
			$("#getDefinition").off('click').on('click', function() {
				handleGetDefinition(credits, popupId);
			});
		});
	
	    
	});
	
});
	
function openModal() {
	var modal = document.getElementById("myModal");
	modal.style.display = "block";
}
	
function closeModal() {
	var modal = document.getElementById("myModal");
	modal.style.display = "none";
}
	
function getPulsanti(crediti) {
	var buttons = [
		{ id: 'generateGraph', text: 'Ottieni connessioni (-30)', creditiNecessari: 30, function: 'graph' },
		{ id: 'getDefinition', text: 'Ottieni la definizione (-50)', creditiNecessari: 50, function: 'def' },
		{ id: 'getTranslation', text: 'Ottieni la traduzione (-80)', creditiNecessari: 80, function: 'translation' },
		{ id: 'getInformation', text: 'Ottieni informazioni (-70)', creditiNecessari: 70, function: 'information' }
	];
	
	// Rimuovi i pulsanti con crediti necessari superiori a quelli disponibili
	buttons = buttons.filter(function(button) {
		return button.creditiNecessari <= crediti;
	});
	
	return buttons;
}
	
function creaFinestraModale(credits, title) {
	var finestraModaleEsistente = document.getElementById('myModal');
	if (finestraModaleEsistente) {
		document.body.removeChild(finestraModaleEsistente);
	}
	
	var nuovaFinestraModale = document.createElement('div');
	nuovaFinestraModale.id = 'myModal';
	nuovaFinestraModale.className = 'modal';
	
	var imgElement = document.createElement('img');
	imgElement.id = 'alarm';
	imgElement.width = 30;
	imgElement.height = 30;
	imgElement.src = 'https://upload.wikimedia.org/wikipedia/commons/8/83/Emergency_Light.gif';
	
	var spanClose = document.createElement('span');
	spanClose.className = 'close';
	spanClose.innerHTML = '&times;';
	spanClose.addEventListener('click', function() {
		document.body.removeChild(nuovaFinestraModale);
	});
	
	var bElement = document.createElement('b');
	bElement.id = title;
	bElement.innerHTML = title + "<br>";
	
	var modalContent = document.createElement('div');
	modalContent.className = 'modal-content';
	modalContent.appendChild(imgElement);
	modalContent.appendChild(bElement);
	modalContent.appendChild(spanClose);
	
	buttons = getPulsanti(credits);
	
	buttons.forEach(function(button) {
		var buttonElement = document.createElement('button');
		buttonElement.id = button.id;
		buttonElement.className = 'modalButton';
		buttonElement.innerHTML = button.text;
	
		buttonElement.addEventListener('click', function() {
			////////console.log('Hai cliccato su ' + button.id);
		});
	
		modalContent.appendChild(buttonElement);
	});
	
	var columnElement = document.createElement('div');
	columnElement.className = 'column';
	columnElement.appendChild(modalContent);
	
	nuovaFinestraModale.appendChild(columnElement);
	
	document.body.appendChild(nuovaFinestraModale);
	nuovaFinestraModale.style.display = 'none';
}
	
$("#stopButton").click(function() {
	if (currentAjaxRequest) {
		currentAjaxRequest.abort(); // Abort the request
	   // //////console.log("AJAX request aborted.");
		$("#loading").hide();
		$("#stopButton").hide();
		$("#recognizeButton").show();
	}
});
	
	
// Example file URL
const fileUrl = 'http://commons.wikimedia.org/wiki/Special:FilePath/OpenSystemRepresentation.svg?width=300';
	
// Extract file name from the URL
const fileName = fileUrl.split('/').pop().split('?')[0];
	
// Construct API endpoint for metadata
const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${fileName}&prop=imageinfo&iiprop=extmetadata&format=json`;
////////console.log("--------------------------" + fileName);
	
function getImageInfo (fileUrl) {
	
	// Extract file name from the URL
const fileName = fileUrl.split('/').pop().split('?')[0];
	
// Construct API endpoint for metadata
const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${fileName}&prop=imageinfo&iiprop=extmetadata&format=json`;
////////console.log("--------------------------" + fileName);
// Fetch data from Wikimedia Commons API
fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
	// Extract relevant information from API response
	const pages = data.query.pages;
	const pageId = Object.keys(pages)[0]; // Assuming there's only one page in the response
	const metadata = pages[pageId].imageinfo[0].extmetadata;
	
	// Access license and author information
	const license = metadata.LicenseShortName.value;
	const author = metadata.Artist.value;
	
	// Log or use the retrieved information
	//////console.log(`License: ${license}`);
	//////console.log(`Author: ${author}`);
  })
  .catch(error => {
   // //console.error('Error fetching data:', error);
  });
 }
	
 
 
 function generateClozeExercise(htmlText) {
	 // Regular expression to match anchor tags with specific attributes
	 const regex = /<a\s+id="\d+"\s+class="(enhanceble|enhanced)"\s+(href="[^"]*"\s+)?(title="[^"]*"\s+)?target="_blank"\s+value="([^"]*)">([^<]*)<\/a>/g;
	
	 // Replace matched elements with blanks where necessary
	 const clozeExercise = htmlText.replace(regex, (match, className, hrefAttr, titleAttr, valueAttr, content) => {
		 // Determine if to replace with a blank based on className and valueAttr
		 if (className === 'enhanceble') {
			 return `<span class="gap">[_____] </span>`;
		 } else {
			 return content; // Keep the original content if no replacement is needed
		 }
	 });
	
	 return clozeExercise;
 }
	
	
	
 function closePopup(popupId) {
	 const popup = document.getElementById(popupId);
	 if (popup) {
		 popup.style.display = 'none';
	}
}
	
function handleInteraction(event) {
	const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	
	if (isTouchDevice) {
		handleTouch(event); 
	} else {
		handleClick(event);
	}
}
	
	
	function handleGenerateGraph(creditsElement, popupId) {
		
			if (parseInt(creditsElement.innerHTML) > 49) {
				$(".scroll-container").empty().show();
	
				var linkText = $(document).data('linkText');
				var linkTitle = $(document).data('linkTitle');
	
				$.ajax({
					type: "POST",
					url: 'GraphHandler',
					data: {
						'action': "doPost",
						'fruit': linkText,
						'apple': linkTitle
					},
					success: function(data) {
						localStorage.setItem("graph", data);
						creditsElement.innerHTML = parseInt(creditsElement.innerHTML) - 30;
						window.open('graph.jsp', '_blank');
						closeModal();
					},
					error: function(error) {
						//console.error("Error during AJAX call: ", error);
					}
				});
			}
		}
	
		function handleGetDefinition(creditsElement, popupId) {
			if (parseInt(creditsElement.innerHTML) > 49) {
				var linkText = $(document).data('linkText');
				var linkTitle = $(document).data('linkTitle');
	
				$.ajax({
					type: "POST",
					url: 'DefHandler',
					data: {
						'action': "doPost",
						'fruit': linkText,
						'apple': linkTitle,
						'subtract': "true"
					},
					success: function(data) {
						document.getElementById("popup" + popupId).querySelector("#definition").innerHTML = data;
						creditsElement.innerHTML = parseInt(creditsElement.innerHTML) - 50;
						closeModal();
					},
					error: function(error) {
						//console.error("Error during AJAX call: ", error);
					}
				});
			} else {
				alert("Il tuo credito non è sufficiente. Devi avere almeno 50 crediti per eseguire questa azione.");
			}
		}
	
	
		
		async function fetchWikimediaAttributionFromUrl(imageUrl) {
			try {
				const filename = imageUrl.split('/').slice(-2).join('/').split('-').slice(1).join('-')
				const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=File:${filename}&prop=imageinfo&iiprop=extmetadata&format=json&origin=*`;
	
				const response = await fetch(apiUrl);
				const data = await response.json();
	
				//////console.log('API Response:', data); // Log the full API response
	
				const pages = data.query.pages;
				const pageId = Object.keys(pages)[0];
				const imageInfo = pages[pageId].imageinfo;
	
				if (imageInfo && imageInfo.length > 0) {
					const metadata = imageInfo[0].extmetadata;
					const artist = metadata.Artist ? metadata.Artist.value : 'Unknown';
					const license = metadata.LicenseShortName ? metadata.LicenseShortName.value : 'Unknown';
					const attributionUrl = metadata.AttributionRequired ? metadata.AttributionRequired.value : imageUrl;
					
	
					return {
						artist: artist,
						license: license,
						attributionUrl: attributionUrl
					};
				} else {
					//console.warn('No imageinfo found in response'); // Log if imageinfo is not found
					return null;
				}
			} catch (error) {
				//console.error('Error fetching Wikimedia attribution:', error);
				return null;
			}
		}
		
		  
		  
		// Global variable to track IDs of correct answers that have already been sent to the servlet
		var sentCorrectAnswers = new Set();
		var clozeScore = 0;
		
	
		function checkAnswers() {
		  
			var userAnswers = [];
			var inputFields = document.querySelectorAll(".cloze-input");
	
			inputFields.forEach(function(inputField) {
				var id = inputField.dataset.id;
				var answer = inputField.value.trim();
				userAnswers.push({ id: parseInt(id), word: answer });
			});
	
			// Reset clozeScore and clear countedCorrectAnswers
		    
			var countedCorrectAnswers = new Set();
			var newAnswer = 0;
	
			// Compare userAnswers with removedWords and color the input fields
			userAnswers.forEach(function(userAnswer) {
				var correctAnswer = removedWords.find(wordObj => wordObj.id === userAnswer.id);
				var inputField = document.querySelector(`.cloze-input[data-id='${userAnswer.id}']`);
				if (correctAnswer && correctAnswer.word === userAnswer.word && !countedCorrectAnswers.has(correctAnswer.id)) {
					inputField.style.backgroundColor = 'lightgreen';
					newAnswer++;
					inputField.readOnly = true; // Make input field read-only once correct
					clozeScore += 5; // Add 5 points for each correct answer
					countedCorrectAnswers.add(correctAnswer.id); // Mark as counted
					
	
				} else {
					inputField.style.backgroundColor = 'lightcoral';
				}
			});
			
			sendScoreToServlet(5*newAnswer);
		}
		   
		   
					   
		   
		   function sendScoreToServlet(finalScore) {
				  	
						if (finalScore > 0) {
					  const xhr = new XMLHttpRequest();
					  xhr.open("POST", "LoadPoints", true);
					  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
					  xhr.onreadystatechange = function () {
						  if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
							  //////console.log("Score sent successfully.");
						  }
					  };
					  xhr.send(`finalScore=${finalScore}`);
				  }
				  }
*/