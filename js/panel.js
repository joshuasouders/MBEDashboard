function Panel(){
	//this data is exactly what we pull in from the server and it never changes. consider it a constant, if javascript could handle that keyword.
	this.originalData;
	//This data is alterable, i.e. the dataset will change if we add or remove filters.
	this.alterableData;

	//these arrays contain the values that are currently displayed on the map. if the array is empty, we default to everything being displayed.
	this.enabledIndustries = new Array();
	this.enabledSpecialties = new Array();
	this.enabledCounties = new Array();

	//this is the set of all of the potential industries, specialties, and counties
	this.allIndustries = new Array();
	this.allSpecialties = new Array();
	this.allCounties = new Array();
}

Panel.prototype.setData = function(data){
	this.originalData = data;
	this.alterableData = data;
	this.populateDropdown();
}

Panel.prototype.populateDropdown = function(){
	//just initializing class level scope so that later we can use the class' scope in a jquery callback
	var self = this;

	//populate industry dropdown
	//we loop through alterable data, pulling out all of the titles for the dropdown
	for(var i = 0; i < this.alterableData.items.length; i++){
		//create the object that we might add to allIndustries
		var obj = {"SHORT_CODE": this.alterableData.items[i].SHORT_CODE, "SHORT_DESC": this.alterableData.items[i].SHORT_DESC};
		//this if statement checks if we've already added the industry to the list. we also automatically add the 0 index in the array.
		if((this.allIndustries.length == 0) || (this.allIndustries[this.allIndustries.length-1].SHORT_CODE != obj.SHORT_CODE)){
			//if we satisfy the check, we push the object we created earlier into the allIndustries array
			this.allIndustries.push(obj);
			//this inserts an entry into the industryDropdown container
			$('#industryDropdown').append('<li role="presentation"><a role="menuitem" id="i' + obj.SHORT_CODE + '" tabindex="-1" href="#">'+obj.SHORT_DESC+' ('+obj.SHORT_CODE+')</a></li>');

			//we create an onclick callback on the id of the dropdown entry we just created
			$('#i'+obj.SHORT_CODE).click(function(e) {
				//when an industry entry is clicked, we add the filter by calling addIndustryFilter with the argument of the SHORT_CODE (which we generate from the HTML ID tag)
				self.addIndustryFilter(e.currentTarget.id.slice(1));
			});
		}
	}

	//populate county dropdown
	//first we just make a static list of counties
	this.allCounties.push("Allegany", "Anne Arundel", "Baltimore", "Baltimore City", "Calvert", "Caroline", "Carroll", "Cecil", "Charles", "Dorchester", "Frederick", "Garrett", "Harford", "Howard", "Kent", "Montgomery", "Prince George's", "Queen Anne's", "Somerset", "St. Mary's", "Talbot", "Washington", "Wicomico", "Worcester");
	//now we loop through and add all of the dropdown entries for each of the counties in the countyDropdown container
	for(var i = 0; i < this.allCounties.length; i++){
		$('#countyDropdown').append('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">'+this.allCounties[i]+'</a></li>');
	}

	this.updateAlterableData();
}

Panel.prototype.addIndustryFilter = function(SHORT_CODE_PARAM){
	//we loop through every entry in allIndustries to try to find the entry where SHORT_CODE is equal to the parameter that we passed in
	for(var i = 0; i < this.allIndustries.length; i++){
		if(this.allIndustries[i].SHORT_CODE == SHORT_CODE_PARAM){
			//if we satisfy that condition, we need to loop through and make sure we're not entering in a duplicate
			for(var x = 0; x < this.enabledIndustries.length; x++){
				if(this.enabledIndustries[x] == this.allIndustries[i]){
					//if we find we're about to enter in a duplicate, we log it and kick out of the function. no sense forcing a map update for no reason.
					console.log("Filter has already been added");
					return;
				}
			}
			console.log("\nAn industry filter has been added :");
			console.log(this.allIndustries[i]);
			this.enabledIndustries.push(this.allIndustries[i]);
			//since we've changed the filter set and therefore the data to display, we need to update alterableData
			this.updateAlterableData();
			return;
		}
	}
}

Panel.prototype.updateAlterableData = function(){
	console.log("The list of enabled industries: ");
	console.log(this.enabledIndustries);

	//this covers the case where no filters are selected, which defaults to everything being displayed on the map
	if((this.enabledIndustries.length == 0) && (this.enabledCounties.length == 0) && (this.enabledSpecialties.length == 0)){
		this.alterableData = this.originalData;
	}
	else{
		//start with a blank object, we have items in there to conform to how the object is set up in originalData just to maintain a common JSON schema
		this.alterableData = {items:[]};

		//loop through and add all of the enabled industries
		for(var i = 0; i < this.enabledIndustries.length; i++){
			for(var x = 0; x < this.originalData.items.length; x++){
				if(this.originalData.items[x].SHORT_CODE == this.enabledIndustries[i].SHORT_CODE){
					this.alterableData.items.push(this.originalData.items[x]);
				}
			}
		}
	}
	console.log("\nalterableData has been updated. The current dataset is: ");
	console.log(this.alterableData);
}