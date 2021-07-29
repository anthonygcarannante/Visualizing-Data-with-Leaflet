
// Use this link to get the GeoJSON data.
var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";

// Function for the marker sizes
function markerSize(magnitude) {
  var markerOption = {
    radius: magnitude * 2,
    color: "red",
    fillColor: "red",
    fillOpacity: 0.75
  }
  return markerOption
}

// Grab GeoJSON Data
d3.json(link).then(function (data) {
  // Creating a GeoJSON layer with the retrieved data
  createFeatures(data.features);
  console.log(data.features);
});

function createFeatures(earthquakeData) {

  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }
  
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachfeature: onEachFeature,
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, markerSize(feature.properties.mag))
    }
  });

  createMap(earthquakes);
};

function createMap(earthquakes) {
  // Streetmap Layer
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define baseMaps object to hold the base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Initialize the Map
  var myMap = L.map("map", {
    center: [38.5816, -121.4944],
    zoom: 6,
    layers: [streetmap, earthquakes]
  });
  
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

}