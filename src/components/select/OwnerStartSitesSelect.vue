<template>
  <el-select v-model="localValue" :placeholder="placeholderText" @visible-change="fetchStartSites"
    class="custom-select" filterable clearable>
    <el-option v-if="allowClear" :key="null" :label="placeholderText" :value="null">
    </el-option>

    <el-option v-for="site in filteredStartSites" :key="site.id" :label="site.name" :value="site.id">
    </el-option>

    <div class="pagination-container">
      <el-pagination @current-change="handlePageChange" :current-page="currentPage" :page-size="perPage"
        layout="prev, pager, next" :total="totalStartSites" />
    </div>
  </el-select>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { getStartSites } from '@/services/detailService';

export default defineComponent({
  name: 'OwnerStartSitesSelect',
  props: {
    ownerName: {
      type: String,
      required: false,
      default: ''
    },
    project_id: {
      type: Number,
      required: false,
      default: 0
    },
    modelValue: {
      type: Number,
      required: true
    },
  },
  setup(props, { emit }) {
    const startSites = ref<{ id: number; name: string }[]>([]);
    const currentPage = ref(1);
    const perPage = ref(10);
    const totalStartSites = ref(0);
    const localValue = ref<number | null>(props.modelValue === 0 ? null : props.modelValue);
    const searchQuery = ref('');
    const placeholderText = ref('请选择起点');
    const allowClear = ref(true);

    const fetchStartSites = async () => {
      try {
        const ownerName = props.ownerName || null;
        const projectId = props.project_id || null;
        const response = await getStartSites(ownerName, projectId, perPage.value, currentPage.value);
        startSites.value = response.data.start_sites;
        totalStartSites.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch start sites', error);
      }
    };

    const handlePageChange = (page: number) => {
      currentPage.value = page;
      fetchStartSites();
    };

    const handleInput = (query: string) => {
      searchQuery.value = query;
      filterStartSites();
    };

    const filterStartSites = () => {
      return startSites.value.filter(site =>
        site.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    };

    const filteredStartSites = ref(filterStartSites());

    watch([searchQuery, startSites], () => {
      filteredStartSites.value = filterStartSites();
    });

    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue === null ? 0 : newValue);
    });

    watch(() => props.modelValue, (newValue) => {
      localValue.value = newValue === 0 ? null : newValue;
    });

    watch([() => props.ownerName, () => props.project_id], () => {
      localValue.value = null; // 恢复默认值
      searchQuery.value = '';  // 清空搜索查询
      fetchStartSites();
    });

    return {
      startSites,
      currentPage,
      perPage,
      totalStartSites,
      fetchStartSites,
      handlePageChange,
      localValue,
      placeholderText,
      allowClear,
      handleInput,
      filteredStartSites
    };
  }
});
</script>

<style scoped>
@import '@/assets/select.css';

.pagination-container {
  padding: 10px;
  text-align: center;
}
</style>
