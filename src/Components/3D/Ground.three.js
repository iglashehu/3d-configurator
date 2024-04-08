import * as THREE from "three";
import aoMap from "./../../Assets/Textures/WoodenFloorTexture/laminate_floor_03_ao_4k.jpg";
import roughMap from "./../../Assets/Textures/WoodenFloorTexture/laminate_floor_03_rough_4k.jpg";
import diffMap from "./../../Assets/Textures/WoodenFloorTexture/laminate_floor_03_diff_4k.jpg";
import normalMap from "./../../Assets/Textures/WoodenFloorTexture/laminate_floor_03_nor_gl_4k.jpg";

export default class Ground {
  constructor(loadingManager) {
    const geometry = new THREE.PlaneGeometry(200, 100);
    let loader = new THREE.TextureLoader(loadingManager);
    const diffMapTexture = loader.load(diffMap);
    const normalMapTexture = loader.load(normalMap);
    const roughMapTexture = loader.load(roughMap);
    const aoMapTexture = loader.load(aoMap);

    const material = new THREE.MeshStandardMaterial({
      map: diffMapTexture,
      normalMap: normalMapTexture,
      roughnessMap: roughMapTexture,
      aoMap: aoMapTexture,
      metalness: 0.9,
      roughness: 0.65,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.type = "ground";
    this.mesh.rotation.x = -Math.PI / 2;
  }

  handleClick() {
    console.log("clicked ground");
  }
}
