let infoPanel = null;  // To hold the info display panel

let nodes = {};  // Store the nodes (words)
let links = [];  // Store the links between words




let selectedNode = null;  // Currently selected node


function onPointerClick(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(scene.children, true); // <-- Key change: recursive = true

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;

        // Traverse up the parent hierarchy to find the "root" object.
        let currentNode = clickedObject;
        while (currentNode.parent && currentNode.parent !== scene) {
            currentNode = currentNode.parent;
        }

        if (currentNode && currentNode.name) { // Check the root object's name
            console.log("Clicked on word:", currentNode.name);
            const wordData = nodes[currentNode.name];
            if (wordData) {
                createInfoPanel(wordData);
            }
        } else {
          console.log("Clicked on something without a name:", currentNode);
        }
    }
}







async function loadWordNetData() {
    try {
        const response = await fetch('/nouns.json'); // Make sure the path is correct
        if (!response.ok) {
            throw new Error('Failed to fetch WordNet data');
        }
        const wordNetData = await response.json();
        return wordNetData; // Returning the entire data
    } catch (error) {
        console.error('Error loading WordNet data:', error);
    }
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Black background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new THREE.FlyControls(camera, renderer.domElement);
controls.movementSpeed = 120;
controls.rollSpeed = Math.PI / 6;
controls.autoForward = false;
controls.dragToLook = true;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();


let hoveredPlanet = null;  // Store the currently hovered planet

function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const object = intersects[0].object;

        // Find the root planet (avoiding text labels or glow)
        let rootObject = object;
        while (rootObject.parent && rootObject.parent !== scene) {
            rootObject = rootObject.parent;
        }

        // Ensure it's a planet (word nodes are spheres)
        if (rootObject.isMesh && rootObject.name) {
            if (hoveredPlanet !== rootObject) {
                // Restore previous planet color if any
                if (hoveredPlanet) {
                    hoveredPlanet.material.emissive.set(0x000000);
                }

                // Highlight new planet
                hoveredPlanet = rootObject;
                hoveredPlanet.material.emissive.set(0xFFFF00); // Yellow glow effect
            }
        }
    } else {
        // If nothing is hovered, remove highlight
        if (hoveredPlanet) {
            hoveredPlanet.material.emissive.set(0x000000);
            hoveredPlanet = null;
        }
    }
}


function render() {
    raycaster.setFromCamera( pointer, camera );
    const intersects = raycaster.intersectObjects( scene.children );
    for ( let i = 0; i < intersects.length; i ++ ) {
        intersects[ i ].object.material.color.set( 0xff0000 );
    }
    renderer.render( scene, camera );
}

window.addEventListener( 'pointermove', onPointerMove );
window.requestAnimationFrame(render);

// Event listeners for drag and drop
controls.addEventListener( 'dragstart', function ( event ) {
    event.object.material.emissive.set( 0xaaaaaa );
} );

controls.addEventListener( 'dragend', function ( event ) {
    event.object.material.emissive.set( 0x000000 );
});


function getNodeColor(type) {
    const baseColor = new THREE.Color('#E5F2FF');  // Light blue
    const redPlanet = new THREE.Color('#FF4C4C');   // Red for a specific type
    const greenPlanet = new THREE.Color('#4CFF6A'); // Green for another type
    const yellowPlanet = new THREE.Color('#FFEB3B'); // Yellow
    switch (type) {
        case 'synonym': return redPlanet;
        case 'meronym': return greenPlanet;
        case 'antonym': return yellowPlanet;
        default: return baseColor;  // Default is light blue
    }
}

