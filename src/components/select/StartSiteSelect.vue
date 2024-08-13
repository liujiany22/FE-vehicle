<template>
  <el-select 
    v-model="localValue" 
    :placeholder="placeholderText" 
    @visible-change="fetchStartSites" 
    class="custom-select"
    filterable
    clearable>
    <!-- 默认的取消选项 -->
    <el-option 
      v-if="allowClear" 
      :key="null" 
      :label="placeholderText" 
      :value="null">
    </el-option>

    <el-option
      v-for="item in start_sites"
      :key="item.id"
      :label="`${item.name} ${item.manager ? `(${item.manager})` : ''}`"
      :value="item.id">
    </el-option>

    <div class="pagination-container">
      <el-pagination 
        @current-change="handleStartSitePageChange" 
        :current-page="startSiteCurrentPage"
        :page-size="perPage" 
        layout="prev, pager, next" 
        :total="totalStartSites" />
    </div>
  </el-select>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { getStartSites } from '@/services/transportService';

export default defineComponent({
  name: 'StartSiteSelect',
  props: {
    modelValue: {
      type: Number,
      required: true
    }
  },
  setup(props, { emit }) {
    const start_sites = ref<{ id: number, name: string, manager: string }[]>([]);
    const startSiteCurrentPage = ref(1);
    const perPage = ref(10);
    const totalStartSites = ref(0);
    const localValue = ref<number | null>(props.modelValue === 0 ? null : props.modelValue);

    const placeholderText = ref('请选择运输起点');
    const allowClear = ref(true);  // 允许清除选项

    const fetchStartSites = async () => {
      try {
        const response = await getStartSites(perPage.value, startSiteCurrentPage.value);
        start_sites.value = response.data.start_sites;
        totalStartSites.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch start sites', error);
      }
    };

    const handleStartSitePageChange = (page: number) => {
      startSiteCurrentPage.value = page;
      fetchStartSites();
    };

    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue === null ? 0 : newValue);
    });

    watch(() => props.modelValue, (newValue) => {
      localValue.value = newValue === 0 ? null : newValue;
    });

    return {
      start_sites,
      startSiteCurrentPage,
      perPage,
      totalStartSites,
      fetchStartSites,
      handleStartSitePageChange,
      localValue,
      placeholderText,
      allowClear
    };
  },
});
</script>

<style scoped>
@import '@/assets/select.css'; /* 引入共享样式 */

.pagination-container {
  padding: 10px;
  text-align: center;
}
</style>
