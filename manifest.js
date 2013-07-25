/* Crawl through a given URL and create a Application Cache Manifest file */

// Create an instance of phantom webpage
var page = require('webpage').create(),
	system = require('system'),
	fs = require('fs'),
	address, output, timestamp, domain;

var resourceType = {
	css: [],
	images: [],
	html: [],
	scripts: [],
	other: []
}

var resourceOrigin = {
	internal: [],
	external: []
}

/* Validate the arguments supplied and exit if validation fails */	
if(system.args.length < 3) {
	console.log('Invalid arguments. Usage: > phantomjs FILE_NAME URL_TO_CRAWL OUTPUT_FILE_NAME.appcache [OPTIONAL_PARAMS]');	
}

/* Store the address and the output file name from the provided arguments */
address = system.args[1];
output = system.args[2];
timestamp = Date.now();

/* Find if the request is for an internal or an external resource */
function isInternalResource(url, domain) {
	var match = url.match(new RegExp(domain));
	if(match) {
		// TODO: Lets assume that an Internal Resource is anything that matches the URL argument.
		return true;
	}
	else {
		return false;
	}
}

/* Cateorize the resources according to thier file extensions */
function categorizeResources(url) {
	var extension = '';
}

/* Add event handlers for onResourceRequested and onResourceReceived events */
page.onResourceRequested = function(requestData, networkRequest) {
	var url = requestData.url;
	if(isInternalResource(url, address)) {
		resourceOrigin.internal.push(url);		
		console.log('Request (#' + requestData.id + '): ' + JSON.stringify(requestData, undefined, 4));
	}	 
}

page.open(address, function(status) {
	if(status == 'success') {
		console.log('....:::: Page Loaded ::::....');
		console.log('....:::: No of internal resources: '+resourceOrigin.internal.length+' ::::....');
		console.log(resourceOrigin.internal);
		phantom.exit();
	}
});

// 08855 259699



