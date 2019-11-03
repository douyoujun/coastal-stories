
var mymap = L.map('mapid').setView([-28.64, 153.61], 13);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.satellite',
  accessToken: 'pk.eyJ1IjoiY21vcmdhbjIwMjAiLCJhIjoiY2syaDQwNG80MTF5dzNjbDYzOXI1eXp0eCJ9.ILIDozuj0Yawu4lWDq5A1A'
}).addTo(mymap);


// $.getJSON(('https://raw.githubusercontent.com/frontiersi/coastal-stories/master/Outputs/updated_polygons.geojson'),
// function(data){
//     L.geoJSON(data, {
//   style: function (feature) {
//       return {color: feature.properties.color};
//   },
//       onEachFeature: onEachFeature
//   }).addTo(mymap);
//   }
// )


var contour_map = L.map('contourid', {
  attributionControl: false,
  zoomControl: false
});

// L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
//     attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
//     maxZoom: 18,
//     id: 'mapbox.satellite',
//     accessToken: 'pk.eyJ1IjoiY21vcmdhbjIwMjAiLCJhIjoiY2syaDQwNG80MTF5dzNjbDYzOXI1eXp0eCJ9.ILIDozuj0Yawu4lWDq5A1A'
// }).addTo(contour_map);

//https://gka.github.io/palettes/#/8|d|4d9293|da3f00|1|1
var color_ramp = ['#003739', '#256567', '#529798', '#86cbcc', '#fcb184', '#ec6a2c', '#bd2c00', '#7a0000'].reverse();

function getColor(rate) {
    if (rate > 1.5) {
      rate = 1.5
    } else if (rate < -1.5) {
      rate = -1.5
    }

     i = (rate + 1.5) * 2;
    color = color_ramp[parseInt(i)];
    return color
}
$.getJSON("https://raw.githubusercontent.com/frontiersi/coastal-stories/master/SacredSites/sacredsites.geojson", function( data ) {
  L.geoJSON(data, {
onEachFeature: function(feature, layer) {
	// does this feature have a property named popupContent?
	if (feature.properties) {
		layer.bindPopup("<h1>" +feature.properties.title+ "</h1>" +
      "<p>" + feature.properties.story+"</p>"+
      "<p><a href='" + feature.properties.link + "'>" + feature.properties.link + "</a></p>");
	}
}
  }).addTo(mymap)
})

mymap.on('click', function(mouseEvent){
    var layer = mouseEvent.target;
    contour_map_holder = $(contour_map.getContainer()).parent()[0]
    mymap.openPopup(contour_map_holder, mouseEvent.latlng)
    // contour_map.fitBounds(mouseEvent.target.getBounds());
    contour_map.setView(mouseEvent.latlng, 13);

})


  $.getJSON("https://raw.githubusercontent.com/frontiersi/coastal-stories/master/Outputs/contour_points.geojson", function( data ) {
      L.geoJSON(data, {
          pointToLayer: function (feature, latlng) {
          color = color_ramp[parseInt(i)];
          return L.circleMarker(latlng, {
            radius: 8,
            fillColor: getColor(feature.properties.mov_rate),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8}).bindTooltip(feature.properties.mov_rate + 'm/yr');
        }
  }).addTo(mymap);
  });

function onEachFeature(feature, layer) {
    layer.on({
        click: zoomToFeature
    });
}



var timeDimension = new L.TimeDimension();

contour_map.timeDimension = timeDimension;

function onTimeLoad(timestamp) {
    console.debug(timestamp);
    if (timestamp.target._availableTimes.includes(timestamp.time)) {
      timestamp.target.opacity = 1;
    } else {
      timestamp.target.opacity = 0;
    }
}

var wmsUrl = "https://ows.dea.ga.gov.au/";

// var wmsLayer5 = L.tileLayer.wms(wmsUrl, {
//     layers: 'ls5_nbart_geomedian_annual',
//     format: 'image/png',
//     transparent: true,
//     attribution: 'Digital Earth Australia | USGS',
//     updateTimeDimension: true,
//     updateTimeDimensionMode: 'union',
//     requestTimeFromCapabilities: true
// });
//
// var tdWmsLayer5 = L.timeDimension.layer.wms(wmsLayer5);
// tdWmsLayer5.on('timeload', onTimeLoad);
// tdWmsLayer5.addTo(mymap);

var wmsLayer7 = L.tileLayer.wms(wmsUrl, {
    layers: 'ls7_nbart_geomedian_annual',
    format: 'image/png',
    transparent: true,
    attribution: 'Digital Earth Australia | USGS',
    updateTimeDimension: true,
    updateTimeDimensionMode: 'union',
    requestTimeFromCapabilities: true
});
var tdWmsLayer7 = L.timeDimension.layer.wms(wmsLayer7);
tdWmsLayer7.on('timeload', onTimeLoad)
tdWmsLayer7.addTo(contour_map);

// var wmsLayer8 = L.tileLayer.wms(wmsUrl, {
//     layers: 'ls8_nbart_geomedian_annual',
//     format: 'image/png',
//     transparent: true,
//     attribution: 'Digital Earth Australia | USGS',
//     updateTimeDimension: true,
//     updateTimeDimensionMode: 'union',
//     requestTimeFromCapabilities: true
// });
// L.timeDimension.layer.wms(wmsLayer8).on('timeload', onTimeLoad).addTo(mymap);

var player        = new L.TimeDimension.Player({
    transitionTime: 1000,
    loop: true,
    startOver:true
}, timeDimension);

var timeDimensionControlOptions = {
    player:        player,
    timeDimension: timeDimension,
    position:      'bottomleft',
    autoPlay:      false,
    minSpeed:      1,
    speedStep:     0.5,
    maxSpeed:      10,
    timeSliderDragUpdate: true,
    speedSlider: false
};

var timeDimensionControl = new L.Control.TimeDimension(timeDimensionControlOptions);
contour_map.addControl(timeDimensionControl);
// Create and add a TimeDimension Layer to the map
var htmlObject = timeDimensionControl.getContainer();
var a = document.getElementById('time-slider');

 // Finally append that node to the new parent, recursively searching out and re-parenting nodes.
 function setParent(el, newParent)
 {
    newParent.appendChild(el);
 }
 setParent(htmlObject, a);


var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

	var div = L.DomUtil.create('div', 'info legend'),
		grades = [-1.5, -1, -0.5, 0, 0.5, 1, 1.5].reverse(),
		labels = [];
	div.innerHTML += '<stong style="text-align: center; display: block;">Metres<br/>per Year</stong>'

	// loop through our density intervals and generate a label with a colored square for each interval
	for (var i = 0; i < grades.length; i++) {
		div.innerHTML +=
			'<i style="background:' + getColor(grades[i]) + '"></i> ' + grades[i] + '<br/>';
	}

	return div;
};

legend.addTo(mymap);
