"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";


export default function ThreeViewer({ modelPath, className, YaxisOffset }) {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        // Renderer (shadows enabled)
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        // Camera
        const camera = new THREE.PerspectiveCamera(
            50,
            container.clientWidth / container.clientHeight,
            0.1,
            2000
        );
        camera.position.set(3, 3, 5);

        // Orbit controls (smooth)
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.04;
        controls.rotateSpeed = 0.4;
        controls.target.set(0, 0, 0);

        // --- LIGHTING ---
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(5, 10, 7);
        dirLight.castShadow = true;

        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 50;
        dirLight.shadow.normalBias = 0.02;

        scene.add(dirLight);

        // Optional shadow receiver plane
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.ShadowMaterial({ opacity: 0.25 })
        );
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -0.01;
        plane.receiveShadow = true;
        scene.add(plane);

        // --- LOAD MODEL ---
        const loader = new GLTFLoader();
        loader.load(
            modelPath,
            (gltf) => {
                const model = gltf.scene;

                // enable casting shadows
                model.traverse((child) => {
                    if ((child).isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                // center model
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());

                model.position.x -= center.x;
                model.position.y -= center.y + YaxisOffset;
                model.position.z -= center.z;
                model.scale.set(3, 3, 3);
                scene.add(model);

                // frame camera
                const maxDim = Math.max(size.x, size.y, size.z);
                const distance = maxDim * 2.2;

                camera.position.set(distance, distance, distance);
                controls.target.set(0, 0, 0);
                controls.update();
            },
            undefined,
            (err) => console.error("Failed to load model:", err)
        );

        // Resize handling
        const handleResize = () => {
            if (!container) return;

            const { clientWidth, clientHeight } = container;
            renderer.setSize(clientWidth, clientHeight);
            camera.aspect = clientWidth / clientHeight;
            camera.updateProjectionMatrix();
        };

        window.addEventListener("resize", handleResize);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            window.removeEventListener("resize", handleResize);
            renderer.dispose();
        };
    }, [modelPath]);

    return (
        <div
            ref={containerRef}
            className={className ?? "w-full h-[50vh] rounded-xl overflow-hidden"}
        />
    );
}
