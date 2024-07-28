<template>
  <el-form-item label="运输终点">
    <el-select v-model="localValue" placeholder="请选择运输终点" @visible-change="fetchEndSites">
      <el-option v-for="item in end_sites" :key="item.id" :label="item.name" :value="item.id"></el-option>
      <div class="pagination-container">
        <el-pagination @current-change="handleEndSitePageChange" :current-page="endSiteCurrentPage" :page-size="perPage" layout="prev, pager, next" :total="totalEndSites" />
      </div>
    </el-select>
  </el-form-item>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { getEndSites } from '@/services/transportService';

export default defineComponent({
  name: 'EndSiteSelect',
  props: {
    modelValue: {
      type: Number,
      required: true
    }
  },
  setup(props, { emit }) {
    const end_sites = ref<{ id: number, name: string }[]>([]);
    const endSiteCurrentPage = ref(1);
    const perPage = ref(10);
    const totalEndSites = ref(0);
    const localValue = ref(props.modelValue);

    const fetchEndSites = async () => {
      try {
        const response = await getEndSites(perPage.value, endSiteCurrentPage.value);
        end_sites.value = response.data.end_sites;
        totalEndSites.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch end sites', error);
      }
    };

    const handleEndSitePageChange = (page: number) => {
      endSiteCurrentPage.value = page;
      fetchEndSites();
    };

    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue);
    });

    watch(() => props.modelValue, (newValue) => {
      localValue.value = newValue;
    });

    return {
      end_sites,
      endSiteCurrentPage,
      perPage,
      totalEndSites,
      fetchEndSites,
      handleEndSitePageChange,
      localValue
    };
  },
});
</script>

<style scoped>
.pagination-container {
  padding: 10px;
  text-align: center;
}
</style>
