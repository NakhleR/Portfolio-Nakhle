<script setup lang="ts">
import { Head, Link, useForm } from "@inertiajs/vue3";
const form = useForm({ email: "", password: "" });
function submit() {
    form.post("/login", { onFinish: () => form.reset("password") });
}
</script>
<template>
    <div>
        <Head title="Admin Login" />
        <main class="min-h-screen grid place-items-center p-6">
            <div class="panel p-8 w-full max-w-md">
                <Link href="/" class="text-sm text-muted-foreground"
                    >← Back to portfolio</Link
                >
                <h1 class="text-3xl mt-8 mb-2">Admin Login</h1>
                <p class="text-muted-foreground text-sm mb-8">
                    Sign in to manage your portfolio.
                </p>
                <form @submit.prevent="submit" class="space-y-5">
                    <div>
                        <label for="email">Email</label
                        ><input
                            id="email"
                            v-model="form.email"
                            type="email"
                            autocomplete="username"
                            required
                            autofocus
                        />
                        <p
                            v-if="form.errors.email"
                            class="field-error"
                            role="alert"
                        >
                            {{ form.errors.email }}
                        </p>
                    </div>
                    <div>
                        <label for="password">Password</label
                        ><input
                            id="password"
                            v-model="form.password"
                            type="password"
                            autocomplete="current-password"
                            required
                        />
                        <p v-if="form.errors.password" class="field-error">
                            {{ form.errors.password }}
                        </p>
                    </div>
                    <button class="button w-full" :disabled="form.processing">
                        {{ form.processing ? "Signing in…" : "Sign In" }}
                    </button>
                </form>
            </div>
        </main>
    </div>
</template>
