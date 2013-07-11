#!/usr/bin/env node

var fs=require('fs');
var program=require('commander');
var cheerio=require('cheerio');
var rest=require('restler');
var CHECKSFILE_DEFAULT="checks.json";

var assertFileExists=function(infile) {
    var instr=infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1);
    }
    return instr;
};

var cheerioHtmlFile=function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks=function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var showResult=function(out) {
    var outJson=JSON.stringify(out, null, 4);
    console.log(outJson);
};

var checkHtmlFile=function(htmlfile, checksfile) {
    $=cheerioHtmlFile(htmlfile);
    var checks=loadChecks(checksfile).sort();
    var out={};
    for(var ii in checks) {
	var present=$(checks[ii]).length > 0;
	out[checks[ii]]=present;
    }
    showResult(out);
};

var checkURL=function(url, checksfile) {
    rest.get(url).on('complete', function(result, response) {
	if(result instanceof Error) {
	    console.error('Error: ' + response);
	    process.exit(1);
	}
	$=cheerio.load(result);
	var checks=loadChecks(checksfile).sort();
	var out={};
	for(var ii in checks) {
	    var present=$(checks[ii]).length > 0;
	    out[checks[ii]]=present;
	}
	showResult(out);
    });
};



var clone=function(fn) {
    return fn.bind({});
};
    

if(require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists))
	.option('-u, --url <url>', 'URL to html file')
	.parse(process.argv);
    var url=program.url;
    var file=program.file;

    if((!url && !file) || (url && file))
    {
	console.log("Only file or URL should be provided, at least one of them.");
	process.exit(1);	
    }

    if(!url)
    {
	checkHtmlFile(file, program.checks);
    }
    else
    {
	checkURL(url, program.checks);
    }
} else {
    exports.checkHtmlFile=checkHtmlFile;
}
