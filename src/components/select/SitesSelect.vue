<template>
  <el-select v-model="localValue" multiple placeholder="请选择运输工地名称" @visible-change="fetchSites" class="custom-select">
    <el-option
      v-for="item in sites"
      :key="item.id"
      :label="`${item.name} (${item.manager})`"
      :value="item.id">
    </el-option>
    <div class="pagination-container">
      <el-pagination @current-change="handleSitePageChange" :current-page="siteCurrentPage" 
        :page-size="perPage" layout="prev, pager, next" :total="totalSites" />
    </div>
  </el-select>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { getSites } from '@/services/transportService';

interface Site {
  id: number;
  name: string;
  manager: string; // 添加 manager 字段
}

export default defineComponent({
  name: 'SitesSelect',
  props: {
    modelValue: {
      type: Array as () => number[],
      required: true
    }
  },
  setup(props, { emit }) {
    const sites = ref<Site[]>([]);
    const siteCurrentPage = ref(1);
    const perPage = ref(10);
    const totalSites = ref(0);
    const localValue = ref<number[]>(props.modelValue);

    const fetchSites = async () => {
      try {
        const response = await getSites(perPage.value, siteCurrentPage.value);
        sites.value = response.data.site;
        totalSites.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch sites', error);
      }
    };

    const handleSitePageChange = (page: number) => {
      siteCurrentPage.value = page;
      fetchSites();
    };

    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue);
    });

    watch(() => props.modelValue, (newValue) => {
      localValue.value = newValue;
    });

    return {
      sites,
      siteCurrentPage,
      perPage,
      totalSites,
      fetchSites,
      handleSitePageChange,
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
