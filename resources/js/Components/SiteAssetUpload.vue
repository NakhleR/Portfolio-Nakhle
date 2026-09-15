<script setup lang="ts">
import { ref, computed } from "vue";
import { router } from "@inertiajs/vue3";
import axios from "axios";
import vueFilePond from "vue-filepond";
import ValidateType from "filepond-plugin-file-validate-type";
import ValidateSize from "filepond-plugin-file-validate-size";
import "filepond/dist/filepond.min.css";
const props = defineProps<{ kind: "portrait" | "cv" }>();
const FilePond = vueFilePond(ValidateType, ValidateSize);
const error = ref("");
const success = ref("");
const server = computed(() => ({
    process: (
        _field: string,
        file: File,
        _metadata: unknown,
        load: (id: string) => void,
        fail: (message: string) => void,
        progress: (computable: boolean, loaded: number, total: number) => void,
        abort: () => void,
    ) => {
        const controller = new AbortController();
        const data = new FormData();
        data.append("file", file);
        error.value = "";
        success.value = "";
        axios
            .post("/dashboard/assets/" + props.kind, data, {
                signal: controller.signal,
                onUploadProgress: (event) =>
                    progress(!!event.total, event.loaded, event.total || 0),
            })
            .then((response) => {
                load(String(response.data.id));
                success.value =
                    "File replaced. The website is using the new file.";
                router.reload({ only: ["cms"] });
            })
            .catch((e) => {
                if (!axios.isCancel(e)) {
                    error.value =
                        e.response?.data?.errors?.file?.[0] ||
                        "Upload failed. Please check the file and try again.";
                    fail(error.value);
                }
            });
        return {
            abort: () => {
                controller.abort();
                abort();
            },
        };
    },
}));
</script>
<template>
    <div>
        <FilePond
            name="file"
            :server="server"
            :allow-multiple="false"
            :allow-revert="false"
            :accepted-file-types="
                kind === 'cv'
                    ? ['application/pdf']
                    : ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
            "
            :max-file-size="kind === 'cv' ? '10MB' : '20MB'"
            label-idle='Drop a replacement here or <span class="filepond--label-action">Browse</span>'
        />
        <p v-if="error" class="cms-error" role="alert">{{ error }}</p>
        <p v-if="success" class="cms-muted" role="status">{{ success }}</p>
    </div>
</template>
