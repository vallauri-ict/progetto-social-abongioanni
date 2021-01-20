"use strict";

const ObjectId = require("mongodb").ObjectId;
const fs = require("fs");

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const fileupload = require("express-fileupload");

const nodemailer = require('nodemailer');
const bcrypt = require("bcryptjs");
const tokens = require("./token-handler/token-handler");
const mongo = require("mongodb");
const colors = require("colors");
const cloudinary = require('cloudinary');

let mongoClient = mongo.MongoClient;

const PORT = process.env.PORT || 1337;

const CONNECTION_STRING = "mongodb+srv://bongioanni:costagigi@cluster0.tfxzk.mongodb.net/";
//const CONNECTION_STRING="mongodb://localhost:27017/?readPreference=primary&ssl=false"
const CONNECTION_OPTIONS = { useNewUrlParser: true, useUnifiedTopology: true };
const UPLOADS_PATH = "/uploads/";
const DB_NAME = "progetto_mana";
const ERROR_STRING = "Errore di connessione al server mongoDb";
const WHITELIST = ["https://progetto-mana.web.app", "http://localhost:4200", "http://192.168.178.105:4200", "http://localhost:8000", "http://192.168.178.105:8000"]; // list of allow domain
const CLOUDINARY_URL = "cloudinary://221739279987621:evb6hhmmkvObYFMqvnTmR-1cFOs@df2qjiqb9";
const CLOUD_NAME = "df2qjiqb9";
const API_KEY = "221739279987621";
const API_SECRET = "evb6hhmmkvObYFMqvnTmR-1cFOs";
const EMAIL = "diesis.progetto@gmail.com";
const EMAIL_PASSWORD = "costagigi";

let EMAIL_PAGE;
const CORS_OPTIONS = {
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }
        if (WHITELIST.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
};

const app = express();
const server = app.listen(PORT, init);

const io = require("socket.io")(server, {
    cors: {
        origin: WHITELIST,
        credentials: true
    }
});

/****************** MIDDLEWARE ROUTES ******************/
app.use(cors(CORS_OPTIONS));
app.use(express.json({ limit: "10mb" }));
app.set("json spaces", 4);

// AVOID CORS PROBLEMS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Headers", "*");
    res.header('Access-Control-Allow-Credentials', true);
    next();
});

app.use(express.static("static"));
app.use(express.static("./static/uploads"));

// INTERCEPT POST PARAMETERS IN REQ.BODY
app.use(bodyParser.urlencoded({ "extended": true }));
app.use(bodyParser.json());

app.use(cookieParser());

app.use(fileupload({
    "limits": { "fileSize": (50 * 1024 * 1024) } // 50*1024*1024 // 50000000 
}));

/***************** SOCKET ROUTES **********************/

let activeUsers = {};

