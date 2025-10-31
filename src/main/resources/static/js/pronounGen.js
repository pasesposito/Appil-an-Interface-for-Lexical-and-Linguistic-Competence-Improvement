
function sanitizeInput(input) {
  return input.replace(/[^a-zA-Z0-9\s]/g, ''); // Allow only alphanumeric characters and spaces
}

// Function to get Wikipedia page title by ID
async function getWikipediaPageTitle(id) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&pageids=${id}&format=json&origin=*`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const pages = data.query.pages;
    const page = pages[id];
    return page.title;
  } catch (error) {
    console.error('Error fetching Wikipedia page:', error);
    return 'Unknown Title'; 
  }
}


// Function to check if abstract is available for a given resource URI
async function checkAbstractAvailability(resourceURI) {
  const sparqlQuery = `
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    SELECT ?abstract WHERE {
      <${resourceURI}> dbo:abstract ?abstract .
      FILTER (LANG(?abstract) = 'en')
    }
  `;

  const endpointUrl = 'https://dbpedia.org/sparql'; // SPARQL endpoint URL

  try {
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'query': sparqlQuery,
        'format': 'json'
      })
    });
    const data = await response.json();
    return data.results.bindings.length > 0;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}


// Event listener for the Enter key
document.getElementById('searchQuery').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default action (form submission, if applicable)
        performSearch(); // Start the search
    }
});

// Function to perform the search query
let searchCancelled = false;

async function performSearch() {
    searchCancelled = false; // Reset the cancel flag at the start

    // Show loading indicator and hide the search button
    document.getElementById('loading').style.display = 'inline';
    document.querySelector('img[is="loading"]').style.display = 'inline-block';
    document.getElementById('querySearch').style.display = 'none';
    document.getElementById('cancelSearch').style.display = 'inline-block';

    const searchTerm = sanitizeInput(document.getElementById('searchQuery').value);
    if (!searchTerm) {
        alert("Please enter a name.");
        document.getElementById('loading').style.display = 'none';
        document.querySelector('img[is="loading"]').style.display = 'none';
        document.getElementById('querySearch').style.display = 'inline-block';
        document.getElementById('cancelSearch').style.display = 'none';
        return;
    }

    const sparqlQuery = `
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX dbo: <http://dbpedia.org/ontology/>
        PREFIX dbr: <http://dbpedia.org/resource/>
        SELECT DISTINCT ?person ?name ?occupation ?page ?wikiPageID WHERE {
            ?person foaf:name ?name .
            OPTIONAL { ?person dbo:occupation ?occupation }
            OPTIONAL { ?person foaf:page ?page }
            OPTIONAL { ?person dbo:wikiPageID ?wikiPageID }
            FILTER (CONTAINS(LCASE(?name), LCASE("${searchTerm}")))
        }
        LIMIT 20
    `;

    const endpointUrl = 'https://dbpedia.org/sparql'; // SPARQL endpoint URL

    document.getElementById('results').innerHTML = ''; // Clear previous results
    document.getElementById('abstract').innerHTML = ''; // Clear previous abstract
    document.getElementById('attribution').innerHTML = ''; // Clear previous attribution

    try {
        const response = await fetch(endpointUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'query': sparqlQuery,
                'format': 'json'
            })
        });
        const data = await response.json();

        if (searchCancelled) {
            document.getElementById('results').innerHTML = 'Search cancelled.';
            return;
        }

        if (data.results.bindings.length === 0) {
            document.getElementById('results').innerHTML = 'No results found.';
            return;
        }

        // Create list of results
        const resultsDiv = document.getElementById('results');
        let count = 0;

        for (const binding of data.results.bindings) {
            if (count >= 20) break; // Limit to 20 results

            const hasAbstract = await checkAbstractAvailability(binding.person.value);

            if (hasAbstract) {
                const item = document.createElement('div');
                item.className = 'result-item';

                const wikiPageID = binding.wikiPageID ? binding.wikiPageID.value : null;
                let searchTitle = 'Unknown';
                
                if (wikiPageID) {
                    searchTitle = await getWikipediaPageTitle(wikiPageID);
                }

                item.textContent = `${binding.name.value} (${searchTitle})`;
                item.dataset.uri = binding.person.value;
                item.dataset.page = binding.page ? binding.page.value : ''; // Store the Wikipedia page URL
                item.dataset.pageid = binding.wikiPageID ? binding.wikiPageID.value : ''; // Store the Wikipedia page ID
                item.onclick = () => fetchResourceDetails(binding.person.value, binding.page ? binding.page.value : '', binding.wikiPageID ? binding.wikiPageID.value : '');
                resultsDiv.appendChild(item);

                count++;
            }
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('results').innerHTML = 'An error occurred. Please try again.';
    } finally {
        // Hide loading indicator and show the search button
        document.getElementById('loading').style.display = 'none';
        document.querySelector('img[is="loading"]').style.display = 'none';
        document.getElementById('querySearch').style.display = 'inline-block';
        document.getElementById('cancelSearch').style.display = 'none';
    }
}

// Add event listener for the cancel button
document.getElementById('cancelSearch').addEventListener('click', () => {
    searchCancelled = true; // Set the flag to true
    document.getElementById('loading').style.display = 'none'; // Hide loading indicator immediately
    document.querySelector('img[is="loading"]').style.display = 'none';
    document.getElementById('querySearch').style.display = 'inline-block';
    document.getElementById('cancelSearch').style.display = 'none';
});

// Function to fetch detailed information about the selected entity
async function fetchResourceDetails(resourceURI, pageUrl, wikiPageID) {
  const sparqlQuery = `
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    SELECT ?name ?abstract WHERE {
      <${resourceURI}> foaf:name ?name .
      <${resourceURI}> dbo:abstract ?abstract .
      FILTER (LANG(?abstract) = 'en')
    }
  `;

  const endpointUrl = 'https://dbpedia.org/sparql'; // SPARQL endpoint URL

  // Show loading indicator
  document.getElementById('loading').style.display = 'block';

  try {
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'query': sparqlQuery,
        'format': 'json'
      })
    });
    const data = await response.json();
    await displayAbstract(data, pageUrl, wikiPageID);
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('abstract').innerHTML = 'An error occurred. Please try again.';
  } finally {
    // Hide loading indicator
    document.getElementById('loading').style.display = 'none';
  }
}

// Function to display the abstract and attribution
async function displayAbstract(data, pageUrl, wikiPageID) {
  
  const abstractDiv = document.getElementById('abstract');
  const attributionDiv = document.getElementById('attribution');

  abstractDiv.innerHTML = '';
  attributionDiv.innerHTML = '';

  if (data.results.bindings.length === 0) {
    abstractDiv.innerHTML = 'No abstract available.';
    return;
  }

  const result = data.results.bindings[0];

  // Add name
  const name = document.createElement('h3');
  name.textContent = result.name.value;
  abstractDiv.appendChild(name);

  // Add abstract with cloze inputs
  const abstract = document.createElement('p');
  abstract.innerHTML = createClozeText(result.abstract.value);
  abstractDiv.appendChild(abstract);

  try {
    const title = await getWikipediaPageTitle(wikiPageID); // Use await to get the title

    // Add attribution only after title is fetched
    const attribution = document.createElement('p');
    attribution.id = 'attribution';
    attribution.style.color = 'black';
    attribution.style.fontSize = '12px';
    attribution.style.fontStyle = 'italic';
   
    attribution.innerHTML = `This is a text from the Wikipedia article <a href="https://en.wikipedia.org/wiki/${title}" target="_blank">${title}</a>, which is released under the <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank">Creative Commons Attribution-Share-Alike License 4.0</a>`;
    abstractDiv.appendChild(attribution); // Append attribution after the abstract

  } catch (error) {
    console.error('Error fetching Wikipedia page:', error);
    const attribution = document.createElement('p'); // Still add an attribution in case of error
    attribution.id = 'attribution';
    attribution.style.color = 'black';
    attribution.style.fontSize = '12px';
    attribution.style.fontStyle = 'italic';
    attribution.innerHTML = `This is a text from a Wikipedia article, which is released under the <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank">Creative Commons Attribution-Share-Alike License 4.0</a>`;
    abstractDiv.appendChild(attribution);
  }
	
  const elements = document.querySelectorAll('[id="checkAnswers"]');
  elements.forEach(element => {
    element.style.display = 'block';
  });
  
  document.getElementById('checkAnswers').style.display = 'block'; // Show the "Check Answers" button
}

// Function to create cloze text with input fields
function createClozeText(text) {
  const pronouns = ['I', 'he', 'she', 'you', 'they', 'it', 'is', 'are'];
  removedWords = []; // Reset the removed words array
  let id = 0;
  let newText = text.replace(new RegExp(`\\b(${pronouns.join('|')})\\b`, 'gi'), (match) => {
    removedWords.push({ id: id, word: match });
    return `<input type="text" class="cloze-input" style="display: inline; width: 100px !important;" data-id="${id++}" placeholder="Insert a pronoun">`;
  });
  return newText;
}

