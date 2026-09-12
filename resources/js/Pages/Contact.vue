<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { Head, useForm, usePage } from "@inertiajs/vue3";
import { MapPin, Mail, Phone, ArrowRight } from "lucide-vue-next";
import SiteLayout from "../Layouts/SiteLayout.vue";
const LocationMap = defineAsyncComponent(
    () => import("../Components/LocationMap.vue"),
);
const DisplacementSphere = defineAsyncComponent(
    () => import("../Components/DisplacementSphere.vue"),
);
const form = useForm({ name: "", email: "", message: "", website: "" });
const page = usePage<{ flash: { success?: string } }>();
function submit() {
    form.post("/contact", {
        preserveScroll: true,
        onSuccess: () => form.reset(),
    });
}
</script>
<template>
    <div>
        <Head title="Contact" /><SiteLayout
            ><div class="relative overflow-hidden">
                <DisplacementSphere />
                <section class="page-heading">
                    <p class="eyebrow">Contact</p>
                    <h1>Get in Touch</h1>
                    <p>
                        Have a project in mind? Let's discuss how we can create
                        something extraordinary together.
                    </p>
                </section>
                <section class="section pt-4">
                    <div class="container grid lg:grid-cols-2 gap-12">
                        <div class="panel p-8">
                            <h2 class="text-2xl mb-8">Send a Message</h2>
                            <p
                                v-if="page.props.flash.success"
                                role="status"
                                class="success-message"
                            >
                                {{ page.props.flash.success }}
                            </p>
                            <form @submit.prevent="submit" class="space-y-5">
                                <div>
                                    <label for="contact-name">Name</label
                                    ><input
                                        id="contact-name"
                                        v-model="form.name"
                                        autocomplete="name"
                                        required
                                        maxlength="255"
                                    />
                                    <p
                                        v-if="form.errors.name"
                                        class="field-error"
                                    >
                                        {{ form.errors.name }}
                                    </p>
                                </div>
                                <div>
                                    <label for="contact-email">Email</label
                                    ><input
                                        id="contact-email"
                                        v-model="form.email"
                                        type="email"
                                        autocomplete="email"
                                        required
                                        maxlength="255"
                                    />
                                    <p
                                        v-if="form.errors.email"
                                        class="field-error"
                                    >
                                        {{ form.errors.email }}
                                    </p>
                                </div>
                                <div>
                                    <label for="contact-message">Message</label
                                    ><textarea
                                        id="contact-message"
                                        v-model="form.message"
                                        rows="6"
                                        minlength="10"
                                        maxlength="10000"
                                        required
                                    />
                                    <p
                                        v-if="form.errors.message"
                                        class="field-error"
                                    >
                                        {{ form.errors.message }}
                                    </p>
                                </div>
                                <div class="hidden" aria-hidden="true">
                                    <label for="website">Website</label
                                    ><input
                                        id="website"
                                        v-model="form.website"
                                        tabindex="-1"
                                        autocomplete="off"
                                    />
                                </div>
                                <button
                                    class="button"
                                    :disabled="form.processing"
                                >
                                    {{
                                        form.processing
                                            ? "Sending…"
                                            : "Send Message"
                                    }}<ArrowRight :size="16" />
                                </button>
                            </form>
                        </div>
                        <div class="panel p-8">
                            <h2 class="text-2xl mb-8">Information</h2>
                            <div class="space-y-7 mb-8">
                                <div class="flex gap-4">
                                    <MapPin :size="20" />
                                    <div>
                                        <h3 class="text-base font-semibold">
                                            Address
                                        </h3>
                                        <p
                                            class="text-sm text-muted-foreground"
                                        >
                                            Rue De Fontenelle<br />Rouen 76000,
                                            France
                                        </p>
                                    </div>
                                </div>
                                <div class="flex gap-4">
                                    <Mail :size="20" />
                                    <div>
                                        <h3 class="text-base font-semibold">
                                            Email
                                        </h3>
                                        <a
                                            href="mailto:nakhler2k2@gmail.com"
                                            class="text-sm text-muted-foreground"
                                            >nakhler2k2@gmail.com</a
                                        >
                                    </div>
                                </div>
                                <div class="flex gap-4">
                                    <Phone :size="20" />
                                    <div>
                                        <h3 class="text-base font-semibold">
                                            Phone
                                        </h3>
                                        <a
                                            href="tel:+33774812104"
                                            class="text-sm text-muted-foreground"
                                            >+33 7 74 81 21 04</a
                                        >
                                    </div>
                                </div>
                            </div>
                            <LocationMap />
                        </div>
                    </div>
                </section></div
        ></SiteLayout>
    </div>
</template>
