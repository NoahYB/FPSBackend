
import { Vector3, Quaternion } from 'three';

export interface ClientData {
    action: 'TEAM_SELECT' | 'MOVEMENT' | 'MOUSE' |'CONFIRM_KILL' | 'SHOT' | 'HIT';
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
    score: number;
    connectionDisplayName: string;
}

export interface Control {

}