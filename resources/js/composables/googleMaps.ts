export type Map3D = HTMLElement & {
    center: { lat: number; lng: number; altitude: number };
    range: number;
    tilt: number;
    heading: number;
};
interface Maps3DLibrary {
    Map3DElement: new (options: Record<string, unknown>) => Map3D;
    Marker3DElement: new (options: Record<string, unknown>) => HTMLElement;
}
type MapsWindow = Window & {
    google?: { maps: { importLibrary: (name: string) => Promise<Maps3DLibrary> } };
    portfolioMapsReady?: () => void;
    gm_authFailure?: () => void;
};
let loading: Promise<Maps3DLibrary> | undefined;

export function loadGoogleMaps(key: string, language: string): Promise<Maps3DLibrary> {
    if (loading) return loading;
    const target = window as MapsWindow;
    target.gm_authFailure = () => window.dispatchEvent(new Event("portfolio-map-error"));
    loading = new Promise<void>((resolve, reject) => {
        if (target.google?.maps.importLibrary) return resolve();
        const script = document.createElement("script");
        const timeout = window.setTimeout(() => fail(), 20000);
        const fail = () => {
            clearTimeout(timeout);
            script.remove();
            reject(new Error("Google Maps could not load"));
        };
        target.portfolioMapsReady = () => {
            clearTimeout(timeout);
            resolve();
        };
        script.async = true;
        script.nonce = document.querySelector<HTMLScriptElement>("script[nonce]")?.nonce ?? "";
        script.src = `https://maps.googleapis.com/maps/api/js?${new URLSearchParams({ key, v: "weekly", loading: "async", callback: "portfolioMapsReady", language, region: "FR" })}`;
        script.onerror = fail;
        document.head.append(script);
    }).then(() => target.google!.maps.importLibrary("maps3d")).catch((error) => {
        loading = undefined;
        throw error;
    });
    return loading;
}
