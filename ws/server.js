const express = require('express');
const request = require('request');
const fs = require('fs');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const yaml = require('js-yaml');
var Redis = require('redis');

var ioredis = require('socket.io-redis');
var port = process.env.PORT || 3000;
var config = null;
var sub = Redis.createClient();

var userSessions = new Map();
var accountSessions = new Map();
var userTokens = new Map();

io.adapter(
    ioredis(
        {
            host: 'localhost',
            port: 6379
        }
    )
);

try {
    config = yaml.safeLoad(fs.readFileSync('app/config/parameters.yml', 'utf8'));
    console.log(config.parameters.front_url);
} catch (e) {
    console.log(e);
}

io.on('connection', function (socket) {
    socket.auth = false;
    socket.on('authenticate', function (data) {
        checkAuthToken(data.token, function (err, response) {
            if (!err && response) {
                socket.auth = true;

                // console.log('authenticate', response);
                for (let key in response.channels) {
                    socket.emit('channels', {channel: key});

                    console.log('channels', key, response.channels[key]);

                    if (response.channels[key].admin === true) {
                        accountSessions.set(response.accountId, socket);
                    }
                    if (response.channels[key].user === true) {
                        userSessions.set(response.userId, socket);
                    }
                    userTokens.set(socket.id, data.token);
                }
                socket.emit('eventClient', {data: 'Hello Client ' + socket.id});
                console.log("Authenticated socket ", socket.id);
            } else {
                socket.emit('eventClient', {data: 'Authenticated failed'});
                console.log("Authenticated false ", socket.id);
            }
        });
    });

    socket.on('subscribe-to-channel', function (data) {
        console.log('SUBSCRIBE TO CHANNEL', data);
        sub.subscribe(data.channel);
    });

    socket.on('send-message', function (data) {
        // socket.emit(); //reply that message on server
        const message = {
            body: data.body,
            chatId: data.chatId,
            timestamp: new Date().getTime()
        };
        console.log('Received message', message);
        sendRequest(userTokens.get(socket.id), "POST", "/api/v1/chat/message", message, function (err, body) {
            if (!err && body) {

            }
        });

    });

    socket.on('get-chats', function (data) {
        sendRequest(userTokens.get(socket.id), "GET", "/api/v1/chat", null, function (err, body) {
            if (!err && body) {
                socket.emit('chat', {chats: body});
            } else {
                socket.emit('errors', {error: body});
            }
        });
    });

    socket.on('get-messages', function (data) {
        sendRequest(userTokens.get(socket.id), "GET", "/api/v1/chat/message", null, function (err, body) {
            if (!err && body) {
                socket.emit('message', {messages: body});
            } else {
                socket.emit('errors', {error: body});
            }
        });
    });

    socket.on('deliver-message', function (data) {
        sendRequest(userTokens.get(socket.id), "POST", "/api/v1/chat/message/deliver", {id: data.id}, function (err, body) {
            if (!err && body) {
                socket.emit('message', {messages: body});
            } else {
                socket.emit('errors', {error: body});
            }
        });
    });

    socket.on('read-message', function (data) {
        sendRequest(userTokens.get(socket.id), "POST", "/api/v1/chat/message/read", {id: data.id}, function (err, body) {
            if (!err && body) {
                socket.emit('message', {messages: body});
            } else {
                socket.emit('errors', {error: body});
            }
        });
    });

    setTimeout(function () {
        if (!socket.auth) {
            console.log("Disconnecting socket ", socket.id);
            socket.disconnect('unauthorized');
        }
    }, 20000);
});

server.listen(port, function () {
    console.log('server listening on port ' + port)
});

io.on('disconnect', function (socket) {
    console.log('disconnect ' + socket.id)
});

function checkAuthToken(token, callback) {
    try {
        console.log('checkAuthToken');
        var requestData = {
            "token": token
        };
        request({
            url: config.parameters.front_url + "/api/check-token",
            method: "POST",
            json: true,
            async: true,
            headers: {
                "Content-Type": "application/json"
            },
            body: requestData
        }, function (error, response, body) {
            // console.log(response);
            if (response.statusCode === 200) {
                callback(false, body);
            } else {
                callback(true, body);
            }
        });
    } catch (e) {
        console.log(e);
        callback(false, '');
    }
}

function sendRequest(token, method, url, data, callback) {
    console.log('token', token, method, url, data);
    request({
        url: config.parameters.front_url + url,
        method: method,
        json: true,
        async: true,
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token
        },
        body: data
    }, function (error, response, body) {
        if (response && response.statusCode === 200) {
            callback(false, body);
        } else {
            callback(true, body);
        }
    });
}

sub.on('error', function (error) {
    console.log('ERROR ' + error)
});

sub.on('message', function (channel, payload) {
    console.log('INCOMING MESSAGE', channel, payload);
    message = JSON.parse(payload);
    if (message.accountId) {
        console.log('accountId', message.accountId);
        if (accountSessions.get(message.accountId)) {
            accountSessions.get(message.accountId).emit(channel, payload)
        }
    }
    if (message.userId) {
        console.log('userId', message.userId);
        if (userSessions.get(message.userId)) {
            userSessions.get(message.userId).emit(channel, payload)
        }
    }
});