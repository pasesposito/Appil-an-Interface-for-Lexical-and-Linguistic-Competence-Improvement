let wordGraphSimulation;
let relationGraphSimulation;

function onWordGraph(jsonData, containerId) {
    if (typeof jsonData === 'string') {
        try {
            jsonData = JSON.parse(jsonData);
        } catch (error) {
            console.error("Failed to parse JSON:", error);
            return;
        }
    }

    if (!jsonData.words || !jsonData.links || jsonData.words.length === 0 || jsonData.links.length === 0) {
        d3.select(containerId).html("<p>No graph data available.</p>");
        return;
    }

    const container = d3.select(containerId);

    const width = 300;
    const height = 300;

    const svg = container.append("svg")
        .attr("width", 800)
        .attr("height", 800);

    const g = svg.append("g");

    const zoom = d3.zoom()
        .scaleExtent([0.1, 10])
        .on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoom);

    function zoomIn() {
        svg.transition().call(zoom.scaleBy, 1.2);
    }

    function zoomOut() {
        svg.transition().call(zoom.scaleBy, 0.8);
    }

    const controls = document.createElement("div");
    controls.classList.add("onWord-controls");

    const zoomInButton = document.createElement("button");
    zoomInButton.id = "zoom-in";
    zoomInButton.innerText = "+";
    zoomInButton.onclick = zoomIn;

    const zoomOutButton = document.createElement("button");
    zoomOutButton.id = "zoom-out";
    zoomOutButton.innerText = "-";
    zoomOutButton.onclick = zoomOut;

    controls.appendChild(zoomInButton);
    controls.appendChild(zoomOutButton);

    container.node().appendChild(controls);

    const wordGraphSimulation = d3.forceSimulation(jsonData.words)
        .force("link", d3.forceLink(jsonData.links).id(d => d.id).distance(150))
        .force("charge", d3.forceManyBody().strength(-700))
        .force("collision", d3.forceCollide().radius(12).strength(0.8))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = g.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(jsonData.links)
        .enter().append("line")
        .attr("class", "link")  // Apply link class to style
        .attr("stroke", "#B0C4DE")  // Light Steel Blue
        .attr("stroke-width", 2);

    const node = g.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(jsonData.words)
        .enter().append("g")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("circle")
        .attr("class", "node")  // Apply node class to style
        .attr("r", d => d.isCore ? 12 : 8)
        .attr("fill", "#F8F8FF")  // Ghost White
        .attr("stroke", "#483D8B")  // Dark Slate Blue
        .attr("stroke-width", 1.5);

    node.append("text")
        .text(d => d.label)
        .attr("class", "label")  // Apply label class to style
        .attr("font-size", 14)
        .attr("fill", "#F0E68C")  // Khaki
        .attr("dx", 12)
        .attr("dy", 4);

    const label = g.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(jsonData.links)
        .enter().append("text")
        .attr("class", "relation-label")
        .text(d => d.relation)
        .attr("font-size", 12)
        .attr("fill", "#87CEFA");  // Light Sky Blue

    wordGraphSimulation.nodes(jsonData.words).on("tick", ticked);
    wordGraphSimulation.force("link").links(jsonData.links);

    function ticked() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("transform", d => `translate(${d.x},${d.y})`);

        label
            .attr("x", d => (d.source.x + d.target.x) / 2)
            .attr("y", d => (d.source.y + d.target.y) / 2);

        avoidLabelOverlaps();
    }

    function dragstarted(event, d) {
        if (!event.active) wordGraphSimulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) wordGraphSimulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    window.addEventListener("resize", () => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        svg.attr("width", newWidth)
            .attr("height", newHeight);

        wordGraphSimulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2));
        wordGraphSimulation.alpha(1).restart();
    });

    function avoidLabelOverlaps() {
        label.each(function() {
            const el = d3.select(this);
            const bbox = el.node().getBBox();
            label.each(function() {
                const other = d3.select(this);
                if (el !== other && overlaps(bbox, other.node().getBBox())) {
                    el.attr("dx", +10);
                }
            });
        });
    }

    function overlaps(bbox1, bbox2) {
        return !(bbox1.right < bbox2.left || 
                 bbox1.left > bbox2.right || 
                 bbox1.bottom < bbox2.top || 
                 bbox1.top > bbox2.bottom);
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

function relationGraph(graphDataAjax) {
	
    let jsonData;

    if (typeof graphDataAjax === 'string') {
        try {
            jsonData = JSON.parse(graphDataAjax);
        } catch (error) {
            console.error("Failed to parse graph data:", error);
            return;
        }
    } else if (typeof graphDataAjax === 'object' && graphDataAjax !== null) {
        jsonData = graphDataAjax;
    } else {
        console.error("Invalid graph data format");
        return;
    }

    jsonData.links = removeDuplicateRelations(jsonData.links);

    const container = d3.select(".scroll-container");

    const svg = container.append("svg")
        .attr("class", "relation-graph")
        .attr("width", "100%")
        .attr("height", "100%");

    svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "-0 -5 10 10")
        .attr("refX", 20)
        .attr("refY", 0)
        .attr("orient", "auto")
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("xoverflow", "visible")
        .append("svg:path")
        .attr("d", "M 0,-5 L 10 ,0 L 0,5")
        .attr("fill", "#87CEFA")
        .style("stroke", "none");

  

    const g = svg.append("g");
    g.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "white");

    const zoom = d3.zoom()
        .scaleExtent([0.1, 10])
        .on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoom);

    function zoomIn() {
        svg.transition().call(zoom.scaleBy, 1.2);
    }

    function zoomOut() {
        svg.transition().call(zoom.scaleBy, 0.8);
    }

    const controls = document.createElement("div");
    controls.classList.add("controls");

    const zoomInButton = document.createElement("button");
    zoomInButton.id = "zoom-in";
    zoomInButton.innerText = "+";
    zoomInButton.onclick = zoomIn;

    const zoomOutButton = document.createElement("button");
    zoomOutButton.id = "zoom-out";
    zoomOutButton.innerText = "-";
    zoomOutButton.onclick = zoomOut;

    controls.appendChild(zoomInButton);
    controls.appendChild(zoomOutButton);
    document.querySelector(".scroll-container").appendChild(controls);

    relationGraphSimulation = d3.forceSimulation(jsonData.nodes)
        .force("link", d3.forceLink(jsonData.links).id(d => d.id).distance(150))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(container.node().clientWidth / 2, container.node().clientHeight / 2))
        .force("collide", d3.forceCollide().radius(20));

    const link = g.selectAll(".link")
        .data(jsonData.links)
        .enter().append("line")
        .attr("class", "link")
        .attr("stroke", "black")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", d => Math.sqrt(d.value))
        .attr("marker-end", "url(#arrowhead)");

    const node = g.selectAll(".node")
        .data(jsonData.nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 12)
        .attr("fill", "steelblue")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("title").text(d => d.id);

    const labels = g.selectAll(".label")
        .data(jsonData.nodes)
        .enter().append("text")
        .attr("class", "label")
        .attr("dx", 16)
        .attr("dy", ".35em")
        .attr("data-id", d => d.id)
        .text(d => d.id);

    avoidLabelOverlaps();

    const linkLabels = g.selectAll(".link-label")
        .data(jsonData.links)
        .enter().append("text")
        .attr("class", "link-label")
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .text(d => d.relation);

    relationGraphSimulation.on("tick", () => {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("cx", d => d.x)
            .attr("cy", d => d.y);

        labels.attr("x", d => d.x + 16)
              .attr("y", d => d.y + 5);

        linkLabels.attr("x", d => (d.source.x + d.target.x) / 2)
                  .attr("y", d => (d.source.y + d.target.y) / 2);
    });

    function dragstarted(event, d) {
        if (!event.active) relationGraphSimulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) relationGraphSimulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

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
            .attr("stroke-width", d => Math.sqrt(d.value));
    });

    link.on("mouseover", function(event, d) {
        d3.select(this)
            .attr("stroke", "orange")
            .attr("stroke-width", 3);
    })
    .on("mouseout", function(event, d) {
        d3.select(this)
            .attr("stroke", "black")
            .attr("stroke-width", d => Math.sqrt(d.value));
    });
}