io.on("connection", (socket) => {

    socket.on("disconnect", (data) => {

    });

    socket.on("get_rooms", (params) => {
        mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
            if (err) {
                log(err.errmsg, colors.red);
                res.status(503).send("Errore di connessione al database");
            }
            else {
                let db = client.db(DB_NAME);
                let collection = db.collection('direct');

                collection.aggregate([
                    {
                        $project: { "_id": 1, "partecipants": 1, "image": 1, "name": 1, "last": 1, "messages": { $slice: ["$messages", -1] } }
                    },
                    {
                        $match: { "partecipants": ObjectId(params._id) }
                    },
                    {
                        $sort: {
                            "last": 1
                        }
                    }

                ]).toArray((err, directs) => {
                    if (err) {
                        log(err.errmsg, colors.red)
                        socket.emit("access_denied", JSON.stringify({ "error": "you cannot partecipate to this conversation!" }));
                    }
                    else {
                        socket.emit("room_list", directs);
                    }
                    client.close();
                });
            }
        });

    });

    socket.on("get_chat", (params) => {
        mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
            if (err) {
                log(err.errmsg, colors.red);
                res.status(503).send("Errore di connessione al database");
            }
            else {
                let db = client.db(DB_NAME);
                let collection = db.collection('direct');
                collection.aggregate([
                    {
                        $project: {
                            "_id": 1,
                            "image": 1,
                            "name": 1,
                            "partecipants": 1,
                            "messages": 1/* { $slice: ["$messages", params.number-params.amount] } */
                        }
                    },
                    {
                        $match: { "_id": ObjectId(params._id) }
                    },
                ]).toArray((err, room) => {
                    room = room[0];
                    if (err) {
                        log(err.errmsg, colors.red)
                        socket.emit("access_denied", JSON.stringify({ "error": "you cannot partecipate to this conversation!" }));
                    }
                    else {
                        if (!activeUsers[params.user._id]) {
                            activeUsers[params.user._id] = {};
                        }
                        socket.join(params._id);
                        activeUsers[params.user._id] = {
                            "username": params.user.username,
                            "image": params.user.image,
                            "roomName": room.name,
                            "roomId": params._id,
                            "partecipants": room.partecipants,
                            "socket": socket
                        };
                        socket.emit("chat_list", room);
                    }
                    client.close();
                });
            }
        });
    });

    socket.on("get_chat_update", (params) => {
        mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
            if (err) {
                log(err.errmsg, colors.red);
                res.status(503).send("Errore di connessione al database");
            }
            else {
                let db = client.db(DB_NAME);
                let collection = db.collection('direct');
                collection.aggregate([
                    {
                        $project: {
                            "_id": 1,
                            "image": 1,
                            "name": 1,
                            "partecipants": 1,
                            "messages": 1/* { $slice: ["$messages", params.number- params.amount] } */
                        }
                    },
                    {
                        $match: { "_id": ObjectId(params._id) }
                    },
                ]).toArray((err, room) => {
                    room = room[0];
                    if (err) {
                        log(err.errmsg, colors.red)
                        socket.emit("access_denied", JSON.stringify({ "error": "you cannot partecipate to this conversation!" }));
                    }
                    else {
                        let msg=room.messages;
                        msg=msg.slice(msg.length-(params.amount*params.number)-params.amount,msg.length-(params.number*params.amount));

                        if(activeUsers[params.user._id]){
                            socket.emit("chat_update",msg);
                        }
                    }
                    client.close();
                });
            }
        });
    });

    socket.on("get_chat_details", (params) => {
        mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
            if (err) {
                log(err.errmsg, colors.red);
                res.status(503).send("Errore di connessione al database");
            }
            else {
                let db = client.db(DB_NAME);
                let diirectCollection = db.collection('direct');
                let userCollection = db.collection('user');
                diirectCollection.aggregate([
                    {
                        $project: {
                            "_id": 1,
                            "image": 1,
                            "name": 1,
                            "partecipants": 1,
                        }
                    },
                    {
                        $match: { "_id": ObjectId(params._id) }
                    },
                ]).toArray((err, room) => {
                    room = room[0];
                    if (err) {
                        log(err.errmsg, colors.red)
                        socket.emit("access_denied", JSON.stringify({ "error": "you cannot partecipate to this conversation!" }));
                    }
                    else {
                        let partecipants = [];
                        room.partecipants.map((userId, i) => {
                            userCollection.findOne({ "_id": ObjectId(userId) }, { projection: { "_id": 1, "image": 1, "username": 1, "first": 1, "last": 1 } }, (err, user) => {
                                if (err) {

                                }
                                else {
                                    partecipants.push(user);
                                    if (i == room.partecipants.length - 1) {
                                        room.partecipants = partecipants
                                        socket.emit("chat_details", room);
                                        client.close();
                                    }
                                }
                            });
                        });
                    }
                });
            }
        });
    });

    socket.on("set_message", (params) => {
        let text = params.text;
        let userSocket = activeUsers[params.userId];
        let message = {
            "owner": {
                "_id": ObjectId(params.userId),
                "image": userSocket.image,
                "username": userSocket.username
            },
            "text": text,
            date: new Date()
        };
        mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
            if (err) {
                log(err.errmsg, colors.red);
                res.status(503).send("Errore di connessione al database");
            }
            else {
                let db = client.db(DB_NAME);
                let collection = db.collection('direct');
                collection.updateOne({ "_id": ObjectId(userSocket.roomId) }, { $push: { "messages": message } }, (err, data) => {
                    if (err) {

                    }
                    else {
                        message.name = userSocket.roomName;
                        userSocket.partecipants.map((item) => {
                            if (activeUsers[item]) {
                                activeUsers[item]["socket"].emit("message_received", message);
                            }
                        });
                    }
                    client.close();
                });
            }
        });
    });

    socket.on("exit_chat", (data) => {
        delete activeUsers[data.userId];
    });
});

/***************** ROUTES SPECIFICHE ******************/

// ==================== PROFILE ====================

app.get("/cookie", (req, res, next) => {
    tokens.getToken(req, res, (err, payload) => {
        res.json(payload);
    });
});

app.post("/login", (req, res, next) => {
    mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
        if (err) {
            log(err.errmsg, colors.red);
            res.status(503).send("Errore di connessione al database");
        }
        else {
            let db = client.db(DB_NAME);
            let collection = db.collection('user');

            let username = req.body.username;
            collection.findOne({ "username": username }, { projection: { "username": 1, "password": 1, "first": 1, "last": 1, "image": 1, "theme": 1 } }, (err, user) => {
                if (err) {
                    log(err.errmsg, colors.red);
                    res.status(500).send("Internal Error in Query Execution");
                }
                else {
                    if (!user) {
                        res.status(401).send("Username or Password non validi");
                    }
                    else {
                        bcrypt.compare(req.body.password, user.password, (err, success) => {
                            if (err) {
                                res.status(500).send("Internal Error in bcrypt compare");
                            }
                            else {
                                if (!success) {
                                    res.status(401).send("Username or Password non validi");
                                }
                                else {
                                    delete user.password
                                    let payload = tokens.generatePayload(user);
                                    let token = tokens.createToken(payload);
                                    tokens.writeCookie(res, token);
                                    res.send({ "result": "ok" });
                                }
                            }
                        });
                    }
                }
                client.close();
            });
        }
    });
});

