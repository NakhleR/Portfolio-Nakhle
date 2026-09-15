<script setup lang="ts">
import AdminLayout from "../Layouts/AdminLayout.vue";
import CmsOverview from "../Components/CmsOverview.vue";
import type { TrendDay } from "../Components/TrendChart.vue";
import { ref, computed, watch, nextTick, defineAsyncComponent } from "vue";
import { Link, router, useForm, usePage } from "@inertiajs/vue3";
import { Plus, Pencil, Trash2, X, Search } from "lucide-vue-next";
import type { Project, TimelineItem } from "../types";
const ProjectUploads = defineAsyncComponent(
    () => import("../Components/ProjectUploads.vue"),
);
const props = defineProps<{
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
    projects: Project[];
    timeline: TimelineItem[];
}>();
const page = usePage<{
    auth: { user: { name: string; email: string } };
    flash: { success?: string };
}>();
const tab = ref<"overview" | "projects" | "timeline">("overview"),
    search = ref("");
const projectDialog = ref<HTMLDialogElement | null>(null),
    timelineDialog = ref<HTMLDialogElement | null>(null);
const projectId = ref<string | null>(null),
    timelineId = ref<string | null>(null);
const projectForm = useForm({
    is_published: false,
    title: "",
    category: "",
    description: "",
    longDescription: "",
    technologies: [] as string[],
    liveUrl: "",
    githubUrl: "",
    order: 0,
});
const technologyText = ref("");
const timelineForm = useForm({
    year: "",
    title: "",
    location: "",
    category: "work",
    description: "",
    bullets: [] as string[],
    order: 0,
});
const bulletsText = ref("");
const editingProject = computed(
    () => props.projects.find((p) => p.id === projectId.value) || null,
);
const projects = computed(() =>
    props.projects.filter((p) =>
        (p.title + " " + p.category + " " + p.description)
            .toLowerCase()
            .includes(search.value.toLowerCase()),
    ),
);
function editProject(project?: Project) {
    projectForm.reset();
    projectForm.clearErrors();
    projectId.value = project?.id || null;
    if (project)
        Object.assign(projectForm, {
            is_published: project.is_published ?? true,
            title: project.title,
            category: project.category,
            description: project.description,
            longDescription: project.longDescription || "",
            technologies: [...project.technologies],
            liveUrl: project.liveUrl || "",
            githubUrl: project.githubUrl || "",
            order: project.order,
        });
    technologyText.value = project?.technologies.join("\n") || "";
    projectDialog.value?.showModal();
}
function saveProject() {
    const wasEditing = projectId.value !== null;
    projectForm.technologies = technologyText.value
        .split("\n")
        .map((v) => v.trim())
        .filter(Boolean);
    const options = {
        preserveScroll: true,
        onSuccess: () => {
            if (wasEditing) projectDialog.value?.close();
        },
    };
    if (projectId.value)
        projectForm.put("/dashboard/projects/" + projectId.value, options);
    else projectForm.post("/dashboard/projects", options);
}
function editTimeline(item?: TimelineItem) {
    timelineForm.reset();
    timelineForm.clearErrors();
    timelineId.value = item?.id || null;
    if (item)
        Object.assign(timelineForm, {
            year: item.year,
            title: item.title,
            location: item.location || "",
            category: item.category,
            description: item.description || "",
            bullets: [...(item.bullets || [])],
            order: item.order,
        });
    bulletsText.value = item?.bullets?.join("\n") || "";
    timelineDialog.value?.showModal();
}
function saveTimeline() {
    timelineForm.bullets = bulletsText.value
        .split("\n")
        .map((v) => v.trim())
        .filter(Boolean);
    const options = {
        preserveScroll: true,
        onSuccess: () => timelineDialog.value?.close(),
    };
    if (timelineId.value)
        timelineForm.put("/dashboard/timeline/" + timelineId.value, options);
    else timelineForm.post("/dashboard/timeline", options);
}
function deleteRecord(
    kind: "projects" | "timeline",
    id: string,
    title: string,
) {
    if (confirm("Delete “" + title + "”? This also removes its images."))
        router.delete("/dashboard/" + kind + "/" + id, {
            preserveScroll: true,
        });
}
watch(
    () => page.url,
    async (url) => {
        const params = new URL(url, "http://localhost").searchParams;
        const selection = params.get("tab");
        tab.value = params.has("edit")
            ? "projects"
            : selection === "projects" || selection === "timeline"
              ? selection
              : "overview";
        const id = params.get("edit");
        if (id) {
            await nextTick();
            const project = props.projects.find((p) => p.id === id);
            if (project) editProject(project);
        }
    },
    { immediate: true },
);
</script>
<template>
    <AdminLayout
        :title="
            tab === 'overview'
                ? 'Studio overview'
                : tab === 'projects'
                  ? 'Projects'
                  : 'Experience'
        "
        description="Manage your work, content, and conversations."
        ><div>
            <div>
                <div
                    class="cms-toolbar justify-end mb-6"
                    v-if="tab === 'projects' || tab === 'timeline'"
                >
                    <button
                        class="cms-button"
                        @click="
                            tab === 'projects' ? editProject() : editTimeline()
                        "
                    >
                        <Plus :size="16" />{{
                            tab === "projects"
                                ? "Add project"
                                : "Add experience"
                        }}
                    </button>
                </div>
                <CmsOverview
                    v-if="tab === 'overview'"
                    :stats="stats"
                    :daily="daily"
                    :recent="recent"
                />
                <div
                    v-if="tab !== 'overview'"
                    class="flex flex-wrap items-center justify-between gap-4 mb-6"
                >
                    <div class="tabs !justify-start !mx-0">
                        <button
                            v-for="item in [
                                'projects',
                                'timeline',
                                'overview',
                            ] as const"
                            :key="item"
                            class="tab capitalize"
                            :class="{ active: tab === item }"
                            :aria-pressed="tab === item"
                            @click="
                                router.get(
                                    item === 'overview'
                                        ? '/dashboard'
                                        : '/dashboard?tab=' + item,
                                )
                            "
                        >
                            {{ item }}
                        </button>
                    </div>
                    <div v-if="tab === 'projects'" class="relative">
                        <Search
                            class="absolute left-3 top-3"
                            :size="16"
                        /><input
                            v-model="search"
                            type="search"
                            aria-label="Search projects"
                            placeholder="Search projects…"
                            class="!pl-10 !py-2"
                        />
                    </div>
                </div>
                <div v-if="tab === 'projects'" class="space-y-3">
                    <article
                        v-for="project in projects"
                        :key="project.id"
                        class="panel p-4 flex items-center gap-5"
                    >
                        <img
                            v-if="project.images[0]"
                            :src="project.images[0]"
                            :alt="project.title"
                            class="hidden sm:block w-28 h-20 object-cover rounded-lg"
                            loading="lazy"
                        />
                        <div class="flex-1 min-w-0">
                            <h2 class="text-lg font-semibold break-words">
                                {{ project.title }}
                            </h2>
                            <p class="cms-muted mt-1">
                                {{ project.category }} · Order
                                {{ project.order }}
                            </p>
                            <p class="text-xs text-muted-foreground mt-2">
                                {{ project.images.length }} images
                                <span class="cms-badge">{{
                                    project.is_published ? "Published" : "Draft"
                                }}</span>
                            </p>
                        </div>
                        <div class="flex gap-1">
                            <button
                                class="icon-button"
                                :aria-label="'Edit ' + project.title"
                                @click="editProject(project)"
                            >
                                <Pencil :size="17" /></button
                            ><button
                                class="icon-button text-red-500"
                                :aria-label="'Delete ' + project.title"
                                @click="
                                    deleteRecord(
                                        'projects',
                                        project.id,
                                        project.title,
                                    )
                                "
                            >
                                <Trash2 :size="17" />
                            </button>
                        </div>
                    </article>
                    <p
                        v-if="!projects.length"
                        class="panel p-12 text-center text-muted-foreground"
                    >
                        No projects found.
                    </p>
                </div>
                <div v-if="tab === 'timeline'" class="space-y-3">
                    <article
                        v-for="item in timeline"
                        :key="item.id"
                        class="panel p-5 flex items-center gap-5"
                    >
                        <div class="flex-1">
                            <h2 class="text-lg font-semibold">
                                {{ item.title }}
                            </h2>
                            <p class="cms-muted mt-1">
                                {{ item.year }} · {{ item.category }} · Order
                                {{ item.order }}
                            </p>
                            <p class="text-sm text-muted-foreground mt-1">
                                {{ item.location }}
                            </p>
                        </div>
                        <button
                            class="icon-button"
                            :aria-label="'Edit ' + item.title"
                            @click="editTimeline(item)"
                        >
                            <Pencil :size="17" /></button
                        ><button
                            class="icon-button text-red-500"
                            :aria-label="'Delete ' + item.title"
                            @click="
                                deleteRecord('timeline', item.id, item.title)
                            "
                        >
                            <Trash2 :size="17" />
                        </button>
                    </article>
                    <p
                        v-if="!timeline.length"
                        class="panel p-12 text-center text-muted-foreground"
                    >
                        No timeline entries yet.
                    </p>
                </div>
            </div>
            <dialog
                ref="projectDialog"
                class="portfolio-dialog editor-dialog"
                aria-labelledby="project-editor-title"
                @cancel="projectForm.clearErrors()"
            >
                <div class="p-6 md:p-8">
                    <div class="flex justify-between items-center mb-6">
                        <h2 id="project-editor-title" class="text-2xl">
                            {{ projectId ? "Edit Project" : "Add Project" }}
                        </h2>
                        <button
                            class="icon-button"
                            aria-label="Close editor"
                            @click="projectDialog?.close()"
                        >
                            <X :size="20" />
                        </button>
                    </div>
                    <form @submit.prevent="saveProject" class="space-y-5">
                        <label class="cms-field-check"
                            ><input
                                type="checkbox"
                                v-model="projectForm.is_published"
                            />Published on the website</label
                        >
                        <p class="cms-muted mb-5">
                            Unpublished projects are hidden from the archive,
                            API, and sitemap. Uploaded media URLs remain public.
                        </p>
                        <div class="grid sm:grid-cols-2 gap-5">
                            <div>
                                <label for="project-title">Title</label
                                ><input
                                    id="project-title"
                                    v-model="projectForm.title"
                                    required
                                />
                            </div>
                            <div>
                                <label for="project-category">Category</label
                                ><input
                                    id="project-category"
                                    v-model="projectForm.category"
                                    required
                                    list="project-categories"
                                /><datalist id="project-categories">
                                    <option
                                        v-for="category in [
                                            ...new Set(
                                                props.projects.map(
                                                    (p) => p.category,
                                                ),
                                            ),
                                        ]"
                                        :key="category"
                                    >
                                        {{ category }}
                                    </option>
                                </datalist>
                            </div>
                        </div>
                        <div>
                            <label for="project-description">Description</label
                            ><textarea
                                id="project-description"
                                v-model="projectForm.description"
                                rows="3"
                                required
                            />
                        </div>
                        <div>
                            <label for="project-long">Full description</label
                            ><textarea
                                id="project-long"
                                v-model="projectForm.longDescription"
                                rows="6"
                            />
                        </div>
                        <div>
                            <label for="project-technologies"
                                >Technologies (one per line)</label
                            ><textarea
                                id="project-technologies"
                                v-model="technologyText"
                                rows="3"
                            />
                        </div>
                        <div class="grid sm:grid-cols-2 gap-5">
                            <div>
                                <label for="project-live">Live URL</label
                                ><input
                                    id="project-live"
                                    v-model="projectForm.liveUrl"
                                    type="url"
                                />
                            </div>
                            <div>
                                <label for="project-github">GitHub URL</label
                                ><input
                                    id="project-github"
                                    v-model="projectForm.githubUrl"
                                    type="url"
                                />
                            </div>
                        </div>
                        <div>
                            <label for="project-order">Display order</label
                            ><input
                                id="project-order"
                                v-model.number="projectForm.order"
                                type="number"
                                step="any"
                                required
                            />
                        </div>
                        <ul
                            v-if="Object.keys(projectForm.errors).length"
                            role="alert"
                            class="field-error"
                        >
                            <li
                                v-for="(error, key) in projectForm.errors"
                                :key="key"
                            >
                                {{ error }}
                            </li>
                        </ul>
                        <button
                            class="button"
                            :disabled="projectForm.processing"
                        >
                            {{
                                projectForm.processing
                                    ? "Saving…"
                                    : projectId
                                      ? "Save Project"
                                      : "Create Project"
                            }}
                        </button>
                    </form>
                    <div
                        v-if="editingProject"
                        class="border-t border-border mt-8 pt-8"
                    >
                        <ProjectUploads :project="editingProject" />
                    </div>
                    <p v-else class="text-sm text-muted-foreground mt-5">
                        Create the project to add images.
                    </p>
                </div>
            </dialog>
            <dialog
                ref="timelineDialog"
                class="portfolio-dialog editor-dialog"
                aria-labelledby="timeline-editor-title"
            >
                <div class="p-6 md:p-8">
                    <div class="flex justify-between items-center mb-6">
                        <h2 id="timeline-editor-title" class="text-2xl">
                            {{
                                timelineId
                                    ? "Edit Timeline Entry"
                                    : "Add Timeline Entry"
                            }}
                        </h2>
                        <button
                            class="icon-button"
                            aria-label="Close timeline editor"
                            @click="timelineDialog?.close()"
                        >
                            <X :size="20" />
                        </button>
                    </div>
                    <form @submit.prevent="saveTimeline" class="space-y-5">
                        <div>
                            <label for="timeline-title">Title</label
                            ><input
                                id="timeline-title"
                                v-model="timelineForm.title"
                                required
                            />
                        </div>
                        <div class="grid sm:grid-cols-2 gap-5">
                            <div>
                                <label for="timeline-year">Year / period</label
                                ><input
                                    id="timeline-year"
                                    v-model="timelineForm.year"
                                    required
                                />
                            </div>
                            <div>
                                <label for="timeline-category">Category</label
                                ><select
                                    id="timeline-category"
                                    v-model="timelineForm.category"
                                >
                                    <option value="work">Work</option>
                                    <option value="education">Education</option>
                                    <option value="project">Project</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label for="timeline-location">Location</label
                            ><input
                                id="timeline-location"
                                v-model="timelineForm.location"
                            />
                        </div>
                        <div>
                            <label for="timeline-description">Description</label
                            ><textarea
                                id="timeline-description"
                                v-model="timelineForm.description"
                                rows="4"
                            />
                        </div>
                        <div>
                            <label for="timeline-bullets"
                                >Bullet points (one per line)</label
                            ><textarea
                                id="timeline-bullets"
                                v-model="bulletsText"
                                rows="5"
                            />
                        </div>
                        <div>
                            <label for="timeline-order">Display order</label
                            ><input
                                id="timeline-order"
                                v-model.number="timelineForm.order"
                                type="number"
                                step="any"
                                required
                            />
                        </div>
                        <ul
                            v-if="Object.keys(timelineForm.errors).length"
                            role="alert"
                            class="field-error"
                        >
                            <li
                                v-for="(error, key) in timelineForm.errors"
                                :key="key"
                            >
                                {{ error }}
                            </li>
                        </ul>
                        <button
                            class="button"
                            :disabled="timelineForm.processing"
                        >
                            {{
                                timelineForm.processing
                                    ? "Saving…"
                                    : "Save Entry"
                            }}
                        </button>
                    </form>
                </div>
            </dialog>
        </div></AdminLayout
    >
</template>
