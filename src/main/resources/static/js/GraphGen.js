function generateDOTGraph(dotCode) {
    document.getElementById('graph-container').innerHTML = "";
    var graphContainer = document.getElementById('graph-container');
    var options = { format: 'svg', engine: 'dot' };

    try {
        var vizInstance = new Viz();
        vizInstance.renderSVGElement(dotCode, options)
            .then(function (element) {
                graphContainer.appendChild(element);
            })
            .catch(function (error) {
                console.error('Errore durante la generazione del grafo:', error);
            });
    } catch (error) {
        console.error('Errore durante l inizializzazione di Viz:', error);
    }
}



function generateGraph(json) {
	
    var json = JSON.parse(json);

    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) {
            return d.id;
        }).distance(50)) // Riduci il valore della distanza per avvicinare i nodi
        .force("charge", d3.forceManyBody().strength(-500)) // Riduci la forza di respulsione tra i nodi
        .force("center", d3.forceCenter(1200 / 2, 800 / 2));

    var nodes = json.nodes;
    var links = json.links;

    simulation.nodes(nodes);
    simulation.force("link").links(links);

    var svg = d3.select("#graph-container").append("svg").attr("width", "1768px").attr("height", "1000px"); // Aumenta le dimensioni del tuo SVG

    var node = svg.selectAll(".node")
        .data(nodes)
        .enter().append("image")
        .attr("class", "node")
        .attr("href", function (d) { return d.image; })
        .attr("width", 200)  // Aumenta questo valore per aumentare la larghezza dell'immagine
        .attr("height", 200)  // Aumenta questo valore per aumentare l'altezza dell'immagine
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    var link = svg.selectAll(".link")
        .data(links)
        .enter().append("line")
        .attr("class", "link")
        .attr("id", function (d, i) { return "linkId_" + i; })
        .attr("stroke", "#b7cbef")
        .attr("stroke-width", "4px")
        .attr("x1", function (d) {
            return d.source.x + 5;
        })
        .attr("y1", function (d) {
            return d.source.y + 5;
        })
        .attr("x2", function (d) {
            return d.target.x + 5;
        })
        .attr("y2", function (d) {
            return d.target.y + 5;
        });

    var label = svg.selectAll(".label")
        .data(nodes)
        .enter().append("text")
        .attr("class", "label")
        .text(function (d) {
            return d.lemma;
        })
        .attr("font-size", "30px")
        .attr("dx", 20)
        .attr("dy", 50);

    node.append("title")
        .text(function (d) {
            return d.id;
        });

    simulation.on("tick", function () {
        node.attr("x", function (d) {
            return d.x;
        })
        .attr("y", function (d) {
            return d.y;
        });

        label.attr("x", function (d) {
            return d.x;
        })
        .attr("y", function (d) {
            return d.y;
        });

        link.attr("x1", function (d) {
            return d.source.x;
        })
        .attr("y1", function (d) {
            return d.source.y;
        })
        .attr("x2", function (d) {
            return d.target.x;
        })
        .attr("y2", function (d) {
            return d.target.y;
        });
    });

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    closeModal();
}




