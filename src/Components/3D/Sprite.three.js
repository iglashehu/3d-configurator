import * as THREE from "three";
import metalTexture from "./../../Assets/SpriteTextures/plus.png";

export default class Sprite {
  constructor(
    loadingManager,
    position = new THREE.Vector3(0, 0, 0),
    side,
    dimensions = { width: 3, height: 3 }
  ) {
    let loader = new THREE.TextureLoader(loadingManager);
    let spriteTexture = loader.load(metalTexture);
    let spriteMaterial = new THREE.SpriteMaterial({ map: spriteTexture });
    this.side = side;
    this.mesh = new THREE.Sprite(spriteMaterial);
    this.mesh.position.set(position.x, position.y + 3, position.z);
    this.mesh.scale.set(dimensions.width, dimensions.height, 1); // Set size
  }

  handleClick() {}
}
