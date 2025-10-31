

function myFunction(id) {
    var x = document.getElementById(id);
    if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";
        x.previousElementSibling.className += " w3-theme-d1";
    } else {
        x.className = x.className.replace("w3-show", "");
        x.previousElementSibling.className =
            x.previousElementSibling.className.replace(" w3-theme-d1", "");
    }
}

// Used to toggle the menu on smaller screens when clicking on the menu button
function openNav() {
    var x = document.getElementById("navDemo");
    if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";
    } else {
        x.className = x.className.replace(" w3-show", "");
    }
}


let globalArticlesData = []; // Global variable to store data
const graphDataMap = new Map(); // Use a Map to store graph data locally

function fetchDataAndDisplay() {
    fetch('api/userarticles/getall')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Debugging: Log the fetched data
            //console.log('Fetched data:', data);

            // Check if data is an array, otherwise default to empty array
            globalArticlesData = Array.isArray(data) ? data : [];

            // Clear previous data
            const container = document.getElementById('middle-column');
            if (!container) {
                console.error('Container with ID "middle-column" not found.');
                return;
            }
            container.innerHTML = '';

            if (globalArticlesData.length < 1) {
                displayNoResultsMessage(container);
            } else {
                // Reverse the order of data to display most recent first
                const reversedData = [...globalArticlesData].reverse(); // Avoid modifying the original array

                // Display data dynamically
                reversedData.forEach((item, id) => {
                    const div = document.createElement('div');
                    div.classList.add('data-item');

                    const title = createTitleElement(item.title, id);
                    div.appendChild(title);

                    const text = createTextElement(item.text, id);
                    div.appendChild(text);

                    if (item.wikiPage != null) {
                        const wikiPage = createWikiPageElement(item.title, item.modified);
                        div.appendChild(wikiPage);
                    }

                    if (item.relationGraph != null) {
                        const divScroll = createScrollContainer(id, text.offsetWidth);
                        divScroll.setAttribute("class", "scroll-container-" + id +" "+ " graph-container");
						div.appendChild(divScroll);

                        // Store the graph data locally
                        graphDataMap.set(id, item.relationGraph);
                    }
                    
                    container.appendChild(div);
                });

                // Apply graphs to all containers
                applyGraphs();
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

function createScrollContainer(id, textWidth) {
    const divScroll = document.createElement('div');
    divScroll.classList.add('scroll-container-' + id); // Ensure this matches what is used in applyGraphs
    divScroll.style.width = textWidth + 'px';
    return divScroll;
}

function applyGraphs() {
    // Iterate over stored graph data and render graphs
    globalArticlesData.forEach((item, id) => {
        const graphData = graphDataMap.get(id);
        if (graphData) {
            relationsGraph(id, graphData);
        }
    });
}

function relationsGraph(id, graphDataAjax) {
    let jsonData;

    // Parse the graph data
    try {
        jsonData = JSON.parse(graphDataAjax);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return;
    }
    //console.log('Parsed graph data:', jsonData);

    // Select the container
    const containerSelector = `.scroll-container-${id}`;
    const container = d3.select(containerSelector);

    if (container.empty()) {
        console.error(`Container with selector ${containerSelector} not found.`);
        return;
    }

    // Clear any existing SVG
    container.select("svg").remove();

    // Set dimensions
    const containerWidth = container.node().offsetWidth;
    const svgHeight = containerWidth * 0.75; // Height is 75% of width

    // Create SVG element
    const svg = container.append("svg")
        .attr("width", containerWidth)
        .attr("height", svgHeight)
        .attr("class", "relation-graph")
        .call(d3.zoom().on("zoom", function (event) {
            svg.select("g").attr("transform", event.transform);
        }))
        .append("g");

    // Create force simulation
    const simulation = d3.forceSimulation(jsonData.nodes)
        .force("link", d3.forceLink(jsonData.links).id(d => d.id).distance(150))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(containerWidth / 2, svgHeight / 2))
        .force("collide", d3.forceCollide(30)); // Avoid overlap

    // Create links
    const link = svg.selectAll(".link")
        .data(jsonData.links)
        .enter().append("line")
        .attr("class", "link")
        .attr("stroke", "black")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", d => Math.sqrt(d.value || 1));

    // Create nodes
    const node = svg.selectAll(".node")
        .data(jsonData.nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 12)
        .attr("fill", "steelblue")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("title")
        .text(d => d.id);

    // Create labels for nodes
    const labels = svg.selectAll(".label")
        .data(jsonData.nodes)
        .enter().append("text")
        .attr("class", "label")
        .attr("dx", 16)
        .attr("dy", ".35em")
        .text(d => d.id)
        .attr("font-size", "12px");

    // Create labels for links
    const linkLabels = svg.selectAll(".link-label")
        .data(jsonData.links)
        .enter().append("text")
        .attr("class", "link-label")
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .text(d => d.relation);

    // Update positions on each tick
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        labels
            .attr("x", d => d.x + 16)
            .attr("y", d => d.y);

        linkLabels
            .attr("x", d => (d.source.x + d.target.x) / 2)
            .attr("y", d => (d.source.y + d.target.y) / 2);
    });

    // Drag functions
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

    // Node and link interaction
    node.on("mouseover", function(event, d) {
        d3.select(this).attr("r", 15);
        link.filter(l => l.source.id === d.id || l.target.id === d.id)
            .attr("stroke", "orange")
            .attr("stroke-width", 3);
    })
    .on("mouseout", function(event, d) {
        d3.select(this).attr("r", 12);
        link.filter(l => l.source.id === d.id || l.target.id === d.id)
            .attr("stroke", "black")
            .attr("stroke-width", d => Math.sqrt(d.value || 1));
    });

    link.on("mouseover", function(event, d) {
        d3.select(this)
            .attr("stroke", "orange")
            .attr("stroke-width", 3);
    })
    .on("mouseout", function(event, d) {
        d3.select(this)
            .attr("stroke", "black")
            .attr("stroke-width", d => Math.sqrt(d.value || 1));
    });
}

