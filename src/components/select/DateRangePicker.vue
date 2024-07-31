<template>
  <el-form-item label="日期范围" class="custom-date-picker">
    <el-date-picker 
      v-model="localValue" 
      type="daterange" 
      start-placeholder="开始日期" 
      end-placeholder="结束日期">
    </el-date-picker>
  </el-form-item>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  name: 'DateRangePicker',
  props: {
      modelValue: {
          type: Array as unknown as () => [string, string],
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
@import '@/assets/select.css'; /* 引入共享样式 */

.el-form-item {
  margin-bottom: 20px;
}

</style>
