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
  thoughts?: string;
  minZoom?: number;
  color?: "red" | "blue";
}

interface MarkerInfo {
  entry: PokeMapEntry;
  marker: maplibregl.Marker;
  element: HTMLDivElement;
}

const MAP_STYLE_LARGE_SCALE = "https://demotiles.maplibre.org/style.json";
const MAP_STYLE_DETAILED = "https://api.maptiler.com/maps/basic-v2/style.json?key=TgZ6XLtzXrDMsQIKPVXc";

// ----------
// The hover radius is now a clear function of zoom, see findMarkerAtPoint for details
// ----------

export default function PokeMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [entries, setEntries] = useState<PokeMapEntry[]>([]);
  const [selected, setSelected] = useState<PokeMapEntry | null>(null);
  const [hovered, setHovered] = useState<PokeMapEntry | null>(null);
  const setSelectedRef = useRef(setSelected);

  useEffect(() => {
    return () => {};
  }, []);

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

    const BLUE_MARKER_MIN_ZOOM = 13;
    let currentMapStyle = MAP_STYLE_LARGE_SCALE;

    const getMinZoom = (entry: PokeMapEntry): number =>
      entry.minZoom !== undefined
        ? entry.minZoom
        : (entry.color === "red" ? 0 : BLUE_MARKER_MIN_ZOOM);

    const getColor = (entry: PokeMapEntry): "red" | "blue" => {
      if (entry.color) return entry.color;
      const minZoom = getMinZoom(entry);
      return minZoom < BLUE_MARKER_MIN_ZOOM ? "red" : "blue";
    };

    const updateMapStyle = () => {
      const currentZoom = map.getZoom();
      const shouldUseDetailed = currentZoom >= BLUE_MARKER_MIN_ZOOM;
      const targetStyle = shouldUseDetailed ? MAP_STYLE_DETAILED : MAP_STYLE_LARGE_SCALE;
      if (targetStyle !== currentMapStyle) {
        currentMapStyle = targetStyle;
        map.setStyle(targetStyle);
      }
    };

    const updateMarkerVisibility = () => {
      const currentZoom = map.getZoom();
      markers.forEach(({ entry, marker }) => {
        const minZoom = getMinZoom(entry);
        const shouldBeVisible = currentZoom >= minZoom;
        marker.getElement().style.display = shouldBeVisible ? "block" : "none";
      });
    };

    const handleZoomChange = () => {
      updateMapStyle();
      updateMarkerVisibility();
    };

    // Dynamically set the hover radius based on the zoom level
    // Now: At low zoom, hover radius is even bigger; at high zoom, much smaller for precision.
    const getHoverThreshold = (zoom: number) => {
      // New: At zoom 2: ~2.2 deg, zoom 6: ~0.63, zoom 10: ~0.13, zoom 14+: ~0.004
      // MIN is much lower than before for high zoom, MAX is slightly larger for low zoom.
      const MIN = 0.004;  // Allow very small threshold at high zoom (precise)
      const MAX = 2.2;    // Slightly larger at low zoom
      const threshold = Math.min(
        MAX,
        Math.max(
          MIN,
          2.2 / Math.pow(2, (zoom - 2) * 0.85)
        )
      );
      return threshold;
    };

    const findMarkerAtPoint = (
      lng: number,
      lat: number,
      includeAllMarkers: boolean = false
    ): PokeMapEntry | null => {
      const currentZoom = map.getZoom();
      const threshold = getHoverThreshold(currentZoom);
      let closestEntry: PokeMapEntry | null = null;
      let closestDistance = Infinity;

      for (const entry of entriesData) {
        const minZoom = getMinZoom(entry);
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

    const handleMapClick = (e: maplibregl.MapMouseEvent) => {
      let clickedEntry = findMarkerAtPoint(e.lngLat.lng, e.lngLat.lat, false);
      if (!clickedEntry) {
        clickedEntry = findMarkerAtPoint(e.lngLat.lng, e.lngLat.lat, true);
      }

      if (clickedEntry) {
        const clickedColor = getColor(clickedEntry);
        const currentZoom = map.getZoom();

        setSelectedRef.current(clickedEntry);

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

    // ✨ Stable map-based HOVER logic, hover radius changes with zoom!
    let lastHovered: PokeMapEntry | null = null;

    const handleMapMouseMove = (e: maplibregl.MapMouseEvent) => {
      const hoveredEntry =
        findMarkerAtPoint(e.lngLat.lng, e.lngLat.lat, false) ||
        findMarkerAtPoint(e.lngLat.lng, e.lngLat.lat, true);

      if (hoveredEntry?.name !== lastHovered?.name) {
        lastHovered = hoveredEntry;
        setHovered(hoveredEntry);
      }
    };

    const handleMapMouseLeave = () => {
      lastHovered = null;
      setHovered(null);
    };

    map.on('mousemove', handleMapMouseMove);
    map.on('mouseleave', handleMapMouseLeave);

    map.on('zoom', handleZoomChange);
    map.on('zoomend', handleZoomChange);

    map.on('style.load', () => {
      markers.forEach(({ marker }) => {
        marker.addTo(map);
      });
      updateMarkerVisibility();
    });

    // --- Main Markers Fetch and Creation ---
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
          el.className = [
            "w-4", "h-4",
            "rounded-full",
            "cursor-pointer",
            color === "red" ? "bg-red-600" : "bg-blue-600",
            "marker-for-pokemap",
          ].join(" ");
          el.tabIndex = 0;

          el.style.position = "relative";
          el.style.left = "0";
          el.style.top = "0";
          el.style.pointerEvents = "auto";
          el.style.zIndex = "9999";
          el.style.display = isVisible ? "block" : "none";
          el.style.width = "16px";
          el.style.height = "16px";
          el.style.cursor = "pointer";
          el.style.backgroundColor = color === "red" ? "#dc2626" : "#2563eb";
          el.style.borderRadius = "9999px";

          el.addEventListener("click", () => {});

          const marker = new maplibregl.Marker(el)
            .setLngLat([point.longitude, point.latitude])
            .addTo(map);

          markers.push({ entry: point, marker, element: el });
        });

        // Update the markersRef for use in other effects
        markersRef.current = markers;

        updateMarkerVisibility();
      })
      .catch((err) => console.error("Failed to load markers:", err));

    return () => {
      map.off('mousemove', handleMapMouseMove);
      map.off('mouseleave', handleMapMouseLeave);
      map.off('click', handleMapClick);
      map.off('zoom', handleZoomChange);
      map.off('zoomend', handleZoomChange);
      map.remove();
    };
  }, []);

  // ✨ Update marker hover ring on hovered change
  useEffect(() => {
    if (!mapRef.current) return;
    const markerEls = document.querySelectorAll<HTMLDivElement>('.marker-for-pokemap');
    markerEls.forEach((el) => {
      const entryName = el.getAttribute("data-marker-name");
      if (hovered && el.textContent === hovered.name) {
        el.classList.add("ring", "ring-yellow-400", "ring-2");
      } else {
        el.classList.remove("ring", "ring-yellow-400", "ring-2");
      }
    });
  }, [hovered]);

  const markersRef = useRef<MarkerInfo[]>([]);
  useEffect(() => {
    if (mapRef.current) {
      // No operation needed; marker ref is updated during marker creation
    }
  }, [entries]);

  useEffect(() => {
    if (!markersRef.current.length) return;
    markersRef.current.forEach(({ entry, element }) => {
      if (hovered && entry.name === hovered.name) {
        element.classList.add("ring", "ring-yellow-400", "ring-2");
      } else {
        element.classList.remove("ring", "ring-yellow-400", "ring-2");
      }
    });
  }, [hovered]);

  useEffect(() => {
    if (!mapRef.current || !mapContainer.current) return;
    // No effect body needed as before.
  }, []);

  const infoEntry = hovered || selected;

  return (
    <div className="flex w-full h-[90vh]">
      <div ref={mapContainer} className="flex-1 h-full" />
      <aside className="w-1/3 p-4 bg-white overflow-auto border-l border-gray-200">
        {infoEntry ? (
          <>
            <h2 className="text-xl font-bold">{infoEntry.name}</h2>
            {infoEntry.leader && (
              <p className="text-sm text-gray-600 mb-1">{infoEntry.leader}</p>
            )}
            {infoEntry.notes && <p className="mt-2 text-sm">{infoEntry.notes}</p>}
            {infoEntry.link && (
              <a
                href={infoEntry.link}
                target="_blank"
                className="text-blue-600 hover:underline mt-2 block"
              >
                Visit site →
              </a>
            )}
            {infoEntry.thoughts && (
              <a
                href={infoEntry.thoughts}
                target="_blank"
                className="text-blue-300 hover:underline mt-1 block"
              >
                See Aath's Notes
              </a>
            )}
            <div className="mt-3 text-xs text-gray-500">
              <span className="font-semibold">Domain:</span>{" "}
              {infoEntry.domain.join(", ")}
            </div>
            {infoEntry.tags && (
              <div className="mt-1 text-xs text-gray-400">
                {infoEntry.tags.join(", ")}
              </div>
            )}
            {hovered && !selected && (
              <div className="mt-4 text-xs text-yellow-600 italic">
                Hovering (click marker to persist info)
              </div>
            )}
            {hovered && selected && hovered.name !== selected.name && (
              <div className="mt-4 text-xs text-yellow-600 italic">
                Hovering (click marker to persist info, or move away to return to selection)
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500 italic">Click or hover a marker to see details</p>
        )}
      </aside>
    </div>
  );
}