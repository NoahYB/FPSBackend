"use strict";
exports.__esModule = true;
exports.PointerLockControls = void 0;
var three_1 = require("three");
var PointerLockControls = /** @class */ (function () {
    function PointerLockControls(camera) {
        this.minPolarAngle = 0;
        this.maxPolarAngle = Math.PI;
        this.euler = new three_1.Euler(0, 0, 0, 'YXZ');
        this.PI_2 = Math.PI / 2;
        this.vec = new three_1.Vector3();
        this.direction = new three_1.Vector3(0, 0, -1);
        this.camera = camera;
    }
    PointerLockControls.prototype.onMouseMove = function (mouseData) {
        var movementX = mouseData.movementX || 0;
        var movementY = mouseData.movementY || 0;
        this.euler.setFromQuaternion(this.camera.quaternion);
        this.euler.y -= movementX * 0.002;
        this.euler.x -= movementY * 0.002;
        this.euler.x = Math.max(this.PI_2 - this.maxPolarAngle, Math.min(this.PI_2 - this.minPolarAngle, this.euler.x));
        this.camera.quaternion.setFromEuler(this.euler);
    };
    ;
    PointerLockControls.prototype.getDirection = function (v) {
        return v.copy(this.direction).applyQuaternion(this.camera.quaternion);
    };
    PointerLockControls.prototype.moveForward = function (distance) {
        // move forward parallel to the xz-plane
        // assumes this.camera.up is y-up
        this.vec.setFromMatrixColumn(this.camera.matrix, 0);
        this.vec.crossVectors(this.camera.up, this.vec);
        this.camera.position.addScaledVector(this.vec, distance);
    };
    ;
    PointerLockControls.prototype.moveRight = function (distance) {
        this.vec.setFromMatrixColumn(this.camera.matrix, 0);
        this.camera.position.addScaledVector(this.vec, distance);
    };
    ;
    return PointerLockControls;
}());
exports.PointerLockControls = PointerLockControls;
