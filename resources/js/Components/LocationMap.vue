<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { usePage } from "@inertiajs/vue3";
import { ArrowUpRight, LocateFixed, MapPin, Minus, Plus } from "lucide-vue-next";
import { loadGoogleMaps, createMapPin, mapStyles, type GoogleMap } from "../composables/googleMaps";
import { useLocale } from "../composables/useLocale";
import { useCms } from "../composables/useCms";

const { locale } = useLocale();
const cms = useCms();
const page = usePage<{ mapsKey?: string }>();
const text = (en: string, fr: string) => locale.value === "fr" ? fr : en;
const element = ref<HTMLElement | null>(null);
const failed = ref(false);
const loading = ref(false);
const ready = ref(false);
const streetZoom = 16;
const centre = () => ({ lat: Number(cms.value.site.latitude), lng: Number(cms.value.site.longitude) });
const mapLink = computed(() => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${centre().lat},${centre().lng}`)}`);
let map: GoogleMap | undefined;
let disposed = false;
let cleanup = () => {};

function resetView() {
    map?.setCenter(centre());
    map?.setZoom(streetZoom);
}
function zoom(amount: number) {
    if (map) map.setZoom(Math.max(3, Math.min(20, (map.getZoom() ?? streetZoom) + amount)));
}
function mapError() {
    loading.value = false;
    ready.value = false;
    failed.value = true;
}
async function loadMap() {
    if (loading.value) return;
    cleanup();
    failed.value = false;
    ready.value = false;
    loading.value = true;
    await nextTick();

    try {
        const library = await loadGoogleMaps(page.props.mapsKey || "", locale.value);
        if (disposed || !element.value || failed.value) return;
        const isDark = () => document.documentElement.classList.contains("dark");
        const currentMap = new library.Map(element.value, {
            center: centre(),
            zoom: streetZoom,
            minZoom: 3,
            maxZoom: 20,
            mapTypeId: "roadmap",
            renderingType: "RASTER",
            tilt: 0,
            disableDefaultUI: true,
            clickableIcons: false,
            gestureHandling: "cooperative",
            keyboardShortcuts: true,
            styles: mapStyles(isDark()),
        });
        map = currentMap;
        const pin = createMapPin(library, currentMap, centre(), cms.value.site.map_label);
        const timeout = window.setTimeout(mapError, 20000);
        const tilesListener = currentMap.addListener("tilesloaded", () => {
            clearTimeout(timeout);
            if (!failed.value) {
                loading.value = false;
                ready.value = true;
            }
        });
        const themeObserver = new MutationObserver(() => currentMap.setOptions({ styles: mapStyles(isDark()) }));
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        const resizeObserver = new ResizeObserver(() => {
            const position = currentMap.getCenter()?.toJSON();
            if (position) currentMap.setCenter(position);
        });
        resizeObserver.observe(element.value);
        cleanup = () => {
            clearTimeout(timeout);
            tilesListener.remove();
            themeObserver.disconnect();
            resizeObserver.disconnect();
            pin.setMap(null);
            element.value?.replaceChildren();
            map = undefined;
        };
    } catch (error) {
        cleanup();
        if (import.meta.env.DEV) console.warn("Map could not load", error);
        mapError();
    }
}
onMounted(() => {
    window.addEventListener("portfolio-map-error", mapError);
    void loadMap();
});
onBeforeUnmount(() => {
    disposed = true;
    window.removeEventListener("portfolio-map-error", mapError);
    cleanup();
});
</script>
<template>
    <section class="location-map" data-analytics-ignore data-lenis-prevent>
        <div class="map-stage">
            <div ref="element" class="map-canvas" role="region"
                :aria-label="`${text('Map of', 'Carte de')} ${cms.site.map_label}`" :aria-busy="loading" />
            <div v-if="failed" class="map-error">
                <MapPin :size="26" :stroke-width="1.25" aria-hidden="true" />
                <p role="status">{{ text('The map could not load. You can retry or open the location below.', 'La carte n’a pas pu charger. Réessayez ou ouvrez le lien ci-dessous.') }}</p>
                <button type="button" class="map-load" @click="loadMap">
                    {{ text('Try again', 'Réessayer') }}
                    <ArrowUpRight :size="16" aria-hidden="true" />
                </button>
            </div>
            <p v-if="loading" class="map-loading" role="status">{{ text('Loading map…', 'Chargement de la carte…') }}</p>
            <div v-if="ready && !failed" class="map-controls" role="group" :aria-label="text('Map controls', 'Commandes de la carte')">
                <button type="button" @click="zoom(1)" :aria-label="text('Zoom in', 'Zoom avant')" :title="text('Zoom in', 'Zoom avant')"><Plus :size="18" aria-hidden="true" /></button>
                <button type="button" @click="zoom(-1)" :aria-label="text('Zoom out', 'Zoom arrière')" :title="text('Zoom out', 'Zoom arrière')"><Minus :size="18" aria-hidden="true" /></button>
                <button type="button" @click="resetView" :aria-label="text('Recenter on the pin', 'Recentrer sur le repère')" :title="text('Recenter on the pin', 'Recentrer sur le repère')"><LocateFixed :size="18" :stroke-width="1.5" aria-hidden="true" /></button>
            </div>
        </div>
        <div class="map-caption">
            <div class="map-address">
                <MapPin :size="16" :stroke-width="1.5" aria-hidden="true" />
                <span>{{ cms.site.map_label }}</span>
            </div>
            <a :href="mapLink" target="_blank" rel="noopener noreferrer">
                {{ text('Open in Google Maps', 'Ouvrir dans Google Maps') }}
                <ArrowUpRight :size="15" aria-hidden="true" />
            </a>
        </div>
    </section>