app.post("/logout", (req, res, next) => {
    tokens.deleteCookie(req, res);
});

app.post("/login/forgot", (req, res, next) => {
    let username = req.body.username;
    mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
        if (err) {
            log(ERROR_STRING, colors.red);
        }
        else {
            let db = client.db(DB_NAME);
            let collection = db.collection("user");
            try {
                collection.findOne({ "username": username }, { projection: { "email": 1, "username": 1, "image": 1 } }, (err, user) => {
                    if (err) {
                        log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                        res.json({ "error": "Errore durante l'esecuzione della query: " + err.errmsg });
                    }
                    else {
                        if (user) {
                            let transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    user: EMAIL,
                                    pass: EMAIL_PASSWORD
                                }
                            });

                            var mailOptions = {
                                from: EMAIL,
                                to: user.email,
                                subject: 'Password recovery',
                                html: EMAIL_PAGE
                            };

                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {
                                    res.status(500).send("error");
                                } else {
                                    let payload = tokens.generatePayload(user);
                                    let token = tokens.createToken(payload);
                                    tokens.writeCookie(res, token);
                                    res.json({ "result": "ok" });
                                }
                            });
                        }
                        else {
                            res.status(500).send("username does not exists");
                        }
                    }
                    client.close();
                });
            }
            catch {
                next();
            }
        }
    });
});


app.get("/login/:username", (req, res, next) => {
    mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
        if (err) {
            log(ERROR_STRING, colors.red);
        }
        else {
            let db = client.db(DB_NAME);
            let collection = db.collection("user");
            try {
                collection.findOne({ "username": req.params.username }, { projection: { "image": 1 } }, (err, data) => {
                    if (err) {
                        log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                        res.json({ "error": "Errore durante l'esecuzione della query: " + err.errmsg });
                    }
                    else {
                        if (data) {
                            res.send({ "image": data.image });
                        }
                        else {
                            res.send("");
                        }
                    }
                    client.close();
                });
            }
            catch {
                next();
            }
        }
    });
});

app.get("/signup/:name/:param", (req, res, next) => {
    if (req.params.name == "username") {
        mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
            if (err) {
                log(ERROR_STRING, colors.red);
            }
            else {
                let db = client.db(DB_NAME);
                let collection = db.collection("user");
                try {
                    collection.findOne({ "username": req.params.param }, { projection: { "username": 1 } }, (err, data) => {
                        if (err) {
                            log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                            res.json({ "error": "Errore durante l'esecuzione della query: " + err.errmsg });
                        }
                        else {
                            if (data) {
                                res.send({ "ris": "nok" });
                            }
                            else {
                                res.send({ "ris": "ok" });
                            }
                        }
                        client.close();
                    });
                }
                catch {
                    next();
                }
            }
        });
    }
    else if (req.params.name) {
        mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
            if (err) {
                log(ERROR_STRING, colors.red);
            }
            else {
                let db = client.db(DB_NAME);
                let collection = db.collection("user");
                try {
                    collection.findOne({ "email": req.params.param }, { projection: { "email": 1 } }, (err, data) => {
                        if (err) {
                            log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                            res.json({ "error": "Errore durante l'esecuzione della query: " + err.errmsg });
                        }
                        else {
                            if (data) {
                                res.send({ "ris": "nok" });
                            }
                            else {
                                res.send({ "ris": "ok" });
                            }
                        }
                        client.close();
                    });
                }
                catch {
                    next();
                }
            }
        });
    }
});


app.post("/signup", (req, res, next) => {
    let params = req.body;
    mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
        if (err) {
            log(ERROR_STRING, colors.red);
        }
        else {
            let db = client.db(DB_NAME);
            let collection = db.collection("user");
            try {
                bcrypt.hash(params.password, 10, (err, hash) => {
                    if (!err) {
                        params.password = hash;
                        collection.insertOne({
                            "username": params.username,
                            "password": params.password,
                            "email": params.email,
                            "bio": params.bio,
                            "first": params.nome,
                            "last": params.cognome,
                            "date-of-birth": params["date-of-birth"],
                            "theme": params.theme,
                            "saved-posts": [],
                            "posts": [],
                            "following": []
                        }, (err, data) => {
                            if (err) {
                                log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                                res.json({ "error": "Errore durante l'esecuzione della query: " + err.errmsg });
                            }
                            else {
                                let id = data.insertedId;
                                cloudinary.v2.uploader.upload(params.image, {
                                    folder: id,
                                    use_filename: true
                                }, (err, result) => {
                                    collection.updateOne({ "_id": ObjectId(id) }, { "$set": { "image": result.secure_url } }, (err, data) => {
                                        collection.findOne({ "_id": ObjectId(id) }, { projection: { "username": 1, "password": 1, "first": 1, "last": 1, "image": 1, "theme": 1 } }, (err, user) => {
                                            if (err) {
                                                log(err.errmsg, colors.red);
                                                res.status(500).send("Internal Error in Query Execution");
                                            }
                                            else {
                                                let payload = tokens.generatePayload(user);
                                                let token = tokens.createToken(payload);
                                                tokens.writeCookie(res, token);
                                                res.json({ "_id": id });
                                            }
                                            client.close();
                                        });

                                    });
                                });
                            }
                        });
                    }
                });
            } catch (err) {
                next();
            }
        }
    });
});