function getRandomPlanetColor() {
    // Define planet color schemes for different types of planets
    const planetColors = {
        terrestrial: [
            '#C2B280', // Desert planet
            '#7F6A3B', // Rocky terrain
            '#98A8B8', // Earth-like planet
            '#4B5320', // Forested planet
            '#A9A9A9'  // Moon-like planet
        ],
        gasGiant: [
            '#4682B4', // Blue gas giant
            '#6A5ACD', // Purple gas giant
            '#FFD700', // Yellow gas giant (like Jupiter)
            '#FF6347', // Red-orange gas giant
            '#00BFFF'  // Light blue gas giant
        ],
        iceGiant: [
            '#B0E0E6', // Pale blue
            '#ADD8E6', // Light blue
            '#00FFFF', // Cyan ice giant
            '#87CEEB', // Sky blue
            '#4682B4'  // Steel blue ice giant
        ],
        rockyMoon: [
            '#DCDCDC', // Lunar surface gray
            '#A9A9A9', // Dark moon
            '#696969', // Charcoal gray
            '#D3D3D3', // Light moon surface
            '#BEBEBE'  // Soft moon gray
        ]
    };

    // Randomly select a planet type (terrestrial, gas giant, ice giant, rocky moon)
    const planetTypes = ['terrestrial', 'gasGiant', 'iceGiant', 'rockyMoon'];
    const selectedPlanetType = planetTypes[Math.floor(Math.random() * planetTypes.length)];

    // Select a random color from the chosen planet type
    const colors = planetColors[selectedPlanetType];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    return new THREE.Color(randomColor);
}

function createWordNode(row, position, type) {
	
    const word = row.word;
    if (nodes[word]) return;

	const planetSize = Math.pow(row.combined_score * 50, 0.8);  // Exponential scaling
	

    const geometry = new THREE.SphereGeometry(planetSize, 32, 32);
    const planetColor = getRandomPlanetColor();
    const material = new THREE.MeshStandardMaterial({ color: planetColor });

    const sphere = new THREE.Mesh(geometry, material);
    sphere.name = word;  // Assign the name here

    const positionFactor = 1000;
    const adjustedPosition = [
        (Math.random() * 2 - 1) * positionFactor,
        (Math.random() * 2 - 1) * positionFactor,
        (Math.random() * 2 - 1) * positionFactor
    ];

    sphere.position.set(...adjustedPosition);
    scene.add(sphere);

    nodes[word] = row;

    // Glow effect (improved)
    const glowMaterial = new THREE.MeshStandardMaterial({
        color: planetColor,
        emissive: planetColor,
        emissiveIntensity: 0.6,
        roughness: 0.5,
        metalness: 0.5,
        transparent: true, // Make the glow transparent
        opacity: 0.8       // Adjust the opacity
    });
    const glowSphere = new THREE.Mesh(geometry, glowMaterial);
    glowSphere.position.set(...adjustedPosition);
    glowSphere.scale.set(1.2, 1.2, 1.2);  // Subtle glow
    scene.add(glowSphere);

    // Make the glow sphere a child of the main sphere
    sphere.add(glowSphere); // This is very important

    // Text label (as a child of the sphere)
    const textSprite = createTextSprite(word);
	const labelOffset = planetSize * 0.5;
	    textSprite.position.set(0, labelOffset, 0);
	    sphere.add(textSprite);
}





function createTextSprite(text) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = "32px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(text, 10, 30);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        depthTest: false
    });

    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(30, 15, 1);
    return sprite;
}

function createLink(sourceWord, targetWord, relationType) {
    const sourceNode = nodes[sourceWord];
    const targetNode = nodes[targetWord];

    if (sourceNode && targetNode) {
        const material = new THREE.LineBasicMaterial({ color: getNodeColor(relationType), transparent: true, opacity: 0.6 });

        const points = [
            new THREE.Vector3(sourceNode.position.x, sourceNode.position.y, sourceNode.position.z),
            new THREE.Vector3(targetNode.position.x, targetNode.position.y, targetNode.position.z)
        ];

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        links.push(line);
    }
}

function createStars() {
    const starGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (let i = 0; i < 500; i++) {
        const star = new THREE.Mesh(starGeometry, starMaterial);
        star.position.set(
            Math.random() * 3000 - 1500,
            Math.random() * 3000 - 1500,
            Math.random() * 3000 - 1500
        );
        scene.add(star);
    }
}

