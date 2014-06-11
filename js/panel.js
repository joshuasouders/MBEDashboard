function Panel(){
	this.data;
}

Panel.prototype.setData = function(data){
	this.data = data;
	this.populateDropdown();
}

Panel.prototype.populateDropdown = function(){
	var industryTypes = new Array({"SHORT_CODE": this.data.items[0].SHORT_CODE, "SHORT_DESC": this.data.items[0].SHORT_DESC});

	for(var i = 0; i < this.data.items.length; i++){
		var obj = {"SHORT_CODE": this.data.items[i].SHORT_CODE, "SHORT_DESC": this.data.items[i].SHORT_DESC};
		if(industryTypes[industryTypes.length-1].SHORT_CODE != obj.SHORT_CODE){
			industryTypes.push(obj);
			$('#industryDropdown').append('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">'+obj.SHORT_DESC+' ('+obj.SHORT_CODE+')</a></li>');
		}
	}
}