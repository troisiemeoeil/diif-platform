"use client"
import { useAppStore } from '@/lib/state/store';
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import ExpandableActions from "@/app/components/Layers/layers-context"
import { AnimatePresence, motion } from "motion/react";
import mapboxgl from "mapbox-gl";
import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';

function Layers() {
    const map = useAppStore((s) => s.map)
    const [activeLayerIds, setActiveLayerIds] = useState(['3d-ply-layer',]);
    const [loaded, setLoaded] = useState(false);
    const wmsLayers = [
        {
            id: "layer1",
            name: "FOREST RESERVE PATTERNS",
            url: "https://avoin.metsakeskus.fi/rajapinnat/v1/stand/ows?service=WMS&request=GetMap&layers=stand&styles=&format=image/png&transparent=true&version=1.1.1&height=256&width=256&srs=EPSG:3857&BBOX={bbox-epsg-3857}",
            image: "/fsv.png"
        },
        {
            id: "layer2",
            name: "FOREST USE NOTIFICATIONS",
            url: "https://avoin.metsakeskus.fi/rajapinnat/v1/forestusedeclaration/ows?service=WMS&request=GetMap&layers=forestusedeclaration&styles=&format=image/png&transparent=true&version=1.1.1&height=256&width=256&srs=EPSG:3857&BBOX={bbox-epsg-3857}",
            image: "/fudv.png"
        },
        {
            id: "layer3",
            name: "Unstable Slopes - Very Strong Incline (SWE)",
            url: "https://geodpags.skogsstyrelsen.se/arcgis/services/Geodataportal/GeodataportalVisaRasoskred/MapServer/WMSServer?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=Angränsande_slänter_med_kraftig_lutning37685&STYLES=&FORMAT=image/png&TRANSPARENT=TRUE&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}",
            image: "/stronglandslide.png"
        },
        {
            id: "layer4",
            name: "Watercourses/Rivers (SWE)",
            url: "https://geodpags.skogsstyrelsen.se/arcgis/services/Geodataportal/GeodataportalVisaRasoskred/MapServer/WMSServer?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=Ravinformation_-_Vattendrag_i_anslutning31827&STYLES=&FORMAT=image/png&TRANSPARENT=TRUE&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}",
            image: "/watercourse.png"
        },
        {
            id: "layer5",
            name: "Harvesting Plan (SWE)",
            url: "https://geodpags.skogsstyrelsen.se/arcgis/services/Geodataportal/GeodataportalVisaAvverkningsanmalan/MapServer/WMSServer?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=Avverkningsanmalan_Skogsstyrelsen&STYLES=&FORMAT=image/png&TRANSPARENT=TRUE&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}",
            image: "harvestingplan.png"
        }
    ];

    useEffect(() => {
        if (!map) return;

        const addLayerIfNeeded = (layer) => {
            const { id, url } = layer;
            if (map.getSource(id)) return;
            map.addSource(id, {
                type: "raster",
                tiles: [url],
                tileSize: 256,
            });

            map.addLayer({
                id,
                type: "raster",
                source: id,
                layout: {
                    visibility: activeLayerIds.includes(id) ? "visible" : "none",
                },
            });
        };

        if (map.isStyleLoaded && map.isStyleLoaded()) {
            wmsLayers.forEach(addLayerIfNeeded);
            setLoaded(true);
            return;
        }


        const customLayer = {
            id: '3d-ply-layer',
            type: 'custom',
            renderingMode: '3d',
            layout: {
                visibility: 'visible'
            },
            onAdd: function (map, gl) {
                this.camera = new THREE.Camera();
                this.scene = new THREE.Scene();
                gl.cullFace(gl.BACK)

                const ambient = new THREE.AmbientLight(0xffffff, 0.5);
                const directional = new THREE.DirectionalLight(0xffffff, 0.5);
                this.scene.add(ambient);
                this.scene.add(directional);

                this.loader = new PLYLoader();
                this.pointsLoaded = false;

                this.loader.load('/300K_points.ply', (geometry) => {
                    geometry.computeBoundingBox();
                    geometry.center();

                    const material = new THREE.PointsMaterial({
                        size: 1.2,
                        vertexColors: !!geometry.hasAttribute('color'),
                        color: geometry.hasAttribute('color') ? undefined : 0x00ff88,
                        sizeAttenuation: true
                    });

                    this.points = new THREE.Points(geometry, material);
                    this.scene.add(this.points);

                    const lng = 22.4190383;
                    const lat = 61.7569133;
                    const alt = 20;

                    const merc = mapboxgl.MercatorCoordinate.fromLngLat({ lng, lat }, alt);
                    const scale = merc.meterInMercatorCoordinateUnits() * 2.25;
                    const offsetX = 0;
                    const offsetY = 0;
                    const offsetZ = 0;
                    const matrix = new THREE.Matrix4()
                        .makeTranslation(merc.x + offsetX, merc.y + offsetY, merc.z + offsetZ)
                        .multiply(new THREE.Matrix4().makeRotationZ(THREE.MathUtils.degToRad(18)))
                        .scale(new THREE.Vector3(scale, -scale, scale));
                    this.points.applyMatrix4(matrix);
                    this.pointsLoaded = true;
                    map.triggerRepaint();
                });

                map.on('styledata', () => {
                    if (this.pointsLoaded) {
                        map.triggerRepaint();
                    }
                });

                this.renderer = new THREE.WebGLRenderer({
                    canvas: map.getCanvas(),
                    context: gl,
                    antialias: true
                });

                this.renderer.autoClear = false;
                this.renderer.outputColorSpace = THREE.SRGBColorSpace;
            },

            render: function (gl, matrix) {
                if (!this.pointsLoaded) return;

                const m = new THREE.Matrix4().fromArray(matrix);
                this.camera.projectionMatrix = m;
                this.renderer.render(this.scene, this.camera);
                map.triggerRepaint();
                this.renderer.resetState()
            }
        };

        //add point clouds layer at the bottom
        // If style not loaded yet, add once on style.load
        const onStyleLoad = () => {
            map.addLayer(customLayer, 'unclustered-point');
            wmsLayers.forEach(addLayerIfNeeded);

            setLoaded(true);
        };

        map.once("style.load", onStyleLoad);

        return () => {
            if (!map || !map.off) return;
            map.off("style.load", onStyleLoad);
        };
    }, [map]);

    useEffect(() => {
        if (!map) return;

        const allLayerIds = ['3d-ply-layer', 'layer1', 'layer2', 'layer3', 'layer4', 'layer5'];

        allLayerIds.forEach((layerId) => {
            if (!map.getLayer(layerId)) return;
            const visibility = activeLayerIds.includes(layerId) ? 'visible' : 'none';
            map.setLayoutProperty(layerId, 'visibility', visibility);
        });
    }, [activeLayerIds, map]);



    const handleClick = (e) => {
        e.preventDefault()
        const layerId = e.currentTarget.id;
        if (!layerId) return;

        setActiveLayerIds((prev) =>
            prev.includes(layerId)
                ? prev.filter((id) => id !== layerId)
                : [...prev, layerId]
        );
    };
    return (

        <ExpandableActions >
            {wmsLayers.map(({ id, name, image }) => (
                <motion.button
                    key={id}
                    id={id}
                    onClick={handleClick}
                    className="p-0 relative w-full border-none bg-transparent cursor-pointer overflow-hidden rounded-md group"
                    whileHover="hovered"
                    initial="rest"
                    variants={{
                        rest: {},
                        hovered: {},
                    }}
                >
                    <motion.img
                        src={image}
                        width={500}
                        height={100}
                        className="object-cover w-full h-33 rounded-md bg-blend-overlay"
                        alt={id}
                        variants={{
                            rest: { filter: "blur(0px)" },
                            hovered: { filter: "blur(3px)" },
                        }}
                        transition={{ duration: 0.3 }}
                    />

                    <motion.span
                        className="text-white font-bold text-md absolute bottom-0 left-2"
                        variants={{
                            rest: { fontSize: "1rem" },
                            hovered: { fontSize: "1.75rem" },
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        {name.toUpperCase()}
                    </motion.span>
                </motion.button>
            ))}

            <motion.button
                id="3d-ply-layer"
                onClick={handleClick}
                className="p-0 relative w-full border-none bg-transparent cursor-pointer overflow-hidden rounded-md group" // Added 'group' for easier image targeting
                // Framer Motion's whileHover prop
                whileHover="hovered"
                initial="rest"
                variants={{
                    rest: {}, // Initial state
                    hovered: {}, // Hovered state (values will be applied to children)
                }}
            >
                {/* Image with blur effect */}
                <motion.img
                    src="/pointcloud.jpg"
                    width={500}
                    height={100}
                    className="object-cover w-full h-33 rounded-md bg-blend-overlay"
                    alt="FSV button image"
                    // Animate the filter (blur) on hover
                    variants={{
                        rest: { filter: "blur(0px)" },
                        hovered: { filter: "blur(3px)" }, // Adjust blur amount as needed
                    }}
                    transition={{ duration: 0.3 }} // Smooth transition for blur
                />

                {/* Text with font size expansion */}
                <motion.span
                    className="text-white font-bold text-md absolute bottom-0 left-2"
                    // Animate font size on hover
                    variants={{
                        rest: { fontSize: "1rem" }, // Default size (text-md is usually 1rem)
                        hovered: { fontSize: "1.75rem" }, // Expanded size, adjust as needed
                    }}
                    transition={{ duration: 0.3 }} // Smooth transition for font size
                >
                    FOREST POINT CLOUDS
                </motion.span>
            </motion.button>

        </ExpandableActions>


    )
}

export default Layers