function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.2);  // Soft global illumination
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);  // Simulate sunlight
    directionalLight.position.set(100, 100, 100).normalize();
    scene.add(directionalLight);
}

function setupFog() {
    scene.fog = new THREE.FogExp2(0x000000, 0.0001);  // Subtle fog effect
}

function adjustCamera() {
    camera.position.z = 600;
    camera.fov = 75;
    camera.updateProjectionMatrix();
}

async function createWordNetwork() {
    const wordNetData = await loadWordNetData();
    if (!wordNetData || wordNetData.length === 0) {
        console.error('No WordNet data found.');
        return;
    }

    setupLighting();  // Add lighting
    setupFog();  // Add fog for depth
    createStars();  // Add more stars to the background

    const sortedData = wordNetData.sort((a, b) => b.combined_score - a.combined_score);

    sortedData.forEach((row) => {
        const position = [
            Math.random() * 500 - 250,
            Math.random() * 500 - 250,
            Math.random() * 500 - 250
        ];
        createWordNode(row, position, 'central');
    });

    sortedData.forEach((row) => {
        if (row.synonyms) {
            row.synonyms.forEach((synonym) => {
                createLink(row.word, synonym, 'synonym');
            });
        }
        if (row.antonyms) {
            row.antonyms.forEach((antonym) => {
                createLink(row.word, antonym, 'antonym');
            });
        }
        if (row.meronyms) {
            row.meronyms.forEach((meronym) => {
                createLink(row.word, meronym, 'meronym');
            });
        }
    });
}

createWordNetwork();

function animate() {
    requestAnimationFrame(animate);
    controls.update(0.01);
    renderer.render(scene, camera);	
	
}

// Add event listener for pointer clicks
window.addEventListener('click', onPointerClick);

// Create and show the info panel
function createInfoPanel(wordData) {
    if (infoPanel) {
        // If infoPanel exists, update it
        updateInfoPanel(wordData);
    } else {
        // Otherwise, create a new panel
        infoPanel = document.createElement('div');
        infoPanel.style.position = 'absolute';
        infoPanel.style.top = '10%';
        infoPanel.style.left = '10px';
        infoPanel.style.width = '300px';
		infoPanel.style.maxHeight = '80%';
        infoPanel.style.padding = '10px';
        infoPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        infoPanel.style.color = 'white';
        infoPanel.style.borderRadius = '8px';
        infoPanel.style.fontFamily = 'Poppins, sans-serif';
        document.body.appendChild(infoPanel);

        // Add a close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.marginTop = '10px';
        closeButton.style.backgroundColor = '#FF4C4C';
        closeButton.style.border = 'none';
        closeButton.style.padding = '5px';
        closeButton.style.color = 'white';
        closeButton.style.borderRadius = '5px';
        closeButton.onclick = () => {
            infoPanel.style.display = 'none';
        };
        infoPanel.appendChild(closeButton);
    }

    // Update the info content
    updateInfoPanel(wordData);
}

