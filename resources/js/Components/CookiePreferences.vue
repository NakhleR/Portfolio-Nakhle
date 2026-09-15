<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { Link, usePage } from "@inertiajs/vue3";
const props = defineProps<{ loading: boolean }>();
const page = usePage<{ privacy: { analytics: boolean | null } }>();
const choice = ref<boolean | null>(page.props.privacy.analytics);
const analytics = ref(choice.value === true);
const mounted = ref(false);
const dialog = ref<HTMLDialogElement | null>(null);
const busy = ref(false);
const error = ref("");
const status = ref("");
const privacySignal = ref(false);
function open() {
    analytics.value = choice.value === true;
    error.value = "";
    dialog.value?.showModal();
}
function announce(value: boolean) {
    window.dispatchEvent(
        new CustomEvent("portfolio-consent", { detail: value }),
    );
}
async function save(value: boolean, erase = false) {
    if (busy.value) return;
    busy.value = true;
    error.value = "";
    if (!value) {
        announce(false);
        try {
            sessionStorage.removeItem("portfolio-analytics-session");
        } catch {}
    }
    try {
        const response = await fetch(
            erase ? "/privacy/erase-analytics" : "/privacy/consent",
            {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN":
                        document.querySelector<HTMLMetaElement>(
                            'meta[name="csrf-token"]',
                        )?.content || "",
                },
                body: JSON.stringify({
                    analytics: value && !privacySignal.value,
                }),
            },
        );
        if (!response.ok) throw new Error();
        const result = await response.json();
        choice.value = result.analytics;
        analytics.value = result.analytics;
        announce(result.analytics);
        dialog.value?.close();
        status.value = erase
            ? "Your browser’s analytics were deleted and tracking is off."
            : "Your cookie preferences have been saved.";
    } catch {
        error.value =
            "Your choice could not be saved. Tracking is paused on this page; please try again.";
        announce(false);
    } finally {
        busy.value = false;
    }
}
onMounted(() => {
    mounted.value = true;
    privacySignal.value =
        (navigator as Navigator & { globalPrivacyControl?: boolean })
            .globalPrivacyControl === true || navigator.doNotTrack === "1";
    window.addEventListener("open-cookie-preferences", open);
});
onBeforeUnmount(() => {
    window.removeEventListener("open-cookie-preferences", open);
    dialog.value?.close();
});
</script>
<template>
    <div data-analytics-ignore>
        <section
            v-if="mounted && choice === null && !props.loading"
            class="cookie-banner"
            aria-labelledby="cookie-title"
        >
            <div>
                <h2 id="cookie-title">Your privacy, your choice.</h2>
                <p>
                    Essential storage keeps the site working. With your
                    permission, private analytics help me understand clicks,
                    scrolling, and which sections hold your attention. No
                    recordings or form contents.
                </p>
                <p>
                    <Link href="/cookies">Cookie policy</Link> ·
                    <Link href="/privacy">Privacy policy</Link>
                </p>
                <p v-if="privacySignal">
                    Your browser’s privacy signal is respected. Analytics stay
                    off.
                </p>
                <p v-if="error" role="alert">{{ error }}</p>
            </div>
            <div class="cookie-actions">
                <button type="button" :disabled="busy" @click="save(false)">
                    Reject analytics
                </button>
                <button
                    type="button"
                    :disabled="busy || privacySignal"
                    @click="save(true)"
                >
                    Accept analytics
                </button>
                <button type="button" class="cookie-manage" @click="open">
                    Manage preferences
                </button>
            </div>
        </section>
        <dialog
            ref="dialog"
            class="cookie-dialog"
            aria-labelledby="preferences-title"
            data-lenis-prevent
            @click="
                (event) => {
                    if (event.target === dialog) dialog?.close();
                }
            "
        >
            <div class="cookie-dialog-content">
                <h2 id="preferences-title">Cookie preferences</h2>
                <p>
                    You can use the entire portfolio without analytics. Change
                    your choice here at any time.
                </p>
                <div class="cookie-option">
                    <strong>Essential storage</strong><span>Always active</span>
                    <p>
                        Security, your cookie choice, theme preference, and the
                        entry-animation setting.
                    </p>
                </div>
                <label class="cookie-option"
                    ><span
                        ><strong>Analytics</strong
                        ><input
                            v-model="analytics"
                            type="checkbox"
                            :disabled="privacySignal || busy"
                    /></span>
                    <p>
                        Page visits, click maps, scroll milestones, and
                        estimated reading time. These records are pseudonymous
                        and kept for 90 days.
                    </p></label
                >
                <p v-if="privacySignal">
                    A browser privacy signal keeps analytics disabled.
                </p>
                <p v-if="error" role="alert">{{ error }}</p>
                <div class="cookie-actions">
                    <button :disabled="busy" @click="save(false)">
                        Reject analytics</button
                    ><button :disabled="busy" @click="save(analytics)">
                        Save preferences
                    </button>
                </div>
                <button
                    class="cookie-delete"
                    :disabled="busy"
                    @click="save(false, true)"
                >
                    Delete this browser’s analytics and turn tracking off
                </button>
                <p>
                    <Link href="/privacy" @click="dialog?.close()"
                        >Privacy policy</Link
                    >
                    ·
                    <Link href="/cookies" @click="dialog?.close()"
                        >Cookie policy</Link
                    >
                </p>
                <button
                    type="button"
                    class="cookie-manage"
                    @click="dialog?.close()"
                >
                    Close
                </button>
            </div>
        </dialog>
        <span class="sr-only" role="status">{{ status }}</span>
    </div>
