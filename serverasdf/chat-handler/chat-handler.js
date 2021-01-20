"use strict"

const colors = require('colors');
const mongo = require("mongodb");
let mongoClient = mongo.MongoClient;
const CONNECTIONSTRING = "mongodb://localhost:27017/";
const CONNECTIONOPTIONS = { useNewUrlParser: true, useUnifiedTopology: true };

let directs = {}; // LIST OF DIRECTS (ROOMS)

module.exports = (socket) => {
    let user;
    let idDirect = socket.handshake.query.idDirect; // ID OF THE DIRECT (ROOM)
    let idUser = socket.handshake.query.idUser;		// ID OF THE USER WHO WANTS TO PARTECIPATE

    mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTIONS, (err, client) => {
        if (err) {
            log("Errore di connessione al server mongoDb: " + err.errmsg, colors.red);
        }
        else {
            let db = client.db("progetto_mana");
            let directCollection = db.collection("direct");
            let userCollection = db.collection("user");
            // GETTING THE DIRECT
            directCollection.findOne({ "_id": idDirect }, (err, direct) => {
                if (err) {
                    log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                }
                else {
                    // CHECKING IF THE USER IS ALLOWED TO PARTECIPATE IN THE CHAT
                    if (!direct.partecipants.includes(idUser.toString())) {
                        socket.emit("access_denied", JSON.stringify({ "error": "you cannot partecipate to this conversation!" }));
                    }
                    else {
                        if (!("online" in direct)) {
                            direct.online = 0;
                        }
                        direct.online++;	// PEOPLE ONLINE COUNTER
                        if (!(direct._id in directs)) {
                            directs[direct._id] = {
                                "id": direct._id,
                                "name": direct.name,
                                "online": direct.online
                            };	// REGISTRATION OF THE CHAT
                        }
                        // GETTING THE USER INFOS
                        userCollection.findOne({ "_id": idUser }, (err, data) => {
                            // GETTING ONLY THE INFOS WE NEED
                            socket.join(direct._id);
                            user = {
                                "username": data.username,
                                "id": data._id,
                                "first": data.first,
                                "last": data.last,
                                "socketId": socket.id,
                                "directId": direct._id
                            }

                            log(' User ' + colors.yellow(user.username) + colors.green(' enter') + ' in ' + colors.yellow(direct.name));

                            // LOAD AND SEND HISTORY
                            socket.emit("set_history", JSON.stringify(direct.messages))

                            client.close();
                        });
                    }
                }
            });
        }
    });

    // 2) MESSAGE RECEIVED 
    socket.on('send_message', (data) => {
        let direct = directs[user.directId];
        log('User ' + colors.yellow(user.username) + ' sent ' + colors.blue(data) + " to " + colors.yellow(direct.name));

        // MESSAGE PDU
        let msg = {
            'from': { "name": user.first + " " + user.last, "id": user.id },
            'content': data,
            'date': new Date()
        };

        mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTIONS, (err, client) => {
            if (err) {
                log("Errore di connessione al server mongoDb: " + err.errmsg, colors.red);
            }
            else {
                let db = client.db("progetto_mana");
                let directCollection = db.collection("direct");

                // HISTORY UPDATING AND BROADCAST THE MESSAGE TO EVERYONE IN THE DIRECT (ROOM)
                directCollection.updateOne({ "_id": user.directId }, { $addToSet: { "messages": msg } }, (err, data) => {
                    if (err) {
                        log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                    }
                    else {
                        socket.emit("receive_message", JSON.stringify(msg)).to(user.directId).emit('receive_message', JSON.stringify(msg));
                        client.close();
                    }
                });
            }
        });
    });

    // 3) USER DISCONNECTED AND REMOVED
    socket.on('disconnect', () => {
        let direct = directs[user.directId];
        log(' User ' + colors.yellow(user.username) + colors.red(' disconnected!'));

        // IF THE DIRECT IS EMPTY IT IS DELETED FROM THE RAM
        if (direct.online - 1 == 0)
            delete directs[user.directId];
        direct--;
    });
}

function log(data, color = colors.white) {
    console.log(colors.cyan("[" + new Date().toLocaleTimeString() + "]") + ": " + color(data));
}

/*

    SERVER SIDE:

    io.on('connection', thisModuleRequired);


    CLIENT SIDE:

    let socket = io.connect('', { transports: ['websocket'], upgrade: false,query: 'idUser=' + idUser + "&idDirect="+idDirect });

    socket.on('connect', () => {

        // SEND EVENT
        //socket.emit("send_message", "put here the message");

        // DISCONNECTION EVENT
        //socket.disconnect();

    });

    socket.on("set_history", (data) => {
        //  HISTORY LISTENER
        JSON.parse(data).map((item) => {
            // ITERATE HERE TO RESTORE THE MESSAGES
            // HERE CHECK IF THE ID OF THE SENDER IT'S THE SAME LOCALLY
        });
    });

    socket.on('receive_message', function (data) {
        // MESSAGE RECEIVED FROM THE SERVER LISTENER
        data = JSON.parse(data);
        // BUILD THE GRAPHICAL MESSAGE
        // HERE CHECK IF THE ID OF THE SENDER IT'S THE SAME LOCALLY
    });


    socket.on('disconnect', function () {
        // DISCONNECTION LISTENER
        alert("Sei stato disconnesso!");
    });


*/