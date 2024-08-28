<template>
  <el-select v-model="localValue" placeholder="请选择装载方式" class="custom-select" filterable clearable>
    <!-- 默认的取消选项 -->
    <el-option v-if="allowClear" :key="null" :label="'请选择装载方式'" :value="null">
    </el-option>
    
    <el-option v-for="(label, value) in loadChoices" :key="value" :label="label" :value="value">
    </el-option>
  </el-select>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  name: 'LoadSelect',
  props: {
    modelValue: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const loadChoices = {
      'Own Equipment': '自带机械',
      'Site Equipment': '工地机械',
      'Manual Loading': '人工装车',
      'On-site Transport': '场内倒运'
    };

    const localValue = ref(props.modelValue);
    const allowClear = ref(true);  // 允许清除选项

    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue);
    });

    watch(() => props.modelValue, (newValue) => {
      localValue.value = newValue;
    });

    return {
      allowClear,
      loadChoices,
      localValue
    };
  },
});
</script>

<style scoped>
@import '@/assets/select.css';
/* 引入共享样式 */
</style>
