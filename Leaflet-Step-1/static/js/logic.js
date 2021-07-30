// Use this link to get the GeoJSON data.
var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Function for the marker sizes earthquake magnitude. Calls markerColor for depth color.
function markerStyler(magnitude, depth) {
  var markerRadius = {
    radius: magnitude * 4,
    color: markerColor(depth),
    fillColor: markerColor(depth),
    fillOpacity: 0.75
  }  
  return markerRadius
}

// Function for marker colors based on depth
function markerColor(depth) {
  switch (true) {
    case depth > 65:
      return "#cc0000";
    case depth > 45:
      return "##e60000";
    case depth > 25:
      return "#ff0000";
    case depth > 10:
      return "#ff1a1a";
    case depth > 0:
      return "#ff3333";
    default:
      return "#ff3333";
  }
}

// Grab GeoJSON Data
d3.json(link).then(function (data) {
  // Creating a GeoJSON layer with the retrieved data
  createFeatures(data.features);
  console.log(data.features);
});

function createFeatures(earthquakeData) {

  // Iterate via geoJson function to create popup on click
  // Iterate to create markers from functions defined above for depth and magnitude
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachfeature: function (feature, layer) {
      console.log(feature.properties.place)
        layer.bindPopup(`Magnitude: ${feature.geometry.coordinates[2]}<br>Location: ${feature.properties.place}`)
       },
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, markerStyler(feature.properties.mag,feature.geometry.coordinates[2]))
    }
  });

  // Call function to create map with earthquakes data
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
    zoom: 4,
    layers: [streetmap, earthquakes]
  });

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({
    position: "bottomleft"
  });
  
  // legend.onAdd = function(map) {
  //   var div = L.DomUtil.create("div", "info legend");
  //   labels = [`<strong>Categories</strong>`],
  //   categories = ["Depth > 65", "Depth > 45", "Depth > 25", "Depth > 10", "Depth > 0"]
  // }

  // legend.addTo(myMap);

}