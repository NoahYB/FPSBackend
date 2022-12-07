import { CharacterController } from './CharacterController';
import { ClientData } from './types/ClientData';
import { ClientMap } from './types/GeneralTypes';

const WebSocketModule = require('ws');

const wss = new WebSocketModule.Server({ port:56112, clientTracking: true});

let connectedClients: ClientMap = {};

let gameData = {
        scores: {
                team1: 0,
                team2: 0,
        },
        action: 'UPDATE_TEAM_SCORES'
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
        
        ws.send(JSON.stringify(connectedClients));
});

function receiveMessage(message:string) {

        let m = JSON.parse(message);
        let data : ClientData = m.data;

        if (!connectedClients[data.senderId]) {
                connectedClients[data.senderId] = {
                        clientData: data,
                        clientController: new CharacterController()
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

        if (data.action === "MOVEMENT") {
                handleMovementUpdate(data);
        }

        if (data.action === "HIT") {
                handleHit(data);
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

function handleKillConfirm(clientData: ClientData) {
        const teamString = clientData
                .team === 1 ? 'team1' : 'team2';
        gameData.scores[teamString] += 1;
        wss.clients.forEach(client => {
                client.send(JSON.stringify(gameData))
        });
}

function handleTeamSelect(clientData: ClientData) {
        connectedClients[clientData.senderId]
                .clientData
                .team = clientData.team;
        wss.clients.forEach(client => {
                client.send(JSON.stringify(clientData))
        });
}

function handleMouseUpdate(clientData: ClientData) {
        connectedClients[clientData.senderId]
                .clientController
                .pointerLockControls
                .onMouseMove(clientData.mouseData);
        wss.clients.forEach(client => {
                client.send(JSON.stringify(client))
        });
}

function handleMovementUpdate(clientData: ClientData) {
        // connectedClients[clientData.senderId]
        //         .clientController
        //         .update(clientData)
        wss.clients.forEach(client => {
                client.send(JSON.stringify(clientData))
        });
}