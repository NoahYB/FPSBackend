"use strict";
exports.__esModule = true;
exports.CharacterController = void 0;
var PointerLockControls_1 = require("./PointerLockControls");
var three_1 = require("three");
var CharacterController = /** @class */ (function () {
    function CharacterController() {
        this.sprinting = false;
        this.getMovementSpeed();
        this.camera = new three_1.Object3D();
        // @ts-ignore
        this.camera.position.copy(new three_1.Vector3(0, 0, 0));
        this.pointerLockControls =
            new PointerLockControls_1.PointerLockControls(this.camera);
        this.velocity = new three_1.Vector3(0, 0, 0);
    }
    CharacterController.prototype.getMovementSpeed = function () {
        this.movementSpeed = 10;
    };
    CharacterController.prototype.input = function (input) {
        var key = input;
        this.velocity.x = 0;
        this.velocity.z = 0;
        switch (key) {
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
    };
    CharacterController.prototype.jump = function () {
        this.velocity.y =
            20 *
                .025;
    };
    CharacterController.prototype.move = function () {
        // console.log( this.velocity);
        // @ts-ignore
        this.camera.position.y += this.velocity.y;
        this.pointerLockControls.moveForward(-this.velocity.z);
        this.pointerLockControls.moveRight(-this.velocity.x);
    };
    ;
    CharacterController.prototype.update = function (data) {
        this.input(data.input);
        if (!data.grounded)
            this.velocity.y -= .025;
        var worldPos = new three_1.Vector3();
        this.camera.getWorldPosition(worldPos);
        // @ts-ignore
        console.log(worldPos);
        this.move();
        // @ts-ignore
        return this.camera.position;
    };
    return CharacterController;
}());
exports.CharacterController = CharacterController;
