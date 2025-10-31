function generateInteractiveGraph(json) {
    var graphData = JSON.parse(json);

    var svg = d3.select("#graph-container").append("svg")
        .attr("width", "1600")
        .attr("height", "1000");

    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) {
            return d.id;
        }).distance(50))
        .force("charge", d3.forceManyBody().strength(-500))
        .force("center", d3.forceCenter(1600 / 2, 1000 / 2));

    var link = svg.selectAll(".link")
        .data(graphData.edges)
        .enter().append("line")
        .attr("class", "link")
        .attr("id", function (d, i) { return "linkId_" + i; })
        .attr("stroke", "#b7cbef")
        .attr("stroke-width", function (d) { return d.weight * 2; })
        .on("mouseover", handleMouseOverLink)
        .on("mouseout", handleMouseOutLink);

    var node = svg.selectAll(".node")
        .data(graphData.nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 10)
        .attr("fill", "#1f78b4")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("mouseover", handleMouseOverNode)
        .on("mouseout", handleMouseOutNode);

    var label = svg.selectAll(".label")
        .data(graphData.nodes)
        .enter().append("text")
        .attr("class", "label")
        .text(function (d) { return d.label; })
        .attr("font-size", "14px")
        .attr("dx", 12)
        .attr("dy", 4);

    simulation.nodes(graphData.nodes);
    simulation.force("link").links(graphData.edges);

    simulation.on("tick", function () {
        link.attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

        node.attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; });

        label.attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; });
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

    function handleMouseOverLink(d, i) {
        // Aggiungi il tuo codice per gestire l'evento mouseover sull'arco
        //console.log("Mouse over link:", d);
    }

    function handleMouseOutLink(d, i) {
        // Aggiungi il tuo codice per gestire l'evento mouseout sull'arco
        //console.log("Mouse out link:", d);
    }

    function handleMouseOverNode(d, i) {
        // Aggiungi il tuo codice per gestire l'evento mouseover sul nodo
        //console.log("Mouse over node:", d);
    }

    function handleMouseOutNode(d, i) {
        // Aggiungi il tuo codice per gestire l'evento mouseout sul nodo
        //console.log("Mouse out node:", d);
    }
}

// Esempio di utilizzo
var jsonGraph = '{"nodes": [{"id": 1, "label": "Node 1"}, {"id": 2, "label": "Node 2"}], "edges": [{"source": 1, "target": 2, "weight": 5}]}';
generateInteractiveGraph(jsonGraph);