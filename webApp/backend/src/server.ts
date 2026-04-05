//===========================================================================================================
//? Import Required Modules and Set Port:
//===========================================================================================================
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file
require('dotenv').config({path:__dirname+'/./../../.env'})

import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';


const port: number = Number(process.env.BACKEND_SERVER_PORT)|| 3001;

// host chooses which netweork interface the server binds to (0.0.0.0 is default values means listen on all network interface on this PC)
// so the backend can be accessed from other devices on the same network using my PC's LAN IP

const host: string = (process.env.BACKEND_SERVER_HOST || '0.0.0.0').toString();
import {initDB} from './database/constructDatabase';
//===========================================================================================================
//? Create HTTP Server and Initialize Express App:
//===========================================================================================================
const server = http.createServer(app);//method to creates an HTTP server and passes Express app to handle incoming requests.

// Initialize Socket.IO
const io: SocketIOServer = new SocketIOServer(server, {
    cors: {
        origin: "*",
        // methods: ["GET", "POST"]
    }
});

//===========================================================================================================

const startServer = async() => {
    try{
        await initDB(); // construct the database ///?

        //--------------------------------
        io.on("connection", function(socket) {
            socket.on("send-location", function(data) {
                io.emit("receive-location", {id: socket.id, ...data})
            });
            
            socket.on("disconnect", function() {
                io.emit("user-disconnected", socket.id);
            })
        });
        
        //--------------------------------
        server.listen(port, host,() =>{    
           console.log(`Server is successfully running on http://${host}:${port}`);
        })
    //===========================================
    }
    catch(error){
        console.log("Error occured while initelizing the database");
        process.exit(1); // we will stop the app if the database building failed

    }
};

// server.listen(port)
startServer();