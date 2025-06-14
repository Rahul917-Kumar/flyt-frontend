"use client";
import { useEffect, useRef } from "react";

type Props = {
    onDrawComplete: (coordinates: { lat: number; lng: number }[], type:"polygon" | "polyline") => void;
    latitude: number;
    longitude: number;
    // drawMode: "polygon" | "polyline";
};

export default function PolygonMap({ onDrawComplete, latitude, longitude }: Props) {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const polygonRef = useRef<google.maps.Polygon | null>(null); // <-- store current polygon
    const polylineRef = useRef<google.maps.Polyline | null>(null);
    const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);


    useEffect(() => {
        const initMap = () => {
            if (!window.google || !mapRef.current) return;

            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: latitude, lng: longitude },
                zoom: 12,
            });

            const drawingManager = new window.google.maps.drawing.DrawingManager({
                drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
                drawingControl: true,
                drawingControlOptions: {
                    position: window.google.maps.ControlPosition.TOP_CENTER,
                    // drawingModes: [google.maps.drawing.OverlayType.POLYGON],
                    // drawingModes:
                    //     drawMode === "polygon"
                    //         ? [window.google.maps.drawing.OverlayType.POLYGON]
                    //         : [window.google.maps.drawing.OverlayType.POLYLINE],
                    drawingModes: [
                        window.google.maps.drawing.OverlayType.POLYGON,
                        window.google.maps.drawing.OverlayType.POLYLINE,
                      ],
                },
                polygonOptions: {
                    editable: true,
                    strokeColor: "#FF0000",
                    fillColor: "#FFAAAA",
                },
                polylineOptions: {
                    editable: true,
                    strokeColor: "#0000FF",
                  },
            });

            drawingManager.setMap(map);

            window.google.maps.event.addListener(drawingManager, "overlaycomplete", (event: any) => {
                console.log("overlay complete", event);
                if(event.type === "polygon") {
                    if (polygonRef.current) {
                        polygonRef.current.setMap(null); // remove previous polygon
                    }
                    polygonRef.current = event.overlay;
                }

                if (event.type === "polyline") {
                    console.log("polyline event", event);
                    if (polylineRef.current) {
                        polylineRef.current.setMap(null); // remove previous polyline
                    }
                    polylineRef.current = event.overlay;
                  }
                
                const path = event.overlay.getPath();
                const coords = path.getArray().map((latLng: google.maps.LatLng) => ({
                    lat: latLng.lat(),
                    lng: latLng.lng(),
                }));

                onDrawComplete(coords, event.type); 

                // if (event.type === "polygon") {
                //     if (polygonRef.current) {
                //         polygonRef.current.setMap(null);
                //     }
                //     const polygon = event.overlay as google.maps.Polygon;
                //     polygonRef.current = polygon;

                //     const path = polygon.getPath();
                //     const coords = path.getArray().map((latLng) => ({
                //         lat: latLng.lat(),
                //         lng: latLng.lng(),
                //     }));

                //     onDrawComplete(coords); // Send to parent
                // }
            });
        };

        if (!window.google) {
            const script = document.createElement("script");
            script.src =
                "https://maps.googleapis.com/maps/api/js?key=AIzaSyCKLdp5Iqth0HbquleWHenUdYKU6EDVzZc&libraries=drawing";
            script.async = true;
            script.onload = initMap;
            document.head.appendChild(script);
        } else {
            initMap();
        }
    }, [ latitude, longitude]);

    // useEffect(() => {
    //     if (!drawingManagerRef.current || !window.google) return;

    //     const mode =
    //         drawMode === "polygon"
    //             ? window.google.maps.drawing.OverlayType.POLYGON
    //             : window.google.maps.drawing.OverlayType.POLYLINE;

    //     drawingManagerRef.current.setDrawingMode(mode);
    // }, [drawMode]);
    

    return <div ref={mapRef} style={{ width: "100%", height: "500px" }} />;
}
