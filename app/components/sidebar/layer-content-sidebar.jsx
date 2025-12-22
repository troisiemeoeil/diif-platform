"use client"

import { ChevronRight, CircleQuestionMark, Layers, Map, SquareTerminal } from "lucide-react";

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
import { Switch } from "../../../components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import StylePopoverDescription, { LayersPopoverDescription } from "@/app/components/Layers/layers-popover-description";

export function LayerContentSidebar({
  items
}) {

  const map = useAppStore((s) => s.map)
  const [activeLayerIds, setActiveLayerIds] = useState(['3d-ply-layer',]);
  const [activeStyleIds, setActiveStyleIds] = useState({});
  const country = useAppStore((s) => s.country);
  const [openLayerIds, setOpenLayerIds] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const wmsLayers = [

    {
      id: "layer1",
      name: "Forest Reserve Patterns",
      url: "https://avoin.metsakeskus.fi/rajapinnat/v1/stand/ows?service=WMS&request=GetMap&layers=stand&styles=Stand&format=image/png&transparent=true&version=1.3.0&height=256&width=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}",
      style: [
        {
          title: "Base Map",
          url: "https://avoin.metsakeskus.fi/rajapinnat/v1/stand/ows?service=WMS&request=GetMap&layers=stand&styles=Stand&format=image/png&transparent=true&version=1.3.0&height=256&width=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}",
          legendUrl: "https://avoin.metsakeskus.fi/rajapinnat/v1/stand/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=stand"

        },

        {
          title: "Stand Outline",
          url: "https://avoin.metsakeskus.fi/rajapinnat/v1/stand/ows?service=WMS&request=GetMap&layers=stand&styles=Stand%20outline%202&format=image/png&transparent=true&version=1.3.0&height=256&width=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}",
          legendUrl: "https://avoin.metsakeskus.fi/rajapinnat/v1/stand/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=stand&style=Stand%20outline"

        },
        {
          title: "Stand Mixed Forest",
          url: "https://avoin.metsakeskus.fi/rajapinnat/v1/stand/ows?service=WMS&request=GetMap&layers=stand&styles=Stand%20mixed%20forest&format=image/png&transparent=true&version=1.3.0&height=256&width=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}",
          legendUrl: "https://avoin.metsakeskus.fi/rajapinnat/v1/stand/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=stand&style=Stand%20mixed%20forest"

        },
        {
          title: "Stand Development Class",
          url: "https://avoin.metsakeskus.fi/rajapinnat/v1/stand/ows?service=WMS&request=GetMap&layers=stand&styles=Stand%20development%20class&format=image/png&transparent=true&version=1.3.0&height=256&width=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}",
          legendUrl: "https://avoin.metsakeskus.fi/rajapinnat/v1/stand/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=stand&style=Stand%20development%20class"

        },
        {
          title: "Stand Volume",
          url: "https://avoin.metsakeskus.fi/rajapinnat/v1/stand/ows?service=WMS&request=GetMap&layers=stand&styles=Stand%20volume&format=image/png&transparent=true&version=1.3.0&height=256&width=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}",
          legendUrl: "https://avoin.metsakeskus.fi/rajapinnat/v1/stand/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=stand&style=Stand%20development%20class"

        },
        {
          title: "Stand Cutting Proposals",
          url: "https://avoin.metsakeskus.fi/rajapinnat/v1/stand/ows?service=WMS&request=GetMap&layers=stand&styles=Stand%20cutting%20proposals&format=image/png&transparent=true&version=1.3.0&height=256&width=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}",
          legendUrl: "https://avoin.metsakeskus.fi/rajapinnat/v1/stand/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=stand&style=Stand%20cutting%20proposals"

        },
        {
          title: "Stand silviculture proposals",
          url: "https://avoin.metsakeskus.fi/rajapinnat/v1/stand/ows?service=WMS&request=GetMap&layers=stand&styles=Stand%20silviculture%20proposals&format=image/png&transparent=true&version=1.3.0&height=256&width=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}",
          legendUrl: "https://avoin.metsakeskus.fi/rajapinnat/v1/stand/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=stand&style=Stand%20silviculture%20proposals"

        },
      ],
      image: "/fsv.png",
      country: "Finland",
      description: "Geographical data on forest stands and resources (metsävarakuvioita) provided by the Finnish Forest Centre (Metsäkeskus). This layer includes information on stand attributes (like age, species, and volume) and is fundamental for planning sustainable forest management and identifying forest resource patterns.",
      legendUrl: ""
    },
    {
      id: "layer2",
      name: "Forest Use Notification",
      url: "https://avoin.metsakeskus.fi/rajapinnat/v1/forestusedeclaration/ows?service=WMS&request=GetMap&layers=forestusedeclaration&styles=&format=image/png&transparent=true&version=1.1.1&height=256&width=256&srs=EPSG:3857&BBOX={bbox-epsg-3857}",
      style: [
        {
          title: "Base Map",
          url: "https://avoin.metsakeskus.fi/rajapinnat/v1/forestusedeclaration/ows?service=WMS&request=GetMap&layers=forestusedeclaration&styles=&format=image/png&transparent=true&version=1.1.1&height=256&width=256&srs=EPSG:3857&BBOX={bbox-epsg-3857}",
          legendUrl: "https://avoin.metsakeskus.fi/rajapinnat/v1/forestusedeclaration/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=forestusedeclaration"
        },
        {
          title: "Forest Use Declaration Cutting Realization Practice",
          url: "https://avoin.metsakeskus.fi/rajapinnat/v1/forestusedeclaration/ows?service=WMS&request=GetMap&layers=forestusedeclaration&styles=Forest%20use%20declaration%20cutting%20realization%20practice&format=image/png&transparent=true&version=1.1.1&height=256&width=256&srs=EPSG:3857&BBOX={bbox-epsg-3857}",
          legendUrl: "https://avoin.metsakeskus.fi/rajapinnat/v1/forestusedeclaration/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=forestusedeclaration&style=Forest%20use%20declaration%20cutting%20realization%20practice"
        },
        {
          title: "Forest Use Declaration Currently Valid",
          url: "https://avoin.metsakeskus.fi/rajapinnat/v1/forestusedeclaration/ows?service=WMS&request=GetMap&layers=forestusedeclaration&styles=Forest%20use%20declaration%20currently%20valid&format=image/png&transparent=true&version=1.1.1&height=256&width=256&srs=EPSG:3857&BBOX={bbox-epsg-3857}",
          legendUrl: "https://avoin.metsakeskus.fi/rajapinnat/v1/forestusedeclaration/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=forestusedeclaration&style=Forest%20use%20declaration%20currently%20valid"
        },

      ],
      image: "/fudv.png",
      country: "Finland",
      description: "Displays the locations and outlines of Metsänkäyttöilmoitus (Forest Use Notifications) submitted to the Finnish Forest Centre. These are mandatory declarations for planned forest activities, such as commercial harvesting or thinning, ensuring legal compliance and allowing for monitoring of felling intentions.",
      legendUrl: ""

    },
    {
      id: "layer3",
      name: "Unstable Slopes",
      url: "",
      image: "/stronglandslide.png",
      country: "Sweden",
      description: "Map layer from the Swedish Forest Agency (Skogsstyrelsen) identifying areas with a high risk of landslides and unstable slopes (Ras- och skredrisk). This is critical information for forestry planning to avoid activities that could trigger erosion or endanger personnel/infrastructure.",
      legendUrl: "https://kartta.luke.fi/geoserver/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=Climforisk%3ADrought_risk",
      style: [
        {
          title: "Angränsande slänter med kraftig Lutning",
          url: "https://geodpags.skogsstyrelsen.se/arcgis/services/Geodataportal/GeodataportalVisaRasoskred/MapServer/WMSServer?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=Angränsande_slänter_med_kraftig_lutning37685&STYLES=&FORMAT=image/png&TRANSPARENT=TRUE&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}",
          legendUrl: "https://geodpags.skogsstyrelsen.se/arcgis/services/Geodataportal/GeodataportalVisaRasoskred/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=Angränsande_slänter_med_kraftig_lutning37685"
        },

        {
          title: "Slänter - Område som kan påverkas vid ras",
          url: "https://geodpags.skogsstyrelsen.se/arcgis/services/Geodataportal/GeodataportalVisaRasoskred/MapServer/WMSServer?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=Slänter_-_Område_som_kan_påverkas_vid_ras19409&STYLES=&FORMAT=image/png&TRANSPARENT=TRUE&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}",
          legendUrl: "https://geodpags.skogsstyrelsen.se/arcgis/services/Geodataportal/GeodataportalVisaRasoskred/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=Slänter_-_Område_som_kan_påverkas_vid_ras19409"
        },


        
        {
          title: "Möjlig Ravinformation",
          url: "https://geodpags.skogsstyrelsen.se/arcgis/services/Geodataportal/GeodataportalVisaRasoskred/MapServer/WMSServer?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=Ravinformation_-_Möjlig_ravinformation56819&STYLES=&FORMAT=image/png&TRANSPARENT=TRUE&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}",
          legendUrl: "https://geodpags.skogsstyrelsen.se/arcgis/services/Geodataportal/GeodataportalVisaRasoskred/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=Ravinformation_-_Möjlig_ravinformation56819"
        },
      ]

    },
    {
      id: "layer4",
      name: "Watercourses & rivers",
      url: "",
      image: "/watercourse.png",
      country: "Sweden",
      description: "Geographic data from the Swedish Forest Agency (Skogsstyrelsen) showing water bodies, rivers, and stream channels. This layer is used to guide forest management practices near watercourses, protecting water quality, aquatic environments, and riparian zones.",
      legendUrl: "https://kartta.luke.fi/geoserver/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=Climforisk%3ADrought_risk",
      style: [
        {
          title: "Watercourses & rivers",
          url: "https://geodpags.skogsstyrelsen.se/arcgis/services/Geodataportal/GeodataportalVisaRasoskred/MapServer/WMSServer?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=Ravinformation_-_Vattendrag_i_anslutning31827&STYLES=&FORMAT=image/png&TRANSPARENT=TRUE&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}",
          legendUrl: "https://geodpags.skogsstyrelsen.se/arcgis/services/Geodataportal/GeodataportalVisaRasoskred/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=Ravinformation_-_Vattendrag_i_anslutning31827"

        },
      ]
    },
    {
      id: "layer5",
      name: "Harvesting Plan",
      url: "",
      image: "/harvestingplan.png",
      country: "Sweden",
      description: "A map layer showing submitted and registered Avverkningsanmälan (Harvesting Notifications/Plans) for final felling on productive forest land, managed by the Swedish Forest Agency (Skogsstyrelsen). \r\n  It indicates the planned locations for future major harvesting operations.",
      legendUrl: "",
      style: [
        {
          title: "Avverkningsanmalan Skogsstyrelsen",
          url: "https://geodpags.skogsstyrelsen.se/arcgis/services/Geodataportal/GeodataportalVisaAvverkningsanmalan/MapServer/WMSServer?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=Avverkningsanmalan_Skogsstyrelsen&STYLES=&FORMAT=image/png&TRANSPARENT=TRUE&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}",
          legendUrl: "https://geodpags.skogsstyrelsen.se/arcgis/services/Geodataportal/GeodataportalVisaAvverkningsanmalan/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=Avverkningsanmalan_Skogsstyrelsen"

        },
      ]
    },
    {
      id: "layer6",
      name: "GeoServer",
      url: "https://kartta.luke.fi/geoserver/ows?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=Climforisk:Drought_risk&STYLES=climforisk_drougthrisk&FORMAT=image/png&WIDTH=256&HEIGHT=256&TRANSPARENT=true&SRS=EPSG:3857&BBOX={bbox-epsg-3857}",
      style: [
        {
          title: "Drought damage probability of trees",
          url: "https://kartta.luke.fi/geoserver/ows?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=Climforisk:Drought_risk&STYLES=climforisk_drougthrisk&FORMAT=image/png&WIDTH=256&HEIGHT=256&TRANSPARENT=true&SRS=EPSG:3857&BBOX={bbox-epsg-3857}",
          legendUrl: "https://kartta.luke.fi/geoserver/wms?request=GetLegendGraphic&version=1.1.1&format=image%2Fpng&width=20&height=20&layer=Climforisk%3ADrought_risk"
        },

        {
          title: "Leaf area index (LAI)",
          url: "https://kartta.luke.fi/geoserver/ows?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=Climforisk%3ALAI_eff_one_sided_100m&STYLES=&FORMAT=image/png&WIDTH=256&HEIGHT=256&TRANSPARENT=true&SRS=EPSG:3857&BBOX={bbox-epsg-3857}",
          legendUrl: "https://kartta.luke.fi/geoserver/wms?request=GetLegendGraphic&version=1.1.1&format=image%2Fpng&width=20&height=20&layer=Climforisk%3ALAI_eff_one_sided_100m"
        },
        {
          title: "Kannot, kuusi, toteutunut hakkuukertymä",
          url: "https://kartta.luke.fi/geoserver/ows?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=bma%3Abiomass_121&STYLES=&FORMAT=image/png&WIDTH=256&HEIGHT=256&TRANSPARENT=true&SRS=EPSG:3857&BBOX={bbox-epsg-3857}",
          legendUrl: "https://kartta.luke.fi/geoserver/wms?request=GetLegendGraphic&version=1.1.1&format=image%2Fpng&width=20&height=20&layer=bma%3Abiomass_121"
        },
        {
          title: "Latvusmassa, lehtipuu, toteutunut hakkuukertymä",
          url: "https://kartta.luke.fi/geoserver/ows?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=bma%3Abiomass_127&STYLES=&FORMAT=image/png&WIDTH=256&HEIGHT=256&TRANSPARENT=true&SRS=EPSG:3857&BBOX={bbox-epsg-3857}",
          legendUrl: "https://kartta.luke.fi/geoserver/wms?request=GetLegendGraphic&version=1.1.1&format=image%2Fpng&width=20&height=20&layer=bma%3Abiomass_127"
        },
        {
          title: "Lehtipuut, kuorellinen runkopuu",
          url: "https://kartta.luke.fi/geoserver/ows?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=bma%3Abiomass_10&STYLES=bma:lehtip_latva&FORMAT=image/png&WIDTH=256&HEIGHT=256&TRANSPARENT=true&SRS=EPSG:3857&BBOX={bbox-epsg-3857}",
          legendUrl: "https://kartta.luke.fi/geoserver/wms?request=GetLegendGraphic&version=1.1.1&format=image%2Fpng&width=20&height=20&layer=bma%3Abiomass_14"
        },
        {
          title: "Biomass, deciduous trees, roundwood with bark 2019 (10 kg/ha)",
          url: "https://kartta.luke.fi/geoserver/ows?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=MVMI:bm_lehtip_runkokuori_1519&STYLES=bm_lehtip_runkokuori_0610&FORMAT=image/png&WIDTH=256&HEIGHT=256&TRANSPARENT=true&SRS=EPSG:3857&BBOX={bbox-epsg-3857}",
          legendUrl: "https://kartta.luke.fi/geoserver/wms?request=GetLegendGraphic&version=1.1.1&format=image%2Fpng&width=20&height=20&layer=MVMI%3Abm_lehtip_runkokuori_1519"
        },
      ],
      image: "drought.png",
      country: "Finland",
      description: "Drought damage occurs in the form of defoliation or discolouration of foliage or even mortality of a tree. Probability of drought damage is expressed as the probability of finding a drought damaged tree in a stand.",
      legendUrl: ""
    },
    {
      id: "layer7",
      name: "Harvestability Information",
      url: "http://aineistot.metsakeskus.fi/metsakeskus/services/Korjuukelpoisuus/Korjuukelpoisuus/MapServer/WmsServer?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=Avverkningsanmalan_Skogsstyrelsen&STYLES=&FORMAT=image/png&TRANSPARENT=TRUE&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}",
      image: "/harvestingplan.png",
      country: "Finland",
      description: "A map layer showing submitted and registered Avverkningsanmälan (Harvesting Notifications/Plans) for final felling on productive forest land, managed by the Swedish Forest Agency (Skogsstyrelsen). \r\n  It indicates the planned locations for future major harvesting operations.",
      legendUrl: "",
      style: [
        {
          title: "Harvestability Map",
          url: "https://aineistot.metsakeskus.fi/metsakeskus/services/Korjuukelpoisuus/Korjuukelpoisuus/MapServer/WmsServer?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=Korjuukelpoisuus&STYLES=default&FORMAT=image/png&TRANSPARENT=true&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=1024&HEIGHT=1024",
          legendUrl: "/harvestability-map.png"
        },
        {
          title: "Soil leaching suspectibility",
          url: "https://aineistot.metsakeskus.fi/metsakeskus/services/Vesiensuojelu/Vesiuomien_maa_aineksen_huuhtoutumisriski/MapServer/WMSServer?request=GetMap&service=WMS?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=1&STYLES=default&FORMAT=image/png&TRANSPARENT=true&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=1024&HEIGHT=1024",
          legendUrl: "http://aineistot.metsakeskus.fi/metsakeskus/services/Vesiensuojelu/Vesiuomien_maa_aineksen_huuhtoutumisriski/MapServer/WmsServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=1"
        },
        {
          title: "Rock Surface Level",
          url: "https://gtkdata.gtk.fi/arcgis/services/Rajapinnat/GTK_Maapera_WMS/MapServer/WMSServer?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=Kallionpinnan_taso54480&STYLES=&FORMAT=image/png&TRANSPARENT=true&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256",
          legendUrl: "https://gtkdata.gtk.fi/arcgis/services/Rajapinnat/GTK_Maapera_WMS/MapServer/WmsServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=Kallionpinnan_taso54480"
        },
        {
          title: "Soil Types ",
          url: "https://gtkdata.gtk.fi/arcgis/services/Rajapinnat/GTK_Maapera_WMS/MapServer/WMSServer?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=maapera_200k_maalajit&STYLES=default&FORMAT=image/png&TRANSPARENT=true&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256",
          legendUrl: "https://gtkdata.gtk.fi/arcgis/services/Rajapinnat/GTK_Maapera_WMS/MapServer/WmsServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=maapera_200k_maalajit"
        },
        {
          title: "Soil Surface Species ",
          url: "https://gtkdata.gtk.fi/arcgis/services/Rajapinnat/GTK_Maapera_WMS/MapServer/WMSServer?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=maapera_20k_pintamaalajit&STYLES=&FORMAT=image/png&TRANSPARENT=true&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256",
          legendUrl: "https://gtkdata.gtk.fi/arcgis/services/Rajapinnat/GTK_Maapera_WMS/MapServer/WmsServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=maapera_20k_pintamaalajit"
        }

      ]
    }

  ];


  useEffect(() => {
    if (!map) return;

    const addLayerIfNeeded = (layer) => {
      const { id, url, legendUrl } = layer;
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
      }, '3d-ply-layer'); // Always add WMS layers below the point cloud
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

    const onStyleLoad = () => {
      map.addLayer(customLayer, 'unclustered-point'); // Point cloud below unclustered points
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

    // Define the function that manipulates the layers
    const setLayerVisibility = () => {
      const allLayerIds = [
        '3d-ply-layer',
        'layer1',
        'layer2',
        'layer3',
        'layer4',
        'layer5',
        'layer6',
        'layer7',
      ];

      allLayerIds.forEach((layerId) => {
        const layerStyles = activeStyleIds[layerId] || [];
        const hasStyleOptions = wmsLayers.some(
          (l) => l.id === layerId && l.style
        );

        const visibility = hasStyleOptions
          ? 'none'
          : activeLayerIds.includes(layerId)
            ? 'visible'
            : 'none';

        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, 'visibility', visibility);
        }
      });
    };

    map.on('style.load', setLayerVisibility);

    if (map.isStyleLoaded()) {
      setLayerVisibility();
    }
    return () => {
      map.off('style.load', setLayerVisibility);
    };

  }, [activeLayerIds, activeStyleIds, map, wmsLayers]);

  useEffect(() => {
    if (!map) return;

    // Update layers when styles change - support multiple active styles
    wmsLayers.forEach((layer) => {
      const layerStyles = activeStyleIds[layer.id] || [];

      if (layer.style && layerStyles.length > 0) {
        // Remove old style layers for this parent layer
        layerStyles.forEach((styleIdx) => {
          const styleLayerId = `${layer.id}-style-${styleIdx}`;

          // Create or update the style layer
          if (!map.getSource(styleLayerId)) {
            const selectedStyle = layer.style[styleIdx];
            map.addSource(styleLayerId, {
              type: "raster",
              tiles: [selectedStyle.url],
              tileSize: 256,
            });

            map.addLayer({
              id: styleLayerId,
              type: "raster",
              source: styleLayerId,
              layout: {
                visibility: 'visible'
              }
            }, '3d-ply-layer'); // Always add style sublayers below the point cloud
          } else {
            // Update visibility if layer exists
            map.setLayoutProperty(styleLayerId, 'visibility', 'visible');
          }
        });
      }

      // Remove inactive style layers
      if (layer.style) {
        layer.style.forEach((_, styleIdx) => {
          const styleLayerId = `${layer.id}-style-${styleIdx}`;
          const isActive = (activeStyleIds[layer.id] || []).includes(styleIdx);

          if (!isActive && map.getLayer(styleLayerId)) {
            map.setLayoutProperty(styleLayerId, 'visibility', 'none');
          }
        });
      }
    });
  }, [activeStyleIds, map, wmsLayers]);





  const setLayerChecked = (layerId, checked) => {
    setActiveLayerIds((prev) => {
      if (checked) {
        return prev.includes(layerId) ? prev : [...prev, layerId];
      }
      return prev.includes(layerId) ? prev.filter((id) => id !== layerId) : prev;
    });
  };

  const setStyleChecked = (layerId, styleIdx, checked) => {
    setActiveStyleIds((prev) => {
      const layerStyles = prev[layerId] || [];
      if (checked) {
        const updatedStyles = layerStyles.includes(styleIdx) ? layerStyles : [...layerStyles, styleIdx];
        return { ...prev, [layerId]: updatedStyles };
      }
      const updatedStyles = layerStyles.filter((idx) => idx !== styleIdx);
      return { ...prev, [layerId]: updatedStyles };
    });

    // Ensure parent layer is active when a style is selected
    if (checked) {
      setActiveLayerIds((prev) => {
        return prev.includes(layerId) ? prev : [...prev, layerId];
      });
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Map Layers</SidebarGroupLabel>
      <SidebarMenu>
        <Collapsible
          key="layers"
          asChild
          defaultOpen="layer1"
          className="group/collapsible">
          <SidebarMenuItem>

            <CollapsibleContent>
              <SidebarMenuSub>
                {country && wmsLayers
                  .filter(layer => layer.country === country)
                  .map((layer) => (
                    <div key={layer.id}>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <div className="w-full flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span>{layer.name}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Popover>
                                <PopoverTrigger> <CircleQuestionMark size={16} /></PopoverTrigger>
                                <PopoverContent side="right" align="center" sideOffset={45} className="w-[30vw]">
                                  <LayersPopoverDescription title={layer.name} imageUrl={layer.image} content={layer.description} legend={layer.legendUrl} />
                                </PopoverContent>
                              </Popover>
                              {/* 
                              <Switch
                                id={layer.id}
                                checked={activeLayerIds.includes(layer.id)}
                                onCheckedChange={(checked) => setLayerChecked(layer.id, checked)}
                              /> */}

                              <button
                                type="button"
                                aria-expanded={openLayerIds.includes(layer.id)}
                                onClick={() =>
                                  setOpenLayerIds((prev) =>
                                    prev.includes(layer.id) ? prev.filter((i) => i !== layer.id) : [...prev, layer.id]
                                  )
                                }
                                className="p-1 rounded hover:bg-muted"
                              >
                                <ChevronRight
                                  className={`transition-transform ${openLayerIds.includes(layer.id) ? 'rotate-90' : ''}`}
                                  size={16}
                                />
                              </button>
                            </div>
                          </div>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      {/* render nested styles, if any */}
                      {openLayerIds.includes(layer.id) && layer.style && (
                        <div className="ml-6 mt-1">
                          {layer.style.map((s, idx) => (
                            <SidebarMenuSubItem key={`${layer.id}-style-${idx}`}>
                              <SidebarMenuSubButton asChild>
                                <div className="w-full flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground"> {s.title.length > 18 ? s.title.slice(0, 18) + "…" : s.title}</span>
                                  <div className="flex items-center gap-2">
                                    <Popover>
                                      <PopoverTrigger> <Map size={16} /></PopoverTrigger>
                                      <PopoverContent side="right" align="center" sideOffset={80} className="w-[20vw]">
                                        <StylePopoverDescription title={s.title} legendUrl={s.legendUrl} />
                                      </PopoverContent>
                                    </Popover>
                                    <Switch
                                      id={`${layer.id}-style-${idx}`}
                                      checked={(activeStyleIds[layer.id] || []).includes(idx)}
                                      onCheckedChange={(checked) => setStyleChecked(layer.id, idx, checked)}
                                    />
                                  </div>

                                </div>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </div>
                      )}
                    </div>
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
