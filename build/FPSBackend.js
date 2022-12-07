"use strict";
exports.__esModule = true;
var WebSocketModule = require('ws');
var wss = new WebSocketModule.Server({ port: 56112, clientTracking: true });
var connectedClients = {};
var gameData = {
    scores: {
        team1: 0,
        team2: 0
    },
    action: 'UPDATE_TEAM_SCORES',
    pointAwardedTo: 0
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
    ws.send(JSON.stringify({
        senderId: 'WEBSOCKET_SERVER_GAME_INIT',
        connectedClients: connectedClients,
        gameData: gameData
    }));
});
function receiveMessage(message) {
    var m = JSON.parse(message);
    var data = m.data;
    if (!connectedClients[data.senderId]) {
        data.inTeamSelect = true;
        connectedClients[data.senderId] = {
            clientData: data
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
    if (data.action === "NAME_CHANGE") {
        handleNameChange(data);
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
    gameData.scores[clientData.team] += 1;
    gameData.pointAwardedTo = clientData.pointAwardedTo;
    connectedClients[clientData.pointAwardedTo].clientData.score += 1;
    var gameWinner = undefined;
    if (gameData.scores.team1 >= 25) {
        gameWinner = 'team1';
    }
    if (gameData.scores.team2 >= 25) {
        gameWinner = 'team2';
    }
    if (gameWinner !== undefined) {
        var victoryMessage = {
            winner: gameWinner,
            specialMessage: 'Noah Wins!'
        };
    }
    wss.clients.forEach(function (client) {
        client.send(JSON.stringify(gameData));
    });
}
2;
function handleTeamSelect(clientData) {
    if (connectedClients[clientData.senderId]
        .clientData
        .team === clientData.team) {
        return;
    }
    ;
    connectedClients[clientData.senderId]
        .clientData
        .team = clientData.team;
    connectedClients[clientData.senderId]
        .clientData
        .score = 0;
    connectedClients[clientData.senderId]
        .clientData
        .inTeamSelect = false;
    clientData.inTeamSelect = false;
    clientData.score = 0;
    wss.clients.forEach(function (client) {
        client.send(JSON.stringify(clientData));
    });
}
function handleMouseUpdate(clientData) {
    wss.clients.forEach(function (client) {
        client.send(JSON.stringify(client));
    });
}
function handleNameChange(clientData) {
    connectedClients[clientData.senderId]
        .clientData
        .connectionDisplayName = clientData.connectionDisplayName;
    wss.clients.forEach(function (client) {
        client.send(JSON.stringify(clientData));
    });
}
function handleMovementUpdate(clientData) {
    // connectedClients[clientData.senderId]
    //         .clientController
    //         .update(clientData)
    connectedClients[clientData.senderId]
        .clientData
        .position = clientData.position;
    wss.clients.forEach(function (client) {
        client.send(JSON.stringify(clientData));
    });
}
