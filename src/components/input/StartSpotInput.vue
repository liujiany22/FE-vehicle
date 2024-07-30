<template>
        <el-input v-model="localValue" placeholder="请输入运输具体起点"></el-input>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
    name: 'StartSpotInput',
    props: {
        modelValue: {
            type: String,
            required: true
        }
    },
    setup(props, { emit }) {
        const localValue = ref(props.modelValue);

        watch(localValue, (newValue) => {
            emit('update:modelValue', newValue);
        });

        watch(() => props.modelValue, (newValue) => {
            localValue.value = newValue;
        });

        return {
            localValue
        };
    }
});
</script>

<style scoped>
.el-form-item {
    margin-bottom: 20px;
}
</style>