/* Crawl through a given URL and create a Application Cache Manifest file */

/* Create an instance of phantom webpage */
var page = require('webpage').create(),
	system = require('system'),
	fs = require('fs'),
	address, output, timestamp, domain;

/* This object holds the resources which are categorized based on the file extensions. This helps to generate a clean manifest file by separating the resources in a proper fashion. */
var resourceType = {
	css: [],
	images: [],
	html: [],
	scripts: [],
	fonts: [],
	other: []
};

/* This object will hold all the known extensions and will be passed to a categorizing function where the url is matched against these values. */
var extensions = {
	css: ['.css'],
	images: ['.jpg', '.png', '.gif', '.tiff'],
	html: ['.html'],
	scripts: ['.js', '.json'],
	fonts: ['.woff', '.ttf', '.otf', '.svg']
}

/* This object will hold the resources that are categorized as either internal or external. Only internal resources are of concern now. We can expand the program later on to include external resources if needed. */
var resourceOrigin = {
	internal: [],
	external: []
};

/* Validate the arguments supplied and exit if validation fails */	
if(system.args.length < 3) {
	console.log('Invalid arguments. Usage: > phantomjs FILE_NAME URL_TO_CRAWL OUTPUT_FILE_NAME.appcache [OPTIONAL_PARAMS]');	
}

/* Store the address and the output file name from the provided arguments */
address = system.args[1];
output = system.args[2];
timestamp = Date.now();

/* Find if the request is for an internal or an external resource */
function isInternalResource(url, address) {
	var match = url.match(new RegExp(address));
	if(match) {
		// TODO: Lets assume that an Internal Resource is anything that matches the address.
		return true;
	}
	else {
		return false;
	}
}

/* Strip out the query parameters from the url to reduce any false positives (Categorizing resources based on RegEx is not reliable enough. Having a query parameter will only make it worse) */
function stripQueryParameters(url) {
	return url.replace(/\?.+/g, '');
}

/* Cateorize the resources according to thier file extensions */
function categorizeResources(url, extensions) {
	var strippedUrl = stripQueryParameters(url);
	var matchFound = false;
	for(var i in extensions) {
		var extension = extensions[i];
		for(var j = 0; j < extension.length; j++) {
			if(strippedUrl.match(new RegExp('\\'+extension[j]))) {
				resourceType[i].push(url)
				matchFound = true;
			}			
		}
	}
	if(!matchFound) {
		resourceType.other.push(url);
	}
}

/* PhantomJS Error Handling */
page.onError = function (msg, trace) {
    console.log(msg);
    trace.forEach(function(item) {
        console.log('  ', item.file, ':', item.line);
    })
}

/* Add event handlers for onResourceRequested and onResourceReceived events. This event handler should be attached before the page.open executes */
page.onResourceRequested = function(requestData, networkRequest) {
	var url = requestData.url;
	if(isInternalResource(url, address)) {
		resourceOrigin.internal.push(url);		
		categorizeResources(url, extensions);
		console.log('Request (#' + requestData.id + '): ' + JSON.stringify(requestData, undefined, 4));
	}	 
}

page.open(address, function(status) {
	if(status == 'success') {
		console.log('....:::: Page Loaded ::::....');
		console.log('....:::: No of internal resources: '+resourceOrigin.internal.length+' ::::....');
		console.log(resourceOrigin.internal);
		console.log('....:::: Categorized Resources ::::....');
		console.log(JSON.stringify(resourceType, undefined, 4));
		phantom.exit();
	}
});



