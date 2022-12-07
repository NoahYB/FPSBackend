import _defineProperty from '@babel/runtime/helpers/esm/defineProperty';
import { Euler, Vector3, Object3D } from 'three';

export class PointerLockControls {
  // Set to constrain the pitch of the camera
  // Range is 0 to Math.PI radians
  // radians
  // radians
  camera: Object3D;

  minPolarAngle: number = 0;

  maxPolarAngle = Math.PI;

  euler: Euler = new Euler(0, 0, 0, 'YXZ');

  PI_2: number = Math.PI / 2;

  vec: Vector3 = new Vector3();

  direction: Vector3 = new Vector3(0, 0, -1);
  constructor(camera) {
    this.camera = camera;
  }
  onMouseMove(mouseData: MouseEvent) {
    const movementX = mouseData.movementX || 0;
    const movementY = mouseData.movementY || 0;
    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y -= movementX * 0.002;
    this.euler.x -= movementY * 0.002;
    this.euler.x = Math.max(this.PI_2 - this.maxPolarAngle, Math.min(this.PI_2 - this.minPolarAngle, this.euler.x));
    this.camera.quaternion.setFromEuler(this.euler);

  };

  getDirection(v) {
    return v.copy(this.direction).applyQuaternion(this.camera.quaternion);
  }

  moveForward(distance: number){
    // move forward parallel to the xz-plane
    // assumes this.camera.up is y-up
    this.vec.setFromMatrixColumn(this.camera.matrix, 0);
    this.vec.crossVectors(this.camera.up, this.vec);
    this.camera.position.addScaledVector(this.vec, distance);
  };

  moveRight(distance: number) {
    this.vec.setFromMatrixColumn(this.camera.matrix, 0);
    this.camera.position.addScaledVector(this.vec, distance);
  };

}