app.use((req, res, next) => {
    tokens.getToken(req, res, (err, payload) => {
        req.payload = payload;
        payload = tokens.generatePayload(payload);
        let token = tokens.createToken(payload);
        tokens.writeCookie(res, token);
        next();
    });
});

app.post("/chat/create", (req, res, next) => {
    let payload = req.payload;
    req.body.partecipants.map((item, i) => {
        req.body.partecipants[i] = new ObjectId(item);
    });
    mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
        if (err) {
            log(ERROR_STRING, colors.red);
        }
        else {
            let db = client.db(DB_NAME);
            let collection = db.collection("direct");
            try {
                collection.insertOne({
                    "name": req.body.name,
                    "partecipants": req.body.partecipants,
                    "messages": [{
                        "owner": {
                            "_id": new ObjectId(payload._id),
                            "image": payload.image,
                            "username": payload.username
                        },
                        "text": payload.username + " add you in this chat!",
                        "date": new Date()
                    }],
                    "last": new Date(),
                }, (err, data) => {
                    if (err) {
                        log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                        res.json({ "error": "Errore durante l'esecuzione della query: " + err.errmsg });
                    }
                    else {
                        let id = data.insertedId;
                        cloudinary.v2.uploader.upload(req.body.image, {
                            folder: id,
                            use_filename: true
                        }, (err, result) => {
                            collection.updateOne({ "_id": ObjectId(id) }, { "$set": { "image": result.secure_url } }, (err, data) => {
                                if (err) {
                                    log(err.errmsg, colors.red);
                                    res.status(500).send("Internal Error in Query Execution");
                                }
                                else {
                                    res.json({ "result": "ok" });
                                }
                                client.close();
                            });
                        });
                    }
                });

            } catch (err) {
                next();
            }
        }
    });
});

app.post("/login/update", (req, res, next) => {
    let password = req.body.password;
    let payload = req.payload;
    mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
        if (err) {
            log(ERROR_STRING, colors.red);
        }
        else {
            let db = client.db(DB_NAME);
            let collection = db.collection("user");
            try {
                bcrypt.hash(password, 10, (err, hash) => {
                    if (!err) {
                        password = hash;
                        collection.updateOne({ "_id": ObjectId(payload._id) }, { $set: { "password": hash } }, (err, data) => {
                            if (err) {
                                log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                                res.json({ "error": "Errore durante l'esecuzione della query: " + err.errmsg });
                            }
                            else {
                                if (data) {
                                    res.send({ "result": "ok" });
                                }
                                else {
                                    res.send({ "result": "nok" });
                                }
                            }
                            client.close();
                        });
                    }
                });
            }
            catch {
                next();
            }
        }
    });
});

// FOLLOW TOGGLE DI UN PROFILO
app.post("/profile/follow", (req, res, next) => {
    let payload = req.payload;
    let id = ObjectId(req.body["id"]);
    mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
        if (err) {
            log(ERROR_STRING, colors.red);
        }
        else {
            let db = client.db(DB_NAME);
            let collection = db.collection("user");
            try {

                collection.find({ "_id": ObjectId(payload._id), "following": ObjectId(id) }).count((err, data) => {
                    if (data > 0) {
                        collection.updateOne({ "_id": ObjectId(payload._id) }, { "$pull": { "following": id } }, (err, data) => {
                            if (err) {
                                log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                                res.json({ "error": "Errore durante l'esecuzione della query: " + err.errmsg });
                            }
                            else {
                                res.json({ "result": "ok" });
                            }
                            client.close();
                        });
                    }
                    else {
                        collection.updateOne({ "_id": ObjectId(payload._id) }, { "$push": { "following": id } }, (err, data) => {
                            if (err) {
                                log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                                res.json({ "error": "Errore durante l'esecuzione della query: " + err.errmsg });
                            }
                            else {
                                res.json({ "result": "ok" });
                            }
                            client.close();
                        });
                    }
                });
            } catch (err) {
                next();
            }
        }
    });

});

// PRENDO I POST SALVATI CON INFO BASILARI (ID,IMAGE)
app.post("/profile/saved/", (req, res, next) => {
    let payload = req.payload;
    let postNumber = req.body["post_number"];
    let postAmount = req.body["post_amount"];

    mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
        if (err) {
            log(ERROR_STRING, colors.red);
        }
        else {
            let db = client.db(DB_NAME);
            let postCollection = db.collection("post");
            let userCollection = db.collection("user");
            try {

                userCollection.findOne({ "_id": ObjectId(payload._id) }, (err, user) => {
                    if (err) {
                        log("Errore durante l' esecuzione della query: " + err.errmsg, colors.red);
                    }
                    else {
                        let idArray = user["saved-posts"];
                        postCollection.find({ "_id": { "$in": idArray } })
                            .sort({ "date": -1 })
                            .skip(postNumber * postAmount)
                            .limit(postAmount)
                            .toArray((err, posts) => {
                                if (err) {
                                    log("Errore durante l' esecuzione della query: " + err.errmsg, colors.red);
                                }
                                else {
                                    res.json(posts);
                                    client.close();
                                }
                            });
                    }
                });
            } catch (err) {
                next();
            }
        }
    });

});

