"use strict";

const fs = require("fs");
const jwt = require("jsonwebtoken");

let TOKEN_TIME;
let PRIVATE_KEY;

module.exports.init = (path, time) => {
    TOKEN_TIME = time;
    fs.readFile(path, (err, data) => {
        if (err) {
            console.log(err.errmsg);
        }
        else {
            PRIVATE_KEY = data.toString();
        }
    });
}

module.exports.writeCookie = (res, token) => {
    //res.set("Set-Cookie", `token=${token};max-age=${TOKEN_TIME};path=/;httponly=true;SameSite=none;secure`);
    res.cookie('token', token, {
        maxAge: TOKEN_TIME,
        path: '/',
        sameSite: "none",
        secure: true
    });
}

module.exports.deleteCookie = (req, res) => {
    let token = this.readCookie(req);
    jwt.verify(token, PRIVATE_KEY, (err, payload) => {
        if (err) {
            res.status(403).send("token expired or corrupted");
        }
        else {
            res.clearCookie("token");
            res.status(403).send("token expired or corrupted");
        }
    });
}

module.exports.readCookie = (req) => {
    return req.cookies.token;
}

module.exports.createToken = (payload) => {
    let token = jwt.sign(payload, PRIVATE_KEY);
    return token;
}

// vuole i dati già formattati
module.exports.generatePayload = (data) => {
    return {
        ...data,
        "iat": data.iat || Math.floor(Date.now() / 1000),
        "exp": Math.floor(Date.now() / 1000) + TOKEN_TIME
    }
}

module.exports.getToken = (req, res, callback) => {
    let token = this.readCookie(req);
    if (!token) {
        res.status(403).send("missing or invalid token");
    }
    else {
        jwt.verify(token, PRIVATE_KEY, callback);
    }
}

module.exports.getTokenFromCookie = (token, callback) => {
    jwt.verify(token, PRIVATE_KEY, callback);
}

module.exports.checkToken = (req, res, next, callback) => {
    let token = this.readCookie(req);
    if (!token) {
        res.status(403).send("missing token");
    }
    else {
        jwt.verify(token, PRIVATE_KEY, (err, payload) => {
            if (err) {
                res.status(403).send("token expired or corrupted");
            }
            else {
                payload = this.generatePayload(payload);
                let newToken = this.createToken(payload);
                this.writeCookie(res, newToken);
                callback(payload);
                next();
            }
        });
    }
}