function avoidLabelOverlaps() {
    if (!wordGraphSimulation) {
        console.error("Word graph simulation is not defined");
        return;
    }

    wordGraphSimulation.force("label-collision", d3.forceCollide().radius(d => {
        const label = d3.select(`.label[data-id="${d.id}"]`);
        if (label.empty()) {
            console.warn(`Label with data-id="${d.id}" not found`);
            return 0;
        }
        const bbox = label.node().getBBox();
        if (!bbox) {
            console.error(`Failed to get bounding box for label with data-id="${d.id}"`);
            return 0;
        }
        return Math.max(bbox.width, bbox.height) / 2;
    }));
}


function onWordGraph3D(jsonData, containerId) {
	
	
    if (typeof jsonData === 'string') {
        try {
            jsonData = JSON.parse(jsonData);
        } catch (error) {
            console.error("Failed to parse JSON:", error);
            return;
        }
    }
	
	if (containerId.startsWith('#')) {
	        containerId = containerId.slice(1); // Rimuove il '#' se è presente
	    }
	    
	        

    if (!jsonData.relation_graph || !jsonData.relation_graph.links || !jsonData.relation_graph.words ||
        jsonData.relation_graph.words.length === 0 || jsonData.relation_graph.links.length === 0) {
        document.querySelector(`#${containerId}`).innerHTML = "<p>No graph data available.</p>";
        return;
    }

    const scene = new THREE.Scene();
    const width = window.innerWidth;
    const height = window.innerHeight;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
    camera.position.z = 200;

    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('graphCanvas') });
    renderer.setSize(width, height);
    document.querySelector(`#${containerId}`).innerHTML = "";
    document.querySelector(`#${containerId}`).appendChild(renderer.domElement);

    renderer.setClearColor(0xffffff);

    const light = new THREE.AmbientLight(0x404040);
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);

    // Colori aggiornati
    const linkColor = new THREE.Color("#0c2135");      // Blu scuro per i link
    const nodeFillColor = new THREE.Color("#F0F8FF");  // Alice Blue per la sfera
    const nodeStrokeColor = new THREE.Color("#003366"); // Blu scuro per il contorno della sfera (opzionale)
    const labelColor = new THREE.Color("#003366");     // Cobalto per la scritta
    const linkLabelColor = new THREE.Color("#4DACFF");  // Cobalto chiaro per il testo del link
    
    const links = jsonData.relation_graph.links;
    const words = jsonData.relation_graph.words;

    const linkMaterial = new THREE.LineBasicMaterial({ color: linkColor });
    const linkGroup = new THREE.Group();
    scene.add(linkGroup);

    const nodeMaterial = new THREE.MeshBasicMaterial({
        color: nodeFillColor,   // Colore della sfera
        transparent: false,     // Non trasparente
        opacity: 1              // Opacità piena
    });

    const nodeRadius = 16;
    const nodes = [];

    const positions = distributeNodes(words, links, width, height);

    // Creazione dei nodi
    words.forEach((word, index) => {
        const geometry = new THREE.SphereGeometry(nodeRadius, 32, 32);
        const node = new THREE.Mesh(geometry, nodeMaterial);
        node.position.x = positions[index].x;
        node.position.y = positions[index].y;
        node.position.z = positions[index].z;

        node.userData = word;
        scene.add(node);
        nodes.push(node);

        // Rimuovi il wireframe, quindi solo la sfera è visibile
        const sprite = createTextSprite(word.label, labelColor);
        sprite.center.set(0.5, 0.5);

        const labelOffset = new THREE.Vector3(0, nodeRadius * 2, 0);
        sprite.position.copy(node.position).add(labelOffset);
        scene.add(sprite);

        node.labelSprite = sprite;
    });

    // Creazione dei link tra i nodi
    links.forEach(link => {
        const sourceNode = nodes.find(node => node.userData.id === link.source);
        const targetNode = nodes.find(node => node.userData.id === link.target);

        if (sourceNode && targetNode) {
            const points = [];
            points.push(sourceNode.position);
            points.push(targetNode.position);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, linkMaterial);
            linkGroup.add(line);

            // Posizionamento del testo del link
            const midPoint = new THREE.Vector3().addVectors(sourceNode.position, targetNode.position).multiplyScalar(0.5);
            const sprite = createTextSprite(link.relation || "", linkLabelColor);
            sprite.center.set(0.5, 0.5);
            sprite.position.set(midPoint.x, midPoint.y + 20, midPoint.z);
            scene.add(sprite);
        }
    });

    // Aggiungere i controlli di orbita per la navigazione
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;  // Abilita l'aggiornamento graduale dei controlli
    controls.dampingFactor = 0.25; // Controlla la velocità di "damping"
    controls.screenSpacePanning = true;  // Permette lo spostamento della scena (trascinando con il mouse)
    controls.maxPolarAngle = Math.PI / 2; // Limita l'inclinazione della vista (evita di andare sotto la scena)

    // Funzione di animazione
    const animate = function () {
        requestAnimationFrame(animate);
        controls.update();  // Aggiorna i controlli (necessario per abilitare il damping)
        renderer.render(scene, camera);
    };

    animate();
}

function distributeNodes(words, links, width, height) {
    const positions = [];
    const radius = Math.min(width, height) / 3;
    const numNodes = words.length;

    for (let i = 0; i < numNodes; i++) {
        const angle = (i / numNodes) * 2 * Math.PI;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        const z = 0;
        positions.push({ x, y, z });
    }

    return positions;
}

function createTextSprite(message, color) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const scaleFactor = window.devicePixelRatio || 1;
    const fontSize = 30;
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






