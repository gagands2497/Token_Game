const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const bodyParser = require('body-parser');
const auth_route = require('./Routes/auth');
const databaseINIT = require('./initDatabase');
const cookieParser = require('cookie-parser');
const socketIo = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const path = require('path');
const { addUser, getUser, removeUser, getUsersInRoom } = require('./users');
// Handling CORS 


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Origin , Accept , Authorization , X-Requested-With'
    );

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT,POST,PATCH,DELETE,GET');
        return res.status(200).json({ });
    }
    next();
})

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


app.get('/', (req, res) => {
    // send the documentation
    res.status(200).json({
        message: "Welcome to Teach me Backend"
    })
})


app.use('/auth', auth_route);
// error middleware

const options = {
    cors: {
        Origin: "*"
    }
}
const io = socketIo(server, options);

io.on('connection', (socket) => {

    console.log("user has connected")

    socket.on('join', ({ name, room }, callback) => {
        // console.log(name,room)
        const { error, user } = addUser({ id: socket.id, name, room });

        if (error) {
            console.log(error);
            return callback(error);
        }

        socket.broadcast.to(user.room).emit('message', {
            user: 'Admin',
            text: `${user.name[0].toUpperCase() + user.name.substring(1, user.name.length)} has joined`
        })
        socket.join(user.room);
        callback()

    })

    socket.on('Moving', (data) => {
        let d = JSON.parse(data);
        console.log(d);
        const user = getUser(socket.id);
        socket.broadcast.to(user.room).emit('MoveCommand', data)
    })

    socket.on('disconnect', () => {
        removeUser(socket.id)
        console.log("User has left!!")
    })


})

// implementing socket






app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    console.log(error);
    res.status(status).json({
        message: message,
        errors: error.data
    });

})


server.listen(port, () => {
    // databaseINIT.init();
    console.log("server is running on port number " + port);
})