// PRENDO I POST SALVATI CON INFO BASILARI (ID,IMAGE)
app.post("/profile/delete", (req, res, next) => {
    let id = req.body.id;
    let payload = req.payload;
    if (payload._id == id) {

        mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
            if (err) {
                log(ERROR_STRING, colors.red);
            }
            else {
                let db = client.db(DB_NAME);
                let userCollection = db.collection("user");
                let directCollection = db.collection("direct");
                try {
                    userCollection.deleteOne({ "_id": ObjectId(id) });
                    userCollection.updateMany({}, { $pull: { "following": ObjectId(id) } }, { multi: true });
                    directCollection.updateMany({}, { $pull: { "partecipants": ObjectId(id) } }, { multi: true }, (err, data) => {
                        client.close();
                    });
                } catch (err) {
                    next();
                }
            }
        });
    }

});

// RITORNA 1 SOLO OGGETTO USER CON GIA" ALL"INTERNO DI "POSTS" I POST DELL"UTENTE (ID,IMAGE)
// RITORNA ANCHE SE LO SEGUO OPPURE NO
app.get("/profile/:id", (req, res, next) => {
    let id = req.params["id"];
    mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
        if (err) {
            log(ERROR_STRING, colors.red);
        }
        else {
            let db = client.db(DB_NAME);
            let postCollection = db.collection("post");
            let userCollection = db.collection("user");
            try {

                userCollection.findOne({ "_id": ObjectId(id) }, (err, user) => {
                    if (err) {
                        log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                    }
                    else {
                        if (!user) {
                            res.send({ "error": "user not exists" });
                            client.close();
                        }
                        else {
                            let idArray = user["posts"];
                            postCollection.find({ "_id": { "$in": idArray } })
                                .sort({ "_id": -1 })
                                .project({ "_id": 1, "image": 1 })
                                .toArray((err, posts) => {
                                    if (err) {
                                        log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                                    }
                                    else {
                                        user["posts"] = posts;
                                        userCollection.find({ "following": user["_id"] }).count((err, data) => {
                                            if (err) {
                                                log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                                            }
                                            else {
                                                user["followers"] = data;
                                                res.json(user);
                                            }
                                            client.close();
                                        });
                                    }
                                });
                        }
                    }
                });
            } catch (err) {
                next();
            }
        }
    });
});

// FOLLOWERS
app.get("/profile/:id/followers", (req, res, next) => {
    mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
        if (err) {
            log(ERROR_STRING, colors.red);
        }
        else {
            let db = client.db(DB_NAME);
            let collection = db.collection("user");
            try {

                collection.find({ "following": req.params.id }).toArray((err, data) => {
                    if (err) {
                        log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                        res.status(500);
                        res.json({ "error": "Errore durante l'esecuzione della query: " + err.errmsg });
                    }
                    else {
                        res.json(data);
                        client.close();
                    }
                });
            } catch (err) {
                next();
            }
        }
    });
});

// FOLLOWING
app.get("/profile/:id/following", (req, res, next) => {
    mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
        if (err) {
            log(ERROR_STRING, colors.red);
        }
        else {
            let db = client.db(DB_NAME);
            let collection = db.collection("user");
            try {

                collection.findOne({ "_id": new ObjectId(req.params.id) }, {
                    "projection": {
                        "following": 1
                    }
                }, (err, user) => {
                    if (err) {
                        log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                        res.status(500);
                        res.json({ "error": "Errore durante l'esecuzione della query: " + err.errmsg });
                    }
                    else {
                        collection.find({ "_id": { "$in": user.following } }).project({ "_id": 1, "username": 1, "image": 1, "first": 1, "last": 1 }).toArray((err, data) => {
                            res.json(data);
                            client.close();
                        });
                    }
                });
            } catch (err) {
                next();
            }
        }
    });
});

// ==================== HOME ====================

