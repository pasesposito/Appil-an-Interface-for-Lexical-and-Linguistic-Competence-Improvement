
// Initialize Leaflet map
var map = L.map('map').setView([20, 0], 2);

// Add OpenStreetMap base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


// Function to speak text
function speakText(text) {
    var nationality = getNationality(text); // Retrieve nationality based on country name
	
    if (nationality) {
        // Use pronounceWord to pronounce the nationality
        pronounceWord("If I come from " + text + ", I am " + nationality);
    } else {
        // Fallback to just pronouncing the country name
        pronounceWord(text);
    }
}



// Load and parse world.json to map alpha2 codes to flag filenames
$.getJSON('lesson1/geo/world/countries/en/world.json', function(data) {
    // Create a map for quick lookup
    var countryFlags = {};
    data.forEach(function(country) {
        countryFlags[country.alpha2] = 'lesson1/geo/world/flags/64x64/' + country.alpha2 + '.png';
    });

    // Now integrate this data into your Leaflet map setup
    var countriesLayer = new L.GeoJSON.AJAX("lesson1/geo/countries.geojson", {
        style: function (feature) {
            return {
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7,
                fillColor: 'gray'
            };
        },
        onEachFeature: function (feature, layer) {
            layer.on({
                mouseover: function (e) {
                    layer.setStyle({
                        weight: 3,
                        color: '#666',
                        dashArray: '',
                        fillOpacity: 0.7
                    });
                    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                        layer.bringToFront();
                    }
                    // Retrieve flag URL based on alpha2 code
                    var code = (feature.properties.iso_3166_1_alpha_2_codes).toLowerCase();
                    var flagUrl = countryFlags[code];

                    // Show country name and flag on hover using tooltip
                    var tooltipContent = '<strong>' + feature.properties.name + '</strong><br><img src="' + flagUrl + '" height="50px">';
                    layer.bindTooltip(tooltipContent, { sticky: true }).openTooltip();
                },
                mouseout: function (e) {
                    countriesLayer.resetStyle(layer);
                },
                click: function (e) {
                    // Speak the country name on click
                    speakText(feature.properties.name);
					
                }
            });
        }
    }).addTo(map); // Add to map after layer is fully configured
}).fail(function(jqxhr, textStatus, error) {
    // Error handling for $.getJSON failure
    var err = textStatus + ", " + error;
    console.error("Error loading world.json: " + err);
});

var countryData = {}; // Object to store country data

$.getJSON('lesson1/geo/world/countries/en/world.json', function(data) {
    data.forEach(function(country) {
        countryData[country.name] = {
            nationality: country.nationality
        };
    });
}).fail(function(jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.error("Error loading world.json: " + err);
});


function getNationality(countryName) {
    if (countryData[countryName]) {
        return countryData[countryName].nationality;
    } else {
        return null; // Handle case where country name doesn't exist in data
    }
}

