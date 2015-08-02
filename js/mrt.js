

var MRT = (function ($, L, d3, RadarChart) { //MOT is a global that can be used by subsequent js files e.g MOT.getGeoJSON(url)
	var mrt = {};

	mrt.initialiseSVGClosure = function (element){ 
	// Document.onReady takes a functionless parameter, to pass in parameters, use a function with parameters that returns a function, text is optional in this case
		return function(){
			mrt.initialiseSVG(element);
			mrt.getLineData();
		}
	
	}
	
	mrt.initialiseSVGFull = function (element){ 
	
		
			mrt.initialiseSVG(element);
			mrt.getLineData();
		
	
	}

	
	mrt.initialiseSVG = function (element) { // ID of element needed to draw
		var svg = d3.select(element).append("svg").attr("width", '100%')
    .attr("height", 600)	;
		//d3.select(element).append("p").text("New paragraph!");
		console.log("called");
		mrt.svg = svg;
	};
	
	mrt.getGeoJSON = function(url, callback){
		//var myLayer = L.geoJson().addTo(mot.map);
		$.ajax({
		dataType: "json",
		url: url,
		success: function(data) {
			callback(data);
		
		}
		}).error(function() {});
	
	};
	
	mrt.getLineData = function() {
	
		d3.json("data/geojson/symbolicnelmrtstation.json", function(error, json) {
			if (error) return console.warn(error);
			var data = json;
			console.log(data);
			mrt.drawLine(data);
		});

	};
	
	mrt.drawLine = function(data){
	
	//var h = mrt.svg.getBBox().height;
	
	var circles =	mrt.svg.selectAll("circle")
	    .data(data)
		.enter()
		.append("circle");
		
		circles.attr("cx", function(d, i) {
            return (i * 100) + 25;
        })
       .attr("cy", 300)
       .attr("r", 25);
	
	}
	

	
	
	

	return mrt;
}($, L, d3, RadarChart));