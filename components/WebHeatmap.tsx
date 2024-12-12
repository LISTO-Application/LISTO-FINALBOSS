import React, { useRef } from "react";
import { useEffect, useMemo } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { FeatureCollection, Point, GeoJsonProperties } from "geojson";
import { MarkersCollection } from "@/constants/markers";

type HeatmapProps = {
  geojson: MarkersCollection;
  radius: number;
  opacity: number;
};

const WebHeatmap = ({ geojson, radius, opacity }: HeatmapProps) => {
  const map = useMap();
  const visual = useMapsLibrary("visualization");
  const heatmapLayerRef = useRef<google.maps.visualization.HeatmapLayer | null>(
    null
  );

  useEffect(() => {
    if (!map || !visual) {
      console.error("Google Maps Visualization library is not loaded.");
      return;
    }

    const heatmapData = geojson.map((marker) => {
      const [lat, lng] = marker.coordinate.split(",").map(Number);
      return {
        location: new google.maps.LatLng(lat, lng),
        weight: marker.weight,
      };
    });
    if (!heatmapLayerRef.current) {
      heatmapLayerRef.current = new visual.HeatmapLayer({
        data: heatmapData,
        radius,
        opacity,
        map,
      });
    } else {
      heatmapLayerRef.current.setData(heatmapData);
      heatmapLayerRef.current.set("radius", radius);
      heatmapLayerRef.current.set("opacity", opacity);
    }
    return () => {
      if (heatmapLayerRef.current) {
        heatmapLayerRef.current.setMap(null);
        heatmapLayerRef.current = null;
      }
    };
  }, [geojson, radius, opacity, map, visual]);

  return null;
};

export default WebHeatmap;
