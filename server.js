var express = require('express');
var app = express();

app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express. static(__dirname + '/css'));
app.use('/data', express.static(__dirname + '/data'));
app.use('/icon', express.static(__dirname + '/icon'));

app.get('/project', function (req, res) {
	res.sendFile("index.html", {root: __dirname});
})

var server = app.listen(8000, function() {
	var host = server.address().address;
	var port = server.address().port;
})
