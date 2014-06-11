function Map(){
	var map = L.map('map').setView([38.8, -77.3], 8);

	L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	    attribution: "OpenStreetMap contributors",
	    maxZoom: 18
	}).addTo(map);
}

Map.prototype.setData = function(data){
	console.log("map.setData called");
}