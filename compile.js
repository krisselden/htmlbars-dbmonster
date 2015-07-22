/* jshint node: true */

var compiler = require('./dist/cjs/htmlbars-compiler');
var fs = require('fs');
var source = fs.readFileSync('./template.hbs','utf8');
var templateSpec = compiler.compileSpec(source, {});
fs.writeFileSync('./template.js', "define('dbmonster/template', function () { return " + templateSpec + "});");
