"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function ThreeScene() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );
    camera.position.set(2, 2, 4);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Debug helpers
    // scene.add(new THREE.GridHelper(10, 10));
    // scene.add(new THREE.AxesHelper(2));

    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    scene.add(hemi);

    const loader = new GLTFLoader();
    loader.load(
      "/models/spruce_tree.glb",
      (gltf) => {
        console.log("GLB LOADED", gltf);

        const model = gltf.scene;

        // Auto-center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        model.position.x -= center.x;
        model.position.y -= center.y + 15;
        model.position.z -= center.z;
        model.scale.set(3,3,3);
        scene.add(model);

        console.log("Model center:", center);
        console.log("Model size:", size);

        // Frame camera to object size
        const maxDim = Math.max(size.x, size.y, size.z);
        const fitDistance = maxDim * 2;
        camera.position.set(fitDistance, fitDistance, fitDistance);
        controls.target.set(0, 0, 0);
      },
      undefined,
      (error) => {
        console.error("FAILED TO LOAD GLB ", error);

        // Add a debug cube so we know the scene is working
        const cube = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshStandardMaterial({ color: "red" })
        );
        scene.add(cube);
      }
    );

    // Resize
    const resize = () => {
      if (!container) return;
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", resize);

    // Animate
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-[50vh] rounded-xl overflow-hidden"
    />
  );
}
