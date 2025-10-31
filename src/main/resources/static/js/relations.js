 // JSON ottenuto da Stanford CoreNLP
  var data = [
  {
    "subject": "I",
    "relation": "calculated By",
    "object": "end"
  },
  {
    "subject": "we",
    "relation": "were",
    "object": "some thirty miles from coast"
  },
  {
    "subject": "we",
    "relation": "were",
    "object": "some thirty miles inland from coast"
  },
  {
    "subject": "I",
    "relation": "calculated By",
    "object": "end of day"
  },
  {
    "subject": "we",
    "relation": "were",
    "object": "some thirty miles"
  },
  {
    "subject": "we",
    "relation": "were",
    "object": "some thirty miles inland"
  },
  {
    "subject": "I",
    "relation": "calculated By",
    "object": "end of third day"
  },
  {
    "subject": "we",
    "relation": "were",
    "object": "forced"
  },
  {
    "subject": "we",
    "relation": "Here arrived at",
    "object": "waterfall"
  },
  {
    "subject": "we",
    "relation": "arrived at",
    "object": "waterfall"
  }
];

  // Larghezza e altezza del grafico
  var width = 3000;
  var height = 3000;

  // Creazione del contenitore SVG nel corpo del documento
  var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

  // Creazione degli archi
  var links = [];
  data.forEach(function (d) {
    links.push({ "source": d.subject, "target": d.object, "relation": d.relation, "label": d.label });
  });

  // Creazione dei nodi
  var nodes = [];
  links.forEach(function (link) {
    nodes.push({ "id": link.source });
    nodes.push({ "id": link.target });
  });

  // Rimuovi duplicati dai nodi
  var uniqueNodes = nodes.filter(function (value, index, self) {
    return index === self.findIndex(function (t) {
      return t.id === value.id;
    });
  });

  // Creazione del grafo
  var graph = {
    nodes: uniqueNodes,
    links: links
  };

  // Creazione della simulazione della forza
 // Creazione della simulazione della forza
var simulation = d3.forceSimulation(graph.nodes)
  .force("link", d3.forceLink(graph.links).id(function (d) { return d.id; }))
  .force("charge", d3.forceManyBody().strength(-1000)) // Imposta il valore di strength a un numero più grande per aumentare la forza di repulsione
  .force("center", d3.forceCenter(width / 2, height / 2));


  // Creazione degli archi
  var link = svg.selectAll(".link")
    .data(graph.links)
    .enter().append("line")
    .attr("class", "link");

  // Creazione dei nodi
  var node = svg.selectAll(".node")
    .data(graph.nodes)
    .enter().append("circle")
    .attr("class", "node")
    .attr("r", 8)
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended))
    .attr("cx", function (d) { return d.x; })
    .attr("cy", function (d) { return d.y; });

  // Aggiunta di etichette ai nodi
  var label = svg.selectAll(".label")
    .data(graph.nodes)
    .enter().append("text")
    .attr("class", "label")
    .attr("x", function (d) { return d.x; })
    .attr("y", function (d) { return d.y; })
    .text(function (d) { return d.id; });

  // Aggiunta di etichette agli archi
  var linkLabel = svg.selectAll(".link-label")
    .data(graph.links)
    .enter().append("text")
    .attr("class", "link-label")
    .attr("x", function (d) { return (d.source.x + d.target.x) / 2; })
    .attr("y", function (d) { return (d.source.y + d.target.y) / 2; })
    .text(function (d) { return d.relation; });

  // Aggiornamento della posizione dei nodi e degli archi
  simulation.on("tick", function () {
    link
      .attr("x1", function (d) { return d.source.x; })
      .attr("y1", function (d) { return d.source.y; })
      .attr("x2", function (d) { return d.target.x; })
      .attr("y2", function (d) { return d.target.y; });

    node
      .attr("cx", function (d) { return d.x; })
      .attr("cy", function (d) { return d.y; });

    label
      .attr("x", function (d) { return d.x; })
      .attr("y", function (d) { return d.y; });

    linkLabel
      .attr("x", function (d) { return (d.source.x + d.target.x) / 2; })
      .attr("y", function (d) { return (d.source.y + d.target.y) / 2; });
  });

  // Funzioni di trascinamento per i nodi
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