</template>

<style scoped>
.location-map { overflow: hidden; border: 1px solid hsl(var(--border)); border-radius: 8px; background: hsl(var(--background)); }
.map-stage { position: relative; height: 400px; isolation: isolate; background: hsl(var(--secondary)); }
.map-canvas { position: absolute; inset: 0; z-index: 0; background: hsl(var(--secondary)); font-family: inherit; }
.map-error { position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 32px; text-align: center; background: hsl(var(--secondary)); }
.map-error p { max-width: 34ch; font-size: 13px; line-height: 1.7; color: hsl(var(--muted-foreground)); }
.map-load { display: inline-flex; align-items: center; gap: 20px; min-height: 44px; padding: 10px 16px; margin-top: 4px; border: 1px solid hsl(var(--foreground) / 0.3); border-radius: 4px; font-size: 12px; }
.map-load:hover { background: hsl(var(--background)); }
.map-loading { position: absolute; top: 16px; left: 16px; z-index: 2; padding: 10px 14px; background: hsl(var(--background)); border: 1px solid hsl(var(--border)); font-size: 12px; }
.map-controls { position: absolute; top: 16px; right: 16px; z-index: 1; display: flex; flex-direction: column; overflow: hidden; border: 1px solid hsl(var(--border)); border-radius: 4px; background: hsl(var(--background)); }
.map-controls button { display: grid; place-items: center; width: 44px; height: 44px; color: hsl(var(--foreground)); }
.map-controls button + button { border-top: 1px solid hsl(var(--border)); }
.map-controls button:hover { background: hsl(var(--accent)); }
.map-controls button:focus-visible, .map-load:focus-visible, .map-caption a:focus-visible { outline: 2px solid hsl(var(--foreground)); outline-offset: -3px; }
.map-caption { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 24px; padding: 18px 20px; border-top: 1px solid hsl(var(--border)); font-size: 12px; }
.map-address, .map-caption a { display: flex; align-items: center; gap: 9px; }
.map-address svg { flex-shrink: 0; }
.map-caption a { min-height: 28px; color: hsl(var(--muted-foreground)); text-underline-offset: 4px; }
.map-caption a:hover { color: hsl(var(--foreground)); text-decoration: underline; }
.map-canvas :deep(.location-pin) { position: absolute; width: 28px; height: 28px; transform: translate(-50%, -50%); display: grid; place-items: center; border-radius: 50%; background: hsl(var(--foreground) / 0.15); }
.map-canvas :deep(.location-pin-dot) { width: 14px; height: 14px; border: 3px solid hsl(var(--background)); border-radius: 50%; background: hsl(var(--foreground)); box-shadow: 0 0 0 1px hsl(var(--foreground) / 0.35); }
@media (max-width: 600px) {
    .map-stage { height: 340px; }
    .map-caption { padding: 14px 16px; gap: 4px; flex-direction: column; align-items: flex-start; }
    .map-error { padding: 24px; }
}
</style>
