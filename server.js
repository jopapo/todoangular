// server.js

// set up ========================
var express  = require('express');
var app      = express();                               // create our app w/ express
var mongoose = require('mongoose');                     // mongoose for mongodb
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

app.set('port', (process.env.PORT || 8080));

// Teste realtime
var server = require('http').createServer(app);
var io = require('socket.io')(server);
io.on('connection', function (socket) {
	var socketId = socket.id
    var clientIp = socket.request.connection.remoteAddress
	
	console.log("IO " + clientIp);
	/*socket.on('toServer', function (data) {
		socket.emit('toClient', msg);
		//socket.broadcast.emit('toClient', data);
	});*/
});


// CORS
var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
}

// configuration =================

//mongoose.connect('mongodb://node:nodeuser@mongo.onmodulus.net:27017/uwO3mypu');     // connect to mongoDB database on modulus.io
//mongoose.connect('mongodb://localhost:27017/TodoNodeJs');     // Teste local
mongoose.connect('mongodb://todoangular:24xmx@ds029317.mongolab.com:29317/todoangular');

app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());
app.use(allowCrossDomain);
app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users

 // define model =================
var Todo = mongoose.model('Todo', {
	text : String,
	done : Boolean,
});

// routes ======================================================================

// api ---------------------------------------------------------------------
// get all todos
app.get('/api/todos', function(req, res) {

	// use mongoose to get all todos in the database
	Todo.find(function(err, todos) {

		// if there is an error retrieving, send the error. nothing after res.send(err) will execute
		if (err)
			res.send(err)

		res.json(todos); // return all todos in JSON format
	});
});

// create todo and send back all todos after creation
app.post('/api/todos', function(req, res) {

	// create a todo, information comes from AJAX request from Angular
	Todo.create({
		text : req.body.text
		,done : false
	}, function(err, todo) {
		if (err)
			res.send(err);
		res.json(todo);
		
		io.emit('post', todo);
		
		// get and return all the todos after you create another
		/*Todo.find(function(err, todos) {
			if (err)
				res.send(err)
			res.json(todos);
		});*/
	});

});

// delete a todo
app.delete('/api/todos/:todo_id', function(req, res) {
	Todo.remove({
		_id : req.params.todo_id
	}, function(err, todo) {
		if (err)
			res.send(err);
		res.json(todo);
		
		io.emit('delete', req.params.todo_id);
		
		// get and return all the todos after you create another
		/*Todo.find(function(err, todos) {
			if (err)
				res.send(err)
			res.json(todos);
		});*/
	});
});

// update a todo
app.put('/api/todos/:todo_id', function(req, res) {
	Todo.findById(req.params.todo_id, function (err, todo) {
		if (err) return err;
		todo.done = !todo.done;
		todo.save(function (err) {
			if (err) return err;
			res.json(todo);
			
			io.emit('put', todo);
			
			// get and return all the todos after you create another
			/*Todo.find(function(err, todos) {
				if (err)
					res.send(err)
				res.json(todos);
			});*/
		});
	});
});

// application -------------------------------------------------------------
app.get('*', function(req, res) {
	res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

// listen (start app with node server.js) ======================================
//app.listen(8080);
server.listen(app.get('port'), function() {
  console.log("Node app is running on port:" + app.get('port'))
});
