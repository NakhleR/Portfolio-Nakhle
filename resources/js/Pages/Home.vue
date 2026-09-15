<script setup lang="ts">
import { useCms } from "../composables/useCms";
const cms = useCms();
import SeoHead from "../Components/SeoHead.vue";
import { Link } from "@inertiajs/vue3";
import { ArrowUpRight } from "lucide-vue-next";
import SiteLayout from "../Layouts/SiteLayout.vue";
import DisciplineShowcase from "../Components/DisciplineShowcase.vue";
import ModelScene from "../Components/ModelScene.vue";
</script>
<template>
    <div>
        <SeoHead /><SiteLayout>
            <DisciplineShowcase />
            <section class="studio-statement">
                <div class="shell studio-statement-content">
                    <div class="studio-statement-copy">
                        <h2 class="whitespace-pre-line">
                            {{ cms.home.statement }}
                        </h2>
                        <p>
                            {{ cms.home.statement_body }}
                        </p>
                        <Link href="/about" class="studio-link"
                            >Meet the person behind the work
                            <ArrowUpRight :size="20"
                        /></Link>
                        <p class="studio-caption">
                            {{ cms.home.caption }}
                        </p>
                    </div>
                </div>
                <div class="studio-dna">
                    <ModelScene model="dna" background />
                </div>
            </section>
            <section class="approach-section">
                <div class="shell approach-grid">
                    <div class="approach-aside">
                        <div class="thinker-stage">
                            <ModelScene model="thinker" />
                        </div>
                        <Link href="/about" class="text-link"
                            >A little more about me <ArrowUpRight :size="18"
                        /></Link>
                    </div>
                    <div class="approach-copy">
                        <h2 data-reveal><template v-for="(line,i) in cms.home.approach.split('\n')" :key="i"><br v-if="i"/><span :class="{'accent-text':i>0}">{{line}}</span></template></h2>
                        <p class="approach-lead">
                            {{ cms.home.approach_body }}
                        </p>
                        <blockquote>
                            {{ cms.home.quote
                            }}<cite>{{ cms.home.quote_author }}</cite>
                        </blockquote>
                        <div class="expertise-list">
                            <article
                                v-for="service in cms.home.services"
                                :key="service.title"
                            >
                                <h3>
                                    {{ service.title
                                    }}<ArrowUpRight :size="22" />
                                </h3>
                                <p>{{ service.text }}</p>
                                <span>{{ service.tools }}</span>
                            </article>
                        </div>
                    </div>
                </div>
            </section>
        </SiteLayout>
    </div>
</template>
