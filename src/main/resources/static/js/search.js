let globalResults = [];
let pages = []; // Initialize pages array

function searchDBpedia() {
    const query = document.getElementById('searchQuery').value;
    const apiUrl = `https://lookup.dbpedia.org/api/search?query=${encodeURIComponent(query)}`;
    
    fetch(apiUrl, {
        headers: {
            'Accept': 'application/xml' // Request XML explicitly if the API does not support JSON
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.text(); // Get the response as text since it's XML
    })
    .then(xmlString => {
        const data = parseXML(xmlString);
        displayResultsDbpedia(data);
    })
    .catch(error => console.error('Error fetching data:', error));
}

function searchWikipedia() {
    const query = document.getElementById('searchQuery').value;
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;

    fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json(); // Parse the response as JSON
    })
    .then(data => {
        displayResultsWikipedia(data.query.search);
    })
    .catch(error => console.error('Error fetching data:', error));
}

function parseXML(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const results = xmlDoc.getElementsByTagName("Result");

    for (let i = 0; i < results.length; i++) {
        let label = results[i].getElementsByTagName("Label")[0].textContent;
        let description = results[i].getElementsByTagName("Description")[0].textContent;
        let uri = results[i].getElementsByTagName("URI")[0].textContent; 
        globalResults.push({ label, description, uri }); 

        addPage(pages, label, description); // Add each result as a page
    }
    
    printPages(); // Call to print the pages array

    return globalResults; 
}

function displayResultsWikipedia(data) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; // Clear previous results

    if (data.length > 0) {
        data.forEach(doc => {
            const div = document.createElement('div');
            div.style.textAlign = 'center';
            div.style.padding = '10px';
            div.style.border = '1px solid #ccc';
            div.style.borderRadius = '5px'; // Optional for better visuals
            div.style.backgroundColor = 'white'; 

            const link = document.createElement('a');
            link.href = "#";
            link.classList.add("clickOnWiki");
            link.style.color = 'Black';
            link.style.textDecoration = 'underline';
            link.setAttribute("value", doc.title);
            link.innerHTML = `<strong>${doc.title}</strong>`;

            const description = document.createElement('p');
            description.innerHTML = doc.snippet || 'No description available.';
            description.style.color = '#666';
            description.style.fontSize = '0.9em'; // Adjust font size if necessary

            div.appendChild(link);
            div.appendChild(document.createElement('br'));
            div.appendChild(description);

            resultsContainer.appendChild(div);
        });
    } else {
        resultsContainer.innerHTML = 'No results found.';
        resultsContainer.style.color = 'red';
    }
}

function addPage(pages, name, text) {
    var existingPage = pages.find(function(page) {
        return page.name === name;
    });

    if (!existingPage) {
        var page = {
            name: name,
            text: text
        };
        pages.push(page);
    }

    return pages;
}

function getTextByPageName(pageName) {
    for (var i = 0; i < pages.length; i++) {
        if (pages[i].name === pageName) {
            return pages[i].text;
        }
    }
    return "Page not found";
}

function printPages() {
    //console.log('Pages array:', pages);
}

function fetchPageContentByTitle(title) {
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&format=json&titles=${encodeURIComponent(title)}&origin=*`;

    return fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            const page = pages[pageId];
            return {
                title: page.title,
                text: page.extract
            };
        });
}

$(document).on('click', '.clickOnWiki', function(e) {
    var title = $(this).attr('value');
    fetchPageContentByTitle(title)
        .then(({ title, text }) => {
            localStorage.setItem("title", title);
            localStorage.setItem("text", text);
            localStorage.setItem("fromWiki", "true");
            
            // Check the current page URL
            const currentUrl = window.location.pathname;

            if (currentUrl.includes("home")) {
                // Redirect to learning page
                window.location.href = "/learningpage"; // Update to your learning page URL
            } 
			if (currentUrl.includes("learningpage")) {
			              // Redirect to learning page
			             document.getElementById("txtarea").value = text;
			      }
			else if (currentUrl.includes("pronunciationgame") || currentUrl.includes("lesson1") || currentUrl.includes("articlesgame")) {
                // Update the same page
                document.getElementById("result").innerText = text;
				
				if (currentUrl.includes("articlesgame"))
					document.getElementById("checkAnswers").display = "block";
					

                if (localStorage.getItem("fromWiki") === "true") {
                    document.getElementById("attribution").innerHTML = `
                        This article uses text from the Wikipedia article 
                        <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(title)}" target="_blank">${title}</a>, 
                        which is released under the 
                        <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank">Creative Commons Attribution-Share-Alike License 4.0</a>`;
                }

                localStorage.setItem("title", "");
                localStorage.setItem("text", "");
                localStorage.setItem("fromWiki", "false");
            }
        })
        .catch(error => console.error('Error fetching page content:', error));
});

$(document).ready(function() {
    $(document).on('keypress', function (e) {
        if (e.key === 'Enter' && $('#searchQuery').val().trim() !== '') {
            searchWikipedia();
        }
    });
});

