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
			$('#industryDropdown').append('<li role="presentation"><a role="menuitem" id="i' + obj.SHORT_CODE + '" tabindex="-1" href="#">'+obj.SHORT_DESC+' (NAICS Code - '+obj.SHORT_CODE+')</a></li>');

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
			this.popuplateSpecialties(SHORT_CODE_PARAM);
			this.addFilterGUI(this.allIndustries[i].SHORT_DESC + ' (NAICS Code - ' + this.allIndustries[i].SHORT_CODE + ')', this.allIndustries[i].SHORT_CODE, "industry");
			//since we've changed the filter set and therefore the data to display, we need to update alterableData
			this.updateAlterableData();
			return;
		}
	}
}

Panel.prototype.popuplateSpecialties = function(SHORT_CODE_PARAM){
	var flag = 0;
	var self = this;

	for(var i = 0; i < this.originalData.items.length; i++){
		if(this.originalData.items[i].SHORT_CODE == SHORT_CODE_PARAM){
			if(this.allSpecialties.length == 0){
				if($('#specialtyDropdown').html() == 'You must first select an industry before selecting an industry specialty.'){
					$('#specialtyDropdown').html('');
				}

				this.allSpecialties.push({"NAICS_CODE": this.originalData.items[i].NAICS_CODE, "NAICS_DESCRIPTION": this.originalData.items[i].NAICS_DESC});
			
				$('#specialtyDropdown').append('<li role="presentation"><a role="menuitem" id="s' + this.originalData.items[i].NAICS_CODE + '" tabindex="-1" href="#">' + this.originalData.items[i].NAICS_DESC + '</a></li>');

				//we create an onclick callback on the id of the dropdown entry we just created
				$('#s'+this.originalData.items[i].NAICS_CODE).click(function(e) {
					//when an industry entry is clicked, we add the filter by calling addIndustryFilter with the argument of the SHORT_CODE (which we generate from the HTML ID tag)
					self.addSpecialtyFilter(e.currentTarget.innerHTML, e.currentTarget.id.slice(1));
				});	

				flag = 1;
			}
			else if(this.allSpecialties[this.allSpecialties.length - 1].NAICS_CODE != this.originalData.items[i].NAICS_CODE){
				this.allSpecialties.push({"NAICS_CODE": this.originalData.items[i].NAICS_CODE, "NAICS_DESCRIPTION": this.originalData.items[i].NAICS_DESC});

				$('#specialtyDropdown').append('<li role="presentation"><a role="menuitem" id="s' + this.originalData.items[i].NAICS_CODE + '" tabindex="-1" href="#">' + this.originalData.items[i].NAICS_DESC + '</a></li>');

				//we create an onclick callback on the id of the dropdown entry we just created
				$('#s'+this.originalData.items[i].NAICS_CODE).click(function(e) {
					//when an industry entry is clicked, we add the filter by calling addIndustryFilter with the argument of the SHORT_CODE (which we generate from the HTML ID tag)
					self.addSpecialtyFilter(e.currentTarget.innerHTML, e.currentTarget.id.slice(1));
				});	

				flag = 1;
			}
			else{}
		}
		else if(flag == 1){
			return;
		}
	}
}

Panel.prototype.addSpecialtyFilter = function(text, id){
	//make sure we're not throwing in a duplicate specialty value
	for(var i = 0; i < this.enabledSpecialties.length; i++){
		console.log(this.enabledSpecialties);
		if(this.enabledSpecialties[i].NAICS_CODE == id){
			console.log("Attempting to create duplicate specialty filter. Aborting creation.");
			return;
		}
	}
	this.enabledSpecialties.push({"NAICS_CODE": id, "NAICS_DESC": text});
	this.addFilterGUI("&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp" + text, id, "specialty");
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

	if(type == "specialty"){
		$("#xi" + id.substring(0,2)).parent().after('<li class="list-group-item"><span id="x' + idPrefix + id + '" class="badge">X</span>' + filterText + '</li>');
	}
	else{
		$("#activeFilterContainer").append('<li class="list-group-item"><span id="x' + idPrefix + id + '" class="badge">X</span>' + filterText + '</li>');
	}

	$('#x' + idPrefix + id).click(function(e) {
		self.removeFilterGUI($('#' + e.currentTarget.id).parent(), e.currentTarget.id.slice(2), e.currentTarget.id.slice(1, 2));
	});
}

