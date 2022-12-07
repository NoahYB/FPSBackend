"use strict";
exports.__esModule = true;
var CharacterController_1 = require("./CharacterController");
var WebSocketModule = require('ws');
var wss = new WebSocketModule.Server({ port: 56112, clientTracking: true });
var connectedClients = {};
var gameData = {
    scores: {
        team1: 0,
        team2: 0
    },
    action: 'UPDATE_TEAM_SCORES'
};
wss.on('request', function (request) {
    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
});
wss.on('connection', function connection(ws) {
    ws.on('message', receiveMessage);
    ws.on('error', function (e) {
        console.log('error', e);
    });
    ws.on('close', function (e) {
        console.log('close', e);
    });
    ws.send(JSON.stringify(connectedClients));
});
function receiveMessage(message) {
    var m = JSON.parse(message);
    var data = m.data;
    if (!connectedClients[data.senderId]) {
        connectedClients[data.senderId] = {
            clientData: data,
            clientController: new CharacterController_1.CharacterController()
        };
    }
    if (data.action === "CONFIRM_KILL") {
        handleKillConfirm(data);
    }
    if (data.action === "TEAM_SELECT") {
        handleTeamSelect(data);
    }
    if (data.action === "SHOT") {
        handleShot(data);
    }
    if (data.action === "MOVEMENT") {
        handleMovementUpdate(data);
    }
    if (data.action === "HIT") {
        handleHit(data);
    }
}
function handleHit(clientData) {
    wss.clients.forEach(function (client) {
        client.send(JSON.stringify(clientData));
    });
}
function handleShot(clientData) {
    var direction = clientData.direction;
    wss.clients.forEach(function (client) {
        client.send(JSON.stringify(clientData));
    });
}
function handleKillConfirm(clientData) {
    var teamString = clientData
        .team === 1 ? 'team1' : 'team2';
    gameData.scores[teamString] += 1;
    wss.clients.forEach(function (client) {
        client.send(JSON.stringify(gameData));
    });
}
function handleTeamSelect(clientData) {
    connectedClients[clientData.senderId]
        .clientData
        .team = clientData.team;
    wss.clients.forEach(function (client) {
        client.send(JSON.stringify(clientData));
    });
}
function handleMouseUpdate(clientData) {
    connectedClients[clientData.senderId]
        .clientController
        .pointerLockControls
        .onMouseMove(clientData.mouseData);
    wss.clients.forEach(function (client) {
        client.send(JSON.stringify(client));
    });
}
function handleMovementUpdate(clientData) {
    // connectedClients[clientData.senderId]
    //         .clientController
    //         .update(clientData)
    wss.clients.forEach(function (client) {
        client.send(JSON.stringify(clientData));
    });
}
