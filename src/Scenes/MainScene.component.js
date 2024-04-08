import * as THREE from "three";
import Box from "../Components/3D/Box.three";
import React, { useRef, useState, useEffect } from "react";
import Loading from "./../Components/Loading.component";
import { handleSceneResize, initEventListener } from "./../Utils/sceneResize";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import CubeTexture from "../Assets/CubeTextures/brown_photostudio_02_4k.hdr";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import Sprite from "../Components/3D/Sprite.three";
import Ground from "../Components/3D/Ground.three";

const MainScene = ({ loading }) => {
  const divRef = useRef(null);
  const leftSpriteRef = useRef();
  const rightSpriteRef = useRef();

  const sceneRef = useRef(new THREE.Scene());
  const loadingManager = useRef(new THREE.LoadingManager());
  const sceneObjectsRef = useRef([]);
  const boxesRef = useRef([]);

  const rendererRef = useRef(
    new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
  );

  const [isLoading, setIsLoading] = useState(loading);

  useEffect(() => {
    console.log("Initializing scene");

    initScene();
    return () => {
      console.log("Clearing scene");
      sceneRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
        sceneRef.current.remove(child);
      });
    };
  }, []);

  function initScene() {
    loadingManager.current.onLoad = () => {
      setIsLoading(false);
    };

    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    rendererRef.current.autoClear = false;
    rendererRef.current.setSize(
      divRef.current.offsetWidth,
      divRef.current.offsetHeight
    );
    // rendererRef.current.toneMapping = THREE.ACESFilmicToneMapping;
    divRef.current.appendChild(rendererRef.current.domElement);

    const camera = new THREE.PerspectiveCamera(
      100,
      divRef.current.offsetWidth / divRef.current.offsetHeight,
      0.1,
      1000
    );
    camera.position.z = 15;
    camera.position.y = 3;

    const controls = new OrbitControls(camera, rendererRef.current.domElement);
    controls.maxDistance = 30;
    controls.minDistance = 10;
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI / 2 - 0.01;

    const loader = new RGBELoader();
    loader.load(CubeTexture, function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      sceneRef.current.background = texture;
      sceneRef.current.environment = texture;
    });

    const ambientLight = new THREE.AmbientLight();
    ambientLight.intensity = 5;
    sceneRef.current.add(ambientLight);

    renderMeshes(loadingManager.current);

    handleSceneResize(camera, rendererRef.current);
    initEventListener();

    handleMouseClick({ camera });

    const animate = () => {
      requestAnimationFrame(animate);
      rendererRef.current.render(sceneRef.current, camera);
      controls.update();
    };
    animate();
  }

  function handleMouseClick(world) {
    document.addEventListener(
      "click",
      (event) => {
        const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera({ x: mouseX, y: mouseY }, world.camera);

        const intersects = raycaster.intersectObjects(
          sceneRef.current.children,
          true
        );

        if (intersects.length > 0) {
          const objectInfo = findObjectByUUID(
            intersects[0].object.uuid,
            sceneObjectsRef.current
          );

          const object = objectInfo.object;
          if (object.type === "ground") {
            return;
          } else if (object?.side === "left") {
            addLeftBox(loadingManager.current);
            object.mesh.position.x += 6;
          } else if (object?.side === "right") {
            addRightBox(loadingManager.current);
            object.mesh.position.x -= 6;
          } else {
            if (boxesRef.current.length === 1) {
              alert("You cannot delete the last box!");
              return;
            }
            const index = findObjectByUUID(
              object.mesh.uuid,
              boxesRef.current
            ).index;
            boxesRef.current.splice(index, 1);
            sceneObjectsRef.current.splice(objectInfo.index, 1);
            if (index > boxesRef.current.length - index) {
              for (let i = index; i < boxesRef.current.length; i++) {
                boxesRef.current[i].mesh.position.x += 6;
              }
              rightSpriteRef.current.mesh.position.x += 6;
            } else {
              for (let i = 0; i < index; i++) {
                boxesRef.current[i].mesh.position.x -= 6;
              }
              leftSpriteRef.current.mesh.position.x -= 6;
            }

            object.mesh.geometry.dispose();
            object.mesh.material?.dispose();
            sceneRef.current.remove(object.mesh);
          }
          console.log(object);
        }
      },
      false
    );
  }

  function findObjectByUUID(uuid, objects) {
    for (let i = 0; i < objects.length; i++) {
      if (objects[i].mesh.uuid === uuid) {
        return { object: objects[i], index: i };
      }
    }
    return null;
  }

  function renderMeshes(loadingManager) {
    const ground = new Ground(loadingManager);
    sceneObjectsRef.current.push(ground);
    sceneRef.current.add(ground.mesh);

    // Cube
    const box = new Box(loadingManager);
    boxesRef.current = [...boxesRef.current, box];
    sceneRef.current.add(box.mesh);
    sceneObjectsRef.current.push(box);

    //Sprites
    leftSpriteRef.current = new Sprite(
      loadingManager.current,
      new THREE.Vector3(6, 0, 0),
      "left"
    );
    sceneObjectsRef.current.push(leftSpriteRef.current);
    sceneRef.current.add(leftSpriteRef.current.mesh);

    rightSpriteRef.current = new Sprite(
      loadingManager.current,
      new THREE.Vector3(-6, 0, 0),
      "right"
    );
    sceneObjectsRef.current.push(rightSpriteRef.current);
    sceneRef.current.add(rightSpriteRef.current.mesh);
  }

  function addLeftBox(loadingManager) {
    const box = new Box(loadingManager);
    boxesRef.current[0].mesh.geometry.computeBoundingSphere();
    const leftBoxPosition = boxesRef.current[0].mesh.position;
    box.mesh.position.x = leftBoxPosition.x + 6;
    boxesRef.current = [box, ...boxesRef.current];
    sceneRef.current.add(box.mesh);
    sceneObjectsRef.current.push(box);
  }

  function addRightBox(loadingManager) {
    const box = new Box(loadingManager);
    boxesRef.current[
      boxesRef.current.length - 1
    ].mesh.geometry.computeBoundingSphere();
    const rightBoxPosition =
      boxesRef.current[boxesRef.current.length - 1].mesh.position;
    box.mesh.position.x = rightBoxPosition.x - 6;
    boxesRef.current = [...boxesRef.current, box];
    sceneRef.current.add(box.mesh);
    sceneObjectsRef.current.push(box);
  }

  return (
    <>
      <div className="three-container" ref={divRef}></div>
      {isLoading && <Loading />}
    </>
  );
};

export default MainScene;