function createTitleElement(title, id) {
    const titleElement = document.createElement('h2');
    titleElement.textContent = title;
    titleElement.setAttribute('class', 'articleTitle');
    titleElement.setAttribute('data-id', 'article' + id);
    return titleElement;
}

function createTextElement(text, id) {
    const textElement = document.createElement('p');
    textElement.textContent = text;
    textElement.setAttribute('class', 'articleText');
    textElement.setAttribute('data-id', 'article' + id);
    return textElement;
}

function createWikiPageElement(title, modified) {
    const wikiPageElement = document.createElement('p');
    wikiPageElement.innerHTML = modified === "yes" 
        ? 'Modified text from Wikipedia article <a href="https://en.wikipedia.org/wiki/' + title + '" target="_blank">' + title + '</a>, which is released under the <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank">Creative Commons Attribution-Share-Alike License 4.0</a>.' 
        : 'Wikipedia article <a href="https://en.wikipedia.org/wiki/' + title + '" target="_blank">' + title + '</a>, which is released under the <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank">Creative Commons Attribution-Share-Alike License 4.0</a>.';
    wikiPageElement.setAttribute('class', 'wikiPage');
    wikiPageElement.setAttribute('id', 'attribution');
    return wikiPageElement;
}

function displayNoResultsMessage(container) {
    const noResults = document.createElement('p');
    noResults.setAttribute("style", "text-align:center");
    noResults.innerHTML = "NO PROCESSED TEXTS FOUND FOR THIS USER <br> Go to <a target='_blank' href='learningpage'> Learning Page </a> and start learning!";
    container.append(noResults);
}

// Fetch data for user with ID 1 on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchDataAndDisplay();
});







$(document).on('click', '.articleTitle, .articleText', function(e) {
    var title, text;

    if ($(this).hasClass('articleTitle')) {
        var id = $(this).data('id'); // Get the data-id attribute
       /*  //console.log('Clicked ID:', id); // Log the id for debugging */
        title = $(this).text(); // Get the title text
        text = $('[data-id="' + id + '"].articleText').text(); // Find the corresponding text element with the same data-id
    } else if ($(this).hasClass('articleText')) {
        var id = $(this).data('id');
        title = $('[data-id="' + id + '"].articleTitle').text(); // Find the corresponding title element with the same data-id
        text = $(this).text(); // Text is the text of the clicked element itself
    }
    
    localStorage.setItem("title", title);
    localStorage.setItem("text", text);

    window.location.href = '/learningpage';
   
});