// RITORNA I POST DEI SEGUITI DELL"UTENTE (ID IN POST) E LI ORDINIAMO IN ORDINE DECRESCENTE DI DATA
// CON AL POSTO DI OWNER METTIAMO LE INFORMAZIONI BASILARI DELL"UTENTE (ID, USERNAME, IMAGE)
app.post("/home", (req, res, next) => {
    let payload = req.payload;
    let postNumber = req.body["post_number"];
    let postAmount = req.body["post_amount"];
    mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
        if (err) {
            log(ERROR_STRING, colors.red);
        }
        else {
            let db = client.db(DB_NAME);
            let postCollection = db.collection("post");
            let userCollection = db.collection("user");
            try {
                userCollection.findOne({ "_id": ObjectId(payload._id) }, { projection: { "following": 1, "_id": 1 } }, (err, data) => {
                    if (err) {
                        log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                    }
                    else {
                        let idArray = data["following"];
                        postCollection.find({ owner: { $in: idArray } })
                            .sort({ "date": -1 })
                            .skip(postNumber * postAmount)
                            .limit(postAmount)
                            .toArray((err, posts) => {
                                if (err) {
                                    log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                                }
                                else {
                                    let i = 0;
                                    posts.map((item) => {
                                        let id = item.owner; // QUESTO E' UN OBJECT ID
                                        userCollection.findOne({ "_id": id },
                                            { projection: { "_id": 1, "username": 1, "image": 1 } },
                                            (err, user) => {
                                                if (err) {
                                                    log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                                                }
                                                else {
                                                    item.owner = user
                                                    if (i == posts.length - 1) {
                                                        res.json(posts)
                                                        client.close();
                                                    }
                                                    else {
                                                        i++;
                                                    }
                                                }
                                            });
                                    });
                                }
                            });
                    };
                });
            } catch (err) {
                next();
            }
        }
    });


});

// ==================== POST ====================

// AGGIUNGE LIKE AD UN POST (AGGIUNGO ID)
app.post("/post/like", (req, res, next) => {
    let payload = req.payload;
    let idPost = req.body.id;
    mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
        if (err) {
            log(ERROR_STRING, colors.red);
        }
        else {
            let db = client.db(DB_NAME);
            let collection = db.collection("post");
            try {
                collection.findOne({ "_id": ObjectId(idPost) }, (err, data) => {
                    if (err) {
                        log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                    }
                    else {
                        if (data.likes.includes(payload._id)) {
                            collection.updateOne({ "_id": ObjectId(idPost) }, { "$pull": { "likes": payload._id } }, (err, data) => {
                                if (err) {
                                    log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                                    res.json({ "error": "Errore durante l'esecuzione della query: " + err.errmsg });
                                }
                                else {
                                    res.json({ "result": "ok" });
                                }
                                client.close();
                            });
                        }
                        else {
                            collection.updateOne({ "_id": ObjectId(idPost) }, { "$push": { "likes": payload._id } }, (err, data) => {
                                if (err) {
                                    log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                                    res.json({ "error": "Errore durante l'esecuzione della query: " + err.errmsg });
                                }
                                else {
                                    res.json({ "result": "ok" });
                                }
                                client.close();
                            });
                        }
                    }
                });
            } catch (err) {
                next();
            }
        }
    });

});

// TOGGLE AL CAMPO SAVEDPOST DELL"UTENTE L"ID DEL POST
app.post("/post/save", (req, res, next) => {
    let payload = req.payload;

    let idPost = req.body.id;
    mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
        if (err) {
            log(ERROR_STRING, colors.red);
        }
        else {
            let db = client.db(DB_NAME);
            let collection = db.collection("user");
            try {
                collection.find({ "$and": [{ "_id": ObjectId(payload._id) }, { "saved-posts": ObjectId(idPost) }] }).count((err, data) => {
                    if (data > 0) {
                        collection.updateOne({ "_id": ObjectId(payload._id) }, { "$pull": { "saved-posts": ObjectId(idPost) } }, (err, data) => {
                            if (err) {
                                log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                                res.json({ "error": "Errore durante l'esecuzione della query: " + err.errmsg });
                            }
                            else {
                                res.json({ "result": "ok" });
                            }
                            client.close();
                        });
                    }
                    else {
                        collection.updateOne({ "_id": ObjectId(payload._id) }, { "$push": { "saved-posts": ObjectId(idPost) } }, (err, data) => {
                            if (err) {
                                log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                                res.json({ "error": "Errore durante l'esecuzione della query: " + err.errmsg });
                            }
                            else {
                                res.json({ "result": "ok" });
                            }
                            client.close();
                        });
                    }
                });
            } catch (err) {
                next();
            }
        }
    });

});

