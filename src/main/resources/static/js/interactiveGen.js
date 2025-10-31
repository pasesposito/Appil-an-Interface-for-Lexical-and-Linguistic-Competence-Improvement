function openModal() {
      var modal = document.getElementById("myModal");
      modal.style.display = "block";
    }

    function closeModal() {
      var modal = document.getElementById("myModal");
      modal.style.display = "none";
    }

    function generateInteractive(jsonData) {
      // Calculate the initial width and height based on the window size
      const width = window.innerWidth;  // Adjust the multiplier as needed
      const height = window.innerHeight;  // Adjust the multiplier as needed

      const svg = d3.select(".scroll-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      const simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.id).distance(50))
        .force("charge", d3.forceManyBody().strength(node => (node.isCore ? -100 : -700)))
        .force("center", d3.forceCenter(width / 2, height / 2));

      const link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(jsonData.links)
        .enter().append("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 1);

      const node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(jsonData.words)
        .enter().append("g")
        .attr("class", "node")
        .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

      node.append("circle")
        .attr("r", node => (node.isCore ? 12 : 8))
        .attr("fill", "AliceBlue");

      const label = svg.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(jsonData.words)
        .enter().append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(d => d.label);

      simulation.nodes(jsonData.words)
        .on("tick", ticked);

      simulation.force("link")
        .links(jsonData.links);

      const zoom = d3.zoom()
        .scaleExtent([0.1, 10])
        .on("zoom", zoomed);

      svg.call(zoom);

      function zoomed(event) {
        svg.selectAll(".nodes, .links, .labels")
          .attr("transform", event.transform);
      }

      function ticked() {
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

        node
          .attr("transform", d => `translate(${d.x},${d.y})`);

        label
          .attr("x", d => d.x)
          .attr("y", d => d.y);
      }

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

      // Listen for window resize events and update the visualization
      window.addEventListener("resize", () => {
        const newWidth = window.innerWidth * 0.9;
        const newHeight = window.innerHeight * 0.9;

        svg.attr("width", newWidth)
           .attr("height", newHeight);

        simulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2));
        simulation.restart();
      });
    }

  /*  // Assuming you have a container element with id "WordNet" that contains JSON data
    const json = document.getElementById("WordNet").innerHTML;
    const jsonData = JSON.parse(json);

    generateInteractive(jsonData);*/