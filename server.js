const dotenv = require("dotenv");

// Load env vars
const path = require("path");
dotenv.config({ path: "./config/config.env" });

const express = require("express");
const errorHandler = require("./middleware/error");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const Notification = require('./models/Notification');

// Connect to database
const sequelize = require("./config/db");
sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully');

    // Sync models and create tables if not exist
    // return sequelize.sync();
  
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
    process.exit(1); 
  });


// Route files
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const commentRoutes = require('./routes/comments');
const tagRoutes = require('./routes/tags');
const notificationRoutes = require('./routes/notification');


const app = express();


const http = require('http');
const socketIo = require('socket.io');
const { constants } = require("buffer");

const server = http.createServer(app);
const io = socketIo(server);

// Listen for socket connections
io.on('connection', (socket) => {
    console.log('New client connected');

    // Subscribe the user to their userId room
    socket.on('join', (userId) => {
      console.log(`User ${userId} has joined their room`);
      socket.join(userId);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

 app.set('io', io);



// Body Parser
app.use(express.json());

// Cookie Parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tasks', commentRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/notifications', notificationRoutes);

const sendNotification = require('./controller/notification')

// // Make sendNotification globally available in the app
app.set('sendNotification', sendNotification); 

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(
    PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server and exit process
    server.close(() => process.exit(1)); 
});