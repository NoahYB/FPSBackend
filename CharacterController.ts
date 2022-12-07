import { PointerLockControls } from './PointerLockControls';

import { Object3D, Vector3 } from 'three';
import { ClientData } from './types/ClientData';
import { Quaternion } from 'three';


export class CharacterController {

    camera: Object3D;

    pointerLockControls: PointerLockControls;

    sprinting: boolean = false;

    movementSpeed: number;

    velocity: Vector3;
    
    constructor() {
        this.getMovementSpeed();
        this.camera = new Object3D();
        // @ts-ignore
        this.camera.position.copy(new Vector3(0,0,0));
        this.pointerLockControls = 
            new PointerLockControls(this.camera);
        this.velocity = new Vector3(0,0,0);
    }

    getMovementSpeed() {
        this.movementSpeed = 10;
    }

    input(input: KeyboardEvent['key']) {
        const key = input;
        this.velocity.x = 0;
        this.velocity.z = 0;
        switch(key) {
            case 'w':
                this.velocity.z =
                    -this.movementSpeed * (this.sprinting ? 2 : 1);
                    break;
            case 's':
                this.velocity.z = 
                    this.movementSpeed * (this.sprinting ? 2 : 1);
                    break;
            case 'a':
                this.velocity.x = 
                    -this.movementSpeed * (this.sprinting ? 2 : 1);
                    break;
            case 'd':
                this.velocity.x = 
                    -this.movementSpeed * (this.sprinting ? 2 : 1);
                    break;
            case ' ':
                this.jump();
        }
    }

    jump() {
        this.velocity.y = 
            20 *
            .025;
    }

    move() {
        // console.log( this.velocity);
        // @ts-ignore
        this.camera.position.y += this.velocity.y;
        this.pointerLockControls.moveForward(-this.velocity.z);
        this.pointerLockControls.moveRight(-this.velocity.x);
    };
    
    update(data: ClientData) {
        this.input(data.input);
        if (!data.grounded) this.velocity.y -= .025
        const worldPos: Vector3 = new Vector3();
        this.camera.getWorldPosition(worldPos)
        // @ts-ignore
        console.log(worldPos);
        this.move();
        // @ts-ignore
        return this.camera.position;
    }
}

export interface ControllerParams {

}