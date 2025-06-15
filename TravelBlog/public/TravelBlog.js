// Initiliazing the mapbox token
mapboxgl.accessToken = 'pk.eyJ1IjoiamFpY2hleSIsImEiOiJjbTJkamhhYngxOW45MmlzZTVtc2p6YXV6In0.M4HJNMcGvfATJZ8o9vJ7IQ';

// Geolocation to get the current position
navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
    enableHighAccuracy: true
});

let map; //map variable globally to use across functions
let directions; // To store the MapboxDirections control
let directionsActive = false; // Track if directions are enabled

// On successful geolocation, set up the map at the user's location
function successLocation(position) {
    setupMap([position.coords.longitude, position.coords.latitude]);
}

// If we have no location, set a default location
function errorLocation() {
    setupMap([80.5726683, 17.4047541]); // Default coordinates when the map is open then this will be applied
}

// Initialize the map
function setupMap(center) {
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/satellite-streets-v11', //for the streets and the satellite view
        projection: 'globe',
        center: center,
        zoom: 1 //zoom for map initially opens
    });

    // Setting the default atmosphere style
    map.on('style.load', () => {
        map.setFog({}); // Adds atmosphere to the globe
    });

    // zoom out and zoom-in controls
    const nav = new mapboxgl.NavigationControl();
    map.addControl(nav, 'top-right');

    // Getting the current location
    map.addControl(
        new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true,
            showUserHeading: true
        })
    );
    //adding the visited locations to map
    const geojson = {
        type: 'FeatureCollection',
        //specific locations
        features: [
            {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [80.5726683, 17.4047541]
                },
                properties: {
                    title: 'Mapbox',//name of the location
                    description: 'Mangaiah Banjar', //about location
                    imageUrl: 'https://www.artfactory.in/product_pictures/Village-CP-104.jpg',
                    link: 'https://www.google.com/'

                }
            },
            {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [80.5726683, 31.1047541]
                },
                properties: {
                    title: 'Mapbox',
                    description: 'Hyderabad'
                }
            },
            {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [80.5726683, 21.1047541]
                },
                properties: {
                    title: 'Mapbox',
                    description: 'Vizag'
                }
            }
        ]
    };

    // add markers to map for clicking
    for (const feature of geojson.features) {

        // create a HTML element for each feature
        const el = document.createElement('div');
        el.className = 'marker';

        // make a marker for each feature and add to the map
        //new mapboxgl.Marker().setLngLat(feature.geometry.coordinates).addTo(map);
        //new mapboxgl.Marker(el).setLngLat(feature.geometry.coordinates).addTo(map);
        //code from step 6 will go here
        new mapboxgl.Marker(el)
            .setLngLat(feature.geometry.coordinates)
            .setPopup(
                new mapboxgl.Popup({ offset: 25 }) // add popups
                    .setHTML(
                        `<h3>${feature.properties.title}</h3><p>${feature.properties.description}</p>
                        <img src="${feature.properties.imageUrl}" alt="Image not Availabe" style="width:100%;height:auto;display:block">
                                                <a href ="${feature.properties.link}">Read More</a>`
                    )

            )
            .addTo(map);
    }/*markers/pin points for mouse hover
    for (const feature of geojson.features) {
        const el = document.createElement('div');
        el.className = 'marker';

        //details of the visited location
        const popup = new mapboxgl.Popup({ offset: 25 })
            //the attributes in the pop up box of the location(visited)
            .setHTML(`
                        <h3>${feature.properties.title}</h3>
                        <p>${feature.properties.description}</p>
                        <img src="${feature.properties.imageUrl}" alt="Image not Available" style="width:100%;height:auto;display:block">
                        <a href ="${feature.properties.link}">Read More</a>
                    `);

        // Adding the marker to the map
        const marker = new mapboxgl.Marker(el)
            .setLngLat(feature.geometry.coordinates)
            .addTo(map);

        // mouseover and mouseout events to show/hide popup
        el.addEventListener('mouseenter', () => {
            popup.setLngLat(feature.geometry.coordinates).addTo(map);
        });

        el.addEventListener('mouseleave', () => {
            popup.remove();
        });
    }*/

}

// Function to enable/disable directions control
function toggleDirections() {
    if (directionsActive) {
        // If directions are active, remove the control
        map.removeControl(directions);
        document.getElementById('toggleButton').innerText = 'Enable Directions';
        directionsActive = false;

    } else {
        // If directions are inactive, add the control
        directions = new MapboxDirections({
            accessToken: mapboxgl.accessToken,
        });
        map.addControl(directions, 'top-left');
        document.getElementById('toggleButton').innerText = 'Disable Directions';
        directionsActive = true;
    }
}
// Mapping of cities to their respective URLs
const placeUrls = {
    "New York": "https://www.google.com/",
    "Los Angeles": "https://example.com/los-angeles",
    "Chicago": "https://example.com/chicago",
    "Houston": "https://example.com/houston",
    "Miami": "https://example.com/miami",
    // Add more cities and their corresponding URLs as needed
};

// Get the search box and button
const searchBox = document.getElementById('search-box');
const searchButton = document.getElementById('search-button');

// Event listener for the search button
searchButton.addEventListener('click', () => {
    const query = searchBox.value.trim().toLowerCase(); // Get the input value and convert to lower case
    const foundCity = Object.keys(placeUrls).find(city => city.toLowerCase() === query); // Find city ignoring case

    if (foundCity) {
        window.location.href = placeUrls[foundCity];
    } else {
        // Show alert if the city is not found
        alert("City not found. Please try another.");
    }
});

// Optional: Allow pressing 'Enter' to search
searchBox.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchButton.click(); // Trigger the search button click
    }
});

