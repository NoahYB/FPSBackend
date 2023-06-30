import { CharacterController } from './CharacterController';
import { ClientData, NewGameMessage, VictoryMessage } from './types/ClientData';
import { ClientMap } from './types/GeneralTypes';

const WebSocketModule = require('ws');

const wss = new WebSocketModule.Server({ port:56112, clientTracking: true});

let connectedClients: ClientMap = {};

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

let itemData = {
        items: {
                1 : {
                        id: 1,
                        type: 'ROCKET',
                        state: 'INTERACTABLE',
                        heldBy: 0,
                        position: [0,0,0]
                },
                2 : {
                        id: 2,
                        type: 'PISTOL',
                        state: 'INTERACTABLE',
                        heldBy: 0,
                        position: [0,0,10]
                }
        }
}

let gameData = {
        scores: {
                team1: 0,
                team2: 0,
        },
        action: 'UPDATE_TEAM_SCORES',
        pointAwardedTo: 0,
        itemData,
}
wss.on('request', function(request) {
        var connection = request.accept('echo-protocol', request.origin);
        console.log((new Date()) + ' Connection accepted.');
});


wss.on('connection', function connection(ws) {
        ws.on('message', receiveMessage)

        ws.on('error', function(e) {
                console.log('error', e);
        });

        ws.on('close', function(e) {
                console.log('close', e);
        });
        
        ws.send(JSON.stringify(
                {
                        senderId: 'WEBSOCKET_SERVER_GAME_INIT',
                        connectedClients,
                        gameData,
                }
        ));
});

function receiveMessage(message:string) {

        let m = JSON.parse(message);
        let data : ClientData = m.data;

        if (!connectedClients[data.senderId]) {
                data.inTeamSelect = true;
                connectedClients[data.senderId] = {
                        clientData: data,
                }
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

function handleHit(clientData: ClientData) {
        wss.clients.forEach(client => {
                client.send(JSON.stringify(clientData))
        });
}

function handleShot(clientData: ClientData) {
        const direction = clientData.direction;
        wss.clients.forEach(client => {
                client.send(JSON.stringify(clientData))
        });
}

function handleProjectileData(clientData: ClientData) {
        const direction = clientData.direction;
        wss.clients.forEach(client => {
                client.send(JSON.stringify(clientData))
        });
}

function handleItemPickup(clientData: ClientData) {
        gameData.itemData.items[clientData.itemId].heldBy = clientData.senderId;
        wss.clients.forEach(client => {
                client.send(JSON.stringify(clientData))
        });
}

function handleKillConfirm(clientData: ClientData) {
        gameData.scores[clientData.team] += 1;
        
        gameData.pointAwardedTo = clientData.pointAwardedTo;

        connectedClients[clientData.pointAwardedTo].clientData.score += 1;

        let gameWinner = undefined;

        if (gameData.scores.team1 >= 10) {
                gameWinner = 'team1';
        }

        if (gameData.scores.team2 >= 10) {
                gameWinner = 'team2'
        }

        if (gameWinner !== undefined) {
                const topScorerKey = Object.keys(connectedClients).reduce((pKey, cKey) => {
                        return connectedClients[cKey].score > connectedClients[pKey].score ? cKey : pKey;
                })
                const topScorer = connectedClients[topScorerKey].connectionDisplayName;
                gameData.scores = {
                        team1: 0,
                        team2: 0,
                }
                const victoryMessage: VictoryMessage = {
                        winner: gameWinner,
                        action: 'GAME_OVER',
                        specialMessage: 'Noah Wins!',
                        gameData: {
                                scores: {
                                        team1: 0,
                                        team2: 0,
                                }
                        },
                        timeTillNextMatch: 10,
                        topScorer,
                }
                wss.clients.forEach(client => {
                        client.send(JSON.stringify(victoryMessage  ))
                });
                setTimeout(handleNewGame, 10000);
        }

        wss.clients.forEach(client => {
                client.send(JSON.stringify(gameData))
        });
}2

function handleNewGame() {
        Object.keys(connectedClients).map((key) => {
                connectedClients[key].score = 0;
        });
        gameData.scores.team1 = 0;
        gameData.scores.team2 = 0;
        const message: NewGameMessage = {
                action: 'START_NEW_GAME',
        }
        wss.clients.forEach(client => {
                client.send(JSON.stringify(message))
        });
}

function handleTeamSelect(clientData: ClientData) {
        if (connectedClients[clientData.senderId]
                .clientData
                .team === clientData.team) {
                return;
        };
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
        wss.clients.forEach(client => {
                client.send(JSON.stringify(clientData))
        });
}

function handleMouseUpdate(clientData: ClientData) {
        wss.clients.forEach(client => {
                client.send(JSON.stringify(client))
        });
}

function handleNameChange(clientData: ClientData) {
        connectedClients[clientData.senderId]
                .clientData
                .connectionDisplayName = clientData.connectionDisplayName;
        wss.clients.forEach(client => {
                client.send(JSON.stringify(clientData))
        });
}

function handleMovementUpdate(clientData: ClientData) {
        // connectedClients[clientData.senderId]
        //         .clientController
        //         .update(clientData)
        connectedClients[clientData.senderId]
                .clientData
                .position = clientData.position;
        wss.clients.forEach(client => {
                client.send(JSON.stringify(clientData))
        });
}