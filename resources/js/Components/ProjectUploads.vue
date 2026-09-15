<script setup lang="ts">
import { computed, ref } from "vue";
import { router } from "@inertiajs/vue3";
import axios from "axios";
import vueFilePond from "vue-filepond";
import ImagePreview from "filepond-plugin-image-preview";
import ValidateType from "filepond-plugin-file-validate-type";
import ValidateSize from "filepond-plugin-file-validate-size";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import type { Project } from "../types";
const props = defineProps<{ project: Project }>();
const FilePond = vueFilePond(ImagePreview, ValidateType, ValidateSize);
const error = ref("");
const removing = ref<number | null>(null);
async function remove(id: number) {
    if (!confirm("Remove this image from the project?")) return;
    removing.value = id;
    error.value = "";
    try {
        await axios.delete(
            "/dashboard/projects/" + props.project.id + "/media/" + id,
        );
        router.reload({ only: ["projects", "selectedProject", "media"] });
    } catch {
        error.value = "The image could not be removed. Please try again.";
    } finally {
        removing.value = null;
    }
}
async function cover(id: number) {
    error.value = "";
    try {
        await axios.post(
            `/dashboard/projects/${props.project.id}/media/${id}/cover`,
        );
        router.reload({ only: ["projects", "selectedProject", "media"] });
    } catch {
        error.value = "Could not set the cover. Please try again.";
    }
}
async function label(id: number, current: string) {
    const alt = prompt(
        "Describe this image for visitors using screen readers:",
        current,
    );
    if (alt === null) return;
    error.value = "";
    try {
        await axios.patch(
            `/dashboard/projects/${props.project.id}/media/${id}`,
            { alt },
        );
        router.reload({ only: ["projects", "selectedProject", "media"] });
    } catch {
        error.value =
            "Please enter an image description of up to 500 characters.";
    }
}
const server = computed(() => ({
    process: (
        _fieldName: string,
        file: File,
        _metadata: unknown,
        load: (id: string) => void,
        fail: (message: string) => void,
        progress: (computable: boolean, loaded: number, total: number) => void,
        abort: () => void,
    ) => {
        const controller = new AbortController();
        const body = new FormData();
        body.append("file", file);
        error.value = "";
        axios
            .post("/dashboard/projects/" + props.project.id + "/media", body, {
                signal: controller.signal,
                onUploadProgress: (event) =>
                    progress(!!event.total, event.loaded, event.total || 0),
            })
            .then((response) => {
                load(String(response.data.id));
                router.reload({
                    only: ["projects", "selectedProject", "media"],
                });
            })
            .catch((e) => {
                if (!axios.isCancel(e)) {
                    const message =
                        e.response?.data?.errors?.file?.[0] ||
                        "Upload failed. Please try again.";
                    error.value = message;
                    fail(message);
                }
            });
        return {
            abort: () => {
                controller.abort();
                abort();
            },
        };
    },
    revert: (id: string, load: () => void, fail: (message: string) => void) => {
        axios
            .delete("/dashboard/projects/" + props.project.id + "/media/" + id)
            .then(() => {
                load();
                router.reload({
                    only: ["projects", "selectedProject", "media"],
                });
            })
            .catch(() => fail("Unable to remove the upload."));
    },
}));
</script>
<template>
    <div>
        <h3 class="text-lg mb-4">Project images</h3>
        <p class="text-sm text-muted-foreground mb-4">
            Upload JPG, PNG, WebP, GIF, or AVIF images up to 20 MB. Uploads are
            saved immediately.
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            <div
                v-for="image in project.media"
                :key="image.id"
                class="border border-border rounded-xl overflow-hidden"
            >
                <img
                    :src="image.url"
                    :alt="image.alt || image.name"
                    class="aspect-video object-contain bg-secondary w-full"
                />
                <div class="flex justify-between gap-2 p-2">
                    <button
                        type="button"
                        class="text-xs"
                        @click="cover(image.id)"
                    >
                        {{
                            project.media[0]?.id === image.id
                                ? "Cover image"
                                : "Use as cover"
                        }}</button
                    ><button
                        type="button"
                        class="text-xs"
                        @click="label(image.id, image.alt || '')"
                    >
                        Edit alt text
                    </button>
                </div>
                <button
                    type="button"
                    class="text-xs w-full p-2 hover:bg-secondary"
                    :disabled="removing === image.id"
                    @click="remove(image.id)"
                >
                    {{ removing === image.id ? "Removing…" : "Remove image" }}
                </button>
            </div>
        </div>
        <FilePond
            name="file"
            :allow-multiple="true"
            :max-parallel-uploads="1"
            :server="server"
            :accepted-file-types="[
                'image/jpeg',
                'image/png',
                'image/webp',
                'image/gif',
                'image/avif',
            ]"
            max-file-size="20MB"
            label-idle='Drag & Drop images or <span class="filepond--label-action">Browse</span>'
        />
        <p v-if="error" class="field-error" role="alert">{{ error }}</p>
    </div>
</template>
