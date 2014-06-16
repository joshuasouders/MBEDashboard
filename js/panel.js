function Panel(map){
	this.map = map;

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
	//just initializing class level scope so that later we can use the class' scope in jquery callbacks
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
		$('#countyDropdown').append('<li role="presentation"><a role="menuitem" id="c' + i + '" tabindex="-1" href="#">'+this.allCounties[i]+'</a></li>');

		//we create an onclick callback on the contents of the dropdown
		$('#c' + i).click(function(e) {
			//when an county entry is clicked, we add the filter by calling addCountyFilter with the argument of the county name
			self.addCountyFilter(e.currentTarget.innerText, e.currentTarget.id.slice(1));
		});
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
			this.addFilterGUI(this.allIndustries[i].SHORT_DESC + ' (' + this.allIndustries[i].SHORT_CODE + ')', this.allIndustries[i].SHORT_CODE, "industry");
			//since we've changed the filter set and therefore the data to display, we need to update alterableData
			this.updateAlterableData();
			return;
		}
	}
}

Panel.prototype.addCountyFilter = function(county, id){
	//make sure we're not throwing in a duplicate county value
	for(var i = 0; i < this.enabledCounties.length; i++){
		if(this.enabledCounties[i] == county){
			console.log("Attempting to create duplicate county filter. Aborting creation.");
			return;
		}
	}
	
	this.enabledCounties.push(county);
	this.addFilterGUI(county, id, "county");
	this.updateAlterableData();
}

//this adds the filter GUI element so that people can see what filters are enabled on the side panel and X out of them if needed
Panel.prototype.addFilterGUI = function(filterText, id, type){
	//just initializing class level scope so that later we can use the class' scope in jquery callbacks
	var self = this;

	if($(".filterHeader").css("display") == "none"){
		$(".filterHeader").css("display", "block");
	}

	var idPrefix;
	if(type == "county"){
		idPrefix = "c";
	}
	else if(type == "industry"){
		idPrefix = "i";
	}
	else if(type == "specialty"){
		idPrefix = "s";
	}
	else{
		console.error("Type not recognized");
	}

	$("#activeFilterContainer").append('<li class="list-group-item"><span id="x' + idPrefix + id + '" class="badge">X</span>' + filterText + '</li>');

	$('#x' + idPrefix + id).click(function(e) {
		self.removeFilterGUI($('#' + e.currentTarget.id).parent(), e.currentTarget.id.slice(2), e.currentTarget.id.slice(1, 2));
	});
}

//liHTML - this is the li element that is the parent of the active filter GUI element. we can use it to reference the list entry so we can remove it entirely
//id - this is the id of the filter. for industry it's SHORT_ID, for county it corresponds to alpabetical order of the counties
//type - either the string c for county, i for industry, or s for specialty
Panel.prototype.removeFilterGUI = function(liHTML, id, type){
	if(type == "c"){
		this.removeCountyFilter(id);
	}
	else if(type == "i"){
		this.removeIndustryFilter(id);
	}
	else if(type == "s"){
		console.error("calling specialty type removal. this function has not been implemented yet.")
	}
	else{
		console.error("Type passed to removeFilterGUI is not recognized");
	}
	liHTML.remove();
}

Panel.prototype.removeIndustryFilter = function(SHORT_CODE_PARAM){
	var obj = this.getIndustryObjectBySHORT_CODE(SHORT_CODE_PARAM);

	for(var i = 0; i < this.enabledIndustries.length; i++){
		if(this.enabledIndustries[i] == obj){
			//remove it from the array of enabled industries
			this.enabledIndustries.splice(i, 1);
			//fix the map to incorporate these changes
			this.updateAlterableData();
		}
	}
}

//the id here is the index in this.allCounties in which the textual representation of the county resides
Panel.prototype.removeCountyFilter = function(id){
	var countyText = this.allCounties[id];

	console.log(countyText);

	for(var i = 0; i < this.enabledCounties.length; i++){
		if(this.enabledCounties[i] == countyText){
			//remove it from the array of enabled counties
			this.enabledCounties.splice(i, 1);
			//fix the map to incorporate these changes
			this.updateAlterableData();
		}
	}
}

//we pass in the SHORT_CODE and we get back the object that it corresponds to
Panel.prototype.getIndustryObjectBySHORT_CODE = function(SHORT_CODE_PARAM){
	for(var i = 0; i < this.allIndustries.length; i++){
		if(this.allIndustries[i].SHORT_CODE == SHORT_CODE_PARAM){
			return this.allIndustries[i];
		}
	}
	return -1;
}

Panel.prototype.updateAlterableData = function(){
	//we want our enabledIndustries etc arrays to contain the definitive list of what the user has personally enabled.
	//we can alter these localEnabledIndustries etc all we want because the scope is within the updateAlterableData function and they'll go out of scope relatively quickly.
	//this allows us to easily account for the situation where no filters are selected. without this code everything would be filtered out if there aren't any filters
	//selected for a given category; this code allows us to make it so that if no filters are selected for a given category, we default to every (for example) industry being
	//displayed on the map.
	var localEnabledIndustries = this.enabledIndustries;
	var localEnabledSpecialties = this.enabledSpecialties;
	var localEnabledCounties = this.enabledCounties;

	//this covers the case where no filters are selected, which defaults to everything being displayed on the map
	if(localEnabledIndustries.length == 0){
		localEnabledIndustries = this.allIndustries;
	}
	if(localEnabledSpecialties.length == 0){
		localEnabledSpecialties = this.allSpecialties;
	}
	if(localEnabledCounties.length == 0){
		localEnabledCounties = this.allCounties;
	}

	//start with a blank object, we have items in there to conform to how the object is set up in originalData just to maintain a common JSON schema
	this.alterableData = {items:[]};

	//loop through and find all of the entries for the given industries
	for(var i = 0; i < localEnabledIndustries.length; i++){
		for(var x = 0; x < this.originalData.items.length; x++){
			if(this.originalData.items[x].SHORT_CODE == localEnabledIndustries[i].SHORT_CODE){
				//if we're this far into the loop we've found an entry for an industry that we were searching for
				//now we have to perform a check to see if it's in a county that we're searching for

				//we do this check because at this point we're starting to get nested loops and we want to kick into the full nest as few times as possible or performance will degrade
				//if we kick into this if statement, it means that the entry can be from any county
				if(localEnabledCounties.length == 24){
					this.alterableData.items.push(this.originalData.items[x]);
				}
				//otherwise county filters have been added and we need to make sure each entry corresponds to a wanted county
				else{
					//loop through each enabled county name and check to see if it corresponds to the given entry
					for(var y = 0; y < localEnabledCounties.length; y++){
						if(this.originalData.items[x].COUNTY == localEnabledCounties[y]){
							this.alterableData.items.push(this.originalData.items[x]);
							break;
						}
					}
				}
			}
		}
	}

	this.map.setData(this.alterableData, localEnabledCounties);

	console.log("\nalterableData has been updated. The current dataset is: ");
	console.log(this.alterableData);
}