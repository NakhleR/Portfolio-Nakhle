<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { router } from "@inertiajs/vue3";
import {
    ArrowDown,
    ArrowUp,
    ArrowUpRight,
    Download,
    SlidersHorizontal,
    Monitor,
    Smartphone,
    Tablet,
    Clock3,
    MousePointer2,
} from "lucide-vue-next";
import AdminLayout from "../Layouts/AdminLayout.vue";
import AnalyticsTraffic, {
    type TrafficDay,
    type TrafficValues,
} from "../Components/AnalyticsTraffic.vue";
import AnalyticsCalendar from "../Components/AnalyticsCalendar.vue";
import "../../css/analytics.css";
type Summary = TrafficValues & { visitors: number };
const props = defineProps<{
    filters: { days: number; path: string; device: string };
    paths: string[];
    pageLabels: Record<string, string>;
    period: {
        start: string;
        end: string;
        timezone: string;
        previousStart: string | null;
        previousEnd: string | null;
    };
    summary: Summary;
    previous: Summary | null;
    daily: TrafficDay[];
    engagement: {
        engagedViews: number;
        rate: number;
        returning: number;
        new: number;
        pagesPerSession: number;
    };
    devices: { device: string; views: number }[];
    activity: { weekday: number; hour: number; views: number }[];
    intents: { target: string; clicks: number; sessions: number }[];
    pages: {
        path: string;
        views: number;
        sessions: number;
        seconds: number;
        clicks: number;
        deepViews: number;
    }[];
    sections: {
        path: string;
        section: string;
        seconds: number;
        readers: number;
    }[];
    actions: {
        path: string;
        section: string;
        target: string;
        clicks: number;
    }[];
    depth: { depth: number; views: number }[];
    heatmap: { x: number; y: number; clicks: number }[];
}>();
const days = ref(props.filters.days),
    path = ref(props.filters.path),
    device = ref(props.filters.device),
    loading = ref(false);
const activeTab = ref("overview");
const tabs = [
    ["overview", "Audience"],
    ["engagement", "Engagement"],
    ["content", "Content & actions"],
] as const;
function filter() {
    loading.value = true;
    router.get(
        "/dashboard/analytics",
        { days: days.value, path: path.value, device: device.value },
        {
            preserveScroll: true,
            preserveState: true,
            replace: true,
            onFinish: () => (loading.value = false),
        },
    );
}
function inspectPage(value: string) {
    path.value = value;
    filter();
}
function reset() {
    path.value = "";
    device.value = "";
    filter();
}
watch(
    () => props.filters,
    (v) => {
        days.value = v.days;
        path.value = v.path;
        device.value = v.device;
    },
);
const label = (value: string) => props.pageLabels[value] || value;
const readable = (value: string) => value.replaceAll("-", " ");
const duration = (seconds: number) => {
    const value = Math.round(Number(seconds) || 0);
    return value >= 60
        ? `${Math.floor(value / 60)}m ${value % 60}s`
        : `${value}s`;
};
const percent = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);
const average = computed(() =>
    props.summary.views ? props.summary.reading / props.summary.views : 0,
);
const cards = computed(() => [
    {
        key: "views",
        label: "Page views",
        value: props.summary.views,
        previous: props.previous?.views,
        display: props.summary.views.toLocaleString(),
    },
    {
        key: "sessions",
        label: "Browser sessions",
        value: props.summary.sessions,
        previous: props.previous?.sessions,
        display: props.summary.sessions.toLocaleString(),
    },
    {
        key: "reading",
        label: "Active time / view",
        value: average.value,
        previous: props.previous?.views
            ? props.previous.reading / props.previous.views
            : 0,
        display: duration(average.value),
    },
    {
        key: "clicks",
        label: "Tracked clicks",
        value: props.summary.clicks,
        previous: props.previous?.clicks,
        display: props.summary.clicks.toLocaleString(),
    },
]);
const change = (value: number, previous: number | undefined) =>
    previous ? Math.round(((value - previous) / previous) * 100) : null;
