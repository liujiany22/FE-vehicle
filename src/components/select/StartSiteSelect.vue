<template>
  <el-select v-model="localValue" :placeholder="placeholderText" @visible-change="fetchStartSites"
    :filter-method="remoteMethod" class="custom-select" filterable clearable>

    <!-- 默认的取消选项 -->
    <el-option v-if="allowClear" :key="null" :label="placeholderText" :value="null">
    </el-option>

    <!-- 显示起点站 -->
    <el-option v-for="item in currentStartSites" :key="item.id"
      :label="`${item.name} ${item.manager ? `(${item.manager})` : ''}`" :value="item.id">
    </el-option>

    <!-- 分页 -->
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
    },
    project_id: {
      type: Number,
      required: false,
      default: 0
    },
  },
  setup(props, { emit }) {
    const start_sites = ref<{ id: number, name: string, manager: string }[]>([]);
    const currentStartSites = ref<{ id: number, name: string, manager: string }[]>([]);
    const startSiteCurrentPage = ref(1);
    const perPage = ref(10);
    const totalStartSites = ref(0);
    const localValue = ref<number | null>(props.modelValue === 0 ? null : props.modelValue);
    const placeholderText = ref('请选择运输起点');
    const allowClear = ref(true);  // 允许清除选项

    // 获取起点站数据
    const fetchStartSites = async () => {
      try {
        const project_id = props.project_id || undefined;
        const response = await getStartSites(10000000, 1, undefined, undefined, project_id);  // 获取所有起点站数据
        start_sites.value = response.data.start_sites;
        totalStartSites.value = start_sites.value.length;
        handleStartSitePageChange(1); // 初始化分页
      } catch (error) {
        console.error('Failed to fetch start sites', error);
      }
    };

    // 分页处理
    const handleStartSitePageChange = (page: number) => {
      startSiteCurrentPage.value = page;
      currentStartSites.value = start_sites.value.slice((startSiteCurrentPage.value - 1) * perPage.value, startSiteCurrentPage.value * perPage.value);
    };

    // 远程筛选方法
    const remoteMethod = async (query: string) => {
      try {
        const project_id = props.project_id || undefined;
        const response = await getStartSites(10000000, 1, undefined, query, project_id); // 根据查询条件筛选
        start_sites.value = response.data.start_sites;
        totalStartSites.value = start_sites.value.length;
        handleStartSitePageChange(1); // 重置分页
      } catch (error) {
        console.error('Failed to fetch filtered start sites', error);
      }
    };

    // 监听本地值变化
    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue === null ? 0 : newValue);
    });

    // 监听 props 传入的值变化
    watch(() => props.modelValue, (newValue) => {
      localValue.value = newValue === 0 ? null : newValue;
    });

    return {
      start_sites,
      currentStartSites,
      startSiteCurrentPage,
      perPage,
      totalStartSites,
      fetchStartSites,
      handleStartSitePageChange,
      remoteMethod,
      localValue,
      placeholderText,
      allowClear
    };
  },
});
</script>

<style scoped>
@import '@/assets/select.css';
/* 引入共享样式 */

.pagination-container {
  padding: 10px;
  text-align: center;
}
</style>