//liHTML - this is the li element that is the parent of the active filter GUI element. we can use it to reference the list entry so we can remove it entirely
//id - this is the id of the filter. for industry it's SHORT_ID, for county it corresponds to alpabetical order of the counties
//type - either the string c for county, i for industry, or s for specialty
Panel.prototype.removeFilterGUI = function(liHTML, id, type){
	if(type == "i"){
		this.removeIndustryFilter(id);
	}
	else if(type == "s"){
		this.removeSpecialtyFilter(id);
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
			break;
		}
	}

	var c = 0;
	var length = this.enabledSpecialties.length;
	for(var i = 0; i < length; i++){
		if(SHORT_CODE_PARAM == this.enabledSpecialties[c].NAICS_CODE.substring(0,2)){
			$('#xs' + this.enabledSpecialties[c].NAICS_CODE).parent().remove();
			$('#s' + this.enabledSpecialties[c].NAICS_CODE).parent().remove();
			this.enabledSpecialties.splice(c, 1);
		}
		else{
			c++;
		}
	}

	if(this.enabledSpecialties.length == 0){
		console.log("here");
		$('#specialtyDropdown').text('You must first select an industry before selecting an industry specialty.');
	}

	c = 0;
	length = this.allSpecialties.length;
	for(var i = 0; i < length; i++){
		if(SHORT_CODE_PARAM == this.allSpecialties[c].NAICS_CODE.toString().substring(0,2)){
			this.allSpecialties.splice(c, 1);
		}
		else{
			c++;
		}
	}
	//fix the map to incorporate these changes
	this.updateAlterableData();
}

Panel.prototype.removeSpecialtyFilter = function(NAICS_CODE_PARAM){
	for(var i = 0; i < this.enabledSpecialties.length; i++){
		if(this.enabledSpecialties[i].NAICS_CODE == NAICS_CODE_PARAM){
			//remove it from the array of enabled industries
			this.enabledSpecialties.splice(i, 1);
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

	var activeFilterCount = 0;

	//this covers the case where no filters are selected, which defaults to everything being displayed on the map
	if(localEnabledIndustries.length == 0){
		localEnabledIndustries = this.allIndustries;
		activeFilterCount++;
	}
	if(localEnabledSpecialties.length == 0){
		localEnabledSpecialties = new Array();
		activeFilterCount++;
	}
	if(localEnabledCounties.length == 0){
		localEnabledCounties = this.allCounties;
		activeFilterCount++;
	}

	if(activeFilterCount == 3){
		$(".filterHeader").css("display", "none");
	}

	console.log(localEnabledSpecialties);

	//start with a blank object, we have items in there to conform to how the object is set up in originalData just to maintain a common JSON schema
	this.alterableData = {items:[]};

	//loop through and find all of the entries for the given industries
	for(var i = 0; i < localEnabledIndustries.length; i++){
		for(var x = 0; x < this.originalData.items.length; x++){
			if(this.originalData.items[x].SHORT_CODE == localEnabledIndustries[i].SHORT_CODE){
				//if we're this far into the loop we've found an entry for an industry that we were searching for

				var flag = false;
				var added = false;

				//if no specialties are enabled, we can just push everything
				if(localEnabledSpecialties.length == 0){
					this.alterableData.items.push(this.originalData.items[x]);
				}
				else{
					//otherwise, we need to loop through our localEnabledSpecialties to see if the specialty of the given feature is in the list of specialties we should allow
					for(var z = 0; z < localEnabledSpecialties.length; z++){
						//this means that the NAICS Code is on the list of NAICS codes that we want to put on the map
						if(this.originalData.items[x].NAICS_CODE == localEnabledSpecialties[z].NAICS_CODE){
							this.alterableData.items.push(this.originalData.items[x]);
							added = true;
							break;
						}
						//if we trip the flag, it means that the industry has a specialty filter on it which means that we can't add it to the map unless it fits in a specialization
						if(this.originalData.items[x].SHORT_CODE == localEnabledSpecialties[z].NAICS_CODE.substring(0,2)){
							flag = true;
						}
					}
					//we should add the entry if it's not in an industry with a specialization filter
					if(!flag && !added){
						this.alterableData.items.push(this.originalData.items[x]);
					}
				}
				
			}
		}
	}

	var industryFilterSelected = false;

	if(this.enabledIndustries.length != 0){
		industryFilterSelected = true;
	}

	this.map.setData(this.alterableData, localEnabledCounties, industryFilterSelected);

	console.log("\nalterableData has been updated. The current dataset is: ");
	console.log(this.alterableData);
}