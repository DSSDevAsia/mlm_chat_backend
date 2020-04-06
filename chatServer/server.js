//Load HTTP module
var url = require('url');
var fs = require('fs');
var app = require('express')();
var server = require('http').createServer(app);
var socketIO = require('socket.io')(server);
const hostname = '127.0.0.1';
const port = 8001;
const axios = require('axios').default;

app.get('/', function (request, response) {
  // response.send('<h1>Hello world</h1>');
  response.sendFile(__dirname + '/index.html');
});

socketIO.on('connection', function (socket) {
  console.log('A user connected');
  // socket.on('disconnect', function(){
  //   console.log('User disconnected');
  // });


  socket.on('join_room', function (room) {
    console.log('room : ' + room);
    // socketIO.to('Room 123').emit(room, 'A new user has joined the room');
    // socketIO.emit('A new user has joined the room');



    socket.join(room, () => {
      let rooms = Object.keys(socket.rooms);
      console.log(rooms);
      console.log('A new user has joined the room');
      // console.log('room:' + room);

      var messages = new Array();

      axios.get('http://localhost:1337/chatrecords')
        .then(function (response) {
          console.log(response);
          var data = response.data;
          data.forEach(function (msg) {
            messages.push(msg.content);
            socketIO.to(room).emit('join_room', msg.content);
          });
        })
        .catch(function (error) {
          console.log(error);
        });


      socketIO.to(room).emit('join_room', 'A new user has joined the room');
      // socketIO.emit('A new user has joined the room');
      // socketIO.in('Room 123').emit('join room', 'A new user has joined the room');

      if (messages != null) {
        messages.forEach(function (msg) {
          socketIO.to(room).emit('join_room', msg);
        });
      }
    });



  });

  socket.on('chat message', function (msg) {
    console.log('message: ' + msg);

    axios.post('http://localhost:1337/chatrecords', {
        authorId: 'user01',
        senderUid: 'user01',
        type: 'Text',
        content: msg,
        parentMeassageId: ''
      })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });


    let rooms = Object.keys(socket.rooms);
    // let room = socketIO.clients.room;
    socketIO.to(rooms[1]).emit('chat message', msg);
    // socketIO.emit('chat message', msg);
  });
});



server.listen(port, function () {
  console.log('listening on : *:8001');
});
// //Create HTTP server and listen on port 3000 for requests
// const server = http.createServer((request, response) => {

//   //Set the response HTTP header with HTTP status and Content type
//   console.log('Connected');
//   var path = url.parse(request.url).pathname;

//   switch(path) {
//     case '/':
//       response.statusCode = 200;
//       response.setHeader('Content-Type', 'text/plain');
//       response.end('Hello World\n');
//       break;
//     case '/socket.html':
//       fs.readFile(__dirname + path, function(error, data) {
//         if (error){
//           response.writeHead(404);
//           response.write("opps this doesn't exist - 404");
//         } else {
//           response.writeHead(200, {"Content-Type": "text/html"});
//           response.write(data, "utf8");
//         }
//         response.end();
//       });
//       break;
//     default:
//         response.writeHead(404);
//         response.write("opps this doesn't exist - 404");
//         response.end();
//         break;
//   }
// });

// //listen for request on port 3000, and as a callback function have the port listened on logged
// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });

// // socketIO.listen(server);
