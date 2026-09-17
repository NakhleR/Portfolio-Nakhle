<script setup lang="ts">
import { computed } from "vue";
import { useCms } from "../composables/useCms";
const cms = useCms();
import { Link } from "@inertiajs/vue3";
import SiteLayout from "../Layouts/SiteLayout.vue";
import SeoHead from "../Components/SeoHead.vue";
const props = defineProps<{
    document: string;
    legal: {
        owner: string;
        email: string;
        website: string;
        business: string | null;
        address: string | null;
        host_name: string | null;
        hosting_details: string;
        host_address: string | null;
        host_phone: string | null;
        updated: string;
    };
}>();
const documents: Record<
    string,
    {
        title: string;
        introduction: string;
        sections: { heading: string; text: string[] }[];
    }
> = {
    privacy: {
        title: "Privacy policy",
        introduction:
            "A clear account of what this portfolio collects, why it collects it, and the choices you have.",
        sections: [
            {
                heading: "Who is responsible",
                text: [
                    `${props.legal.owner} is responsible for personal information processed through this portfolio. For privacy requests, contact ${props.legal.email}.`,
                ],
            },
            {
                heading: "Contact enquiries",
                text: [
                    "The contact form stores the name, email address, and message you choose to send. This information is used to reply to your enquiry and discuss potential work. Please do not include sensitive personal information.",
                    "Handling an enquiry relies on taking steps at your request before a possible contract, or on the legitimate interest of answering correspondence. Messages should be reviewed when an enquiry is resolved and deleted when no longer needed; relevant correspondence may be retained for ongoing work, legal obligations, or disputes. You can ask about retention or request deletion using the contact address above.",
                ],
            },
            {
                heading: "Optional audience analytics",
                text: [
                    "Only after you accept analytics, this site records page paths, visits, coarse device categories, clicks on interface controls and page surfaces, approximate click positions, scroll milestones, and estimated active reading time by section. A random consent reference and a random browser-session reference associate these events. They are pseudonymous identifiers, not a verified identity.",
                    "Analytics do not capture form inputs, message contents, keystroke contents, screenshots, screen recordings, URL query strings, full referrer addresses, advertising profiles, or device fingerprints. IP addresses and user-agent strings are not stored in the analytics tables. The web server still processes network information needed to deliver and secure the site.",
                    "Consent is the basis for this optional processing. Rejecting analytics does not limit access to the portfolio. Reading time is an estimate of active, visible content, not eye tracking or proof that a person read a particular sentence. The reports cover consenting traffic only.",
                ],
            },
            {
                heading: "Retention and your choices",
                text: [
                    "Analytics events are retained for up to 90 days, with expired records removed by a daily maintenance task. Your choice and its policy version are remembered for 180 days. The optional session reference is kept in session storage and renewed after 30 minutes without activity. Browser storage restrictions can affect these durations.",
                    "Use Cookie preferences in the footer to change your choice. Withdrawing consent stops future analytics collection; it does not make earlier processing unlawful. You can also delete analytics linked to this browser’s consent reference and turn tracking off. Clearing cookies or using another browser may remove the reference needed to find those records.",
                ],
            },
            {
                heading: "Recipients and external services",
                text: [
                    "Analytics and contact messages are stored in the database on Nakhle Rizk’s own server and are accessible to him to operate this personal portfolio and respond to enquiries. Analytics are not sent to an advertising network or external analytics provider, and personal information is not sold.",
                    "The interactive map connects to OpenStreetMap only when you choose to load it. That provider then receives connection information such as your IP address. External project, GitHub, LinkedIn, and other links take you to services governed by their own privacy notices. The site is self-hosted using Microsoft IIS; publisher and hosting contact details are listed in the Legal notice.",
                ],
            },
            {
                heading: "Your rights",
                text: [
                    "Where applicable, you may request access, correction, deletion, restriction, portability, or object to processing based on legitimate interests. You may withdraw analytics consent at any time. Contact the address above; only information reasonably necessary to verify and handle a request should be requested.",
                    "You may also raise a concern with your local data-protection authority. In France this is the CNIL (cnil.fr). Applicable statutory rights are not limited by this policy.",
                ],
            },
        ],
    },
    cookies: {
        title: "Cookie policy",
        introduction:
            "The portfolio works without optional analytics. Accepting them is your choice.",
        sections: [
            {
                heading: "Essential cookies and storage",
                text: [
                    "The Laravel session cookie and XSRF-TOKEN support sessions, form security, and authentication. Their lifetime follows the server’s session configuration. Administrators may also use an authentication remembrance cookie when that feature is selected.",
                    "The portfolio_consent cookie remembers an explicit analytics choice and its version for 180 days. It is encrypted, HttpOnly, and uses SameSite=Lax; Secure is used on HTTPS requests. The server stores the matching choice and expiry so it can enforce consent.",
                    "portfolio-theme in local storage remembers a theme you choose until you remove it. portfolio-entry-seen in session storage prevents the entry animation from repeating in the same tab session. These settings support the requested interface rather than audience tracking.",
                ],
            },
            {
                heading: "Optional analytics storage",
                text: [
                    "portfolio-analytics-session is created in session storage only when analytics are allowed. It contains a random session reference and activity time. A new reference is generated after 30 minutes without recorded activity. Session storage normally ends when its tab session ends.",
                    "Analytics requests stay on this site. Consent is checked on the server for every event batch. Global Privacy Control and Do Not Track signals keep analytics off. No optional advertising or session-replay cookies are used.",
                ],
            },
            {
                heading: "Choose, change, or delete",
                text: [
                    "Accept and Reject are both available in the cookie banner. Manage preferences lets you review the purpose before choosing. No analytics option is preselected for a new visitor.",
                    "Cookie preferences remains available in the footer. Turning analytics off drops unsent events and removes the optional session reference from this tab. Deleting this browser’s analytics also removes the linked stored events. You can additionally clear site cookies and storage in your browser, which may reset your preferences.",
                ],
            },
            {
                heading: "Third-party content",
                text: [
                    "The map stays inactive until you request it. Loading it contacts OpenStreetMap. Visiting an external link is a separate interaction with that provider. Those services can have their own storage and privacy practices.",
                ],
            },
        ],
    },
    terms: {
        title: "Terms of use",
        introduction:
            "These terms explain the permitted use of this portfolio. They are not a contract for paid development services.",
        sections: [
            {
                heading: "Purpose of this website",
                text: [
                    "This site presents work, experience, experiments, and ways to contact the publisher. Project descriptions and demonstrations illustrate work at a point in time and may change. Browsing the site or sending a message does not create an employment relationship, partnership, or services agreement. Any paid work requires separate agreed terms.",
                ],
            },
            {
                heading: "Permitted use",
                text: [
                    "You may browse, share links, and download the provided CV for evaluating professional opportunities. Do not attempt unauthorized access, interfere with the site, bypass security controls, send unlawful or abusive material, or use the contact form for spam. Automated access must respect applicable law and must not disrupt the service.",
                ],
            },
            {
                heading: "Content and intellectual property",
                text: [
                    "Original text, design, custom visual work, and original code are protected to the extent applicable law provides. Rights remain with their respective owners. Project screenshots, software names, trademarks, client materials, libraries, fonts, and third-party models may have separate owners and licences.",
                    "Public source repositories are governed by the licence supplied with each repository; displaying a project here does not grant additional rights. Statutory exceptions, quotation rights, and rights granted by applicable open-source licences remain unaffected. Ask the publisher before reusing original portfolio material beyond those rights.",
                ],
            },
            {
                heading: "External links and availability",
                text: [
                    "Links and demonstrations may rely on third-party services. Their availability, content, and terms can change independently. Reasonable care is taken with the portfolio, but uninterrupted access or error-free information cannot be promised. Do not rely on a demonstration as a production service unless separately agreed.",
                ],
            },
            {
                heading: "Responsibility and disputes",
                text: [
                    "Each party remains responsible as required by applicable law. These terms do not exclude liability that cannot lawfully be excluded, or restrict mandatory consumer, privacy, or other statutory protections.",
                    `Please contact ${props.legal.email} first about a concern so it can be investigated. Applicable law and jurisdiction follow the rules that legally apply to the situation; no exclusive foreign forum is imposed here.`,
                ],
            },
            {
                heading: "Updates",
                text: [
                    "These terms may be updated as the site changes. The date shown on this page identifies the current text. Changes to analytics purposes require a renewed consent choice where required.",
                ],
            },
        ],
    },
    legal: {
        title: "Legal notice & copyright",
        introduction:
            "Publisher details and ownership information for this portfolio.",
        sections: [
            {
                heading: "Publisher",
                text: [
                    props.legal.owner,
                    `Website: ${props.legal.website}`,
                    `Publication contact: ${props.legal.email}`,
                    ...(props.legal.business ? [props.legal.business] : []),
                    ...(props.legal.address ? [props.legal.address] : []),
                ],
            },
            {
                heading: "Hosting",
                text: [
                    props.legal.hosting_details,
                    ...(props.legal.host_name ? [props.legal.host_name] : []),
                    ...(props.legal.host_address ? [props.legal.host_address] : []),
                    ...(props.legal.host_phone ? [`Telephone: ${props.legal.host_phone}`] : []),
                    `Hosting contact: ${props.legal.email}`,
                ],
            },
            {
                heading: "Copyright and credits",
                text: [
                    `© ${new Date().getFullYear()} ${props.legal.owner} for original contributions. Third-party content remains the property of its respective owners.`,
                    "Technology icons and names identify the tools used and do not imply sponsorship. Libraries, fonts, models, project materials, and linked source code remain subject to their own licences. Permissions to reuse original content can be requested through the publication contact.",
                ],
            },
            {
                heading: "Report a concern",
                text: [
                    "For an ownership, attribution, privacy, accessibility, or content concern, send the relevant page address and a description to the publication contact. Claims will be reviewed and corrections made where appropriate.",
                ],
            },
        ],
    },
};
const content = computed(() => {
    const document = cms.value[props.document] as
        | {
              title: string;
              introduction: string;
              sections: { heading: string; body: string }[];
          }
        | undefined;
    if (!document || !Array.isArray(document.sections))
        return documents[props.document] || documents.privacy;
    const resolve = (value: string) =>
        value
            .replaceAll("{{publisher}}", props.legal.owner)
            .replaceAll("{{email}}", props.legal.email)
            .replaceAll("{{website}}", props.legal.website);
    return {
        title: document.title,
        introduction: resolve(document.introduction),
        sections: document.sections.map((section) => ({
            heading: section.heading,
            text: resolve(section.body).split("\n\n"),
        })),
    };
});
function preferences() {
    window.dispatchEvent(new Event("open-cookie-preferences"));
}
</script>
<template>
    <div>
        <SeoHead /><SiteLayout>
            <article class="legal-document shell">
                <p class="eyebrow">Updated {{ legal.updated }}</p>
                <h1>{{ content.title }}</h1>
                <p class="legal-intro">{{ content.introduction }}</p>
                <p>
                    Applies to <a :href="legal.website">{{ legal.website }}</a>,
                    the personal portfolio of {{ legal.owner }}.
                </p>
                <nav aria-label="Legal documents">
                    <Link href="/privacy">Privacy</Link
                    ><Link href="/cookies">Cookies</Link
                    ><Link href="/terms">Terms</Link
                    ><Link href="/legal">Legal notice</Link
                    ><button type="button" @click="preferences">
                        Cookie preferences
                    </button>
                </nav>
                <section v-for="item in content.sections" :key="item.heading">
                    <h2>{{ item.heading }}</h2>
                    <p v-for="(paragraph, index) in item.text" :key="index">
                        {{ paragraph }}
                    </p>
                </section>
                <p class="legal-contact">
                    Contact:
                    <a :href="`mailto:${legal.email}`">{{ legal.email }}</a>
                </p>
            </article>
        </SiteLayout>
    </div>
</template>
<style scoped>
.legal-document {
    max-width: 1100px;
    padding-block: 64px 100px;
}
.legal-document h1 {
    font-size: clamp(42px, 6vw, 76px);
    margin-block: 20px 24px;
}
.legal-intro {
    font-size: 19px;
    max-width: 65ch;
    color: hsl(var(--muted-foreground));
}
.legal-document nav {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 24px;
    padding-block: 28px;
    margin-bottom: 24px;
    border-bottom: 1px solid hsl(var(--border));
    font-size: 14px;
}
.legal-document nav :is(a, button) {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    text-decoration: underline;
    text-underline-offset: 5px;
}
.legal-document section {
    margin-top: 42px;
}
.legal-document section h2 {
    font-size: 28px;
    letter-spacing: -0.025em;
    margin-bottom: 18px;
}
.legal-document section p {
    font-size: 16px;
    line-height: 1.8;
    max-width: 78ch;
    margin-top: 14px;
    color: hsl(var(--muted-foreground));
}
.legal-contact {
    margin-top: 48px;
}
.legal-contact a {
    text-decoration: underline;
}
</style>