// Update the content of the info panel
function updateInfoPanel(wordData) {
    infoPanel.innerHTML = `
        <h2>${wordData.word} (${wordData.label_it || ''})</h2>
        <p><strong>Description (EN):</strong></p>
        <div id="description" style="max-height: 150px; overflow-y: auto; border: 1px solid #ccc; padding: 5px;">
            ${wordData.abs}
        </div>

        ${wordData.abs_it ? `
            <p><strong>Descrizione (IT):</strong></p>
            <div id="description-it" style="max-height: 150px; overflow-y: auto; border: 1px solid #ccc; padding: 5px;">
                ${wordData.abs_it}
            </div>
        ` : ''}

        <p><strong>Wiki Link:</strong> 
            <a href="${wordData.wiki_page}" target="_blank" style="color: #4CFF6A;">
                ${wordData.wiki_page}
            </a>
        </p>
    `;

    if (wordData.img) {
        // Create image container
        const imgContainer = document.createElement("div");
        imgContainer.classList.add("img-container");
        imgContainer.style.position = "relative";
        imgContainer.style.display = "inline-block";
        imgContainer.style.width = "100%";
		imgContainer.style.height = "300px";
        imgContainer.style.marginTop = "10px";

        // Create image element
        const imgElement = document.createElement("img");
        imgElement.src = wordData.img;
        imgElement.alt = `Image of ${wordData.word}`;
        imgElement.style.width = "100%";
        imgElement.style.borderRadius = "5px";

        // Build the attribution overlay dynamically (only if there is content)
        let overlayContent = "";
        if (wordData.img_title) overlayContent += `<div><strong>Title:</strong> ${wordData.img_title}</div>`;
        if (wordData.img_author) overlayContent += `<div><strong>Author:</strong> ${wordData.img_author}</div>`;
        if (wordData.img_credit) overlayContent += `<div><strong>Credit:</strong> ${wordData.img_credit}</div>`;
        if (wordData.img_description) overlayContent += `<div><strong>Description:</strong> ${wordData.img_description}</div>`;
        if (wordData.img_license) overlayContent += `<div><strong>License:</strong> ${wordData.img_license}</div>`;

        if (overlayContent) {
            // Create info icon
            const infoIcon = document.createElement("div");
            infoIcon.classList.add("info-icon");
            infoIcon.innerText = "i";
            infoIcon.style.position = "absolute";
            infoIcon.style.top = "10px";
            infoIcon.style.right = "10px";
            infoIcon.style.background = "rgba(0,0,0,0.6)";
            infoIcon.style.color = "white";
            infoIcon.style.borderRadius = "50%";
            infoIcon.style.width = "24px";
            infoIcon.style.height = "24px";
            infoIcon.style.display = "flex";
            infoIcon.style.alignItems = "center";
            infoIcon.style.justifyContent = "center";
            infoIcon.style.fontWeight = "bold";
            infoIcon.style.cursor = "pointer";

            // Create attribution overlay
            const attributionOverlay = document.createElement("div");
            attributionOverlay.classList.add("attribution-overlay");
            attributionOverlay.style.display = "none";
            attributionOverlay.style.position = "absolute";
            attributionOverlay.style.top = "40px";
            attributionOverlay.style.right = "10px";
            attributionOverlay.style.background = "rgba(0, 0, 0, 0.8)";
            attributionOverlay.style.color = "white";
            attributionOverlay.style.padding = "10px";
            attributionOverlay.style.borderRadius = "5px";
            attributionOverlay.style.width = "200px";
            attributionOverlay.innerHTML = overlayContent;

            // Show overlay on hover
            infoIcon.addEventListener("mouseenter", () => {
                attributionOverlay.style.display = "block";
            });
            infoIcon.addEventListener("mouseleave", () => {
                attributionOverlay.style.display = "none";
            });

            // Append elements
            imgContainer.appendChild(imgElement);
            imgContainer.appendChild(attributionOverlay);
            imgContainer.appendChild(infoIcon);
        } else {
            // If no attribution details exist, just add the image without the info icon
            imgContainer.appendChild(imgElement);
        }

        // Append image container to the panel
        infoPanel.appendChild(imgContainer);
		// Apply scrolling styles to the entire info panel
		    infoPanel.style.maxHeight = "100%";  // Adjust height as needed
		    infoPanel.style.overflowY = "auto";   // Enable scrolling if content overflows
		    infoPanel.style.border = "1px solid #ccc"; // Optional: Adds a boundary
		    infoPanel.style.padding = "10px";  // Optional: Improves spacing
    }
}




let stars = [];  // To store the star meshes

function createStars() {
    const starGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (let i = 0; i < 500; i++) {
        const star = new THREE.Mesh(starGeometry, starMaterial);
        star.position.set(
            Math.random() * 3000 - 1500,
            Math.random() * 3000 - 1500,
            Math.random() * 3000 - 1500
        );
        scene.add(star);
        stars.push(star);  // Save the star for animation
    }
}

