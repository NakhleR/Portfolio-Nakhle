<script setup lang="ts">
import SeoHead from "../Components/SeoHead.vue";
import { defineAsyncComponent } from "vue";
import { useForm, usePage } from "@inertiajs/vue3";
import { ArrowUpRight, ArrowRight } from "lucide-vue-next";
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
        <SeoHead /><SiteLayout>
            <div class="contact-scene">
                <DisplacementSphere />
                <section class="contact-hero shell">
                    <div class="contact-hero-copy">
                        <h1>
                            <span class="line-mask"
                                ><span data-intro>Good things</span></span
                            ><span class="line-mask"
                                ><span data-intro class="accent-text"
                                    >start here.</span
                                ></span
                            >
                        </h1>
                        <p data-intro-fade>
                            A new project, an opportunity, or an interesting
                            problem. I'd love to hear about it.
                        </p>
                        <a
                            href="mailto:nakhler2k2@gmail.com"
                            class="contact-email"
                            data-intro-fade
                            >nakhler2k2@gmail.com <ArrowUpRight
                        /></a>
                    </div>
                </section>
                <section class="shell contact-layout">
                    <div class="contact-form">
                        <h2>Let's start a conversation.</h2>
                        <p
                            v-if="page.props.flash.success"
                            role="status"
                            class="success-message"
                        >
                            {{ page.props.flash.success }}
                        </p>
                        <form @submit.prevent="submit">
                            <div class="contact-field">
                                <label for="contact-name">Your name</label
                                ><input
                                    id="contact-name"
                                    v-model="form.name"
                                    placeholder="How should I call you?"
                                    autocomplete="name"
                                    required
                                    maxlength="255"
                                    :aria-invalid="!!form.errors.name"
                                    :aria-describedby="
                                        form.errors.name
                                            ? 'name-error'
                                            : undefined
                                    "
                                />
                                <p
                                    v-if="form.errors.name"
                                    id="name-error"
                                    class="field-error"
                                >
                                    {{ form.errors.name }}
                                </p>
                            </div>
                            <div class="contact-field">
                                <label for="contact-email">Email address</label
                                ><input
                                    id="contact-email"
                                    v-model="form.email"
                                    type="email"
                                    placeholder="you@example.com"
                                    autocomplete="email"
                                    required
                                    maxlength="255"
                                    :aria-invalid="!!form.errors.email"
                                    :aria-describedby="
                                        form.errors.email
                                            ? 'email-error'
                                            : undefined
                                    "
                                />
                                <p
                                    v-if="form.errors.email"
                                    id="email-error"
                                    class="field-error"
                                >
                                    {{ form.errors.email }}
                                </p>
                            </div>
                            <div class="contact-field">
                                <label for="contact-message"
                                    >What do you have in mind?</label
                                ><textarea
                                    id="contact-message"
                                    v-model="form.message"
                                    placeholder="Tell me a little about your idea…"
                                    rows="4"
                                    minlength="10"
                                    maxlength="10000"
                                    required
                                    :aria-invalid="!!form.errors.message"
                                    :aria-describedby="
                                        form.errors.message
                                            ? 'message-error'
                                            : undefined
                                    "
                                />
                                <p
                                    v-if="form.errors.message"
                                    id="message-error"
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
                                class="button send-button"
                                :disabled="form.processing"
                            >
                                {{
                                    form.processing
                                        ? "Sending…"
                                        : "Send message"
                                }}<ArrowRight :size="20" />
                            </button>
                        </form>
                    </div>
                    <aside class="contact-details">
                        <h2>Find me here.</h2>
                        <dl>
                            <div>
                                <dt>Based in</dt>
                                <dd>
                                    Rue De Fontenelle<br />Rouen 76000, France
                                </dd>
                            </div>
                            <div>
                                <dt>Call me</dt>
                                <dd>
                                    <a href="tel:+33774812104"
                                        >+33 7 74 81 21 04</a
                                    >
                                </dd>
                            </div>
                            <div>
                                <dt>Elsewhere</dt>
                                <dd class="contact-social">
                                    <a
                                        href="https://github.com/NakhleR"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        >GitHub <ArrowUpRight :size="16" /></a
                                    ><a
                                        href="https://www.linkedin.com/in/nakhle-rizk-528129256/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        >LinkedIn <ArrowUpRight :size="16"
                                    /></a>
                                </dd>
                            </div>
                        </dl>
                        <div class="contact-map"><LocationMap /></div>
                    </aside>
                </section>
            </div>
        </SiteLayout>
    </div>
</template>
