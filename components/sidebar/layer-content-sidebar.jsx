"use client"

import { ChevronRight, CircleQuestionMark, Layers, SquareTerminal } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useAppStore } from "@/lib/state/store";
import { useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { Switch } from "../ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LayersPopoverDescription } from "@/app/components/Layers/layers-popover-description";

export function LayerContentSidebar({
  items
}) {

  const map = useAppStore((s) => s.map)
  const [activeLayerIds, setActiveLayerIds] = useState(['3d-ply-layer',]);
  const country = useAppStore((s) => s.country);
  const [loaded, setLoaded] = useState(false);
  const wmsLayers = [

    {
      id: "layer1",
      name: "FOREST RESERVE PATTERNS",
      url: "https://avoin.metsakeskus.fi/rajapinnat/v1/stand/ows?service=WMS&request=GetMap&layers=stand&styles=&format=image/png&transparent=true&version=1.1.1&height=256&width=256&srs=EPSG:3857&BBOX={bbox-epsg-3857}",
      image: "/fsv.png",
      country: "Finland",
      description: "Geographical data on forest stands and resources (metsävarakuvioita) provided by the Finnish Forest Centre (Metsäkeskus). This layer includes information on stand attributes (like age, species, and volume) and is fundamental for planning sustainable forest management and identifying forest resource patterns.",
    },
    {
      id: "layer2",
      name: "FOREST USE NOTIFICATIONS",
      url: "https://avoin.metsakeskus.fi/rajapinnat/v1/forestusedeclaration/ows?service=WMS&request=GetMap&layers=forestusedeclaration&styles=&format=image/png&transparent=true&version=1.1.1&height=256&width=256&srs=EPSG:3857&BBOX={bbox-epsg-3857}",
      image: "/fudv.png",
      country: "Finland",
      description: "Displays the locations and outlines of Metsänkäyttöilmoitus (Forest Use Notifications) submitted to the Finnish Forest Centre. These are mandatory declarations for planned forest activities, such as commercial harvesting or thinning, ensuring legal compliance and allowing for monitoring of felling intentions.",
    },
    {
      id: "layer3",
      name: "Unstable Slopes",
      url: "https://geodpags.skogsstyrelsen.se/arcgis/services/Geodataportal/GeodataportalVisaRasoskred/MapServer/WMSServer?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=Angränsande_slänter_med_kraftig_lutning37685&STYLES=&FORMAT=image/png&TRANSPARENT=TRUE&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}",
      image: "/stronglandslide.png",
      country: "Sweden",
      description: "Map layer from the Swedish Forest Agency (Skogsstyrelsen) identifying areas with a high risk of landslides and unstable slopes (Ras- och skredrisk). This is critical information for forestry planning to avoid activities that could trigger erosion or endanger personnel/infrastructure.",
    },
    {
      id: "layer4",
      name: "Watercourses & rivers",
      url: "https://geodpags.skogsstyrelsen.se/arcgis/services/Geodataportal/GeodataportalVisaRasoskred/MapServer/WMSServer?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=Ravinformation_-_Vattendrag_i_anslutning31827&STYLES=&FORMAT=image/png&TRANSPARENT=TRUE&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}",
      image: "/watercourse.png",
      country: "Sweden",
      description: "Geographic data from the Swedish Forest Agency (Skogsstyrelsen) showing water bodies, rivers, and stream channels. This layer is used to guide forest management practices near watercourses, protecting water quality, aquatic environments, and riparian zones.",
    },
    {
      id: "layer5",
      name: "Harvesting Plan",
      url: "https://geodpags.skogsstyrelsen.se/arcgis/services/Geodataportal/GeodataportalVisaAvverkningsanmalan/MapServer/WMSServer?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=Avverkningsanmalan_Skogsstyrelsen&STYLES=&FORMAT=image/png&TRANSPARENT=TRUE&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}",
      image: "/harvestingplan.png",
      country: "Sweden",
      description: "A map layer showing submitted and registered Avverkningsanmälan (Harvesting Notifications/Plans) for final felling on productive forest land, managed by the Swedish Forest Agency (Skogsstyrelsen). \r\n  It indicates the planned locations for future major harvesting operations."
    },
    {
      id: "layer6",
      name: "Water bodies sensitive to forestry",
      url: "https://paikkatiedot.ymparisto.fi/geoserver/syke_metsataloudelleherkatvesistot/ows?SERVICE=WMS&&request=GetMap&layers=stand&styles=&format=image/png&transparent=true&version=1.1.1&height=256&width=256&srs=EPSG:3857&BBOX={bbox-epsg-3857}",
      image: "harvestingplan.png",
      country: "Finland",
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

  const toggleLayer = (layerId) => {
    setActiveLayerIds((prev) =>
      prev.includes(layerId) ? prev.filter((id) => id !== layerId) : [...prev, layerId]
    );
  };

  const setLayerChecked = (layerId, checked) => {
    setActiveLayerIds((prev) => {
      if (checked) {
        return prev.includes(layerId) ? prev : [...prev, layerId];
      }
      return prev.includes(layerId) ? prev.filter((id) => id !== layerId) : prev;
    });
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        <Collapsible
          key="layers"
          asChild
          defaultOpen="layer1"
          className="group/collapsible">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip="Layers">
                <Layers />
                <span>Layers</span>
                <ChevronRight
                  className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {country && wmsLayers
                  .filter(layer => layer.country === country)
                  .map(({ id, name, image, description }) => (
                    <SidebarMenuSubItem key={id}>
                      <SidebarMenuSubButton asChild>
                        <div className="w-full flex items-center justify-between">
                          <span>{name.toLowerCase()}</span>
                          <div className="flex items-center gap-2">
                            <Popover>
                              <PopoverTrigger> <CircleQuestionMark size={16} /></PopoverTrigger>
                              <PopoverContent side="right" align="center" sideOffset={80} className="w-[30vw]">
                                <LayersPopoverDescription title={name} imageUrl={image} content={description} />
                              </PopoverContent>
                            </Popover>

                            <Switch
                              id={id}
                              checked={activeLayerIds.includes(id)}
                              onCheckedChange={(checked) => setLayerChecked(id, checked)}
                            />
                          </div>
                        </div>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                {
                  country === "Finland" && (
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <div className="w-full flex items-center justify-between">
                          <span>Point Cloud</span>
                          <Switch
                            id="3d-ply-layer"
                            checked={activeLayerIds.includes('3d-ply-layer')}
                            onCheckedChange={(checked) => setLayerChecked('3d-ply-layer', checked)}
                          />
                        </div>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  )
                }

              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>

      </SidebarMenu>
    </SidebarGroup>
  );
}
