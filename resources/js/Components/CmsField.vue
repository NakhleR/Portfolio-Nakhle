<script setup lang="ts">
import { computed } from "vue";
import { Plus, ArrowUp, ArrowDown, Trash2 } from "lucide-vue-next";
export type Value = string | number | boolean | null | Values | Values[];
export interface Values {
    [key: string]: Value;
}
export interface Field {
    label: string;
    type: string;
    default: Value;
    optional?: boolean;
    max?: number;
    min?: number;
    options?: string[];
    fields?: Record<string, Field>;
}
const props = defineProps<{
    field: Field;
    modelValue: Value;
    path: string;
    errors: Record<string, string>;
}>();
const emit = defineEmits<{ "update:modelValue": [value: Value] }>();
const rows = computed(() =>
    Array.isArray(props.modelValue) ? props.modelValue : [],
);
function update(index: number, key: string, value: Value) {
    emit(
        "update:modelValue",
        rows.value.map((row, i) =>
            i === index ? { ...row, [key]: value } : row,
        ),
    );
}
function add() {
    emit("update:modelValue", [
        ...rows.value,
        Object.fromEntries(
            Object.entries(props.field.fields || {}).map(([key, field]) => [
                key,
                JSON.parse(JSON.stringify(field.default)),
            ]),
        ),
    ]);
}
function move(index: number, delta: number) {
    const next = [...rows.value];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    emit("update:modelValue", next);
}
</script>
<template>
    <div class="cms-field">
        <template v-if="field.type === 'repeater'"
            ><div class="cms-field-label">{{ field.label }}</div>
            <div class="cms-repeater">
                <section
                    v-for="(row, index) in rows"
                    :key="index"
                    class="cms-repeater-row"
                >
                    <div class="cms-row-actions">
                        <strong>{{ field.label }} · {{ index + 1 }}</strong>
                        <div>
                            <button
                                type="button"
                                @click="move(index, -1)"
                                :disabled="index === 0"
                                :aria-label="`Move ${field.label} ${index + 1} up`"
                            >
                                <ArrowUp :size="15" /></button
                            ><button
                                type="button"
                                @click="move(index, 1)"
                                :disabled="index === rows.length - 1"
                                :aria-label="`Move ${field.label} ${index + 1} down`"
                            >
                                <ArrowDown :size="15" /></button
                            ><button
                                type="button"
                                @click="
                                    emit(
                                        'update:modelValue',
                                        rows.filter((_, i) => i !== index),
                                    )
                                "
                                :disabled="rows.length === 1"
                                :aria-label="`Remove ${field.label} ${index + 1}`"
                            >
                                <Trash2 :size="15" />
                            </button>
                        </div>
                    </div>
                    <div class="cms-fields">
                        <CmsField
                            v-for="(child, key) in field.fields"
                            :key="key"
                            :field="child"
                            :model-value="row[key]"
                            :path="`${path}.${index}.${key}`"
                            :errors="errors"
                            @update:model-value="update(index, key, $event)"
                        />
                    </div>
                </section>
            </div>
            <button
                class="cms-button secondary cms-repeater-add"
                type="button"
                @click="add"
                :disabled="rows.length >= (field.max || 20)"
            >
                <Plus :size="15" />Add item
            </button></template
        >
        <label
            v-else-if="field.type === 'checkbox'"
            class="cms-field-check"
            :for="path"
            ><input
                :id="path"
                type="checkbox"
                :checked="Boolean(modelValue)"
                @change="
                    emit(
                        'update:modelValue',
                        ($event.target as HTMLInputElement).checked,
                    )
                "
            />{{ field.label }}</label
        >
        <template v-else
            ><label :for="path"
                >{{ field.label
                }}<span v-if="field.optional" class="cms-muted">
                    · optional</span
                ></label
            ><textarea
                v-if="field.type === 'textarea'"
                :id="path"
                :value="String(modelValue ?? '')"
                :maxlength="field.max || 10000"
                :rows="String(modelValue || '').length > 500 ? 9 : 4"
                :aria-invalid="!!errors[path]"
                @input="
                    emit(
                        'update:modelValue',
                        ($event.target as HTMLTextAreaElement).value,
                    )
                " /><select
                v-else-if="field.type === 'select'"
                :id="path"
                :value="modelValue"
                @change="
                    emit(
                        'update:modelValue',
                        ($event.target as HTMLSelectElement).value,
                    )
                "
            >
                <option v-for="option in field.options" :key="option">
                    {{ option }}
                </option></select
            ><input
                v-else
                :id="path"
                :type="
                    ['email', 'number', 'url'].includes(field.type)
                        ? field.type
                        : 'text'
                "
                :value="modelValue"
                :max="field.type === 'number' ? field.max : undefined"
                :min="field.min"
                :maxlength="field.max || 1000"
                :aria-invalid="!!errors[path]"
                step="any"
                @input="
                    emit(
                        'update:modelValue',
                        field.type === 'number'
                            ? Number(($event.target as HTMLInputElement).value)
                            : ($event.target as HTMLInputElement).value,
                    )
                "
        /></template>
        <p v-if="errors[path]" class="cms-error" role="alert">
            {{ errors[path] }}
        </p>
    </div>
</template>
