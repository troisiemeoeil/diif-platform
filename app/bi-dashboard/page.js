"use client";

import { useEffect, useRef } from "react";
import ChartsEmbedSDK from "@mongodb-js/charts-embed-dom";

export default function DashboardPage() {
  const chartRef = useRef(null);

 useEffect(() => {
  const loadChart = async () => {
    try {
      const res = await fetch("/api/bi-dash-token");

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const { token } = await res.json();

      const sdk = new ChartsEmbedSDK({
        baseUrl: "https://charts.mongodb.com/charts-project-0-fqgauli",
      });

      const chart = sdk.createDashboard({
        dashboardId: "e4c385eb-0986-44ae-9798-f1dc618c4eb0",
        height: "800px",
      });

      await chart.render(chartRef.current);

    } catch (err) {
      console.error("Chart Error:", err);
      alert(err.message || JSON.stringify(err));
    }
  };

  loadChart();
  
}, []);

  return <div ref={chartRef} />;
}