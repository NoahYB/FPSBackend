
import { Vector3, Quaternion } from 'three';

export interface ClientData {
    action: 'TEAM_SELECT' | 'MOVEMENT' | 'MOUSE' |'CONFIRM_KILL' | 'SHOT' | 'HIT' | 'NAME_CHANGE';
    mouseData: MouseEvent;
    connected: boolean;
    input: KeyboardEvent['key'];
    grounded: boolean;
    messageId: number;
    position: Vector3;
    senderId: number;
    superUser: boolean;
    team: number;
    timeStamp: number;
    lookQuaternion: Quaternion;
    direction?: Vector3;
    pointAwardedTo?: number;
    score: number;
    connectionDisplayName: string;
    inTeamSelect: boolean;
}

export interface VictoryMessage {
    winner: 'team1' | 'team2';
    specialMessage: 'Noah Wins!';
}

export interface Control {

}