// AGGIUNGO UN POST (PARAMETRI NEL BODY)
app.post("/post/add", (req, res, next) => {
    let payload = req.payload;

    let params = req.body;
    let files = [];
    let path;

    if (Array.isArray(req.files["image"])) {
        files = req.files["image"];
    }
    else {
        files.push(req.files["image"]);
    }
    files.map((item) => {
        path = UPLOADS_PATH + payload._id;
        let id;
        mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
            if (err) {
                log(ERROR_STRING, colors.red);
            }
            else {
                let db = client.db(DB_NAME);
                let postCollection = db.collection("post");
                let userCollection = db.collection("user");
                postCollection.insertOne({
                    "owner": new ObjectId(payload._id),
                    "likes": [],
                    "comment": [],
                    "date": new Date(),
                    "tags": params.tags,
                    "description": params.description,
                }, (err, data) => {
                    if (err) {
                        log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                    }
                    else {
                        id = data.insertedId;
                        let type = item["type"] || item["mimetype"];
                        let ext = type.split('/').pop();
                        path += "/" + id + "." + ext;
                        userCollection.updateOne({ "_id": ObjectId(payload._id) }, { "$push": { "posts": id } }, (err, data) => {
                            if (err) {
                                log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                                res.json({ "error": "Errore durante l'esecuzione della query: " + err.errmsg });
                            }
                            else {
                                postCollection.updateOne({ "_id": ObjectId(id) }, { "$set": { "image": path } }, (err, data) => {
                                    if (err) {
                                        log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                                        res.json({ "error": "Errore durante l'esecuzione della query: " + err.errmsg });
                                    }
                                    else {
                                        let folderPath = path.split('/');
                                        folderPath.pop();
                                        folderPath = folderPath.join('/');
                                        if (!fs.existsSync("./static" + folderPath)) {
                                            fs.mkdirSync("./static" + folderPath);
                                        }
                                        item.mv("./static" + path, (err, data) => {
                                            if (err) {
                                                log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                                                res.json({ "error": "Errore durante l'esecuzione della query: " + err.errmsg });
                                            }
                                            else {
                                                cloudinary.v2.uploader.upload("./static" + path, {
                                                    folder: payload._id,
                                                    use_filename: true
                                                }, (err, result) => {
                                                    postCollection.updateOne({ "_id": id }, { "$set": { "image": result.secure_url } }, (err, data) => {
                                                        res.json({ "result": "ok" });
                                                        client.close();
                                                    });
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });

            }
        });
    });
});

// ELIMINO IL POST
app.post("/post/remove", (req, res, next) => {
    let payload = req.payload;

    let idPost = req.body.id;
    mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
        if (err) {
            log(ERROR_STRING, colors.red);
        }
        else {
            let db = client.db(DB_NAME);
            let collection = db.collection("post");
            try {

                collection.deleteOne({ "_id": ObjectId(idPost), "owner": ObjectId(payload._id) }, (err, data) => {
                    if (err) {
                        log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                        res.json({ "error": "Errore durante l'esecuzione della query: " + err.errmsg });
                    }
                    else {
                        res.json({ "result": "ok" });
                    }
                    client.close();
                });
            } catch (err) {
                next();
            }
        }
    });

});

// RITORNA 1 SOLO POST CON AL POSTO DI OWNER METTIAMO LE INFORMAZIONI BASILARI DELL"UTENTE (ID, USERNAME, IMAGE)
app.get("/post/:id", (req, res, next) => {
    let payload = req.payload;

    mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
        if (err) {
            log(ERROR_STRING, colors.red);
        }
        else {
            let db = client.db(DB_NAME);
            let postCollection = db.collection("post");
            postCollection.findOne({ "_id": ObjectId(req.params.id) }, (err, post) => {
                if (err) {
                    log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                    res.status(500);
                    res.json({ "error": "Errore durante l'esecuzione della query: " + err.errmsg });
                }
                else {
                    post.owner = {
                        "_id": payload._id,
                        "username": payload.username,
                        "image": payload.image
                    };
                    res.json(post);
                }
                client.close();
            });

        }
    });

});

// ==================== SEARCH ====================

// RITORNA UNA SERIE DI RISULTATI DI PROFILI CON ID,USERNAME,FIRST,LAST,IMAGE (RICERCA IN POST)
// IN BASE AL NOME/COGNOME/USERNAME PARTENDO DA SEGUITI -> FOLLOWERS -> ALTRI
app.post("/search/user", (req, res, next) => {
    let userNumber = req.body["user_number"];
    let userAmount = req.body["user_amount"];
    mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
        if (err) {
            log(ERROR_STRING, colors.red);
        }
        else {
            let db = client.db(DB_NAME);
            let collection = db.collection("user");

            let search = req.body.search.replace(/\s\s+/g, " ").trim();
            let regex = [];
            search.split(" ").map((item) => {
                regex.push(new RegExp("^" + item, "ig"));
            });
            try {

                collection.aggregate([
                    {
                        "$project": {
                            "_id": 1,
                            "image": 1,
                            "username": 1,
                            "first": 1,
                            "last": 1
                        }
                    },
                    {
                        "$match": {
                            "$or": [
                                { "first": { "$in": regex } },
                                { "last": { "$in": regex } },
                                { "username": { "$in": regex } }
                            ]
                        }
                    },
                    {
                        "$skip": ((userNumber) * userAmount)
                    },
                    {
                        "$limit": userAmount
                    }
                ]).toArray((err, users) => {
                    if (err) {
                        log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                        res.status(500);
                        res.json({ "error": "Errore durante l'esecuzione della query: " + err.errmsg });
                    }
                    else {
                        res.json(users);
                        client.close()
                    }
                });
            } catch (err) {
                next();
            }
        }
    });
});

// RITORNA UNA SERIE DI RISULTATI DI POST CON ID,IMAGE (RICERCA IN POST) IN BASE A DEI TAG
app.post("/search/post", (req, res, next) => {
    let postNumber = req.body["post_number"];
    let postAmount = req.body["post_amount"];
    mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
        if (err) {
            log(ERROR_STRING, colors.red);
        }
        else {
            let db = client.db(DB_NAME);
            let collection = db.collection("post");

            let search = req.body.search;
            search = search.replace(/\s\s+/g, " ").trim();
            let regex = [];
            search.split(" ").map((item) => {
                regex.push(new RegExp("#" + item, "ig"));
            });
            try {

                collection.aggregate([
                    {
                        "$project": {
                            "_id": 1,
                            "image": 1,
                            "tags": 1
                        }
                    },
                    {
                        "$match": {
                            "$and": [
                                { "tags": { "$in": regex } }
                            ]
                        }
                    },
                    /*                {
                                       "$sort": {
                   
                                       }
                                   }, */
                    {
                        "$skip": ((postNumber) * postAmount)
                    },
                    {
                        "$limit": postAmount
                    }
                ]).toArray((err, users) => {
                    if (err) {
                        log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                        res.status(500);
                        res.json({ "error": "Errore durante l'esecuzione della query: " + err.errmsg });
                    }
                    else {
                        res.json(users);
                        client.close();
                    }
                });
            } catch (err) {
                next();
            }
        }
    });
});

// ==================== SETTINGS ====================

// SALVA TUTTI I PARAMETRI MODIFICABILI (USERNAME,BIO,EMAIL,PASSWORD,NOME,COGNOME,ETA",CELL,IMAGE)
app.post("/settings/save", (req, res, next) => {
    let payload = req.payload;

    let params = req.body;
    mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
        if (err) {
            log(ERROR_STRING, colors.red);
        }
        else {
            let db = client.db(DB_NAME);
            let collection = db.collection("user");
            try {
                bcrypt.hash(params.password, 10, (err, hash) => {
                    if (!err) {
                        params.password = hash;

                        collection.updateOne({ "_id": ObjectId(payload._id) }, {
                            $set: {
                                "username": params.username,
                                "password": params.password,
                                "email": params.email,
                                "image": params.image,
                                "bio": params.bio,
                                "first": params.nome,
                                "last": params.cognome,
                                "date-of-birth": params["date-of-birth"],
                                "theme": params.theme
                            }
                        }, (err, data) => {
                            if (err) {
                                log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                                res.json({ "error": "Errore durante l'esecuzione della query: " + err.errmsg });
                            }
                            else {
                                cloudinary.v2.uploader.upload(params.image, {
                                    folder: payload._id,
                                    use_filename: true
                                }, (err, result) => {
                                    collection.updateOne({ "_id": ObjectId(payload._id) }, { "$set": { "image": result.secure_url } }, (err, data) => {
                                        res.json({ "result": "ok" });
                                        client.close();
                                    });
                                });
                            }
                        });
                    }
                });
            } catch (err) {
                next();
            }
        }
    });

});