</template>
<style scoped>
.cookie-banner {
    position: fixed;
    z-index: 70;
    bottom: 20px;
    left: 20px;
    right: 20px;
    max-width: 1060px;
    margin-inline: auto;
    display: grid;
    grid-template-columns: 1fr 290px;
    gap: 28px;
    padding: 26px;
    border: 1px solid hsl(var(--border));
    border-radius: 20px;
    background: hsl(var(--background));
    color: hsl(var(--foreground));
    box-shadow: 0 12px 60px #0003;
}
.cookie-banner h2 {
    font-size: 24px;
    letter-spacing: -0.03em;
}
.cookie-banner p,
.cookie-dialog p {
    font-size: 13px;
    line-height: 1.6;
    margin-top: 10px;
}
a,
.cookie-delete {
    text-decoration: underline;
    text-underline-offset: 3px;
}
.cookie-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-content: center;
}
.cookie-actions button {
    flex: 1 1 130px;
    min-height: 44px;
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid hsl(var(--foreground));
    font-size: 13px;
}
.cookie-actions button:hover {
    background: hsl(var(--secondary));
}
.cookie-actions .cookie-manage,
.cookie-manage {
    border: 0;
    min-height: 44px;
    font-size: 13px;
    text-decoration: underline;
}
.cookie-dialog {
    width: min(560px, calc(100% - 32px));
    max-height: calc(100dvh - 40px);
    border: 1px solid hsl(var(--border));
    border-radius: 20px;
    padding: 0;
    background: hsl(var(--background));
    color: hsl(var(--foreground));
}
.cookie-dialog::backdrop {
    background: #0009;
}
.cookie-dialog-content {
    padding: 28px;
}
.cookie-dialog h2 {
    font-size: 30px;
}
.cookie-option {
    display: block;
    padding-block: 20px;
    margin-block: 8px;
    border-bottom: 1px solid hsl(var(--border));
    font-size: 14px;
}
.cookie-option > span {
    display: flex;
    justify-content: space-between;
    gap: 15px;
}
.cookie-option > strong + span {
    display: inline;
    margin-left: 16px;
    font-size: 12px;
}
.cookie-option input {
    width: 20px;
    height: 20px;
    accent-color: var(--spot);
}
.cookie-delete {
    min-height: 44px;
    margin-top: 12px;
    text-align: left;
    font-size: 12px;
}
button:disabled {
    opacity: 0.55;
}
@media (max-width: 767px) {
    .cookie-banner {
        display: block;
        padding: 20px;
        bottom: 12px;
        left: 12px;
        right: 12px;
        max-height: 80dvh;
        overflow-y: auto;
    }
    .cookie-actions {
        margin-top: 16px;
    }
}
</style>
