

var MOT = (function ($, L, d3, RadarChart) { //MOT is a global that can be used by subsequent js files e.g MOT.getGeoJSON(url)
	var mot = {};

	mot.initialiseMapClosure = function (text){ 
	// Document.onReady takes a functionless parameter, to pass in parameters, use a function with parameters that returns a function, text is optional in this case
		return function(){
			mot.initialiseMap(text);
			mot.getStationGeoJSON();
			mot.getLineGeoJSON();
			mot.initialiseOverlayControls();
			mot.initialiseCustomControl();
			//mot.initialiseChartControl(); // replaced with onclick function
		}
	
	}

	
	mot.initialiseMap = function (text) { // text is optional, in case parameters like tileLayer URL need to be specified in the future
		var map = new L.Map('map', {center: new L.LatLng(1.26958, 103.90841), zoom: 10, zoomControl: false});
		map.addLayer(new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'));
		
		console.log(text);
		
		mot.map = map
	};
	
	mot.initialiseOverlayControls = function() {
		var overlays = {
				"Stations": map.stations, // should be by lines and type, eg maintenance NS, NEL, CIRCLE
				"Lines": map.lines
			};
			
			L.control.layers(null, overlays, {collapsed: false, position: "topleft"}).addTo(mot.map);
	
	};
	
	mot.initialiseCustomControl = function(){
		var info = L.control();

		info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'detail-window'); // create a div with a class "info"
		this.update();
		return this._div;
		};

		// method that we to update the data in the control based on feature properties passed TODO, switch to underscore.js for templating
		info.update = function (props) {
		
			var divHTML;
			
			if (props){
				divHTML = '<h4>Detailed Info</h4>' +
				'<b>' + props.Name + '</b><br />' + props.Description;
			}
			else {
				divHTML = '<h4>Detailed Info</h4>' + 'Click a station or line segment for more info';
			}
		
			this._div.innerHTML = divHTML;
		};
		
		info.updateLine = function (props) {
		
			var divHTML;
			
			if (props){
				divHTML = '<h4>Detailed Info</h4>' +
				'<b>' + props.Name + '</b><br />' + props.Description + 'MaintenanceRating: 1245';
			}
			else {
				divHTML = '<h4>Detailed Info</h4>' + 'Click a station or line segment for more info';
			}
		
			this._div.innerHTML = divHTML;
		};

		info.addTo(mot.map);
	
		mot.infoDiv = info;
	};
	
	mot.OnStationClick = function(e) {
		var layer = e.target;
	
		mot.infoDiv.update(layer.feature.properties);
	}
	
	mot.getGeoJSON = function(url, callback){
		//var myLayer = L.geoJson().addTo(mot.map);
		$.ajax({
		dataType: "json",
		url: url,
		success: function(data) {
			callback(data);
		
		}
		}).error(function() {});
	
	};
	
	mot.getStationGeoJSON = function(){
		map.stations = L.geoJson(null, {
			onEachFeature: mot.onEachStationFeature // used to bind event handler to each feature in GeoJSON
		}).addTo(mot.map);
		
		mot.getGeoJSON("data/geojson/mrtstation.json", function(data){
			map.stations.addData(data);
		});
	
	};
	
	mot.onEachStationFeature = function(feature, layer) {
		layer.on({
			//mouseover: highlightFeature,
			//mouseout: resetHighlight,
			click: mot.OnStationClick
		});
	
	};
	
	mot.drawChart = function() { // function to draw data as Spider/Radar Chart, data is hardcoded for now
	console.log(d3.select('.info').append('div').attr("class", "hexchart"));
	
		var w = 200,
		h = 200;

		var colorscale = d3.scale.category10();

		//Legend titles
		var LegendOptions = ['Smartphone','Tablet'];

		//Data
		var d = [
		  
			[
			{axis:"Spot Check",value:0.48},
			{axis:"Sleeper",value:0.41},
			{axis:"Power Line",value:0.27},
			{axis:"Rail",value:0.28},
			{axis:"PM",value:0.46},
			{axis:"Other",value:0.29}
			]
			
		];

		//Options for the Radar chart, other than default
		var mycfg = {
			w: w,
			h: h,
			maxValue: 0.6,
			levels: 6,
			ExtraWidthX: 200
		}

//Call function to draw the Radar chart
//Will expect that data is in %'s
		RadarChart.draw(".hexchart", d, mycfg);
	
	
	};
	
	mot.drawPassengerLoadGraph = function() { // function to draw line graph, data is hardcoded for now
		d3.select('.info').append('div').attr("class", "passenger-chart");
	
		var margin = {top: 20, right: 80, bottom: 30, left: 50},
		width = 400 - margin.left - margin.right,
		height = 200 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y%m%d").parse;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
	.ticks(3);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.passengers); });

var svg = d3.select(".passenger-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.tsv("data/tsv/passenger2.tsv", function(error, data) {
  if (error) throw error;

  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

  data.forEach(function(d) {
    d.date = parseDate(d.date);
  });

  var trainlines = color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {date: d.date, passengers: +d[name]};
      })
    };
  });

  x.domain(d3.extent(data, function(d) { return d.date; }));

  y.domain([
    d3.min(trainlines, function(c) { return d3.min(c.values, function(v) { return v.passengers; }); }),
    d3.max(trainlines, function(c) { return d3.max(c.values, function(v) { return v.passengers; }); })
  ]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Passengers (1000s)");
	  


  var passenger = svg.selectAll(".passenger")
      .data(trainlines)
    .enter().append("g")
      .attr("class", "passenger");

  passenger.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return color(d.name); });
/*
  passenger.append("text")
      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.passengers) + ")"; })
      .attr("x", 3)
      .attr("dy", ".35em")
      .text(function(d) { return d.name; });
	  */
});

	
	};
	
	mot.getLineGeoJSON = function(){
		map.lines = L.geoJson(null,{onEachFeature: mot.onEachLineFeature}).addTo(mot.map);
		
		mot.getGeoJSON("data/geojson/ns.json", function(data){
			map.lines.addData(data);
		});
		
		mot.getGeoJSON("data/geojson/nel.json", function(data){
			map.lines.addData(data);
		});
		
		mot.getGeoJSON("data/geojson/ew.json", function(data){
			map.lines.addData(data);
		});
		
		
	
	};
	
	mot.OnLineClick = function(e) {
		var layer = e.target;
	
		mot.infoDiv.updateLine(layer.feature.properties);
		mot.drawChart();
		mot.drawPassengerLoadGraph();
	}
	
	mot.onEachLineFeature = function(feature, layer) {
	
		layer.on({
			//mouseover: highlightFeature,
			//mouseout: resetHighlight,
			click: mot.OnLineClick
		});

	};
	
	
	

	return mot;
}($, L, d3, RadarChart));