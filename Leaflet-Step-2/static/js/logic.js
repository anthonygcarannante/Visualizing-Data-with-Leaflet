// Use this link to get the GeoJSON data.
var earthquakeLink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
var boundaryLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

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
    case depth > 90:
      return "red";
    case depth > 70:
      return "orangered";
    case depth > 50:
      return "orange";
    case depth > 30:
      return "gold";
    case depth > 10:
      return "yellow";
    default:
      return "lightgreen";
  }
}

// Grab GeoJSON Data
d3.json(earthquakeLink).then(function (earthquakeData) {
  createFeatures(earthquakeData);
})

function createFeatures(earthquakeData) {
  // Iterate via geoJson function to create popup on click
  // Iterate to create markers from functions defined above for depth and magnitude
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, markerStyler(feature.properties.mag, feature.geometry.coordinates[2]))
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup(`Location: ${feature.properties.place}<br>Magnitude ${feature.properties.mag}<br>Depth: ${feature.geometry.coordinates[2]}`)
    }
  });

  // Call function to create map with earthquakes data
  createMap(earthquakes);
};

function createMap(earthquakes) {
  // Streetmap Layer
  var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "outdoors-v9",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  var grayscale = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
  });

  var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "satellite-streets-v10",
    accessToken: API_KEY
  });

  // Define baseMaps object to hold the base layers
  var baseMaps = {
    "Outdoors": outdoors,
    "Dark Map": darkmap,
    "Grayscale": grayscale,
    "Satellite": satellite
  };

  // Create layer group for plates
  var plates = new L.LayerGroup();

  // Call data for plate boundaries and add to layer groupo
  d3.json(boundaryLink).then(function (boundaryData) {
    L.geoJSON(boundaryData, {
      color: "orange",
      weight: 2
    }).addTo(plates)
  })

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    Plates: plates
  };

  // Initialize the Map
  var myMap = L.map("map", {
    center: [38.5816, -121.4944],
    zoom: 4,
    layers: [outdoors, earthquakes]
  });

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({
    position: "bottomright"
  });

  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend");

    var depth = [10, 30, 50, 70, 90];

    div.innerHTML += "<h4 style='text-align: center'>Depth</h4>"
    for (var i = 0; i < depth.length; i++) {
      div.innerHTML +=
        '<i style="background: ' + markerColor(depth[i] + 1) + '"></i> ' +
        depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
    }
    return div;
  }

  legend.addTo(myMap);
}
