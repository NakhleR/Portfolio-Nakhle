<script setup lang="ts">
import { useLocale } from "../composables/useLocale";
const { t, locale, localPath } = useLocale();
import { useCms } from "../composables/useCms";
const cms = useCms();
import SeoHead from "../Components/SeoHead.vue";
import { defineAsyncComponent } from "vue";
import { Link, useForm, usePage } from "@inertiajs/vue3";
import { ArrowUpRight, ArrowRight } from "lucide-vue-next";
import SiteLayout from "../Layouts/SiteLayout.vue";
const LocationMap = defineAsyncComponent(
    () => import("../Components/LocationMap.vue"),
);
import DisplacementSphere from "../Components/DisplacementSphere.vue";
const form = useForm({ name: "", email: "", message: "", website: "" });
const page = usePage<{ flash: { success?: string } }>();
function submit() {
    form.post(localPath("/contact"), {
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
                            <span
                                v-for="(line, i) in cms.contact.hero.split(
                                    '\n',
                                )"
                                :key="i"
                                class="line-mask"
                                ><span data-intro>{{ line }}</span></span
                            >
                        </h1>
                        <p data-intro-fade>{{ cms.contact.intro }}</p>
                        <a
                            :href="`mailto:${cms.site.email}`"
                            class="contact-email"
                            data-intro-fade
                            >{{ cms.site.email }} <ArrowUpRight
                        /></a>
                    </div>
                </section>
                <section class="shell contact-layout">
                    <div class="contact-form">
                        <h2>{{ cms.contact.form_title }}</h2>
                        <p
                            v-if="page.props.flash.success"
                            role="status"
                            class="success-message"
                        >
                            {{ page.props.flash.success }}
                        </p>
                        <form @submit.prevent="submit">
                            <div class="contact-field">
                                <label for="contact-name"> {{ t("Your name") }} </label
                                ><input
                                    id="contact-name"
                                    v-model="form.name"
                                    :placeholder="t('How should I call you?')"
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
                                <label for="contact-email"> {{ t("Email address") }} </label
                                ><input
                                    id="contact-email"
                                    v-model="form.email"
                                    type="email"
                                    :placeholder="t('you@example.com')"
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
                                    > {{ t("What do you have in mind?") }} </label
                                ><textarea
                                    id="contact-message"
                                    v-model="form.message"
                                    :placeholder="t('Tell me a little about your idea…')"
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
                                <label for="website"> {{ t("Website") }} </label
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
                                        ? t("Sending…")
                                        : t("Send message")
                                }}<ArrowRight :size="20" />
                            </button>
                            <p class="mt-4 text-xs text-muted-foreground"> {{ t("Your name, email, and message are used to respond to your enquiry.") }} <Link :href="localPath('/privacy')" class="underline"
                                    > {{ t("Read the privacy policy.") }} </Link
                                >
                            </p>
                        </form>
                    </div>
                    <aside class="contact-details">
                        <h2>{{ cms.contact.details_title }}</h2>
                        <dl>
                            <div>
                                <dt> {{ t("Based in") }} </dt>
                                <dd>
                                    <span class="whitespace-pre-line">{{
                                        cms.site.address
                                    }}</span>
                                </dd>
                            </div>
                            <div>
                                <dt> {{ t("Call me") }} </dt>
                                <dd>
                                    <a
                                        :href="`tel:${cms.site.phone.replace(/[^+0-9]/g, '')}`"
                                        >{{ cms.site.phone }}</a
                                    >
                                </dd>
                            </div>
                            <div>
                                <dt> {{ t("Elsewhere") }} </dt>
                                <dd class="contact-social">
                                    <a
                                        :href="cms.site.github"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        >GitHub <ArrowUpRight :size="16" /></a
                                    ><a
                                        :href="cms.site.linkedin"
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
