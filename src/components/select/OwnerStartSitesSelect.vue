<template>
  <el-select v-model="localValue" :placeholder="placeholderText" @visible-change="fetchStartSites"
    :filter-method="remoteMethod" class="custom-select" filterable clearable>

    <!-- 默认的取消选项 -->
    <el-option v-if="allowClear" :key="null" :label="placeholderText" :value="null">
    </el-option>

    <!-- 起点站点选项 -->
    <el-option v-for="site in currentStartSites" :key="site.id" :label="site.name" :value="site.id">
    </el-option>

    <!-- 分页控制 -->
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
    const currentStartSites = ref<{ id: number; name: string }[]>([]);
    const currentPage = ref(1);
    const perPage = ref(10);
    const totalStartSites = ref(0);
    const localValue = ref<number | null>(props.modelValue === 0 ? null : props.modelValue);
    const placeholderText = ref('请选择起点');
    const allowClear = ref(true);

    // 获取起点站点数据
    const fetchStartSites = async () => {
      try {
        const ownerName = props.ownerName || null;
        const projectId = props.project_id || null;
        const response = await getStartSites(ownerName, projectId, 10000000000, 1);
        startSites.value = response.data.start_sites;
        totalStartSites.value = startSites.value.length;
        handlePageChange(1); // 初始化分页
      } catch (error) {
        console.error('Failed to fetch start sites', error);
      }
    };

    // 分页处理
    const handlePageChange = (page: number) => {
      currentPage.value = page;
      currentStartSites.value = startSites.value.slice((currentPage.value - 1) * perPage.value, currentPage.value * perPage.value);
    };

    // 远程搜索方法
    const remoteMethod = async (query: string) => {
      try {
        const ownerName = props.ownerName || null;
        const projectId = props.project_id || null;
        const response = await getStartSites(ownerName, projectId, 1000000000, 1, query);
        startSites.value = response.data.start_sites;
        totalStartSites.value = startSites.value.length;
        handlePageChange(1); // 初始化分页
      } catch (error) {
        console.error('Failed to fetch start sites', error);
      }
    };

    // 监听 localValue 变化
    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue === null ? 0 : newValue);
    });

    // 监听 props 传入的值变化
    watch(() => props.modelValue, (newValue) => {
      localValue.value = newValue === 0 ? null : newValue;
    });

    // 监听 ownerName 或 project_id 的变化
    watch([() => props.ownerName, () => props.project_id], () => {
      localValue.value = null; // 恢复默认值
      fetchStartSites(); // 重新获取数据
    });

    return {
      startSites,
      currentStartSites,
      currentPage,
      perPage,
      totalStartSites,
      fetchStartSites,
      handlePageChange,
      localValue,
      placeholderText,
      allowClear,
      remoteMethod,
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
