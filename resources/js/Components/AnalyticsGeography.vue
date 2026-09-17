<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Globe2, Layers3, Map as MapIcon, MoveUpRight } from "lucide-vue-next";
// Simplified Natural Earth 1:50m countries, public domain. No remote map requests.
// Source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson
import world from "../data/worldCountries.json";

export type CountrySessions = { country: string | null; sessions: number };
const props = defineProps<{ countries: CountrySessions[] }>();
const selected = ref<string | null>(null);
const hovered = ref<string | null>(null);
const raised = ref(true);
const region = ref("world");
const names = new Intl.DisplayNames(["en"], { type: "region" });
const countryName = (code: string | null) => {
    if (!code) return "Unknown";
    return /^[A-Z]{2}$/.test(code) ? names.of(code) || code : world.find(country => country.code === code)?.name || code;
};
const rows = computed(() => props.countries.map(row => ({ ...row, name: countryName(row.country) })));
const total = computed(() => rows.value.reduce((sum, row) => sum + row.sessions, 0));
const known = computed(() => rows.value.filter(row => row.country));
const located = computed(() => known.value.reduce((sum, row) => sum + row.sessions, 0));
const counts = computed(() => new Map(props.countries.map(row => [row.country, row.sessions])));
const max = computed(() => Math.max(1, ...known.value.map(row => row.sessions)));
const active = computed(() => hovered.value || selected.value);
const activeName = computed(() => active.value ? countryName(active.value) : null);
const percent = (value: number) => total.value ? Math.round(value / total.value * 100) : 0;
const height = (value: number) => 4 + value / max.value * 100;
const fill = (code: string) => {
    const count = counts.value.get(code) || 0;
    if (!count) return "#e1e4d9";
    return `hsl(${85 - 45 * count / max.value} 30% ${76 - 39 * count / max.value}%)`;
};
const towers = computed(() => world.filter(country => counts.value.get(country.code))
    .map(country => ({ ...country, sessions: counts.value.get(country.code) || 0 }))
    .sort((a, b) => a.y - b.y));
const select = (code: string) => { selected.value = selected.value === code ? null : code; };
watch(() => props.countries, () => { selected.value = null; hovered.value = null; });
</script>

