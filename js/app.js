var map = new Map();
var panel = new Panel(map);

var originalData = [];

var socrataDataset = new Dataset();
socrataDataset.setHost('https://data.maryland.gov');
socrataDataset.setAppToken(config.apptoken);
socrataDataset.setUID(config.uid);
socrataDataset.setCredentials(config.user, config.password);

getData(0);

function getData(offset){
    socrataDataset.query('$limit=10000&$offset=' + offset, function(returnedData) {
        for(var i = 0; i < returnedData.length; i++){
            originalData.push(returnedData[i]);
        }

        if(returnedData.length < 10000){
            panel.setData(originalData);
        }
        else{
            getData(offset + 10000);
        }
    });
};