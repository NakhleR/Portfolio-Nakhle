<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { TrafficDay } from "./AnalyticsTraffic.vue";

const props = defineProps<{ days: TrafficDay[]; timezone: string }>();
const grid = ref<HTMLElement | null>(null);
const selected = ref<string | null>(null);
const focusIndex = ref(0);
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dateOf = (day: string) => new Date(`${day}T12:00:00Z`);
const dateLabel = (day: string) =>
    dateOf(day).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    });
const maxViews = computed(() =>
    Math.max(1, ...props.days.map((day) => day.views)),
);
const total = computed(() =>
    props.days.reduce((sum, day) => sum + day.views, 0),
);
const activeDays = computed(
    () => props.days.filter((day) => day.views > 0).length,
);
const busiest = computed(() =>
    props.days.reduce<TrafficDay | null>(
        (best, day) => (day.views > (best?.views ?? 0) ? day : best),
        null,
    ),
);
const offset = computed(() =>
    props.days.length ? (dateOf(props.days[0].day).getUTCDay() + 6) % 7 : 0,
);
const weeks = computed(() => Math.ceil((offset.value + props.days.length) / 7));
const months = computed(() => {
    const labels: { name: string; column: number }[] = [];
    props.days.forEach((day, i) => {
        const date = dateOf(day.day);
        if (i !== 0 && date.getUTCDate() !== 1) return;
        const column = Math.floor((offset.value + i) / 7) + 1;
        const label = {
            name: date.toLocaleDateString("en-US", {
                month: "short",
                timeZone: "UTC",
            }),
            column,
        };
        // A partial first week can straddle months; show the new month once.
        if (labels.at(-1)?.column === column) labels.pop();
        labels.push(label);
    });
    return labels;
});
const details = computed(() => {
    const day = props.days.find((day) => day.day === selected.value);
    return day
        ? describe(day)
        : "Hover, tap, or use arrow keys to explore each day.";
});
function describe(day: TrafficDay) {
    return `${day.views.toLocaleString()} ${day.views === 1 ? "view" : "views"} on ${dateLabel(day.day)}${day === props.days.at(-1) ? " · Today so far" : ""}`;
}
function level(views: number) {
    return views > 0 ? Math.min(4, Math.ceil((views / maxViews.value) * 4)) : 0;
}
function navigate(event: KeyboardEvent, index: number) {
    const moves: Record<string, number> = {
        ArrowUp: -1,
        ArrowDown: 1,
        ArrowLeft: -7,
        ArrowRight: 7,
    };
    let next: number;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = props.days.length - 1;
    else if (event.key in moves) next = index + moves[event.key];
    else return;
    event.preventDefault();
    next = Math.max(0, Math.min(props.days.length - 1, next));
    grid.value?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
}
watch(
    () => props.days,
    () => {
        selected.value = null;
        focusIndex.value = 0;
    },
);
</script>

<template>
    <section
        class="cms-panel an-panel an-calendar"
        aria-labelledby="activity-title"
    >
        <div class="an-heading">
            <div>
                <h2 id="activity-title">Daily activity</h2>
                <p>
                    Daily page views · {{ timezone }} · Each square is one day
                </p>
            </div>
            <span class="an-calendar-range">Last {{ days.length }} days</span>
        </div>
        <div class="an-calendar-body">
            <div class="an-calendar-chart">
                <div class="an-calendar-scroll">
                    <div
                        class="an-calendar-layout"
                        :style="{ '--weeks': weeks }"
                    >
                        <div class="an-calendar-months" aria-hidden="true">
                            <span
                                v-for="month in months"
                                :key="month.column"
                                :style="{ gridColumn: month.column }"
                                >{{ month.name }}</span
                            >
                        </div>
                        <div class="an-calendar-weekdays" aria-hidden="true">
                            <span v-for="(day, index) in weekdays" :key="day">{{
                                index % 2 === 0 ? day : ""
                            }}</span>
                        </div>
                        <div
                            ref="grid"
                            class="an-calendar-grid"
                            role="group"
                            aria-label="Daily page views. Arrow keys move between days and weeks."
                        >
                            <button
                                v-for="(day, index) in days"
                                :key="day.day"
                                type="button"
                                class="an-calendar-cell"
                                :data-level="level(day.views)"
                                :aria-label="describe(day)"
                                :title="describe(day)"
                                :tabindex="focusIndex === index ? 0 : -1"
                                :style="{
                                    gridColumn:
                                        Math.floor((offset + index) / 7) + 1,
                                    gridRow: ((offset + index) % 7) + 1,
                                    '--delay': `${Math.floor((offset + index) / 7) * 18}ms`,
                                }"
                                @mouseenter="selected = day.day"
                                @click="selected = day.day"
                                @focus="
                                    selected = day.day;
                                    focusIndex = index;
                                "
                                @keydown="navigate($event, index)"
                            ></button>
                        </div>
                    </div>
                </div>
                <div
                    class="an-calendar-key"
                    aria-label="Color intensity from zero to the highest daily view count in this selection"
                >
                    <span>Less</span
                    ><i
                        v-for="n in 5"
                        :key="n"
                        :data-level="n - 1"
                        aria-hidden="true"
                    ></i
                    ><span>More</span>
                </div>
            </div>
            <div class="an-calendar-summary">
                <strong
                    >{{ total.toLocaleString() }}
                    <span>page views</span></strong
                >
                <p>
                    Across {{ activeDays }} active
                    {{ activeDays === 1 ? "day" : "days" }} in this selection.
                </p>
                <p v-if="busiest" class="an-calendar-peak">
                    Busiest day <b>{{ dateLabel(busiest.day) }}</b
                    >{{ busiest.views.toLocaleString() }} views
                </p>
                <p v-else class="an-calendar-peak">
                    No recorded activity in this selection yet.
                </p>
            </div>
        </div>
        <p class="an-calendar-detail" aria-live="polite">{{ details }}</p>
    </section>
