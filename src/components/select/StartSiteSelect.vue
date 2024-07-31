<template>
    <el-select v-model="localValue" placeholder="请选择运输起点" @visible-change="fetchStartSites" class="custom-select">
      <el-option v-for="item in start_sites" :key="item.id" :label="item.name" :value="item.id"></el-option>
      <div class="pagination-container">
        <el-pagination @current-change="handleStartSitePageChange" :current-page="startSiteCurrentPage"
          :page-size="perPage" layout="prev, pager, next" :total="totalStartSites" />
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
    const start_sites = ref<{ id: number, name: string }[]>([]);
    const startSiteCurrentPage = ref(1);
    const perPage = ref(10);
    const totalStartSites = ref(0);
    const localValue = ref(props.modelValue);

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
      emit('update:modelValue', newValue);
    });

    watch(() => props.modelValue, (newValue) => {
      localValue.value = newValue;
    });

    return {
      start_sites,
      startSiteCurrentPage,
      perPage,
      totalStartSites,
      fetchStartSites,
      handleStartSitePageChange,
      localValue
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