<template>
    <section class="an-geography cms-panel" aria-labelledby="geography-title">
        <header class="geo-header">
            <div>
                <span class="geo-eyebrow"><Globe2 :size="13" /> Audience atlas</span>
                <h2 id="geography-title">Where visits begin.</h2>
                <p>Session concentration by country</p>
            </div>
            <div class="geo-controls">
                <label class="sr-only" for="geography-region">Map region</label>
                <select id="geography-region" v-model="region">
                    <option value="world">World</option>
                    <option value="europe">Europe</option>
                </select>
                <button type="button" :aria-pressed="raised" @click="raised = !raised">
                    <Layers3 v-if="raised" :size="15" /><MapIcon v-else :size="15" />
                    {{ raised ? "Raised" : "Flat" }}
                </button>
            </div>
        </header>
        <div class="geo-content">
            <div class="geo-stage">
                <div class="geo-readout" aria-live="polite" aria-atomic="true">
                    <template v-if="activeName">
                        <span>{{ activeName }}</span>
                        <strong>{{ (counts.get(active) || 0).toLocaleString("en-US") }} <small>sessions · {{ percent(counts.get(active) || 0) }}%</small></strong>
                    </template>
                    <template v-else>
                        <span>{{ known.length ? `${known.length} countries & territories` : "Waiting for country data" }}</span>
                        <strong>{{ located.toLocaleString("en-US") }} <small>located sessions</small></strong>
                    </template>
                </div>
                <svg class="geo-world-map" :viewBox="region === 'europe' ? '440 95 205 220' : '0 0 1000 500'" role="img" aria-labelledby="geo-map-title geo-map-description" @mouseleave="hovered = null">
                    <title id="geo-map-title">Sessions by country</title>
                    <desc id="geo-map-description">Darker countries and taller columns indicate more sessions. Columns use representative country positions, not visitor addresses. Exact counts are available in the country list.</desc>
                    <g class="geo-grid" aria-hidden="true">
                        <path v-for="n in 7" :key="`h${n}`" :d="`M32,${130 + n * 40} H968`" />
                        <path v-for="n in 12" :key="`v${n}`" :d="`M${32 + n * 72},130 V430`" />
                    </g>
                    <g v-if="raised" transform="translate(0 4)" fill="#bdc4b0" aria-hidden="true">
                        <path v-for="country in world" :key="country.code" :d="country.path" />
                    </g>
                    <g class="geo-countries">
                        <path v-for="country in world" :key="country.code" :d="country.path"
                            :fill="fill(country.code)" :class="{ 'is-active': active === country.code }"
                            @mouseenter="hovered = country.code" @click="select(country.code)">
                            <title>{{ country.name }}: {{ counts.get(country.code) || 0 }} sessions</title>
                        </path>
                    </g>
                    <g v-if="raised" class="geo-towers" aria-hidden="true">
                        <g v-for="country in towers" :key="country.code" :transform="`translate(${country.x} ${country.y})`"
                            :class="{ 'is-active': active === country.code }"
                            @mouseenter="hovered = country.code" @click="select(country.code)">
                            <ellipse cx="4" cy="3" rx="13" ry="4" fill="#394320" opacity=".13" />
                            <path :d="`M-4,0 L4,3 V${3-height(country.sessions)} L-4,${-height(country.sessions)} Z`" fill="#697c40" />
                            <path :d="`M4,3 L9,0 V${-height(country.sessions)} L4,${3-height(country.sessions)} Z`" fill="#394e27" />
                            <path :d="`M-4,${-height(country.sessions)} L1,${-3-height(country.sessions)} L9,${-height(country.sessions)} L4,${3-height(country.sessions)} Z`" fill="#c4cf90" />
                            <circle :cy="-height(country.sessions)" cx="2" r="2" fill="#f9fbe9" />
                        </g>
                    </g>
                </svg>
                <div class="geo-map-footer">
                    <span class="geo-scale"><i /> Fewer <b /> More sessions</span>
                    <a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noopener noreferrer">Natural Earth <MoveUpRight :size="10" /></a>
                </div>
            </div>
            <aside class="geo-breakdown" aria-label="Country session counts">
                <div class="geo-coverage"><span>Country coverage</span><strong>{{ percent(located) }}%</strong></div>
                <div class="geo-meter" aria-hidden="true"><i :style="{ width: `${percent(located)}%` }" /></div>
                <p class="geo-coverage-note">{{ located }} of {{ total }} sessions located</p>
                <div v-if="rows.length" class="geo-list">
                    <button v-for="row in rows" :key="row.country || 'unknown'" type="button"
                        :aria-pressed="row.country ? selected === row.country : false"
                        @click="row.country ? select(row.country) : selected = null"
                        @mouseenter="hovered = row.country" @mouseleave="hovered = null">
                        <span class="geo-country-code">{{ row.country || '—' }}</span>
                        <span class="geo-country-name">{{ row.name }}<i :style="{ width: `${percent(row.sessions)}%` }" /></span>
                        <strong>{{ row.sessions.toLocaleString("en-US") }}</strong>
                        <small>{{ percent(row.sessions) }}%</small>
                    </button>
                </div>
                <p v-else class="geo-empty">Country totals will appear here as consenting visitors arrive.</p>
            </aside>
        </div>
        <footer class="geo-note">
            <p v-if="!located">No country data yet. New consenting visits can be located once Cloudflare proxying and IP Geolocation are enabled. Earlier visits remain unknown.</p>
            <p>One country per session: the first available country in the filtered visits. Height and color show relative session totals, not precise locations or population density. Small territories may appear only in the list. VPNs can affect accuracy.</p>
        </footer>
    </section>
</template>

