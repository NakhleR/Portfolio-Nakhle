export type MapPosition = { lat: number; lng: number };
type MapListener = { remove(): void };
export interface GoogleMap {
    setCenter(position: MapPosition): void;
    getCenter(): { toJSON(): MapPosition } | undefined;
    setZoom(zoom: number): void;
    getZoom(): number | undefined;
    setOptions(options: Record<string, unknown>): void;
    addListener(name: string, callback: () => void): MapListener;
}
interface MapOverlay {
    onAdd(): void;
    draw(): void;
    onRemove(): void;
    setMap(map: GoogleMap | null): void;
    getPanes(): { markerLayer: HTMLElement } | null;
    getProjection(): { fromLatLngToDivPixel(position: MapPosition): { x: number; y: number } | null };
}
interface MapsLibrary {
    Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMap;
    OverlayView: new () => MapOverlay;
}
type MapsWindow = Window & {
    google?: { maps: { importLibrary(name: "maps"): Promise<MapsLibrary> } };
    portfolioMapsReady?: () => void;
    gm_authFailure?: () => void;
};
let loading: Promise<MapsLibrary> | undefined;

export function loadGoogleMaps(key: string, language: string): Promise<MapsLibrary> {
    if (!key) return Promise.reject(new Error("Google Maps API key is missing"));
    if (loading) return loading;
    const target = window as MapsWindow;
    loading = new Promise<MapsLibrary>((resolve, reject) => {
        const script = document.createElement("script");
        const fail = () => {
            clearTimeout(timeout);
            script.remove();
            reject(new Error("Google Maps could not load"));
        };
        const timeout = window.setTimeout(fail, 20000);
        target.gm_authFailure = () => {
            window.dispatchEvent(new Event("portfolio-map-error"));
            fail();
        };
        const importMaps = () => target.google!.maps.importLibrary("maps").then((library) => {
            clearTimeout(timeout);
            resolve(library);
        }, fail);
        if (target.google?.maps.importLibrary) {
            void importMaps();
            return;
        }
        target.portfolioMapsReady = () => { void importMaps(); };
        script.async = true;
        script.nonce = document.querySelector<HTMLScriptElement>("script[nonce]")?.nonce ?? "";
        script.src = `https://maps.googleapis.com/maps/api/js?${new URLSearchParams({ key, v: "weekly", loading: "async", callback: "portfolioMapsReady", language, region: "FR" })}`;
        script.onerror = fail;
        document.head.append(script);
    }).catch((error) => {
        loading = undefined;
        throw error;
    });
    return loading;
}

export function createMapPin(library: MapsLibrary, map: GoogleMap, position: MapPosition, label: string): MapOverlay {
    const overlay = new library.OverlayView();
    const pin = document.createElement("div");
    pin.className = "location-pin";
    pin.setAttribute("role", "img");
    pin.setAttribute("aria-label", label);
    pin.title = label;
    const dot = document.createElement("span");
    dot.className = "location-pin-dot";
    pin.append(dot);
    overlay.onAdd = () => { overlay.getPanes()?.markerLayer.append(pin); };
    overlay.draw = () => {
        const point = overlay.getProjection().fromLatLngToDivPixel(position);
        if (point) {
            pin.style.left = `${point.x}px`;
            pin.style.top = `${point.y}px`;
        }
    };
    overlay.onRemove = () => pin.remove();
    overlay.setMap(map);
    return overlay;
}

export function mapStyles(dark: boolean) {
    const colors = dark
        ? { land: "#20251e", text: "#c4c8bc", stroke: "#20251e", road: "#3b4136", highway: "#535b48", park: "#2a3525", water: "#151e1c" }
        : { land: "#f4f5ef", text: "#666e5b", stroke: "#f4f5ef", road: "#ffffff", highway: "#e0e3d7", park: "#e5ead9", water: "#cdd8d2" };
    return [
        { elementType: "geometry", stylers: [{ color: colors.land }] },
        { elementType: "labels.text.fill", stylers: [{ color: colors.text }] },
        { elementType: "labels.text.stroke", stylers: [{ color: colors.stroke }] },
        { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
        { featureType: "poi.park", elementType: "geometry", stylers: [{ visibility: "on" }, { color: colors.park }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: colors.road }] },
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: colors.highway }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: colors.water }] },
    ];
}
