<script setup lang="ts">
import { useForm, router } from "@inertiajs/vue3";
import { watch } from "vue";
import { Mail, Trash2 } from "lucide-vue-next";
export interface Enquiry {
    id: number;
    name: string;
    email: string;
    message: string;
    status: string;
    notes: string | null;
    created_at: string;
}
const props = defineProps<{ message: Enquiry }>();
const form = useForm({
    status: props.message.status,
    notes: props.message.notes || "",
});
watch(
    () => props.message,
    () => {
        form.defaults({
            status: props.message.status,
            notes: props.message.notes || "",
        });
        form.reset();
    },
);
function save() {
    form.patch("/dashboard/inbox/" + props.message.id, {
        preserveScroll: true,
    });
}
function remove() {
    if (
        confirm(
            "Permanently delete this enquiry and its notes? This cannot be undone.",
        )
    )
        router.delete("/dashboard/inbox/" + props.message.id, {
            preserveScroll: true,
        });
}
</script>
<template>
    <details class="cms-panel cms-message">
        <summary>
            <span
                ><strong>{{ message.name }}</strong
                ><small>{{ message.email }}</small></span
            ><span class="cms-badge" :class="message.status">{{
                message.status
            }}</span
            ><small>{{
                new Date(message.created_at).toLocaleDateString()
            }}</small>
        </summary>
        <div class="cms-message-body">
            <p>{{ message.message }}</p>
            <div class="cms-toolbar">
                <a
                    class="cms-button secondary"
                    :href="`mailto:${message.email}?subject=${encodeURIComponent('Re: Your portfolio enquiry')}`"
                    ><Mail :size="16" />Reply in email app</a
                ><button class="cms-button secondary" @click="remove">
                    <Trash2 :size="15" />Delete enquiry
                </button>
            </div>
            <p class="cms-muted">
                Replies are sent through your email app. Mark the enquiry
                replied once you have sent it.
            </p>
            <form class="cms-fields" @submit.prevent="save">
                <div class="cms-field">
                    <label :for="`status-${message.id}`">Status</label
                    ><select :id="`status-${message.id}`" v-model="form.status">
                        <option
                            v-for="status in [
                                'new',
                                'read',
                                'replied',
                                'archived',
                            ]"
                            :key="status"
                            :value="status"
                        >
                            {{ status }}
                        </option>
                    </select>
                </div>
                <div class="cms-field">
                    <label :for="`notes-${message.id}`">Private notes</label
                    ><textarea
                        :id="`notes-${message.id}`"
                        v-model="form.notes"
                        maxlength="10000"
                        rows="3"
                        placeholder="Next steps, context, or follow-up notes…"
                    />
                </div>
                <p
                    v-for="(error, key) in form.errors"
                    :key="key"
                    class="cms-error"
                    role="alert"
                >
                    {{ error }}
                </p>
                <div>
                    <button class="cms-button" :disabled="form.processing">
                        {{ form.processing ? "Saving…" : "Save enquiry" }}
                    </button>
                </div>
            </form>
        </div>
    </details>
</template>