<style scoped>
.an-geography { margin-block: 24px; padding: 0; overflow: hidden; background: #fff; border: 1px solid var(--cms-line, #dde1d5); border-radius: 16px; color: #293222; }
.geo-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 26px 28px 20px; }
.geo-eyebrow { display: flex; align-items: center; gap: 7px; font-size: 10px; text-transform: uppercase; letter-spacing: .13em; color: #6b755b; }
.geo-header h2 { font-size: 24px; font-weight: 500; letter-spacing: -.045em; margin: 8px 0 3px; }
.geo-header p { font-size: 12px; color: #707767; }
.geo-controls { display: flex; align-items: center; gap: 8px; }
.geo-controls button, .geo-controls select { display: flex; gap: 7px; align-items: center; width: auto; margin: 0; padding: 9px 12px; min-height: 40px; border: 1px solid #dce1d3; border-radius: 8px; background: #fff; color: #3c492e; font-size: 12px; }
.geo-content { display: grid; grid-template-columns: minmax(0, 1fr) 280px; border-top: 1px solid #edf0e7; }
.geo-stage { position: relative; min-width: 0; background: radial-gradient(ellipse at 50% 80%, #e9edde, #f8f9f4 80%); display: flex; flex-direction: column; justify-content: end; }
.geo-readout { position: absolute; z-index: 1; top: 22px; left: 28px; pointer-events: none; }
.geo-readout > span { display: block; font-size: 11px; color: #657153; }
.geo-readout strong { display: block; margin-top: 5px; font-size: 25px; font-weight: 500; letter-spacing: -.04em; }
.geo-readout small { font-size: 11px; letter-spacing: 0; font-weight: 400; color: #778267; }
.geo-world-map { display: block; width: 100%; height: auto; min-height: 310px; max-height: 440px; }
.geo-grid path { stroke: #d7decb; stroke-width: .5; fill: none; }
.geo-countries path { stroke: #f7f8f1; stroke-width: .65; stroke-linejoin: round; cursor: pointer; }
.geo-countries path.is-active { stroke: #425529; stroke-width: 1.5; }
.geo-towers g { cursor: pointer; }
.geo-towers .is-active path { stroke: #273b15; stroke-width: .6; }
.geo-map-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 24px 20px; font-size: 10px; color: #667456; }
.geo-scale, .geo-map-footer a { display: flex; align-items: center; gap: 5px; }
.geo-map-footer a { color: inherit; white-space: nowrap; text-decoration: none; }
.geo-map-footer a:hover { text-decoration: underline; }
.geo-map-footer a svg { flex-shrink: 0; }
.geo-scale i { width: 9px; height: 9px; background: #e1e4d9; border: 1px solid #cbd3be; border-radius: 2px; }
.geo-scale b { display: block; width: 55px; height: 7px; margin-left: 6px; background: linear-gradient(90deg, #c9d7b0, #7b793e); border-radius: 2px; }
.geo-breakdown { padding: 24px 20px; border-left: 1px solid #e6eadf; }
.geo-coverage { display: flex; justify-content: space-between; font-size: 12px; }
.geo-coverage strong { font-weight: 500; }
.geo-meter { height: 4px; background: #edf0e5; margin-top: 12px; border-radius: 3px; overflow: hidden; }
.geo-meter i { display: block; height: 100%; background: #77874e; }
.geo-coverage-note { font-size: 10px; color: #79816d; margin-top: 8px; }
.geo-list { max-height: 300px; overflow: auto; margin-top: 18px; }
.geo-list button { display: grid; grid-template-columns: 25px minmax(0, 1fr) auto 30px; gap: 8px; align-items: center; width: 100%; text-align: left; padding: 12px 4px; border-bottom: 1px solid #f0f2e9; font-size: 11px; }
.geo-list button:hover, .geo-list button[aria-pressed="true"] { background: #f1f4e8; }
.geo-country-code { font-size: 9px; color: #77846a; letter-spacing: .06em; }
.geo-country-name { position: relative; padding-bottom: 6px; overflow-wrap: anywhere; }
.geo-country-name i { display: block; position: absolute; bottom: 0; left: 0; height: 2px; background: #a3b27b; }
.geo-list strong { font-weight: 500; font-variant-numeric: tabular-nums; }
.geo-list small { text-align: right; color: #7b846f; font-size: 10px; }
.geo-empty { margin-top: 30px; line-height: 1.8; color: #768168; font-size: 12px; }
.geo-note { padding: 16px 28px; border-top: 1px solid #e7ebdf; font-size: 10px; line-height: 1.7; color: #717b65; }
.geo-note p + p { margin-top: 7px; }
button:focus-visible, select:focus-visible, a:focus-visible { outline: 2px solid #62773d; outline-offset: 2px; }
@media (max-width: 1100px) { .geo-content { grid-template-columns: 1fr; } .geo-breakdown { border-left: 0; border-top: 1px solid #e6eadf; } .geo-list { max-height: 240px; } }
@media (max-width: 600px) { .geo-header { padding: 20px; align-items: start; flex-direction: column; gap: 14px; } .geo-world-map { min-height: 280px; } .geo-readout { left: 20px; top: 18px; } .geo-map-footer { padding-inline: 15px; } .geo-note { padding: 15px 20px; } }
</style>
