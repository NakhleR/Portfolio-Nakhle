<script setup lang="ts">
import { ref } from "vue";
import { router, Link } from "@inertiajs/vue3";
import AdminLayout from "../Layouts/AdminLayout.vue";
import InboxMessage, { type Enquiry } from "../Components/InboxMessage.vue";
import CmsPagination from "../Components/CmsPagination.vue";
const props = defineProps<{
    messages: {
        data: Enquiry[];
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { status?: string; q?: string };
    counts: Record<string, number>;
}>();
const query = ref(props.filters.q || "");
function filter(status?: string) {
    router.get(
        "/dashboard/inbox",
        { status: status ?? props.filters.status, q: query.value },
        { preserveState: true, replace: true },
    );
}
</script>
<template>
    <AdminLayout
        title="Enquiries"
        description="Review conversations, keep private notes, and follow up on opportunities."
        ><div class="cms-toolbar mb-6">
            <Link
                class="cms-button"
                :class="{ secondary: !!filters.status }"
                href="/dashboard/inbox"
                >All</Link
            ><button
                v-for="status in ['new', 'read', 'replied', 'archived']"
                :key="status"
                class="cms-button capitalize"
                :class="{ secondary: filters.status !== status }"
                @click="filter(status)"
            >
                {{ status }} · {{ counts[status] || 0 }}
            </button>
        </div>
        <form class="cms-toolbar mb-6" @submit.prevent="filter()">
            <label class="sr-only" for="inbox-search">Search enquiries</label
            ><input
                id="inbox-search"
                v-model="query"
                type="search"
                maxlength="100"
                placeholder="Search name, email, or message…"
                style="max-width: 440px"
            /><button class="cms-button secondary">Search</button>
        </form>
        <p class="cms-muted mb-4">
            {{ messages.total }}
            {{ messages.total === 1 ? "enquiry" : "enquiries" }}
        </p>
        <div class="cms-inbox">
            <InboxMessage
                v-for="message in messages.data"
                :key="message.id"
                :message="message"
            />
        </div>
        <div v-if="!messages.data.length" class="cms-panel cms-empty">
            <strong>No enquiries here.</strong>Messages submitted through your
            contact form appear here. Try another filter if you are looking for
            a previous conversation.
        </div>
        <CmsPagination :links="messages.links"
    /></AdminLayout>
</template>
