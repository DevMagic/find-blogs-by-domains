const rp = require('request-promise');
const fs = require('fs');
const csv = require('csv');
const Promise = require('bluebird');

var serialChain = Promise.resolve(),
	counter = 0;
fs.createReadStream('./domains.csv')
  .pipe(csv.parse())
  .pipe(csv.transform(function(domainLine, cb){
  	serialChain = serialChain.then(function () {  		
  	 return verifyIfExists('http://blog.' + domainLine[0] || "")
	    .catch(function () {
	    	return verifyIfExists('https://blog.' + domainLine[0] || "");
	    })
	    .catch(function () {
	    	return verifyIfExists('http://' + (domainLine[0] || "") + '/blog')
	    })
	    .catch(function () {
	    	return verifyIfExists('https://' + (domainLine[0] || "") + '/blog');
	    })
	    .then(function (url) {
        domainLine[1] = url;
        cb(null, domainLine);
        console.log(++counter, "blog found!", new Date(), url);
	    })
	    .catch(function (err) {
	    	domainLine[1] = 'ohno!';
        cb(null, domainLine); 
        console.log(++counter, "blog not found!", new Date());
	    });
    });
  }))
  .pipe(csv.stringify ())
  .pipe(fs.createWriteStream('./domains-result.csv'));

function verifyIfExists (url) {
	return rp(url).then(() => url);
}
