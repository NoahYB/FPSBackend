import { ClientMap } from "./GeneralTypes";

export interface GameState {
    movementSpeed: number,
    connectedPlayers: ClientMap,
}