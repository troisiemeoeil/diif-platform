

"use client";
 
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
 
 
export default function ThreeViewer({ 
    modelPath, 
    className, 
    YaxisOffset,
    measurements
}) {
    const containerRef = useRef(null);
    const stateRef = useRef({
        scene: null,
        camera: null,
        renderer: null,
        labelsContainer: null,
        controls: null,
        animationId: null
    });
 
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
 
        console.log("ThreeViewer initializing, container:", container);
 
        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);
 
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.domElement.style.position = "absolute";
        renderer.domElement.style.top = "0";
        renderer.domElement.style.left = "0";
        renderer.domElement.style.zIndex = "1";
        renderer.domElement.style.display = "block";
        container.appendChild(renderer.domElement);
 
        const camera = new THREE.PerspectiveCamera(
            50,
            container.clientWidth / container.clientHeight,
            0.1,
            2000
        );
        camera.position.set(3, 3, 5);
 
        // Labels container
        const labelsContainer = document.createElement("div");
        labelsContainer.style.position = "absolute";
        labelsContainer.style.top = "0";
        labelsContainer.style.left = "0";
        labelsContainer.style.width = "100%";
        labelsContainer.style.height = "100%";
        labelsContainer.style.pointerEvents = "none";
        labelsContainer.style.zIndex = "10";
        container.style.position = "relative";
        container.appendChild(labelsContainer);
 
        // Create SVG for lines (HIGHER z-index than labels)
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.style.position = "absolute";
        svg.style.top = "0";
        svg.style.left = "0";
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.pointerEvents = "none";
        svg.style.zIndex = "15";
        svg.style.border = "1px solid red"; // DEBUG: Red border to see SVG bounds
        labelsContainer.appendChild(svg);
 
        // Store references
        stateRef.current = {
            scene,
            camera,
            renderer,
            labelsContainer,
            container,
            svg
        };
 
        // Orbit controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.04;
        controls.rotateSpeed = 0.4;
        controls.target.set(0, 0, 0);
        stateRef.current.controls = controls;
 
        // Lighting
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
 
        // Shadow plane
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.ShadowMaterial({ opacity: 0.25 })
        );
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -0.01;
        plane.receiveShadow = true;
        scene.add(plane);
 
        // Load model
        const loader = new GLTFLoader();
        console.log("Loading model from:", modelPath);
 
        loader.load(
            modelPath,
            (gltf) => {
                console.log("Model loaded successfully:", gltf);
                const model = gltf.scene;
 
                model.traverse((child) => {
                    if ((child).isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
 
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
 
                model.position.x -= center.x;
                model.position.y -= center.y + YaxisOffset;
                model.position.z -= center.z;
                model.scale.set(3, 3, 3);
                scene.add(model);
 
                stateRef.current.modelSize = size.clone();
 
                const maxDim = Math.max(size.x, size.y, size.z);
                const distance = maxDim * 2.2;
 
                camera.position.set(distance, distance, distance);
                controls.target.set(0, 0, 0);
                controls.update();
            },
            undefined,
            (err) => {
                console.error("Failed to load model:", modelPath, err);
            }
        );
 
        // Resize handler
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
            stateRef.current.animationId = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
            updateLabelsPositions(labelsContainer, camera, container, svg, stateRef.current.modelSize);
        };
        console.log("Starting animation loop");
        animate();
 
        return () => {
            window.removeEventListener("resize", handleResize);
            if (stateRef.current.animationId) {
                cancelAnimationFrame(stateRef.current.animationId);
            }
            renderer.dispose();
            labelsContainer.remove();
        };
    }, [modelPath, YaxisOffset]);
 
    useEffect(() => {
        const { labelsContainer, modelSize, svg } = stateRef.current;
        console.log("Measurements effect triggered:", measurements);
        console.log("labelsContainer:", labelsContainer);
        console.log("modelSize:", modelSize);
        
        if (!labelsContainer || !modelSize || !measurements) {
            console.log("Early return - missing:", { labelsContainer: !labelsContainer, modelSize: !modelSize, measurements: !measurements });
            return;
        }
 
        // Clear only the label divs, NOT the SVG
        const existingLabels = labelsContainer.querySelectorAll("div:not(svg)");
        existingLabels.forEach(label => label.remove());
 
        // Create labels
        const scale = 3;
        const scaledSize = modelSize.clone().multiplyScalar(scale);
        console.log("scaledSize:", scaledSize);
 
        // ADJUST LABEL POSITIONS HERE
        // Format: new THREE.Vector3(x_offset, y_offset, z_offset)
        // Multiply by scaledSize dimensions to position relative to model
        // Examples: scaledSize.x * 0.8 means 80% of model width to the right
        const positions = {
            topDiameter: new THREE.Vector3(scaledSize.x * 0.1, scaledSize.y * 0.4, 5),      // Top diameter - right and up
            bottomDiameter: new THREE.Vector3(-scaledSize.x * 0.2, -scaledSize.y * 0.7, 0), // Bottom diameter - left and down
            length: new THREE.Vector3(0, 1, scaledSize.z * 0.05),                            // Length - forward
            volume: new THREE.Vector3(scaledSize.x * 0.9, scaledSize.y * 0.5, -scaledSize.z * 0.5) // Volume - right and back
        };
 
        console.log("Creating labels with measurements:", measurements);
        
        if (measurements.topDiameter) {
            console.log("Creating topDiameter label:", measurements.topDiameter);
            createLabelElement(labelsContainer, `Ø ${measurements.topDiameter} mm`, positions.topDiameter);
        }
        if (measurements.bottomDiameter) {
            console.log("Creating bottomDiameter label:", measurements.bottomDiameter);
            createLabelElement(labelsContainer, `Ø ${measurements.bottomDiameter} mm`, positions.bottomDiameter);
        }
        if (measurements.length) {
            console.log("Creating length label:", measurements.length);
            createLabelElement(labelsContainer, `L: ${measurements.length} mm`, positions.length);
        }
        if (measurements.volume) {
            console.log("Creating volume label:", measurements.volume);
            createLabelElement(labelsContainer, `V: ${measurements.volume} m³`, positions.volume);
        }
        
        const labelCount = labelsContainer.querySelectorAll("div:not(svg)").length;
        console.log("Total labels created:", labelCount);
    }, [measurements]);
 
    return (
        <div
            ref={containerRef}
            className={className ?? "w-full h-[50vh] rounded-xl overflow-hidden"}
        />
    );
}
 
