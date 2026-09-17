<script setup lang="ts">
import { ref, watch, onBeforeUnmount, onMounted } from "vue";
import { router, useForm } from "@inertiajs/vue3";
import { Save, Upload, ArrowUpRight } from "lucide-vue-next";
import AdminLayout from "../Layouts/AdminLayout.vue";
import CmsField, { type Field, type Values } from "../Components/CmsField.vue";
const props = defineProps<{
    section: string;
    definition: { label: string; path: string; fields: Record<string, Field> };
    data: Values;
    version: number;
    hasDraft: boolean;
    publishedAt: string | null;
    revisions: { id: number; created_at: string }[];
}>();
const form = useForm({
    content: JSON.parse(JSON.stringify(props.data)),
    version: props.version,
});
const action = useForm({ version: props.version });
const publishDialog = ref<HTMLDialogElement | null>(null);
watch(
    () => [props.data, props.version],
    () => {
        form.defaults({
            content: JSON.parse(JSON.stringify(props.data)),
            version: props.version,
        });
        form.reset();
        action.version = props.version;
    },
);
const sections = [
    ["home", "Homepage"],
    ["about", "About & skills"],
    ["work", "Work archive"],
    ["contact", "Contact page"],
    ["site", "Identity & contact"],
    ["seo", "Search & social"],
    ["legal", "Publisher & hosting"],
    ["privacy", "Privacy policy"],
    ["cookies", "Cookie policy"],
    ["terms", "Terms of use"],
];
sections.push(...sections.filter(([key]) => key !== "legal").map(([key, label]) => [`fr_${key}`, `Français · ${label}`]), ["fr_projects", "Français · Project translations"]);
function save() {
    form.transform(({content,version})=>({data:content,version})).put(`/dashboard/pages/${props.section}`, { preserveScroll: true });
}
function publish() {
    action.post(`/dashboard/pages/${props.section}/publish`, {
        preserveScroll: true,
        onSuccess: () => publishDialog.value?.close(),
    });
}
function restore(id: number) {
    if (
        confirm(
            "Restore this revision as a draft? Your current saved draft will be replaced.",
        )
    )
        action.post(`/dashboard/pages/${props.section}/restore/${id}`, {
            preserveScroll: true,
        });
}
const remove = router.on("before", (event) => {
    if (
        form.isDirty &&
        event.detail.visit.method === "get" &&
        !confirm("Leave without saving your changes?")
    )
        return false;
});
function beforeUnload(event: BeforeUnloadEvent) {
    if (form.isDirty) {
        event.preventDefault();
        event.returnValue = "";
    }
}
onMounted(() => window.addEventListener("beforeunload", beforeUnload));
onBeforeUnmount(() => {
    remove();
    window.removeEventListener("beforeunload", beforeUnload);
});
</script>
<template>
    <AdminLayout
        :title="definition.label"
        description="Write, preview, and publish. Saved drafts stay private until you publish them."
        ><template #actions
            ><div class="cms-toolbar">
                <button
                    class="cms-button secondary"
                    @click="save"
                    :disabled="form.processing || action.processing"
                >
                    <Save :size="16" />{{
                        form.processing ? "Saving…" : "Save draft"
                    }}</button
                ><button
                    class="cms-button"
                    @click="publishDialog?.showModal()"
                    :disabled="!hasDraft || form.isDirty || action.processing"
                >
                    <Upload :size="16" />{{
                        action.processing ? "Working…" : "Publish"
                    }}
                </button>
            </div></template
        >
        <p
            v-if="form.errors.version || action.errors.version"
            class="cms-error"
            role="alert"
        >
            {{ form.errors.version || action.errors.version }}
        </p>
        <div class="cms-grid">
            <form class="cms-panel cms-fields" @submit.prevent="save">
                <CmsField
                    v-for="(field, key) in definition.fields"
                    :key="key"
                    :field="field"
                    :model-value="form.content[key]"
                    :path="`data.${key}`"
                    :errors="form.errors"
                    @update:model-value="form.content[key] = $event"
                /><button class="cms-button" :disabled="form.processing">
                    Save draft
                </button>
            </form>
            <aside class="cms-panel cms-editor-side">
                <div>
                    <h2>Content</h2>
                    <label class="sr-only" for="cms-section"
                        >Choose a page</label
                    ><select
                        id="cms-section"
                        :value="section"
                        @change="
                            router.get(
                                '/dashboard/pages/' +
                                    ($event.target as HTMLSelectElement).value,
                            )
                        "
                    >
                        <option
                            v-for="[key, label] in sections"
                            :key="key"
                            :value="key"
                        >
                            {{ label }}
                        </option>
                    </select>
                </div>
                <div>
                    <h3>
                        {{
                            form.isDirty
                                ? "Unsaved changes"
                                : hasDraft
                                  ? "Draft ready to review"
                                  : "Published content"
                        }}
                    </h3>
                    <p class="cms-muted">
                        {{
                            publishedAt
                                ? "Last published " +
                                  new Date(publishedAt).toLocaleString()
                                : "Original website content is live."
                        }}
                    </p>
                    <a
                        :href="definition.path + '?preview=1'"
                        target="_blank"
                        rel="noopener"
                        class="cms-button secondary"
                        ><ArrowUpRight :size="15" />Preview saved draft</a
                    >
                    <p class="cms-muted mt-3">
                        Save first to include your latest edits. The preview is
                        only available to signed-in administrators.
                    </p>
                </div>
                <div
                    v-if="
                        ['privacy', 'cookies', 'terms', 'legal'].includes(
                            section,
                        )
                    "
                >
                    <h3>Policy editing</h3>
                    <p class="cms-muted">
                        Keep the text consistent with actual tracking and
                        hosting. {{ "{" + "{publisher}" + "}" }} and
                        {{ "{" + "{email}" + "}" }} resolve from Publisher &
                        hosting.
                    </p>
                </div>
                <div>
                    <h3>Published history</h3>
                    <p v-if="!revisions.length" class="cms-muted mt-3">
                        Your first publication will preserve the original
                        content here.
                    </p>
                    <div
                        v-for="revision in revisions"
                        :key="revision.id"
                        class="cms-revision"
                    >
                        <time>{{
                            new Date(revision.created_at).toLocaleString()
                        }}</time
                        ><button
                            @click="restore(revision.id)"
                            :disabled="action.processing || form.isDirty"
                        >
                            Restore
                        </button>
                    </div>
                </div>
            </aside>
        </div>
        <dialog ref="publishDialog" class="cms-publish-dialog" aria-labelledby="publish-dialog-title">
            <h2 id="publish-dialog-title">Publish {{ definition.label }}?</h2>
            <p>This saved draft will become visible on the website. The previous version remains in Published history.</p>
            <p v-if="action.errors.version" class="cms-error" role="alert">{{ action.errors.version }}</p>
            <div class="cms-toolbar">
                <button type="button" class="cms-button secondary" autofocus @click="publishDialog?.close()">Cancel</button>
                <button type="button" class="cms-button" :disabled="action.processing" @click="publish">
                    {{ action.processing ? 'Publishing…' : 'Publish now' }}
                </button>
            </div>
        </dialog></AdminLayout
    >
</template>

<style scoped>
.cms-publish-dialog {
    width: min(480px, calc(100vw - 32px));
    margin: auto;
    padding: 28px;
    border: 1px solid hsl(var(--border));
    border-radius: 18px;
    background: hsl(var(--background));
    color: hsl(var(--foreground));
}
.cms-publish-dialog::backdrop { background: rgb(0 0 0 / 55%); }
.cms-publish-dialog h2 { font-size: 22px; font-weight: 600; }
.cms-publish-dialog p { margin: 16px 0 24px; line-height: 1.6; }
.cms-publish-dialog .cms-toolbar { justify-content: flex-end; }
</style>
