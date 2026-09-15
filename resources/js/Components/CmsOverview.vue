<script setup lang="ts">
import { Link } from "@inertiajs/vue3";
import { ArrowUpRight } from "lucide-vue-next";
import TrendChart, { type TrendDay } from "./TrendChart.vue";
defineProps<{
    stats: {
        views: number;
        sessions: number;
        newMessages: number;
        drafts: number;
        published: number;
        media: number;
    };
    daily: TrendDay[];
    recent: { key: string; updated_at: string }[];
}>();
</script>
<template>
    <div>
        <div class="cms-stats">
            <div class="cms-stat">
                <span>Page views · 30 days</span
                ><strong>{{ stats.views }}</strong>
            </div>
            <div class="cms-stat">
                <span>Sessions · 30 days</span
                ><strong>{{ stats.sessions }}</strong>
            </div>
            <div class="cms-stat">
                <span>New enquiries</span
                ><strong>{{ stats.newMessages }}</strong>
            </div>
            <div class="cms-stat">
                <span>Content drafts</span><strong>{{ stats.drafts }}</strong>
            </div>
        </div>
        <div class="cms-grid">
            <section class="cms-panel">
                <div class="cms-panel-header">
                    <div>
                        <h2>Audience over time</h2>
                        <p class="cms-muted mt-2">
                            Consenting visitors. Your own admin visits are
                            excluded.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/analytics"
                        aria-label="Open full analytics"
                        ><ArrowUpRight :size="20"
                    /></Link>
                </div>
                <TrendChart :days="daily" />
            </section>
            <section class="cms-panel cms-work-queue">
                <h2>Keep the studio current</h2>
                <Link href="/dashboard?tab=projects" class="cms-list-link"
                    ><span
                        >Project portfolio<small
                            >{{ stats.published }} published projects</small
                        ></span
                    ><ArrowUpRight :size="18" /></Link
                ><Link href="/dashboard/inbox?status=new" class="cms-list-link"
                    ><span
                        >Enquiries<small
                            >{{ stats.newMessages }} waiting for review</small
                        ></span
                    ><ArrowUpRight :size="18" /></Link
                ><Link href="/dashboard/media" class="cms-list-link"
                    ><span
                        >Media & documents<small
                            >{{ stats.media }} files in the library</small
                        ></span
                    ><ArrowUpRight :size="18" /></Link
                ><Link href="/dashboard/pages/seo" class="cms-list-link"
                    ><span
                        >Search appearance<small
                            >Titles and social descriptions</small
                        ></span
                    ><ArrowUpRight :size="18"
                /></Link>
                <h3 class="mt-8">Recently edited</h3>
                <Link
                    v-for="item in recent"
                    :key="item.key"
                    :href="'/dashboard/pages/' + item.key"
                    class="cms-list-link"
                    ><span class="capitalize"
                        >{{ item.key
                        }}<small>{{
                            new Date(item.updated_at).toLocaleDateString()
                        }}</small></span
                    ><ArrowUpRight :size="16"
                /></Link>
                <p v-if="!recent.length" class="cms-muted mt-3">
                    Your existing content is live. Edit a page to start a
                    private draft.
                </p>
            </section>
        </div>
        <section class="cms-panel mt-6">
            <div class="cms-panel-header">
                <h2>Pages & settings</h2>
                <Link href="/dashboard/pages/home" class="cms-button secondary"
                    >Edit homepage</Link
                >
            </div>
            <div class="cms-grid-equal">
                <div>
                    <Link
                        v-for="[key, label] in [
                            ['home', 'Homepage'],
                            ['about', 'About & skills'],
                            ['work', 'Work archive'],
                            ['contact', 'Contact page'],
                        ]"
                        :key="key"
                        :href="'/dashboard/pages/' + key"
                        class="cms-list-link"
                        >{{ label }}<ArrowUpRight :size="16"
                    /></Link>
                </div>
                <div>
                    <Link
                        v-for="[key, label] in [
                            ['site', 'Identity & contact details'],
                            ['seo', 'Search & social metadata'],
                            ['legal', 'Publisher & hosting'],
                            ['privacy', 'Privacy & cookie policies'],
                        ]"
                        :key="key"
                        :href="'/dashboard/pages/' + key"
                        class="cms-list-link"
                        >{{ label }}<ArrowUpRight :size="16"
                    /></Link>
                </div>
            </div>
        </section>
    </div>
</template>