const maxReading = computed(() =>
    Math.max(1, ...props.sections.map((r) => Number(r.seconds))),
);
const maxClicks = computed(() =>
    Math.max(1, ...props.heatmap.map((r) => Number(r.clicks))),
);
const palettes = ["#53682e", "#87965a", "#d0dc93"];
const deviceRows = computed(() =>
    ["desktop", "mobile", "tablet"].map((name, i) => ({
        name,
        value: Number(props.devices.find((d) => d.device === name)?.views || 0),
        color: palettes[i],
    })),
);
const intentLabels: Record<string, string> = {
    project: "Project opens",
    "cv-download": "CV download clicks",
    email: "Email link clicks",
    telephone: "Phone link clicks",
    "external-link": "External link clicks",
};
const sort = ref<"views" | "seconds" | "clicks">("views");
const sortedPages = computed(() =>
    [...props.pages].sort((a, b) => b[sort.value] - a[sort.value]),
);
const selectedDevice = ref<string | null>(null);
const deviceTotal = computed(() =>
    deviceRows.value.reduce((sum, r) => sum + r.value, 0),
);
const topPage = computed(() => props.pages[0]);
const mostRead = computed(() => props.sections[0]);
function exportCsv() {
    const rows = [
        ["Date", "Page views", "Sessions", "Active seconds", "Clicks"],
        ...props.daily.map((r) => [
            r.day,
            r.views,
            r.sessions,
            r.reading,
            r.clicks,
        ]),
    ];
    const url = URL.createObjectURL(
        new Blob([rows.map((r) => r.join(",")).join("\r\n")], {
            type: "text/csv;charset=utf-8",
        }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${props.filters.days}-days.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
</script>
<template>
    <AdminLayout
        title="Analytics"
        description="See what brings attention, holds it, and turns it into action."
    >
        <template #actions
            ><button class="cms-button secondary" @click="exportCsv">
                <Download :size="16" />Export daily CSV
            </button></template
        >
        <div class="an-report" :aria-busy="loading">
            <form class="an-filters" @submit.prevent="filter">
                <SlidersHorizontal :size="18" aria-hidden="true" /><label
                    >Period<select v-model="days" aria-label="Period">
                        <option :value="7">Last 7 days</option>
                        <option :value="30">Last 30 days</option>
                        <option :value="90">Last 90 days</option>
                    </select></label
                ><label
                    >Page<select v-model="path" aria-label="Page">
                        <option value="">All pages</option>
                        <option v-for="item in paths" :key="item" :value="item">
                            {{ label(item) }}
                        </option>
                    </select></label
                ><label
                    >Device<select v-model="device" aria-label="Device">
                        <option value="">All devices</option>
                        <option value="desktop">Desktop</option>
                        <option value="mobile">Mobile</option>
                        <option value="tablet">Tablet</option>
                    </select></label
                ><button class="cms-button" :disabled="loading">
                    {{ loading ? "Updating…" : "Apply filters" }}</button
                ><button
                    v-if="filters.path || filters.device"
                    type="button"
                    class="an-reset"
                    @click="reset"
                >
                    Clear filters
                </button>
            </form>
            <div class="an-period">
                <span
                    >{{ period.start }} — {{ period.end }} ·
                    {{ period.timezone }}</span
                ><span>Today is still in progress</span>
            </div>
            <div class="an-metrics">
                <article v-for="card in cards" :key="card.key">
                    <span>{{ card.label }}</span
                    ><strong :key="card.display" class="an-value">{{
                        card.display
                    }}</strong
                    ><small
                        v-if="
                            previous &&
                            change(card.value, card.previous) !== null
                        "
                        :class="{
                            'an-positive': card.value > (card.previous || 0),
                        }"
                        ><ArrowUp
                            v-if="card.value > (card.previous || 0)"
                            :size="12"
                        /><ArrowDown
                            v-else-if="card.value < (card.previous || 0)"
                            :size="12"
                        />{{
                            Math.abs(change(card.value, card.previous) || 0)
                        }}% vs previous {{ filters.days }} days</small
                    ><small v-else>{{
                        previous
                            ? "No previous activity to compare"
                            : "Comparison exceeds 90-day retention"
                    }}</small>
                </article>
            </div>
            <div class="an-report-note">
                Consenting traffic only. Your admin visits are excluded.
                Browsers and sessions are not unique people.
            </div>
            <nav class="an-tabs" aria-label="Analytics reports">
                <button
                    v-for="[key, title] in tabs"
                    :key="key"
                    :aria-pressed="activeTab === key"
                    @click="activeTab = key"
                >
                    {{ title }}
                </button>
            </nav>
            <p v-if="!summary.views" class="cms-notice">
                No visits recorded in this selection. Reports populate when
                visitors accept analytics; no sample data is added here.
            </p>
            <div :key="activeTab" class="an-view">
                <template v-if="activeTab === 'overview'">
                    <div class="an-main-grid">
                        <section class="cms-panel an-panel">
                            <div class="an-heading">
                                <div>
                                    <h2>Traffic, in perspective</h2>
                                    <p>
                                        Inspect a day. Switch metrics. Compare
                                        the shape of two periods.
                                    </p>
                                </div>
                            </div>
                            <AnalyticsTraffic
                                :days="daily"
                                :comparable="!!previous"
                            />
                            <p class="an-footnote">
                                {{
                                    previous
                                        ? `Comparison: ${period.previousStart} — ${period.previousEnd}. Missing dates are zero; today is partial.`
                                        : "Previous-period comparison is unavailable for 90-day reports."
                                }}
                            </p>
                        </section>
                        <section class="cms-panel an-panel">
                            <h2>Audience mix</h2>
                            <p class="an-subtitle">Page views by screen size</p>
                            <div class="an-donut-wrap">
                                <svg
                                    viewBox="0 0 180 180"
                                    role="img"
                                    aria-label="Device share; values listed below"
                                >
                                    <circle
                                        cx="90"
                                        cy="90"
                                        r="68"
                                        fill="none"
                                        stroke="#edf0e5"
                                        stroke-width="18"
                                    />
                                    <circle
                                        v-for="(row, i) in deviceRows"
                                        :key="row.name + row.value"
                                        cx="90"
                                        cy="90"
                                        r="68"
                                        fill="none"
                                        :stroke="row.color"
                                        stroke-width="18"
                                        pathLength="100"
                                        :stroke-dasharray="`${deviceTotal ? (row.value / deviceTotal) * 100 : 0} ${100 - (deviceTotal ? (row.value / deviceTotal) * 100 : 0)}`"
                                        :stroke-dashoffset="
                                            -deviceRows
                                                .slice(0, i)
                                                .reduce(
                                                    (n, r) =>
                                                        n +
                                                        (deviceTotal
                                                            ? (r.value /
                                                                  deviceTotal) *
                                                              100
                                                            : 0),
                                                    0,
                                                )
                                        "
                                        transform="rotate(-90 90 90)"
                                        class="an-donut-segment"
                                        :style="{
                                            opacity:
                                                selectedDevice &&
                                                selectedDevice !== row.name
                                                    ? 0.25
                                                    : 1,
                                        }"
                                        @mouseenter="selectedDevice = row.name"
                                        @mouseleave="selectedDevice = null"
                                    />
                                </svg>
                                <div>
                                    <strong>{{
                                        selectedDevice
                                            ? percent(
                                                  deviceRows.find(
                                                      (r) =>
                                                          r.name ===
                                                          selectedDevice,
                                                  )?.value || 0,
                                                  deviceTotal,
                                              ) + "%"
                                            : summary.visitors
                                    }}</strong
                                    ><span>{{
                                        selectedDevice || "consenting browsers"
                                    }}</span>
                                </div>
                            </div>
                            <div class="an-device-legend">
                                <button
                                    v-for="(row, i) in deviceRows"
                                    :key="row.name"
                                    @mouseenter="selectedDevice = row.name"
                                    @mouseleave="selectedDevice = null"
                                    @focus="selectedDevice = row.name"
                                    @blur="selectedDevice = null"
                                    @click="
                                        device = row.name;
                                        filter();
                                    "
                                >
                                    <component
                                        :is="
                                            i === 0
                                                ? Monitor
                                                : i === 1
                                                  ? Smartphone
                                                  : Tablet
                                        "
                                        :size="16"
                                        :style="{ color: row.color }"
                                    /><span>{{ row.name }}</span
                                    ><strong>{{ row.value }}</strong
                                    ><small
                                        >{{
                                            percent(row.value, deviceTotal)
                                        }}%</small
                                    >
                                </button>
                            </div>
                            <div class="an-returning">
                                <span
                                    ><strong>{{ engagement.new }}</strong
                                    >First seen in period</span
                                ><span
                                    ><strong>{{ engagement.returning }}</strong
                                    >Seen before period</span
                                >
                            </div>
                            <p class="an-footnote">
                                Returning means the same consent reference
                                appeared earlier in the retained 90 days.
                                Cleared cookies cannot be linked.
                            </p>
                        </section>
                    </div>
                    <AnalyticsCalendar
                        :days="daily"
                        :timezone="period.timezone"
                    />
                </template>
                <template v-if="activeTab === 'engagement'">
                    <div class="an-engagement-banner">
                        <div>
                            <Clock3 :size="22" /><span>Engaged page views</span
                            ><strong
                                >{{ engagement.rate }}<small>%</small></strong
                            >
                        </div>
                        <p>
                            {{ engagement.engagedViews }} of
                            {{ summary.views }} views recorded at least 10
                            seconds of active reading, a control click, or 50%
                            scroll reach.
                        </p>
                        <div>
                            <strong>{{ engagement.pagesPerSession }}</strong
                            ><span>Pages per session</span>
                        </div>
                    </div>
                    <div class="an-two-col">
                        <section class="cms-panel an-panel">
                            <h2>How far visitors get</h2>
                            <p class="an-subtitle">
                                Share of recorded page views reaching each
                                scroll milestone.
                            </p>
                            <div class="an-depth-list">
                                <div
                                    v-for="(step, i) in [25, 50, 75, 100]"
                                    :key="step"
                                >
                                    <div>
                                        <span>{{ step }}% of the page</span
                                        ><strong
                                            >{{
                                                percent(
                                                    Number(
                                                        depth.find(
                                                            (d) =>
                                                                Number(
                                                                    d.depth,
                                                                ) === step,
                                                        )?.views || 0,
                                                    ),
                                                    summary.views,
                                                )
                                            }}%</strong
                                        >
                                    </div>
                                    <div class="an-depth-track">
                                        <span
                                            :style="{
                                                width:
                                                    percent(
                                                        Number(
                                                            depth.find(
                                                                (d) =>
                                                                    Number(
                                                                        d.depth,
                                                                    ) === step,
                                                            )?.views || 0,
                                                        ),
                                                        summary.views,
                                                    ) + '%',
                                                animationDelay: i * 70 + 'ms',
                                            }"
                                        ></span>
                                    </div>
                                    <small
                                        >{{
                                            depth.find(
                                                (d) => Number(d.depth) === step,
                                            )?.views || 0
                                        }}
                                        views</small
                                    >
                                </div>
                            </div>
                            <p class="an-footnote">
                                These are reach milestones, not an ordered
                                conversion funnel. Short pages may reach every
                                milestone immediately.
                            </p>
                        </section>
                        <section class="cms-panel an-panel">
                            <h2>Actions that matter</h2>
                            <p class="an-subtitle">
                                Distinct sessions using each control. Actions
                                can overlap.
                            </p>
                            <div class="an-intents">
                                <div v-for="row in intents" :key="row.target">
                                    <div>
                                        <MousePointer2 :size="15" /><span>{{
                                            intentLabels[row.target]
                                        }}</span
                                        ><strong>{{ row.sessions }}</strong>
                                    </div>
                                    <div class="an-intent-track">
                                        <span
                                            :style="{
                                                width:
                                                    percent(
                                                        row.sessions,
                                                        summary.sessions,
                                                    ) + '%',
                                            }"
                                        ></span>
                                    </div>
                                    <small
                                        >{{
                                            percent(
                                                row.sessions,
                                                summary.sessions,
                                            )
                                        }}% of sessions ·
                                        {{ row.clicks }} clicks</small
                                    >
                                </div>
                            </div>
                            <p class="an-footnote">
                                A link click expresses intent; it does not
                                confirm a download, sent email, call, or
                                completed enquiry.
                            </p>
                        </section>
                    </div>
                    <section class="cms-panel an-panel">
                        <div class="an-heading">
                            <div>
                                <h2>What holds attention</h2>
                                <p>
                                    Active reading across page sections, ranked
                                    by time.
                                </p>
                            </div>
                        </div>
                        <div class="an-reading-list">
                            <div
                                v-for="(row, i) in sections.slice(0, 12)"
                                :key="row.path + row.section"
                                class="an-reading-row"
                            >
                                <button @click="inspectPage(row.path)">
                                    <span>{{ label(row.path) }}</span
                                    ><strong>{{
                                        readable(row.section || "content")
                                    }}</strong>
                                </button>
                                <div class="an-attention-bar">
                                    <span
                                        :style="{
                                            width:
                                                (row.seconds / maxReading) *
                                                    100 +
                                                '%',
                                            animationDelay:
                                                Math.min(i * 35, 250) + 'ms',
                                        }"
                                    ></span>
                                </div>
                                <div>
                                    <strong>{{ duration(row.seconds) }}</strong
                                    ><small
                                        >{{ row.readers }} views ·
                                        {{
                                            duration(
                                                row.seconds /
                                                    Math.max(1, row.readers),
                                            )
                                        }}
                                        / view</small
                                    >
                                </div>
                            </div>
                            <p v-if="!sections.length" class="an-empty">
                                No reading activity in this selection.
                            </p>
                        </div>
                        <p class="an-footnote">
                            Reading is an estimate while the tab is visible and
                            focused. It pauses after 30 seconds without
                            interaction. One section receives time at once.
                        </p>
                    </section>
                </template>
                <template v-if="activeTab === 'content'">
                    <div class="an-insights">
                        <div>
                            <span>Most visited</span
                            ><strong>{{
                                topPage ? label(topPage.path) : "No visits yet"
                            }}</strong
                            ><small>{{
                                topPage
                                    ? topPage.views + " views"
                                    : "Waiting for consenting traffic"
                            }}</small>
                        </div>
                        <div>
                            <span>Most reading time</span
                            ><strong>{{
                                mostRead
                                    ? readable(mostRead.section || "content")
                                    : "No reading yet"
                            }}</strong
                            ><small>{{
                                mostRead
                                    ? label(mostRead.path) +
                                      " · " +
                                      duration(mostRead.seconds)
                                    : "Waiting for active reading"
                            }}</small>
                        </div>
                    </div>
                    <section class="cms-panel an-panel">
                        <div class="an-heading">
                            <div>
                                <h2>Page performance</h2>
                                <p>
                                    Select a page to explore its audience and
                                    engagement.
                                </p>
                            </div>
                            <label class="an-sort"
                                >Sort by<select
                                    v-model="sort"
                                    aria-label="Sort pages"
                                >
                                    <option value="views">Views</option>
                                    <option value="seconds">Active time</option>
                                    <option value="clicks">Clicks</option>
                                </select></label
                            >
                        </div>
                        <div class="cms-table-wrap">
                            <table class="cms-table an-page-table">
                                <thead>
                                    <tr>
                                        <th>Page</th>
                                        <th>Views</th>
                                        <th>Sessions</th>
                                        <th>Active time / view</th>
                                        <th>75% reach</th>
                                        <th>Clicks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="row in sortedPages"
                                        :key="row.path"
                                    >
                                        <td>
                                            <button
                                                @click="inspectPage(row.path)"
                                            >
                                                {{ label(row.path)
                                                }}<ArrowUpRight :size="14" />
                                            </button>
                                            <div class="an-page-share">
                                                <span
                                                    :style="{
                                                        width:
                                                            percent(
                                                                row.views,
                                                                summary.views,
                                                            ) + '%',
                                                    }"
                                                ></span>
                                            </div>
                                        </td>
                                        <td>{{ row.views }}</td>
                                        <td>{{ row.sessions }}</td>
                                        <td>
                                            {{
                                                duration(
                                                    row.seconds /
                                                        Math.max(1, row.views),
                                                )
                                            }}
                                        </td>
                                        <td>
                                            {{
                                                percent(
                                                    row.deepViews,
                                                    row.views,
                                                )
                                            }}%
                                        </td>
                                        <td>{{ row.clicks }}</td>
                                    </tr>
                                    <tr v-if="!pages.length">
                                        <td colspan="6">No page data yet.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                    <div class="an-two-col">
                        <section class="cms-panel an-panel">
                            <h2>Clicked controls</h2>
                            <p class="an-subtitle">
                                Where interactions happen, grouped by action and
                                section.
                            </p>
                            <div class="an-actions">
                                <div
                                    v-for="(row, i) in actions.slice(0, 15)"
                                    :key="i"
                                >
                                    <div>
                                        <strong>{{
                                            readable(row.target)
                                        }}</strong
                                        ><small
                                            >{{ label(row.path) }} ·
                                            {{
                                                readable(
                                                    row.section || "content",
                                                )
                                            }}</small
                                        >
                                    </div>
                                    <span>{{ row.clicks }}</span>
                                </div>
                                <p v-if="!actions.length" class="an-empty">
                                    No click activity yet.
                                </p>
                            </div>
                        </section>
                        <section class="cms-panel an-panel">
                            <h2>Click distribution</h2>
                            <p class="an-subtitle">
                                A normalized page-coordinate map, not a
                                screenshot overlay.
                            </p>
                            <div
                                v-if="filters.path && filters.device"
                                class="an-click-map"
                                role="img"
                                :aria-label="`Click distribution for ${filters.path} on ${filters.device}`"
                            >
                                <span
                                    v-for="(point, i) in heatmap"
                                    :key="i"
                                    :title="`${point.clicks} clicks at ${point.x}%, ${point.y}%`"
                                    :style="{
                                        left: point.x + '%',
                                        top: point.y + '%',
                                        opacity:
                                            0.3 +
                                            (point.clicks / maxClicks) * 0.7,
                                        width:
                                            8 +
                                            (point.clicks / maxClicks) * 24 +
                                            'px',
                                        height:
                                            8 +
                                            (point.clicks / maxClicks) * 24 +
                                            'px',
                                    }"
                                ></span>
                                <p v-if="!heatmap.length">
                                    No clicks in this selection.
                                </p>
                            </div>
                            <div v-else class="an-map-empty">
                                <MousePointer2 :size="28" /><strong
                                    >Focus the map</strong
                                >
                                <p>
                                    Choose a page and a device using the filters
                                    above.
                                </p>
                            </div>
                            <p class="an-footnote">
                                Larger, darker points mean more clicks. Layout
                                changes affect positions; up to 1,000 occupied
                                cells are shown.
                            </p>
                        </section>
                    </div>
                </template>
            </div>
        </div>
    </AdminLayout>
</template>
