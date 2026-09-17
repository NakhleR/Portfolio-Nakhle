<script setup lang="ts">
import { useLocale } from "../composables/useLocale";
const { t, locale, localPath } = useLocale();
import { useCms } from "../composables/useCms";
const cms = useCms();
import SeoHead from "../Components/SeoHead.vue";
import { ref } from "vue";
import { ArrowDown } from "lucide-vue-next";
import SiteLayout from "../Layouts/SiteLayout.vue";
import ImageGallery from "../Components/ImageGallery.vue";
import { computed } from "vue";
const skills = computed(() => cms.value.about.skills);
import type { TimelineItem } from "../types";
defineProps<{ timeline: TimelineItem[] }>();
const category = ref(0);
const gallery = ref<InstanceType<typeof ImageGallery> | null>(null);
const timelineCategory = ref("all");
</script>
<template>
    <div>
        <SeoHead /><SiteLayout>
            <section class="inner-hero shell about-heading">
                <h1>
                    <span
                        v-for="(line, i) in cms.about.hero.split('\n')"
                        :key="i"
                        class="line-mask"
                        ><span data-intro>{{ line }}</span></span
                    >
                </h1>
            </section>
            <section class="shell biography">
                <figure class="portrait" data-intro-fade>
                    <a
                        :href="cms.assets.portrait_original"
                        class="portrait-frame"
                        :aria-label="t('Open portrait in gallery')"
                        aria-haspopup="dialog"
                        @click.prevent="gallery?.open()"
                    >
                        <img
                            :src="cms.assets.portrait"
                            :srcset="cms.assets.portrait_srcset || undefined"
                            sizes="(max-width: 767px) 90vw, (min-width: 1680px) 540px, 36vw"
                            :alt="cms.site.name"
                            width="800"
                            height="1000"
                            fetchpriority="high"
                        />
                    </a>
                    <figcaption>
                        <span>{{cms.site.name}}</span
                        ><span>{{ cms.about.portrait_caption }}</span>
                    </figcaption>
                </figure>
                <div class="biography-copy" data-reveal>
                    <h2 class="whitespace-pre-line">{{ cms.about.title }}</h2>
                    <p
                        v-for="(paragraph, i) in cms.about.biography.split(
                            '\n\n',
                        )"
                        :key="i"
                    >
                        {{ paragraph }}
                    </p>
                    <a
                        :href="cms.assets.cv"
                        download="Nakhle_Rizk_CV.pdf"
                        class="round-link"
                        ><span class="round-icon"><ArrowDown :size="22" /></span
                        ><span> {{ t("The full story, in my CV") }} </span></a
                    >
                </div>
            </section>
            <section class="journey-section shell">
                <div class="section-bar">
                    <h2>{{ cms.about.journey_title }}</h2>
                    <span class="small-label"> {{ t("Experience & education") }} </span>
                </div>
                <div class="filter-list timeline-filters">
                    <button
                        v-for="item in ['all', 'education', 'work', 'project']"
                        :key="item"
                        :aria-pressed="timelineCategory === item"
                        class="capitalize"
                        @click="timelineCategory = item"
                    >
                        {{ t(item) }}
                    </button>
                </div>
                <div class="journey-list">
                    <article
                        v-for="item in timeline.filter(
                            (item) =>
                                timelineCategory === 'all' ||
                                item.category === timelineCategory,
                        )"
                        :key="item.id"
                        class="journey-item"
                    >
                        <div class="journey-date">
                            {{ t(item.year) }}<span>{{ t(item.category) }}</span>
                        </div>
                        <div>
                            <h3>{{ t(item.title) }}</h3>
                            <p v-if="item.location" class="journey-location">
                                {{ t(item.location) }}
                            </p>
                            <p
                                v-if="item.description"
                                class="whitespace-pre-line"
                            >
                                {{ t(item.description) }}
                            </p>
                            <ul v-if="item.bullets?.length">
                                <li
                                    v-for="(bullet, i) in item.bullets"
                                    :key="i"
                                >
                                    {{ t(bullet) }}
                                </li>
                            </ul>
                        </div>
                    </article>
                </div>
            </section>
            <section class="skills-section">
                <div class="shell skills-layout">
                    <div>
                        <h2><template v-for="(line,i) in cms.about.skills_title.split('\n')" :key="i"><br v-if="i"/><span :class="{'accent-text':i>0}">{{line}}</span></template></h2>
                        <p> {{ t("Technologies and tools I work with.") }} <br /> {{ t("Always room for something new.") }} </p>
                    </div>
                    <div>
                        <div class="filter-list skills-filters">
                            <button
                                v-for="(group, i) in skills"
                                :key="group.name"
                                :aria-pressed="category === i"
                                @click="category = i"
                            >
                                {{ t(group.name) }}
                            </button>
                        </div>
                        <div class="skills-panels">
                          <div
                            v-for="(group, i) in skills"
                            :key="group.name"
                            class="skills-list"
                            :class="{ 'is-active': category === i }"
                            :aria-hidden="category !== i"
                            :inert="category !== i"
                          >
                            <div
                                v-for="skill in group.items"
                                :key="skill.name"
                            >
                                <img
                                    :src="skill.imagePath"
                                    alt=""
                                    width="28"
                                    height="28"
                                    loading="lazy"
                                    :class="{
                                        'dark:invert':
                                            'darkModeInvert' in skill &&
                                            skill.darkModeInvert,
                                    }"
                                /><span>{{ skill.name }}</span>
                            </div>
                          </div>
                        </div>
                    </div>
                </div>
            </section>
            <ImageGallery
                ref="gallery"
                :images="[cms.assets.portrait_original]"
                :title="cms.site.name"
            />
        </SiteLayout>
    </div>
</template>