// Function to animate stars (twinkle effect + slow movement)
function animateStars() {
    stars.forEach(star => {
        // Make stars twinkle (flicker effect)
        const intensity = Math.sin(Date.now() * 0.005 + star.position.x * 0.1) * 0.5 + 0.5;
        star.material.opacity = intensity;

        // Slowly move stars for a subtle background animation
        star.position.x += Math.sin(Date.now() * 0.0001 + star.position.x) * 0.1;
        star.position.y += Math.cos(Date.now() * 0.0001 + star.position.y) * 0.1;
        star.position.z += Math.sin(Date.now() * 0.0001 + star.position.z) * 0.1;
    });
}




function createStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 10000;  // Number of stars
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        starPositions[i * 3] = Math.random() * 10000 - 5000;  // x position
        starPositions[i * 3 + 1] = Math.random() * 10000 - 5000;  // y position
        starPositions[i * 3 + 2] = Math.random() * 10000 - 5000;  // z position
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    const starMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 1,  // Adjust the size of stars
        sizeAttenuation: true,  // Ensure that stars appear smaller as they move farther
    });

    const starfield = new THREE.Points(starGeometry, starMaterial);
    scene.add(starfield);
}

createStarfield();

function createNebulaEffect() {
    const particleCount = 10000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);  // To simulate slow movement

    // Generate random positions and velocities for particles
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = Math.random() * 10000 - 5000;
        positions[i * 3 + 1] = Math.random() * 10000 - 5000;
        positions[i * 3 + 2] = Math.random() * 10000 - 5000;

        velocities[i * 3] = Math.random() * 0.05 - 0.025;  // Slow movement in x direction
        velocities[i * 3 + 1] = Math.random() * 0.05 - 0.025;  // Slow movement in y direction
        velocities[i * 3 + 2] = Math.random() * 0.05 - 0.025;  // Slow movement in z direction
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Create a transparent glowing material for the nebula
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x8a2be2, // Soft purple nebula color
        size: 2,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
    });

    const nebula = new THREE.Points(particles, particleMaterial);
    scene.add(nebula);

    // Update particle positions for movement
    function updateNebula() {
        const positions = particles.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] += velocities[i * 3];       // Update x position
            positions[i * 3 + 1] += velocities[i * 3 + 1];  // Update y position
            positions[i * 3 + 2] += velocities[i * 3 + 2];  // Update z position
        }
        particles.attributes.position.needsUpdate = true;
    }

    return updateNebula;
}

const updateNebula = createNebulaEffect();


function createTwinklingStars() {
    const starCount = 10000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starBrightness = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
        starPositions[i * 3] = Math.random() * 10000 - 5000;
        starPositions[i * 3 + 1] = Math.random() * 10000 - 5000;
        starPositions[i * 3 + 2] = Math.random() * 10000 - 5000;

        starBrightness[i] = Math.random();  // Random brightness for each star
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('brightness', new THREE.BufferAttribute(starBrightness, 1));

    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
        sizeAttenuation: true,
        transparent: true,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Update the brightness over time to create a twinkling effect
    function updateTwinkling() {
        const brightness = starGeometry.attributes.brightness.array;
        for (let i = 0; i < starCount; i++) {
            brightness[i] = Math.random();  // Change brightness randomly
        }
        starGeometry.attributes.brightness.needsUpdate = true;
    }

    return updateTwinkling;
}

const updateTwinkling = createTwinklingStars();


function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xaaaaaa, 0.3); // Soft ambient light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Simulate distant stars
    const pointLight = new THREE.PointLight(0xffffff, 0.8, 10000);
    pointLight.position.set(2000, 2000, 2000);
    scene.add(pointLight);
}


    requestAnimationFrame(animate);
	updateNebula(); // Update the nebula cloud positions
	   updateTwinkling(); // Update star twinkling effect
	  // setupLighting();
   

	   

	   animate();



