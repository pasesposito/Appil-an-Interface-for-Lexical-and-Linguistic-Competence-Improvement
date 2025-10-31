
document.addEventListener('DOMContentLoaded', function() {
	
			
	// Function to get CSRF token and header from meta tags
	function getCsrfToken() {
	    const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
	    const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');
	    return { csrfToken, csrfHeader };
	}
	
    function getDateDaysAgo(daysAgo) {
        let date = new Date();
        date.setDate(date.getDate() - daysAgo);
        let year = date.getFullYear();
        let month = String(date.getMonth() + 1).padStart(2, '0');
        let day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    }
	
	/* async function fetchFeaturedArticle(date) {
		
    let languageCode = 'en'; // English
    let baseUrl = 'https://api.wikimedia.org/feed/v1/wikipedia/';
    let apiUrl = `${baseUrl}${languageCode}/featured/${date}`;
    let normalizedDate = date.replace(/\//g, '-'); // Adjust format if needed

    try {
        // Check if the article already exists in the database
        let checkUrl = `api/articles/CheckArticle?featured_date=${encodeURIComponent(normalizedDate)}`;
        let checkResponse = await fetch(checkUrl);
        let checkData = await checkResponse.json();

        if (checkData.exists) {
            // Fetch article details from your server if it exists
            let fetchFromServerUrl = `api/articles/GetArticle?featured_date=${encodeURIComponent(normalizedDate)}`;
            let fetchFromServerResponse = await fetch(fetchFromServerUrl);
            let articleData = await fetchFromServerResponse.json();
			
			if (articleData.title != null && articleData.extract != null) {
            // Add the article to the page
            addPage(articleData.title, articleData.extract);
            addFeaturedArticleItem(
                articleData.thumbnailUrlSource,
                articleData.title,
                articleData.extract,
                articleData.thumbnailTitle,
                articleData.thumbnailLicense,
                articleData.thumbnailArtist,
                articleData.thumbnailCredit,
                articleData.thumbnailDescription,
                articleData.thumbnailUrlSource
            );
			
			}

            return; // Skip fetching from Wikipedia API
        }
		
		
		
        // Proceed to fetch the article from Wikipedia if it doesn't exist
        let apiResponse = await fetch(apiUrl);
		
		console.log(apiResponse.json());
		
		var csrfHeader = $("meta[name='_csrf_header']").attr("content");
		var csrfToken = $("meta[name='_csrf']").attr("content");

        if (!apiResponse.ok || isInvalidDataStructure(apiResponse)) {
			
			let articleData = {
			              title: "",
			              extract: "",
			              thumbnailUrl: "",
			              thumbnailTitle: "",
			              thumbnailLicense: "",
			              thumbnailArtist: "",
			              thumbnailCredit: "",
			              thumbnailDescription: "",
			              thumbnailUrlSource: "",
			              featuredDate: normalizedDate
			          };
					
           			
					  let storeResponse = await fetch('api/articles/storeEmptyArticle', {
					                  method: 'POST',
					                  headers: {
					                      'Content-Type': 'application/json',
					                      [csrfHeader]: csrfToken
					                  },
					                  body: JSON.stringify(normalizedDate) // Ensure the date is in the correct format
					              });

					              if (!storeResponse.ok) {
					                  console.error(`Failed to store empty article data. HTTP Status: ${storeResponse.status}`);
					                  throw new Error(`HTTP error! Status: ${storeResponse.status}`);
					              }

					              console.log('Empty article date stored successfully.');
					              return; // Exit the function early
					          }
	
        let data = await apiResponse.json();
		
        if (data.tfa && data.tfa.titles && data.tfa.thumbnail) {
            let extract = data.tfa.extract;
            let normalizedTitle = data.tfa.titles.normalized;
            let thumbnailUrlSource = data.tfa.thumbnail.source;		
						
			
            let imgInfo = await fetchAttribution(data.tfa.originalimage.source);
			
			if (!imgInfo) {
				
                throw new Error('Failed to fetch image information.');
            }

            let articleData = {
                title: normalizedTitle,
                extract: extract,
                thumbnailUrl: thumbnailUrlSource,
                thumbnailTitle: imgInfo.title,
                thumbnailLicense: imgInfo.license,
                thumbnailArtist: imgInfo.artist,
                thumbnailCredit: imgInfo.credit,
                thumbnailDescription: imgInfo.description,
                thumbnailUrlSource: thumbnailUrlSource,
                featuredDate: normalizedDate
            };
			
			
			
            // Send data to the server
            let storeResponse = await fetch('api/articles/storeData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
					[csrfHeader]: csrfToken
					
				},
                body: JSON.stringify(articleData)
            });

            if (!storeResponse.ok) {
                throw new Error(`HTTP error! Status: ${storeResponse.status}`);
            }

            let storeResult = await storeResponse.json();
           

            // Add the article to the page
            addPage(normalizedTitle, extract);
            addFeaturedArticleItem(
                thumbnailUrlSource,
                normalizedTitle,
                extract,
                imgInfo.title,
                imgInfo.license,
                imgInfo.artist,
                imgInfo.credit,
                imgInfo.description,
                thumbnailUrlSource
            );
        } else {
            console.error('Invalid data structure', data);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
} */

async function fetchFeaturedArticle(date) {
    let languageCode = 'en'; // English
    let baseUrl = 'https://api.wikimedia.org/feed/v1/wikipedia/';
    let apiUrl = `${baseUrl}${languageCode}/featured/${date}`;
    let normalizedDate = date.replace(/\//g, '-'); // Adjust format if needed

    try {
        // Check if the article already exists in the database
        let checkUrl = `api/articles/CheckArticle?featured_date=${encodeURIComponent(normalizedDate)}`;
        let checkResponse = await fetch(checkUrl);
        let checkData = await checkResponse.json();

        if (checkData.exists) {
            // Fetch article details from your server if it exists
            let fetchFromServerUrl = `api/articles/GetArticle?featured_date=${encodeURIComponent(normalizedDate)}`;
            let fetchFromServerResponse = await fetch(fetchFromServerUrl);
            let articleData = await fetchFromServerResponse.json();
			
            // Check for title and extract to avoid empty articles
            if (articleData && articleData.title && articleData.extract) {
                addPage(articleData.title, articleData.extract);
                addFeaturedArticleItem(
                    articleData.thumbnailUrlSource,
                    articleData.title,
                    articleData.extract,
                    articleData.thumbnailTitle,
                    articleData.thumbnailLicense,
                    articleData.thumbnailArtist,
                    articleData.thumbnailCredit,
                    articleData.thumbnailDescription,
                    articleData.thumbnailUrlSource
                );
            } else {
                console.error('Fetched article data is incomplete:', articleData);
            }
            return; // Skip fetching from Wikipedia API
        }

        // Proceed to fetch the article from Wikipedia if it doesn't exist
        let apiResponse = await fetch(apiUrl);

        // Check if API call was successful
        if (!apiResponse.ok) {
            console.error(`Failed to fetch from Wikipedia API. Status: ${apiResponse.status}`);
            return; // Exit if the API call fails
        }

        let data = await apiResponse.json();

        // Validate the structure of the data before processing
        if (data.tfa && data.tfa.titles && data.tfa.thumbnail) {
            let extract = data.tfa.extract;
            let normalizedTitle = data.tfa.titles.normalized;
            let thumbnailUrlSource = data.tfa.thumbnail.source;

            // Fetch image attribution info
            let imgInfo = await fetchAttribution(data.tfa.originalimage.source);
            if (!imgInfo) {
                throw new Error('Failed to fetch image information.');
            }

            // Prepare article data for storing
            let articleData = {
                title: normalizedTitle,
                extract: extract,
                thumbnailUrl: thumbnailUrlSource,
                thumbnailTitle: imgInfo.title,
                thumbnailLicense: imgInfo.license,
                thumbnailArtist: imgInfo.artist,
                thumbnailCredit: imgInfo.credit,
                thumbnailDescription: imgInfo.description,
                thumbnailUrlSource: thumbnailUrlSource,
                featuredDate: normalizedDate
            };

            // Only store if the article has valid data
            if (articleData.title && articleData.extract) {
                let csrfHeader = $("meta[name='_csrf_header']").attr("content");
                let csrfToken = $("meta[name='_csrf']").attr("content");

                // Send data to the server
                let storeResponse = await fetch('api/articles/storeData', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [csrfHeader]: csrfToken
                    },
                    body: JSON.stringify(articleData)
                });

                if (!storeResponse.ok) {
                    throw new Error(`HTTP error! Status: ${storeResponse.status}`);
                }

                // Add the article to the page
                addPage(normalizedTitle, extract);
                addFeaturedArticleItem(
                    thumbnailUrlSource,
                    normalizedTitle,
                    extract,
                    imgInfo.title,
                    imgInfo.license,
                    imgInfo.artist,
                    imgInfo.credit,
                    imgInfo.description,
                    thumbnailUrlSource
                );
            } else {
                console.error('Article data is incomplete or invalid:', articleData);
                // Store empty article as a fallback
                await storeEmptyArticle(normalizedDate, csrfHeader, csrfToken);
            }
        } else {
            console.error('Invalid data structure', data);
            // Store empty article if data is invalid
            await storeEmptyArticle(normalizedDate, csrfHeader, csrfToken);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Function to store empty article
async function storeEmptyArticle(normalizedDate, csrfHeader, csrfToken) {
    let storeResponse = await fetch('api/articles/storeEmptyArticle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken
        },
        body: JSON.stringify(normalizedDate) // Store empty article
    });

    if (!storeResponse.ok) {
        console.error(`Failed to store empty article data. HTTP Status: ${storeResponse.status}`);
    } else {
        console.log('Empty article date stored successfully.');
    }
}





	async function fetchFeaturedArticlesForLast12Days() {
	    for (let i = 0; i < 12; i++) {
	        let date = getDateDaysAgo(i);
	        fetchFeaturedArticle(date);
	        // Optional: Delay between requests
	        await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second delay
			
	    }
	}

	// Call the function to start fetching articles
	fetchFeaturedArticlesForLast12Days();
	
	
	// Function to check if the data structure is valid
	function isInvalidDataStructure(apiResponse) {
	    // Check for required properties and their types
	    if (!apiResponse.hasOwnProperty('title') || typeof apiResponse.title !== 'string') return true;
	    if (!apiResponse.hasOwnProperty('extract') || typeof apiResponse.extract !== 'string') return true;
	    if (!apiResponse.hasOwnProperty('thumbnailUrl') || typeof apiResponse.thumbnailUrl !== 'string') return true;
	    if (!apiResponse.hasOwnProperty('thumbnailTitle') || typeof apiResponse.thumbnailTitle !== 'string') return true;
	    if (!apiResponse.hasOwnProperty('thumbnailLicense') || typeof apiResponse.thumbnailLicense !== 'string') return true;
	    if (!apiResponse.hasOwnProperty('thumbnailArtist') || typeof apiResponse.thumbnailArtist !== 'string') return true;
	    if (!apiResponse.hasOwnProperty('thumbnailCredit') || typeof apiResponse.thumbnailCredit !== 'string') return true;
	    if (!apiResponse.hasOwnProperty('thumbnailDescription') || typeof apiResponse.thumbnailDescription !== 'string') return true;
	    if (!apiResponse.hasOwnProperty('thumbnailUrlSource') || typeof apiResponse.thumbnailUrlSource !== 'string') return true;
	    
	    // Additional checks can be added as needed
	    return false; // Return false if all checks pass (meaning structure is valid)
	}

	
	async function fetchAttribution(imageUrl) {
				
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

   
    

    function fetchFeaturedArticlesForLastWeek() {
		
        for (let i = 0; i < 12; i++) {
            let date = getDateDaysAgo(i);
            fetchFeaturedArticle(date);
        }
        
        // Ensure title is defined
		$(".attribution").append('<p id="attribution" style="color:white">This page uses material from Wikipedia which is released under the <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank">Creative Commons Attribution-Share-Alike License 3.0</a></p>');

    }
    

function addFeaturedArticleItem(imgSrc, title, articlePreview, imgTitle, imgLicense, imgArtist, imgCredit, imgDescription, imgUrl) {
    
	const newSectionItem = document.createElement('div');
    newSectionItem.classList.add('section-item');

    const ajaxElement = document.createElement('a');
    ajaxElement.setAttribute("class", "clickOn");
    ajaxElement.setAttribute("href", "/learningpage");
    ajaxElement.setAttribute("value", title); 
    ajaxElement.setAttribute("target", "_blank");
    ajaxElement.classList.add('no-underline');

    // Container for image and attribution overlay
    const imgContainer = document.createElement('div');
    imgContainer.style.position = 'relative';

    const imgElement = document.createElement('img');
    imgElement.src = imgSrc;
    imgElement.setAttribute("id", "picturesOfTheDay");
    imgElement.style.width = '300px';
    imgElement.style.height = '300px';
    imgElement.style.objectFit = 'cover';
    imgElement.alt = 'Image';

    // Information icon
    const infoIcon = document.createElement('div');
    infoIcon.classList.add('info-icon');
    infoIcon.innerHTML = 'i';
    
    // Attribution overlay with complex HTML content
    const attributionOverlay = document.createElement('div');
    attributionOverlay.classList.add('attribution-overlay');
    attributionOverlay.innerHTML = `
        <div><strong>Title:</strong> ${imgTitle}</div>
        <div><strong>Artist:</strong> ${imgArtist}</div>
        <div><strong>Credit:</strong> ${imgCredit}</div>
        <div><strong>License:</strong> ${imgLicense}</div>
    `;
    imgContainer.appendChild(imgElement);
    imgContainer.appendChild(attributionOverlay);
    imgContainer.appendChild(infoIcon);

    // Show overlay on mouse enter and hide on mouse leave
    infoIcon.addEventListener('mouseenter', () => {
        attributionOverlay.style.display = 'block';
    });

    infoIcon.addEventListener('mouseleave', () => {
        attributionOverlay.style.display = 'none';
    });

    const textContainer = document.createElement('div');
    textContainer.classList.add('preview-text');
	textContainer.classList.add('.text-container');
    
    const titleElement = document.createElement('h3');
    titleElement.innerHTML = title;
    textContainer.appendChild(titleElement);

    const articleElement = document.createElement('div');
    articleElement.innerHTML = articlePreview;
    textContainer.appendChild(articleElement);

    const attribution = document.createElement('p');
    attribution.id = 'attribution';
    attribution.style.color = 'black';
    attribution.style.fontSize = '10px';
    attribution.style.margin = '10px';
    attribution.style.fontFamily = 'Roboto';
    attribution.style.lineHeight = '1.5';
    attribution.style.textAlign = 'justify';
    attribution.style.backgroundColor = '#E5F2FF';
    attribution.style.padding = '10px';
    attribution.style.borderRadius = '5px';
    attribution.style.boxShadow = '0px 2px 5px rgba(0, 0, 0, 0.1)';
    attribution.style.maxWidth = '768px';
    attribution.style.overflowWrap = 'break-word';
    attribution.style.whiteSpace = 'normal';
    attribution.style.display = 'block';

    attribution.innerHTML = `This is a text from the Wikipedia article <a href="https://en.wikipedia.org/wiki/${title}" target="_blank">${title}</a>, released under the <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank">Creative Commons Attribution-Share-Alike License 4.0</a>`;
    
    const contentWrapper = document.createElement('div');
    contentWrapper.style.display = 'flex';
    contentWrapper.style.flexDirection = 'column';
    contentWrapper.style.height = '100%';
    contentWrapper.style.justifyContent = 'space-between';

    ajaxElement.appendChild(imgContainer);
    ajaxElement.appendChild(textContainer);

    contentWrapper.appendChild(ajaxElement);
    contentWrapper.appendChild(attribution);

    newSectionItem.appendChild(contentWrapper);

    const scrollableSection = document.querySelector('.scrollable-section-featured');
    if (scrollableSection) {
        scrollableSection.appendChild(newSectionItem);
    } else {
        console.error("Scrollable section for featured articles not found");
    }
}



function addFeaturedArticleOlder(imgSrc, title, articlePreview, imgTitle, imgLicense, imgArtist, imgCredit, imgDescription, imgUrl) {
    
    const newSectionItem = document.createElement('div');
    newSectionItem.classList.add('section-item');

    const ajaxElement = document.createElement('a');
    ajaxElement.setAttribute("class", "clickOn");
    ajaxElement.setAttribute("href", "learningpage");
    ajaxElement.setAttribute("value", title); 
    ajaxElement.setAttribute("target", "_blank");
    ajaxElement.classList.add('no-underline'); // Add custom class

    const imgElement = document.createElement('img');
    imgElement.src = imgSrc;
    imgElement.setAttribute("id", "picturesOfTheDay");
    imgElement.setAttribute("width", "300px");
    imgElement.setAttribute("height", "300px");
    imgElement.alt = 'Image';
    
    // Create tooltip content with bold labels
    let tooltipContent = `
		<div><strong>Original image:</strong></div>
        <div><strong>Title:</strong> ${imgTitle}</div>
        <div><strong>Artist:</strong> ${imgArtist}</div>
        <div><strong>Credit:</strong> ${imgCredit}</div>
        <div><strong>License:</strong> ${imgLicense}</div>
        <div><strong>Source:</strong> ${imgSrc}</div>
        <div><strong>Description:</strong> ${imgDescription}</div>
    `;

    // Create tooltip div
    const tooltipDiv = document.createElement('div');
    tooltipDiv.classList.add('tooltip');
    tooltipDiv.innerHTML = tooltipContent;
    document.body.appendChild(tooltipDiv);
    
    imgElement.addEventListener('mouseover', (event) => {
        tooltipDiv.classList.add('wider');
        tooltipDiv.style.display = 'block';
        tooltipDiv.style.left = `${event.pageX + 10}px`;
        tooltipDiv.style.top = `${event.pageY + 10}px`;
    });

    imgElement.addEventListener('mousemove', (event) => {
        tooltipDiv.style.left = `${event.pageX + 10}px`;
        tooltipDiv.style.top = `${event.pageY + 10}px`;
    });

    imgElement.addEventListener('mouseout', () => {
        tooltipDiv.classList.remove('wider');
        tooltipDiv.style.display = 'none';
    });

    const textContainer = document.createElement('div');
    textContainer.classList.add('preview-text');
    
    const titleElement = document.createElement('h3');
    titleElement.innerHTML = title;
    textContainer.appendChild(titleElement);

    const articleElement = document.createElement('div');
    articleElement.innerHTML = articlePreview;
    textContainer.appendChild(articleElement);
	
	const attribution = document.createElement('p');
	attribution.id = 'attribution';
	attribution.style.color = 'black';
	attribution.style.fontSize = '12px';
	attribution.style.fontStyle = 'italic';

	// Set the inner HTML of the p element
	attribution.innerHTML = `This is a text from the Wikipedia article <a href="https://en.wikipedia.org/wiki/${title}" target="_blank">${title}</a>, which is released under the <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank">Creative Commons Attribution-Share-Alike License 4.0</a>`;
	
	
	
    ajaxElement.appendChild(imgElement);
    ajaxElement.appendChild(textContainer);
	newSectionItem.appendChild(attribution);

    newSectionItem.appendChild(ajaxElement);

    const scrollableSection = document.querySelector('.scrollable-section-old');
    if (scrollableSection) {
        scrollableSection.appendChild(newSectionItem);
    } else {
        console.error("Scrollable section for featured articles not found");
    }
}


function onThisDay() {
    let today = new Date();
    let month = String(today.getMonth() + 1).padStart(2, '0'); // Get current month (adjust for zero-indexed month)
    let day = String(today.getDate()).padStart(2, '0'); // Get current day of the month
    let url = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/${month}/${day}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.births) {
                let births = data.births;
            /*    //console.log("----------------");
                //console.log(births);
				//console.log("----------------");*/
                births.forEach(birth => {
                    if (Array.isArray(birth.pages)) { // Check if pages is an array
                        birth.pages.forEach(page => {
                            try {
                                addPage(page.titles.normalized, page.extract);
                                addOnThisDayItem(page.originalimage ? page.originalimage.source : '', page.titles.normalized, page.extract);
                            } catch (error) {
                                console.error('Error processing page:', error.message);
                            }
                        });
                    } else {
                        console.error('Invalid data structure: pages is missing or not an array', birth);
                    }
                });
            } else {
                console.error('Invalid data structure', data);
            }
        })
        .catch(error => console.error('Fetch error:', error.message));
}




    function addOnThisDayItem(imgSrc, title, articlePreview) {
        const newSectionItem = document.createElement('div');
        newSectionItem.classList.add('section-item');

        const ajaxElement = document.createElement('a');
        ajaxElement.setAttribute("class", "clickOn");
        ajaxElement.setAttribute("href", "learningpage");
        ajaxElement.setAttribute("value", title); 
        ajaxElement.setAttribute("target", "_blank");
        ajaxElement.classList.add('no-underline'); // Add custom class

        const imgElement = document.createElement('img');
        imgElement.src = imgSrc;
        imgElement.setAttribute("id", "picturesOfTheDay");
        imgElement.setAttribute("width", "300px");
        imgElement.setAttribute("height", "300px");
        imgElement.alt = 'Image';

        const textContainer = document.createElement('div');
        textContainer.classList.add('preview-text');

        const titleElement = document.createElement('h3');
        titleElement.innerHTML = title;

        const articleElement = document.createElement('div');
        articleElement.classList.add('preview-text');
        articleElement.innerHTML = articlePreview;

        textContainer.appendChild(titleElement);
        textContainer.appendChild(articleElement);

        ajaxElement.appendChild(imgElement);
        ajaxElement.appendChild(textContainer);

        newSectionItem.appendChild(ajaxElement);

        const scrollableSection = document.querySelector('#scrollable-section-onthisday');
        if (scrollableSection) {
            scrollableSection.appendChild(newSectionItem);
        } else {
            console.error("Scrollable section for On This Day not found");
        }
    }

    let pagesLookup = [];

    function addPage(name, text) {
        var existingPage = pagesLookup.find(function(page) {
            return page.name === name;
        });

        if (!existingPage) {
            var page = {
                "name": name,
                "text": text
            };
            pagesLookup.push(page);
        }
    }

    function getTextByPageName(pageName) {
		
		////console.log(pagesLookup);
		
        for (var i = 0; i < pagesLookup.length; i++) {
            if (pagesLookup[i].name === pageName) {
                return pagesLookup[i].text;
            }
        }
        
        return "Page not found";
    }

    ////console.log(pagesLookup);
	
	$(document).on('click', '.clickOn', function(e) {
	    // Check if the click target is the 'i' element
	    if ($(e.target).hasClass('info-icon') || $(e.target).closest('.info-icon').length) {
	        // Prevent default action and stop propagation
	        e.preventDefault();
	        e.stopPropagation();
	        
	       
	        return; // Exit the click handler early
	    }
		
			    
	    // Find the title from the closest .text-container
	    var title = $(this).attr('value');
	    var text = getTextByPageName(title);
	    
	    if (title && text) {
	        localStorage.setItem("title", title);
	        localStorage.setItem("text", text);
	        localStorage.setItem("fromWiki", "true");
	    } else {
	        console.error('Title or text not found');
	    }
	});

    
	

	let links = []; // Declare links in a scope that is accessible

	function fetchWordOfTheDay() {
	    fetch('/api/words/word-of-the-day') // Adjust the endpoint if necessary
	        .then(response => {
	            if (!response.ok) {
	                throw new Error('Network response was not ok');
	            }
	            return response.json();  // Parse the JSON response
	        })
	        .then(data => {
	            // Check if a word was returned
	            if (data) {
	                // Update the UI with the word of the day
	                document.getElementById("word").innerText = data.word; // Update word
	                
	                // Format the definitions as an unordered list
	                const definitionElement = document.getElementById("definition");
	                definitionElement.innerHTML = ""; // Clear previous definitions

	                // Parse the definitions if they are a string
	                let definitionsArray;
	                try {
	                    definitionsArray = typeof data.definitions === "string" 
	                        ? JSON.parse(data.definitions) // Parse the string to an array
	                        : data.definitions; // Use as is if already an array
	                } catch (error) {
	                    console.error('Error parsing definitions:', error);
	                    definitionsArray = []; // Fallback to empty array on error
	                }

					if (Array.isArray(definitionsArray) && definitionsArray.length > 0) {
					    const ul = document.createElement('ul'); // Create a new unordered list
					    definitionsArray.forEach(def => {
					        const li = document.createElement('li'); // Create a new list item for each definition
					        li.textContent = def; // Set the text of the list item
					        
					        // Add click event to each definition
					        li.addEventListener('click', () => {
					            console.log("Clicked definition:", def); // Debug log
					            highlightRelated(def);
					        });
					        
					        ul.appendChild(li); // Append the list item to the unordered list
					    });
					    definitionElement.appendChild(ul); // Append the unordered list to the definition element
					} else {
					    definitionElement.innerText = "No definitions available."; // Handle case with no definitions
					}

	                // Call the function to visualize the graph
	                onWordGraph(data.graph);
					
	                
	                // Log the data for debugging
	                //console.log('Word of the Day:', data);
					
	            } else {
	                console.error('No word of the day found.');
	            }
	        })
	        .catch(error => {
	            console.error('There was a problem with the fetch operation:', error);
	        });
	}

	// Call the function to fetch and display the word of the day
	fetchWordOfTheDay();

	
	let width, height; // Declare globally
	 
		function onWordGraph(jsonData) {
		    if (typeof jsonData === 'string') {
		        try {
		            jsonData = JSON.parse(jsonData);
		        } catch (error) {
		            console.error("Failed to parse JSON:", error);
		            return;
		        }
		    }

		    if (!jsonData.relation_graph || !jsonData.relation_graph.links || !jsonData.relation_graph.words ||
		        jsonData.relation_graph.words.length === 0 || jsonData.relation_graph.links.length === 0) {
		        document.querySelector(".scroll-container").innerHTML = "<p>No graph data available.</p>";
		        return;
		    }

		    const scene = new THREE.Scene();
		    const width = window.innerWidth;
		    const height = window.innerHeight;
		    const isMobile = width < 768;

		    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);
		    camera.position.z = isMobile ? 500 : 700; // Maggiore zoom su mobile

		    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('graphCanvas') });
		    renderer.setSize(width, height);
		    document.querySelector(".scroll-container").innerHTML = "";
		    document.querySelector(".scroll-container").appendChild(renderer.domElement);
		    renderer.setClearColor(0xffffff);

		    const light = new THREE.AmbientLight(0x404040);
		    scene.add(light);
		    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
		    directionalLight.position.set(5, 5, 5).normalize();
		    scene.add(directionalLight);

		    const linkColor = new THREE.Color("#0c2135");
		    const nodeFillColor = new THREE.Color("#F0F8FF");
		    const labelColor = new THREE.Color("#003366");
		    const linkLabelColor = new THREE.Color("#4DACFF");

		    const links = jsonData.relation_graph.links;
		    const words = jsonData.relation_graph.words;

		    const linkMaterial = new THREE.LineBasicMaterial({ color: linkColor });
		    const linkGroup = new THREE.Group();
		    scene.add(linkGroup);

		    const nodeMaterial = new THREE.MeshBasicMaterial({ color: nodeFillColor });

		    const nodeRadius = isMobile ? 12 : 16; // Nodi più piccoli su mobile
		    const nodes = [];
		    const positions = distributeNodes(words, links, width, height, isMobile);

		    words.forEach((word, index) => {
		        const geometry = new THREE.SphereGeometry(nodeRadius, 32, 32);
		        const node = new THREE.Mesh(geometry, nodeMaterial);
		        node.position.x = positions[index].x;
		        node.position.y = positions[index].y;
		        node.position.z = positions[index].z;
		        node.userData = word;
		        scene.add(node);
		        nodes.push(node);

		        // Regoliamo la dimensione e posizione delle etichette
		        const fontSize = isMobile ? 20 : 30;
		        const sprite = createTextSprite(word.label, labelColor, fontSize);
		        sprite.center.set(0.5, 0.5);
		        const labelOffset = new THREE.Vector3(0, nodeRadius * 1.5, 0); // Più spazio sopra i nodi
		        sprite.position.copy(node.position).add(labelOffset);
		        scene.add(sprite);
		        node.labelSprite = sprite;
		    });

		    links.forEach(link => {
		        const sourceNode = nodes.find(node => node.userData.id === link.source);
		        const targetNode = nodes.find(node => node.userData.id === link.target);
		        if (sourceNode && targetNode) {
		            const points = [sourceNode.position, targetNode.position];
		            const geometry = new THREE.BufferGeometry().setFromPoints(points);
		            const line = new THREE.Line(geometry, linkMaterial);
		            linkGroup.add(line);

		            const midPoint = new THREE.Vector3().addVectors(sourceNode.position, targetNode.position).multiplyScalar(0.5);
		            const sprite = createTextSprite(link.relation || "", linkLabelColor, isMobile ? 16 : 24);
		            sprite.center.set(0.5, 0.5);
		            sprite.position.set(midPoint.x, midPoint.y + 20, midPoint.z);
		            scene.add(sprite);
		        }
		    });

		    const controls = new THREE.OrbitControls(camera, renderer.domElement);
		    controls.enableDamping = true;
		    controls.dampingFactor = 0.25;
		    controls.screenSpacePanning = true;
		    controls.maxPolarAngle = Math.PI / 2;

		    const animate = function () {
		        requestAnimationFrame(animate);
		        controls.update();
		        renderer.render(scene, camera);
		    };

		    animate();
		}



	
	function distributeNodes(words, links, width, height, isMobile) {
	    const positions = [];
	    const nodeSpacing = 150; // Space between nodes (adjust as needed)
	    
	    // Random range for x, y, z coordinates. You can tweak these values for a more spread out or compact look.
	    const randomRange = 500;

	    words.forEach((word, index) => {
	        // Randomly position each node in 3D space
	        const x = Math.random() * randomRange - randomRange / 2; // X coordinate between -randomRange/2 and +randomRange/2
	        const y = Math.random() * randomRange - randomRange / 2; // Y coordinate between -randomRange/2 and +randomRange/2
	        const z = Math.random() * randomRange - randomRange / 2; // Z coordinate between -randomRange/2 and +randomRange/2

	        positions.push({ x, y, z });
	    });

	    return positions;
	}
	
	function createTextSprite(message, color, fontSize) {
	    const canvas = document.createElement('canvas');
	    const context = canvas.getContext('2d');
	    const scaleFactor = window.devicePixelRatio || 1;
	    context.font = `Bold ${fontSize * scaleFactor}px Arial`;
	    const metrics = context.measureText(message);
	    canvas.width = Math.ceil(metrics.width * scaleFactor);
	    canvas.height = Math.ceil((fontSize + 10) * scaleFactor);
	    context.scale(scaleFactor, scaleFactor);
	    context.fillStyle = color.getStyle();
	    context.font = `Bold ${fontSize * scaleFactor}px Arial`;
	    context.fillText(message, 0, fontSize);

	    const texture = new THREE.CanvasTexture(canvas);
	    texture.premultiplyAlpha = false;
	    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
	    const sprite = new THREE.Sprite(spriteMaterial);
	    const scale = fontSize / 100;
	    sprite.scale.set(canvas.width * scale / scaleFactor, canvas.height * scale / scaleFactor, 1);

	    return sprite;
	}



	// Highlighting Function
	function highlightRelated(definition) {
	    // Reset previous highlights
	    d3.selectAll('.nodes circle')
	        .transition()
	        .duration(200)
	        .attr('fill', 'AliceBlue');

	    d3.selectAll('.links line')
	        .transition()
	        .duration(200)
	        .attr('stroke', '#aaa');

	    // Find related links and node IDs based on the definition
	    const relatedLinks = links.filter(link => link.relation === definition);
	    const relatedNodeIds = relatedLinks.map(link => link.source.id).concat(relatedLinks.map(link => link.target.id));

	    // Highlight related nodes
	    d3.selectAll('.nodes circle')
	        .filter(d => relatedNodeIds.includes(d.id))
	        .transition()
	        .duration(200)
	        .attr('fill', 'orange');

	    // Highlight related links
	    d3.selectAll('.links line')
	        .filter(link => relatedLinks.includes(link))
	        .transition()
	        .duration(200)
	        .attr('stroke', 'red');
	}


	function throttle(callback, limit) {
	    let lastCall = 0;
	    return function() {
	        const now = Date.now();
	        if (now - lastCall >= limit) {
	            lastCall = now;
	            return callback.apply(this, arguments);
	        }
	    };
	}

	
	
	
});


