<template>
    <el-form-item :label="label">
        <el-input v-model="modelValue" :placeholder="placeholder"></el-input>
    </el-form-item>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'InputField',
    props: {
        modelValue: {
            type: String,
            required: true,
        },
        label: {
            type: String,
            required: true,
        },
        placeholder: {
            type: String,
            required: true,
        },
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
        const updateValue = (value: string) => {
            emit('update:modelValue', value);
        };

        return {
            updateValue,
        };
    },
});
</script>

<style scoped>
.el-form-item {
    margin-bottom: 20px;
}
</style>