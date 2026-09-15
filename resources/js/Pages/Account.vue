<script setup lang="ts">
import { useForm, usePage } from "@inertiajs/vue3";
import AdminLayout from "../Layouts/AdminLayout.vue";
const page = usePage<{ auth: { user: { name: string; email: string } } }>();
const form = useForm({
    current_password: "",
    password: "",
    password_confirmation: "",
});
function save() {
    form.put("/dashboard/account", { onFinish: () => form.reset() });
}
</script>
<template>
    <AdminLayout
        title="Account & security"
        description="Protect access to the portfolio and its private data."
        ><div class="cms-grid">
            <form class="cms-panel cms-fields" @submit.prevent="save">
                <h2>Change password</h2>
                <p class="cms-muted">
                    Use at least 12 characters, including upper and lower case
                    letters, a number, and a symbol. Changing your password
                    signs you out.
                </p>
                <div
                    v-for="[key, label] in [
                        ['current_password', 'Current password'],
                        ['password', 'New password'],
                        ['password_confirmation', 'Confirm new password'],
                    ] as const"
                    :key="key"
                    class="cms-field"
                >
                    <label :for="key">{{ label }}</label
                    ><input
                        :id="key"
                        v-model="form[key]"
                        type="password"
                        :autocomplete="
                            key === 'current_password'
                                ? 'current-password'
                                : 'new-password'
                        "
                        required
                        maxlength="72"
                        :minlength="key === 'current_password' ? undefined : 12"
                    />
                    <p v-if="form.errors[key]" class="cms-error" role="alert">
                        {{ form.errors[key] }}
                    </p>
                </div>
                <div>
                    <button class="cms-button" :disabled="form.processing">
                        {{
                            form.processing
                                ? "Updating…"
                                : "Update password & sign out"
                        }}
                    </button>
                </div>
            </form>
            <aside class="cms-panel">
                <h2>Administrator</h2>
                <p class="mt-4">{{ page.props.auth.user.name }}</p>
                <p class="cms-muted">{{ page.props.auth.user.email }}</p>
                <div class="mt-8">
                    <h3>Access protections</h3>
                    <p class="cms-muted mt-3">
                        Administrator-only CMS access, protected sessions,
                        request validation, and login rate limits are enabled.
                        Public visitors cannot access enquiries, drafts, or
                        analytics reports.
                    </p>
                </div>
            </aside>
        </div></AdminLayout
    >
</template>
