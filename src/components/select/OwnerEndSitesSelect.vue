<template>
  <el-select v-model="localValue" :placeholder="placeholderText" @visible-change="fetchEndSites" class="custom-select"
    filterable clearable>
    <el-option v-if="allowClear" :key="null" :label="placeholderText" :value="null">
    </el-option>

    <el-option v-for="site in filteredEndSites" :key="site.id" :label="site.name" :value="site.id">
    </el-option>

    <div class="pagination-container">
      <el-pagination @current-change="handlePageChange" :current-page="currentPage" :page-size="perPage"
        layout="prev, pager, next" :total="totalEndSites" />
    </div>
  </el-select>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { getEndSites } from '@/services/detailService';

export default defineComponent({
  name: 'OwnerEndSitesSelect',
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
    const endSites = ref<{ id: number; name: string }[]>([]);
    const currentPage = ref(1);
    const perPage = ref(10);
    const totalEndSites = ref(0);
    const localValue = ref<number | null>(props.modelValue === 0 ? null : props.modelValue);
    const searchQuery = ref('');
    const placeholderText = ref('请选择终点');
    const allowClear = ref(true);

    const fetchEndSites = async () => {
      try {
        const ownerName = props.ownerName || null;
        const projectId = props.project_id || null;
        const response = await getEndSites(ownerName, projectId, perPage.value, currentPage.value);
        endSites.value = response.data.end_sites;
        totalEndSites.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch end sites', error);
      }
    };

    const handlePageChange = (page: number) => {
      currentPage.value = page;
      fetchEndSites();
    };

    const handleInput = (query: string) => {
      searchQuery.value = query;
      filterEndSites();
    };

    const filterEndSites = () => {
      return endSites.value.filter(site =>
        site.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    };

    const filteredEndSites = ref(filterEndSites());

    watch([searchQuery, endSites], () => {
      filteredEndSites.value = filterEndSites();
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
      fetchEndSites();         // 重新获取终点站列表
    });

    return {
      endSites,
      currentPage,
      perPage,
      totalEndSites,
      fetchEndSites,
      handlePageChange,
      localValue,
      placeholderText,
      allowClear,
      handleInput,
      filteredEndSites
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
