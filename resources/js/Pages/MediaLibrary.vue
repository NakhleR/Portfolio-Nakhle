<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";
import { FileText, Download, ArrowUpRight, Images } from "lucide-vue-next";
import { router, Link } from "@inertiajs/vue3";
import AdminLayout from "../Layouts/AdminLayout.vue";
import CmsPagination from "../Components/CmsPagination.vue";
import { useCms } from "../composables/useCms";
import type { Project } from "../types";
const ProjectUploads = defineAsyncComponent(
    () => import("../Components/ProjectUploads.vue"),
);
const SiteAssetUpload = defineAsyncComponent(
    () => import("../Components/SiteAssetUpload.vue"),
);
const props = defineProps<{
    projects: { mongo_id: string; title: string }[];
    selectedProject: Project | null;
    media: {
        data: {
            id: number;
            url: string;
            name: string;
            size: number;
            project: string;
        }[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
}>();
const cms = useCms();
const selected = ref(props.selectedProject?.id || "");
</script>
<template>
    <AdminLayout
        title="Media library"
        description="The images and documents behind your portfolio."
    >
        <template #actions
            ><a href="#project-media" class="cms-button"
                ><Images :size="16" />Manage project images</a
            ></template
        >
        <div class="cms-assets">
            <section class="cms-panel cms-asset">
                <div class="cms-asset-summary">
                    <img
                        :src="cms.assets.portrait"
                        :alt="cms.site.name"
                        class="cms-portrait-preview"
                    />
                    <div>
                        <h2>Profile portrait</h2>
                        <p class="cms-muted">Your About page portrait.</p>
                        <a
                            :href="cms.assets.portrait_original"
                            target="_blank"
                            rel="noopener"
                            class="cms-inline-link"
                            >Open current original<ArrowUpRight :size="14"
                        /></a>
                    </div>
                </div>
                <SiteAssetUpload kind="portrait" />
                <p class="cms-asset-help">
                    JPG, PNG, WebP or AVIF · Up to 20 MB
                </p>
            </section>
            <section class="cms-panel cms-asset">
                <div class="cms-asset-summary">
                    <div class="cms-document-preview" aria-hidden="true">
                        <FileText :size="32" :stroke-width="1.4" /><span
                            >PDF</span
                        >
                    </div>
                    <div>
                        <h2>Curriculum vitae</h2>
                        <p class="cms-muted">
                            One CV, across the whole website.
                        </p>
                        <a
                            :href="cms.assets.cv"
                            download
                            class="cms-inline-link"
                            >Download current CV<Download :size="14"
                        /></a>
                    </div>
                </div>
                <SiteAssetUpload kind="cv" />
                <p class="cms-asset-help">PDF · Up to 10 MB</p>
            </section>
        </div>
        <p class="cms-media-notice">
            Portrait and CV replacements go live immediately. Keep a copy of
            files you want to retain.
        </p>
        <section id="project-media" class="cms-panel cms-library">
            <div class="cms-library-heading">
                <div>
                    <h2>
                        Project media
                        <span class="cms-count">{{ media.total }}</span>
                    </h2>
                    <p class="cms-muted">
                        Choose a project to upload, arrange, and describe its
                        images.
                    </p>
                </div>
                <div class="cms-library-filter">
                    <label for="media-project">Project</label>
                    <select
                        id="media-project"
                        v-model="selected"
                        @change="
                            router.get(
                                '/dashboard/media',
                                selected ? { project: selected } : {},
                            )
                        "
                    >
                        <option value="">All project images</option>
                        <option
                            v-for="project in projects"
                            :key="project.mongo_id"
                            :value="project.mongo_id"
                        >
                            {{ project.title }}
                        </option>
                    </select>
                </div>
            </div>
            <ProjectUploads
                v-if="selectedProject"
                :project="selectedProject"
                class="mt-6"
            />
            <template v-else>
                <div class="cms-media-grid">
                    <Link
                        v-for="image in media.data"
                        :key="image.id"
                        :href="'/dashboard/media?project=' + image.project"
                        class="cms-media-tile"
                        :aria-label="
                            'Manage image for ' +
                            (projects.find(
                                (project) => project.mongo_id === image.project,
                            )?.title || image.name)
                        "
                    >
                        <div class="cms-media-preview">
                            <img
                                :src="image.url"
                                :alt="image.name"
                                loading="lazy"
                            /><span class="cms-media-open" aria-hidden="true"
                                ><ArrowUpRight :size="18"
                            /></span>
                        </div>
                        <div class="cms-media-caption">
                            <div>
                                <strong>{{
                                    projects.find(
                                        (project) =>
                                            project.mongo_id === image.project,
                                    )?.title || image.name
                                }}</strong
                                ><small
                                    >{{
                                        (image.size / 1024 / 1024).toFixed(2)
                                    }}
                                    MB</small
                                >
                            </div>
                            <span>Manage</span>
                        </div>
                    </Link>
                </div>
                <div v-if="!media.data.length" class="cms-empty">
                    <Images :size="32" :stroke-width="1.4" /><strong
                        >No project images yet.</strong
                    >Select a project above to upload its first image.
                </div>
                <CmsPagination :links="media.links" />
            </template>
        </section>
    </AdminLayout>
</template>
