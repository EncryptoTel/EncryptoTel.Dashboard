const cheerio = require('cheerio');
const fs = require('fs');
const _ = require('lodash');
const indexFilePath = '../../dist/index.html';
const args = require('yargs').argv;

console.log('theme: ' + args.theme);
console.log(__dirname);
console.log('After build script started...');

console.log('About to rewrite file: ', indexFilePath);
fs.readFile(__dirname + '/' + indexFilePath, 'utf8', function (err,data) {
    if (err) {
        return console.log(err);
    }
    const $ = cheerio.load(data);

    if(args.theme) {
        $('body').attr('class', args.theme);
    }

    fs.writeFile(__dirname + '/' + indexFilePath, $.html(), function (err) {
        if (err) return console.log(err);
        console.log('Successfully rewrote index html');
    });
});
