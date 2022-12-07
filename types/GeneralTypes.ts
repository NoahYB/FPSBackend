import { ClientData } from "./ClientData"
import { CharacterController } from "../CharacterController"

export interface ClientMap {
    [id: number]: {
        clientData: ClientData
    }
}
