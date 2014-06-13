function Panel(){
	this.data;
}

Panel.prototype.setData = function(data){
	this.data = data;
	this.populateDropdown();
}

Panel.prototype.populateDropdown = function(){
	var industry = new Array({"SHORT_CODE": this.data.items[0].SHORT_CODE, "SHORT_DESC": this.data.items[0].SHORT_DESC});
	var specialty = new Array({"SHORT_CODE": this.data.items[0].NAICS_CODE, "SHORT_DESC": this.data.items[0].NAICS_DESC});

	//populate industry dropdown
	for(var i = 0; i < this.data.items.length; i++){
		var obj = {"SHORT_CODE": this.data.items[i].SHORT_CODE, "SHORT_DESC": this.data.items[i].SHORT_DESC};
		if(industry[industry.length-1].SHORT_CODE != obj.SHORT_CODE){
			industry.push(obj);
			$('#industryDropdown').append('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">'+obj.SHORT_DESC+' ('+obj.SHORT_CODE+')</a></li>');
		}
	}

	//populate county dropdown
	var counties = new Array("Allegany", "Anne Arundel", "Baltimore", "Baltimore City", "Calvert", "Caroline", "Carroll", "Cecil", "Charles", "Dorchester", "Frederick", "Garrett", "Harford", "Howard", "Kent", "Montgomery", "Prince George's", "Queen Anne's", "Somerset", "St. Mary's", "Talbot", "Washington", "Wicomico", "Worcester");
	for(var i = 0; i < counties.length; i++){
		$('#countyDropdown').append('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">'+counties[i]+'</a></li>');
	}
}