// RITORNA TUTTI I PARAMETRI MODIFICABILI (USERNAME,BIO,EMAIL,PASSWORD,NOME,COGNOME,ETA",CELL,IMAGE)
app.get("/settings", (req, res, next) => {
    let payload = req.payload;

    mongoClient.connect(CONNECTION_STRING, CONNECTION_OPTIONS, (err, client) => {
        if (err) {
            log(ERROR_STRING, colors.red);
        }
        else {
            let db = client.db(DB_NAME);
            let collection = db.collection("user");
            try {
                collection.findOne({ "_id": ObjectId(payload._id) }, {
                    "projection": {
                        "posts": 0,
                        "saved-posts": 0,
                        "following": 0
                    }
                }, (err, user) => {
                    if (err) {
                        log("Errore durante l'esecuzione della query: " + err.errmsg, colors.red);
                        res.status(500);
                        res.json({ "error": "Errore durante l'esecuzione della query: " + err.errmsg });
                    }
                    else {
                        res.json(user);
                        client.close();
                    }
                });
            } catch (err) {
                next();
            }
        }
    });
});

/****************** MIDDLEWARE ROUTES ******************/

app.use((req, res, next) => {
    res.status(404);
    res.send({ "error": "resource not found" });
});

function log(data, color = colors.white) {
    console.log(colors.cyan("[" + new Date().toLocaleTimeString() + "]") + ": " + color(data));
}

function init() {
    //qui inizializza la pagina di errore
    if (!fs.existsSync('./static' + UPLOADS_PATH)) {
        fs.mkdirSync('./static' + UPLOADS_PATH);
    }
    fs.readFile("./static/mail.html", (err, data) => {
        if (err) {
            log("Errore durante il reperimento di un file: " + err.errmsg, colors.red);
        }
        else {
            EMAIL_PAGE = data;
        }
    });
    cloudinary.config({
        cloud_name: CLOUD_NAME,
        api_key: API_KEY,
        api_secret: API_SECRET
    });
    tokens.init("./keys/private.key", 864000);
    log("Server in ascolto sulla porta " + PORT, colors.yellow);
}