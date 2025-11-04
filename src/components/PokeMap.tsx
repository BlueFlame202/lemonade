import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface PokeMapEntry {
  name: string;
  leader?: string;
  type: "research_group" | "institution" | "journal" | "conference" | "dataset";
  latitude: number;
  longitude: number;
  domain: string[];
  tags?: string[];
  notes?: string;
  link?: string;
  minZoom?: number; // Minimum zoom level to show this marker (default based on type)
  color?: "red" | "blue"; // Marker color (default based on zoom level)
}

interface MarkerInfo {
  entry: PokeMapEntry;
  marker: maplibregl.Marker;
  element: HTMLDivElement;
}

// Map styles for different zoom levels
const MAP_STYLE_LARGE_SCALE = "https://demotiles.maplibre.org/style.json"; // For zoomed out
const MAP_STYLE_DETAILED = "https://api.maptiler.com/maps/basic-v2/style.json?key=TgZ6XLtzXrDMsQIKPVXc"; // For zoomed in (detailed)

export default function PokeMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [entries, setEntries] = useState<PokeMapEntry[]>([]);
  const [selected, setSelected] = useState<PokeMapEntry | null>(null);
  const setSelectedRef = useRef(setSelected);

  // Keep ref updated
  useEffect(() => {
    setSelectedRef.current = setSelected;
  }, [setSelected]);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE_LARGE_SCALE,
      center: [-100, 40],
      zoom: 2,
    });

    mapRef.current = map;
    let entriesData: PokeMapEntry[] = [];
    const markers: MarkerInfo[] = [];

    // Blue marker zoom level (much more zoomed in)
    const BLUE_MARKER_MIN_ZOOM = 13;
    
    // Track current map style to avoid unnecessary updates
    let currentMapStyle = MAP_STYLE_LARGE_SCALE;

    // Helper to get min zoom for an entry (default based on type or explicit)
    const getMinZoom = (entry: PokeMapEntry): number => {
      if (entry.minZoom !== undefined) return entry.minZoom;
      // Default: red markers (large scale) at zoom 0-10, blue markers (small scale) at zoom >= 11
      return entry.color === "red" ? 0 : BLUE_MARKER_MIN_ZOOM;
    };

    // Helper to get color for an entry
    const getColor = (entry: PokeMapEntry): "red" | "blue" => {
      if (entry.color) return entry.color;
      // Default: red for large scale, blue for small scale
      const minZoom = getMinZoom(entry);
      return minZoom < BLUE_MARKER_MIN_ZOOM ? "red" : "blue";
    };

    // Update map style based on zoom level
    const updateMapStyle = () => {
      const currentZoom = map.getZoom();
      const shouldUseDetailed = currentZoom >= BLUE_MARKER_MIN_ZOOM;
      const targetStyle = shouldUseDetailed ? MAP_STYLE_DETAILED : MAP_STYLE_LARGE_SCALE;
      
      if (targetStyle !== currentMapStyle) {
        currentMapStyle = targetStyle;
        map.setStyle(targetStyle);
      }
    };

    // Update marker visibility based on current zoom
    const updateMarkerVisibility = () => {
      const currentZoom = map.getZoom();
      markers.forEach(({ entry, marker, element }) => {
        const minZoom = getMinZoom(entry);
        const shouldBeVisible = currentZoom >= minZoom;
        
        // Show/hide marker
        if (shouldBeVisible) {
          marker.getElement().style.display = "block";
        } else {
          marker.getElement().style.display = "none";
        }
      });
    };

    // Combined update function for zoom changes
    const handleZoomChange = () => {
      updateMapStyle();
      updateMarkerVisibility();
    };

    // Function to find marker near click point (only visible ones)
    const findMarkerAtPoint = (lng: number, lat: number, includeAllMarkers: boolean = false): PokeMapEntry | null => {
      const currentZoom = map.getZoom();
      // Calculate threshold based on zoom: smaller threshold when zoomed in
      const threshold = Math.max(0.1, 2.0 / Math.pow(2, currentZoom - 2));
      
      let closestEntry: PokeMapEntry | null = null;
      let closestDistance = Infinity;
      
      for (const entry of entriesData) {
        const minZoom = getMinZoom(entry);
        // Only consider markers that should be visible at current zoom (unless includeAllMarkers is true)
        if (!includeAllMarkers && currentZoom < minZoom) continue;
        
        const distance = Math.sqrt(
          Math.pow(entry.longitude - lng, 2) + Math.pow(entry.latitude - lat, 2)
        );
        if (distance < threshold && distance < closestDistance) {
          closestDistance = distance;
          closestEntry = entry;
        }
      }
      return closestEntry;
    };

    // Listen for map clicks
    const handleMapClick = (e: maplibregl.MapMouseEvent) => {
      // First check visible markers, then check all markers (for red markers when zoomed out)
      let clickedEntry = findMarkerAtPoint(e.lngLat.lng, e.lngLat.lat, false);
      if (!clickedEntry) {
        // If no visible marker found, check all markers (for red markers)
        clickedEntry = findMarkerAtPoint(e.lngLat.lng, e.lngLat.lat, true);
      }
      
      if (clickedEntry) {
        const clickedColor = getColor(clickedEntry);
        const clickedMinZoom = getMinZoom(clickedEntry);
        const currentZoom = map.getZoom();
        
        console.log("Marker clicked via map:", clickedEntry.name);
        setSelectedRef.current(clickedEntry);
        
        // If red marker clicked and we're zoomed out, center and zoom in to blue marker level
        if (clickedColor === "red" && currentZoom < BLUE_MARKER_MIN_ZOOM) {
          map.flyTo({
            center: [clickedEntry.longitude, clickedEntry.latitude],
            zoom: BLUE_MARKER_MIN_ZOOM,
            duration: 1000
          });
        }
      }
    };
    map.on('click', handleMapClick);

    // Listen for zoom changes to update map style and marker visibility
    map.on('zoom', handleZoomChange);
    map.on('zoomend', handleZoomChange);
    
    // Also listen for style load to re-add markers after style change
    map.on('style.load', () => {
      // Re-add all markers after style change
      markers.forEach(({ entry, marker }) => {
        marker.addTo(map);
      });
      updateMarkerVisibility();
    });

    // Fetch marker data
    fetch("/data/comp-bio-pokemap.json")
      .then((res) => res.json())
      .then((data: PokeMapEntry[]) => {
        entriesData = data;
        setEntries(data);
        
        data.forEach((point) => {
          const color = getColor(point);
          const minZoom = getMinZoom(point);
          const currentZoom = map.getZoom();
          const isVisible = currentZoom >= minZoom;

          const el = document.createElement("div");
          el.className = `w-3 h-3 ${color === "red" ? "bg-red-600" : "bg-blue-600"} rounded-full cursor-pointer`;
          el.style.pointerEvents = "auto";
          el.style.zIndex = "1000";
          el.style.display = isVisible ? "block" : "none";

          const marker = new maplibregl.Marker(el)
            .setLngLat([point.longitude, point.latitude])
            .addTo(map);

          markers.push({ entry: point, marker, element: el });
        });
        
        // Initial visibility update
        updateMarkerVisibility();
      })
      .catch((err) => console.error("Failed to load markers:", err));

    return () => {
      map.off('click', handleMapClick);
      map.off('zoom', updateMarkerVisibility);
      map.off('zoomend', updateMarkerVisibility);
      map.remove();
    };
  }, []);

  return (
    <div className="flex w-full h-[90vh]">
      {/* Map container with full height */}
      <div ref={mapContainer} className="flex-1 h-full" />

      {/* Sidebar */}
      <aside className="w-1/3 p-4 bg-white overflow-auto border-l border-gray-200">
        {selected ? (
          <>
            <h2 className="text-xl font-bold">{selected.name}</h2>
            {selected.leader && (
              <p className="text-sm text-gray-600 mb-1">{selected.leader}</p>
            )}
            {selected.notes && <p className="mt-2 text-sm">{selected.notes}</p>}
            {selected.link && (
              <a
                href={selected.link}
                target="_blank"
                className="text-blue-600 hover:underline mt-2 block"
              >
                Visit site →
              </a>
            )}
            <div className="mt-3 text-xs text-gray-500">
              <span className="font-semibold">Domain:</span>{" "}
              {selected.domain.join(", ")}
            </div>
            {selected.tags && (
              <div className="mt-1 text-xs text-gray-400">
                {selected.tags.join(", ")}
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500 italic">Click a marker to see details</p>
        )}
      </aside>
    </div>
  );
}