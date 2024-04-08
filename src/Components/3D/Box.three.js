import * as THREE from "three";
import metalTexture from "./../../Assets/Textures/metal_texture.jpg";
import { getRandomColor } from "../../Utils/functions.js";

export default class Box {
  constructor(loadingManager, dimensions = { width: 6, height: 6, depth: 6 }) {
    let geometry = new THREE.BoxGeometry(
      dimensions.width,
      dimensions.height,
      dimensions.depth
    );
    let loader = new THREE.TextureLoader(loadingManager);
    let texture = loader.load(metalTexture);
    const material = new THREE.MeshStandardMaterial({
      color: getRandomColor(),
      map: texture,
      metalness: 0.9,
      roughness: 0.7,
    });

    //Assign geometry and material to the mesh
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.y += dimensions.height / 2;
  }
}
