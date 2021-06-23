const https = require('https');
const fs = require('fs');

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
}


const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
app.set("view engine", "ejs");
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, { debug: true, });

app.use("/peerjs", peerServer);
app.use(express.static("public"));
app.get("/", (req, res) => { res.redirect(`/${uuidv4()}`); });
app.get("/:room", (req, res) => { res.render("room", { roomId: req.param.room }); });

io.on("connection", (socket) => {
    console.log("join");
    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit("user-connected", userId);
    });
});


//create https server
https.createServer(options, app).listen(3030);