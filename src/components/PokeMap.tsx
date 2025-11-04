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
}

// Use MapLibre demo tiles first to confirm it works
const MAP_STYLE = "https://demotiles.maplibre.org/style.json";

export default function PokeMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [entries, setEntries] = useState<PokeMapEntry[]>([]);
  const [selected, setSelected] = useState<PokeMapEntry | null>(null);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: [0, 20],
      zoom: 2,
    });

    mapRef.current = map;

    // Fetch marker data
    fetch("/data/pokemap.json")
      .then((res) => res.json())
      .then((data: PokeMapEntry[]) => {
        setEntries(data);
        data.forEach((point) => {
          const el = document.createElement("div");
          el.className = "w-3 h-3 bg-blue-600 rounded-full cursor-pointer";
          el.onclick = () => setSelected(point);

          new maplibregl.Marker(el)
            .setLngLat([point.longitude, point.latitude])
            .addTo(map);
        });
      })
      .catch((err) => console.error("Failed to load markers:", err));

    return () => map.remove();
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