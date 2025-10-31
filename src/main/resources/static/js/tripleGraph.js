function generateTripleGraph(graphData) {
   
    // Crea un'area SVG nel corpo del documento
    var svg = d3.select("body").append("svg")
        .attr("width", window.innerWidth)
        .attr("height", window.innerHeight)
        .call(d3.zoom().on("zoom", function () {
            svg.attr("transform", d3.event.transform);
        }))
        .append("g");  // Aggiungi un gruppo per contenere tutti gli elementi del grafo

    // Definisci le forze del layout del grafo
    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) { return d.id; }).distance(150))
        .force("charge", d3.forceManyBody().strength(-700))
        .force("collision", d3.forceCollide().radius(10).strength(0.8)) // Forza di collisione
        .force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2));

    // Aggiungi gli archi al grafico
    var link = svg.append("g")
        .selectAll("line")
        .data(graphData.links)
        .enter().append("line")
        .attr("stroke", "#aaa")
        .attr("stroke-width", 1);

    // Aggiungi i nodi al grafico
    var node = svg.append("g")
        .selectAll("g")
        .data(graphData.nodes)
        .enter().append("g")
        .call(d3.drag()  // Aggiungi funzionalità di trascinamento
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("circle")
        .attr("style", "cursor:pointer")
        .attr("r", 8)
        .attr("fill", "steelblue")
        .on("click", function (d) {
            // Aggiungi l'apertura del link quando si fa clic sul nodo
            window.open(d.href, "_blank");
        });

    node.append("text")
        .text(function (d) { return d.value; })
        .attr("font-size", 12)
        .attr("fill", "#555")
        .attr("dx", 12)
        .attr("dy", 4);

    // Aggiorna la simulazione con i dati del grafo
    simulation
        .nodes(graphData.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graphData.links);

    // Funzione di aggiornamento dei nodi e degli archi alla simulazione
    function ticked() {
        link
            .attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

        node
            .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
    }

    // Funzioni per il trascinamento dei nodi
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
  }