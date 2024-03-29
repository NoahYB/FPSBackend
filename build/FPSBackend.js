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
            type: 'RIFLE',
            state: 'INTERACTABLE',
            heldBy: 0,
            position: { x: 0, y: 0, z: 0 }
        },
        2: {
            id: 2,
            type: 'RIFLE',
            state: 'INTERACTABLE',
            heldBy: 0,
            position: { x: 10, y: 0, z: 10 }
        },
        3: {
            id: 3,
            type: 'ROCKET',
            state: 'INTERACTABLE',
            heldBy: 0,
            position: { x: 21.075607996795043, y: 43.36202370887371, z: -14.331500908262825 }
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
        console.log(e);
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
    else if (data.action === "CONFIRM_KILL") {
        handleKillConfirm(data);
    }
    else if (data.action === "CLOSING") {
        handleClose(data);
    }
    else if (data.action === "TEAM_SELECT") {
        handleTeamSelect(data);
    }
    else if (data.action === "SHOT") {
        handleShot(data);
    }
    else if (data.action === "PROJECTILE_DATA") {
        handleProjectileData(data);
    }
    else if (data.action === "ITEM_PICKUP") {
        handleItemPickup(data);
    }
    else if (data.action === "MOVEMENT") {
        handleMovementUpdate(data);
    }
    else if (data.action === "HIT") {
        handleHit(data);
    }
    else if (data.action === "NAME_CHANGE") {
        handleNameChange(data);
    }
    else if (data.action === "ITEM_DROP") {
        handleItemDrop(data);
    }
}
function handleItemDrop(clientData) {
    var itemsDropped = clientData.itemsDropped;
    itemsDropped.forEach(function (item) {
        gameData.itemData.items[item.id].heldBy = 0;
        gameData.itemData.items[item.id].position = clientData.position;
    });
    wss.clients.forEach(function (client) {
        client.send(JSON.stringify(clientData));
    });
}
function handleClose(clientData) {
    Object.keys(gameData.itemData.items).forEach(function (key) {
        var item = gameData.itemData.items[key];
        var itemsDropped = [];
        if (item.heldBy === (clientData.senderId)) {
            item.heldBy = 0;
            item.position = clientData.position;
            itemsDropped.push(item);
        }
        wss.clients.forEach(function (client) {
            client.send(JSON.stringify({
                action: 'ITEM_DROP',
                itemsDropped: itemsDropped
            }));
        });
        wss.clients.forEach(function (client) {
            client.send(JSON.stringify(clientData));
        });
    });
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
