"use strict";
exports.__esModule = true;
var WebSocketModule = require('ws');
var wss = new WebSocketModule.Server({ port: 56112, clientTracking: true });
var connectedClients = {};
var sleep = function (waitTimeInMs) { return new Promise(function (resolve) { return setTimeout(resolve, waitTimeInMs); }); };
var itemData = {
    items: {
        1: {
            id: 1,
            type: 'ROCKET',
            state: 'INTERACTABLE',
            heldBy: 0,
            position: [0, 0, 0]
        },
        2: {
            id: 2,
            type: 'PISTOL',
            state: 'INTERACTABLE',
            heldBy: 0,
            position: [0, 0, 10]
        }
    }
};
var gameData = {
    scores: {
        team1: 0,
        team2: 0
    },
    action: 'UPDATE_TEAM_SCORES',
    pointAwardedTo: 0,
    itemData: itemData
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
    if (data.action === "PROJECTILE_DATA") {
        handleProjectileData(data);
    }
    if (data.action === "ITEM_PICKUP") {
        handleItemPickup(data);
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
function handleProjectileData(clientData) {
    var direction = clientData.direction;
    wss.clients.forEach(function (client) {
        client.send(JSON.stringify(clientData));
    });
}
function handleItemPickup(clientData) {
    gameData.itemData.items[clientData.itemId].heldBy = clientData.senderId;
    wss.clients.forEach(function (client) {
        client.send(JSON.stringify(clientData));
    });
}
function handleKillConfirm(clientData) {
    gameData.scores[clientData.team] += 1;
    gameData.pointAwardedTo = clientData.pointAwardedTo;
    connectedClients[clientData.pointAwardedTo].clientData.score += 1;
    var gameWinner = undefined;
    if (gameData.scores.team1 >= 10) {
        gameWinner = 'team1';
    }
    if (gameData.scores.team2 >= 10) {
        gameWinner = 'team2';
    }
    if (gameWinner !== undefined) {
        var topScorerKey = Object.keys(connectedClients).reduce(function (pKey, cKey) {
            return connectedClients[cKey].score > connectedClients[pKey].score ? cKey : pKey;
        });
        var topScorer = connectedClients[topScorerKey].connectionDisplayName;
        gameData.scores = {
            team1: 0,
            team2: 0
        };
        var victoryMessage_1 = {
            winner: gameWinner,
            action: 'GAME_OVER',
            specialMessage: 'Noah Wins!',
            gameData: {
                scores: {
                    team1: 0,
                    team2: 0
                }
            },
            timeTillNextMatch: 10,
            topScorer: topScorer
        };
        wss.clients.forEach(function (client) {
            client.send(JSON.stringify(victoryMessage_1));
        });
        setTimeout(handleNewGame, 10000);
    }
    wss.clients.forEach(function (client) {
        client.send(JSON.stringify(gameData));
    });
}
2;
function handleNewGame() {
    Object.keys(connectedClients).map(function (key) {
        connectedClients[key].score = 0;
    });
    gameData.scores.team1 = 0;
    gameData.scores.team2 = 0;
    var message = {
        action: 'START_NEW_GAME'
    };
    wss.clients.forEach(function (client) {
        client.send(JSON.stringify(message));
    });
}
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