</template>

<style scoped>
.an-calendar {
    --square: 18px;
    --gap: 5px;
}
.an-calendar-range {
    font-size: 12px;
    color: var(--cms-muted);
    white-space: nowrap;
}
.an-calendar-body {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 28px 48px;
}
.an-calendar-chart {
    max-width: 100%;
    min-width: 0;
}
.an-calendar-scroll {
    overflow-x: auto;
    padding: 4px;
    scrollbar-width: thin;
    scrollbar-color: #bcc6ae transparent;
}
.an-calendar-layout {
    display: grid;
    grid-template-columns: 32px auto;
    grid-template-rows: 22px auto;
    column-gap: 8px;
    width: max-content;
}
.an-calendar-months {
    grid-column: 2;
    display: grid;
    grid-template-columns: repeat(var(--weeks), var(--square));
    gap: var(--gap);
    font-size: 11px;
    color: var(--cms-muted);
}
.an-calendar-weekdays {
    grid-row: 2;
    display: grid;
    grid-template-rows: repeat(7, var(--square));
    gap: var(--gap);
    font-size: 11px;
    color: var(--cms-muted);
}
.an-calendar-weekdays span {
    align-self: center;
}
.an-calendar-grid {
    display: grid;
    grid-template-columns: repeat(var(--weeks), var(--square));
    grid-template-rows: repeat(7, var(--square));
    gap: var(--gap);
}
.cms-app .an-calendar-cell {
    width: var(--square);
    height: var(--square);
    min-height: 0;
    padding: 0;
    border: 1px solid rgb(32 37 30 / 7%);
    border-radius: 3px;
    animation: calendar-appear 300ms ease-out both;
    animation-delay: var(--delay);
    transition:
        outline-color 150ms,
        transform 150ms;
}
.an-calendar [data-level="0"] {
    background: #edf0e7;
}
.an-calendar [data-level="1"] {
    background: #d2e3a6;
}
.an-calendar [data-level="2"] {
    background: #a1c266;
}
.an-calendar [data-level="3"] {
    background: #709142;
}
.an-calendar [data-level="4"] {
    background: #3f612c;
}
.cms-app .an-calendar-cell:hover,
.cms-app .an-calendar-cell:focus-visible {
    outline: 2px solid #20251e;
    outline-offset: 1px;
    transform: scale(1.08);
    z-index: 1;
}
.an-calendar-key {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    margin-top: 14px;
    font-size: 11px;
    color: var(--cms-muted);
}
.an-calendar-key span {
    margin-inline: 3px;
}
.an-calendar-key i {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    border: 1px solid rgb(32 37 30 / 7%);
}
.an-calendar-summary {
    border-left: 1px solid var(--cms-line);
    padding-left: 28px;
}
.an-calendar-summary strong {
    display: block;
    font-size: 30px;
    font-weight: 600;
    letter-spacing: -0.04em;
}
.an-calendar-summary strong span {
    font-size: 13px;
    letter-spacing: 0;
    font-weight: 400;
}
.an-calendar-summary p {
    font-size: 12px;
    color: var(--cms-muted);
    margin-top: 4px;
}
.an-calendar-summary .an-calendar-peak {
    margin-top: 18px;
}
.an-calendar-peak b {
    display: block;
    color: var(--cms-ink);
    font-weight: 500;
}
.an-calendar-detail {
    margin-top: 22px;
    padding-top: 14px;
    border-top: 1px solid var(--cms-line);
    font-size: 12px;
    color: var(--cms-muted);
    min-height: 34px;
}
@keyframes calendar-appear {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
@media (max-width: 650px) {
    .an-calendar {
        --square: 13px;
        --gap: 3px;
    }
    .an-calendar-summary {
        border-left: 0;
        padding-left: 0;
    }
    .an-calendar-body {
        gap: 20px;
    }
}
@media (prefers-reduced-motion: reduce) {
    .cms-app .an-calendar-cell {
        animation: none;
        transition: none;
        transform: none;
    }
}
</style>