// Helper functions
function createLabelElement(container, text, position3D) {
    const label = document.createElement("div");
    label.innerHTML = text;
    label.style.position = "absolute";
    label.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
    label.style.border = "2px solid #333";
    label.style.borderRadius = "4px";
    label.style.padding = "6px 10px";
    label.style.fontSize = "13px";
    label.style.fontWeight = "700";
    label.style.whiteSpace = "nowrap";
    label.style.transform = "translate(-50%, -50%)";
    label.style.zIndex = "11"; // CHANGED: Lower than SVG (was 100)
    label.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
    label.dataset.x = position3D.x;
    label.dataset.y = position3D.y;
    label.dataset.z = position3D.z;
    // Create a line element reference below the label
    const lineId = `line-${Date.now()}-${Math.random()}`;
    label.dataset.lineId = lineId;
    container.appendChild(label);
}
 
function updateLabelsPositions(labelsContainer, camera, container, svg, modelSize) {
    if (!labelsContainer || !svg || !modelSize) return;
    
    // Clear existing elements
    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }
    
    // Ensure SVG covers entire container and has proper viewBox
    const w = container.clientWidth;
    const h = container.clientHeight;
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    
    const labels = labelsContainer.querySelectorAll("div:not(svg)");
    labels.forEach((label) => {
        const labelText = label.textContent;
        console.log("Processing label:", labelText);
        
        // Calculate line endpoints based on actual model geometry
        let point1 = new THREE.Vector3();
        let point2 = new THREE.Vector3();
        const modelScale = 3; // This must match the model scale in the loader
        const scaledSize = modelSize.clone().multiplyScalar(modelScale);
        
        // Length measurement: line extends along Z axis
        if (labelText.includes("L:")) {
            const lengthMatch = labelText.match(/L:\s*(\d+)/);
            if (lengthMatch) {
                const length = parseInt(lengthMatch[1]);
                // Use actual model Z dimension
                const zHalfExtent = scaledSize.z / 2;
                point1.set(0, 0, -zHalfExtent);
                point2.set(0, 0, zHalfExtent);
            }
        }
        // Diameter measurement: line extends along X axis (at front of log - positive Z)
        else if (labelText.includes("Ø")) {
            const diameterMatch = labelText.match(/Ø\s*(\d+)/);
            if (diameterMatch) {
                const diameter = parseInt(diameterMatch[1]);
                // Use actual model X dimension but scale it down
                const diameterScale = 0.6; // Adjust this to control line length (0.7 = 70% of full X extent)
                const xHalfExtent = (scaledSize.x / 2) * diameterScale;
                // Position at the front (positive Z end) of the log
                const zPosition = scaledSize.z / 2;
                point1.set(-xHalfExtent + 0.12, 1.2, zPosition);
                point2.set(xHalfExtent + 0.12, 1.2, zPosition);
            }
        }
        
        // Project both points to screen space
        point1.project(camera);
        point2.project(camera);
        
        // Check if either point is behind camera
        if (point1.z > 0.99 && point2.z > 0.99) {
            label.style.display = "none";
            return;
        }
        
        const screenX1 = (point1.x * 0.5 + 0.5) * w;
        const screenY1 = (-(point1.y) * 0.5 + 0.5) * h;
        const screenX2 = (point2.x * 0.5 + 0.5) * w;
        const screenY2 = (-(point2.y) * 0.5 + 0.5) * h;
        
        // Calculate center of the line for label positioning
        const centerX = (screenX1 + screenX2) / 2;
        const centerY = (screenY1 + screenY2) / 2;
        
        // Position label below the line (add offset)
        const labelOffsetY = 20; // Move label down by 30px
        label.style.left = centerX + "px";
        label.style.top = (centerY + labelOffsetY) + "px";
        label.style.display = "block";
        
        // Draw line connecting the projected endpoints
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", screenX1);
        line.setAttribute("y1", screenY1);
        line.setAttribute("x2", screenX2);
        line.setAttribute("y2", screenY2);
        line.setAttribute("stroke", "#000");
        line.setAttribute("stroke-width", "2");
        line.setAttribute("stroke-dasharray", "8,4");
        line.setAttribute("stroke-linecap", "round");
        svg.appendChild(line);
        
        // Add endpoint circles
        const circle1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle1.setAttribute("cx", screenX1);
        circle1.setAttribute("cy", screenY1);
        circle1.setAttribute("r", "3");
        circle1.setAttribute("fill", "#333");
        svg.appendChild(circle1);
        
        const circle2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle2.setAttribute("cx", screenX2);
        circle2.setAttribute("cy", screenY2);
        circle2.setAttribute("r", "3");
        circle2.setAttribute("fill", "#333");
        svg.appendChild(circle2);
    });
}