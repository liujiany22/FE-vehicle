<template>
  <el-select 
    v-model="localValue" 
    :placeholder="placeholderText" 
    @visible-change="fetchProjects" 
    :filter-method="remoteMethod" 
    class="custom-select" 
    clearable
    filterable>
    
    <!-- 默认的取消选项 -->
    <el-option 
      v-if="allowClear" 
      :key="null" 
      :label="placeholderText" 
      :value="null">
    </el-option>
    
    <!-- 项目选项 -->
    <el-option 
      v-for="item in currentProjects" 
      :key="item.id" 
      :label="`${item.name} (${item.owner})`" 
      :value="item.id">
    </el-option>

    <!-- 分页控制 -->
    <div class="pagination-container" v-if="totalProjects > perPage">
      <el-pagination 
        @current-change="handleProjectPageChange" 
        :current-page="projectCurrentPage" 
        :page-size="perPage" 
        layout="prev, pager, next" 
        :total="totalProjects" />
    </div>
  </el-select>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { getProjectOwners } from '@/services/transportService';

export default defineComponent({
  name: 'ProjectSelect',
  props: {
    modelValue: {
      type: Number,
      required: true,
    },
  },
  setup(props, { emit }) {
    const projects = ref<{ id: number; name: string; owner: string }[]>([]);
    const currentProjects = ref<{ id: number; name: string; owner: string }[]>([]);
    const projectCurrentPage = ref(1);
    const perPage = ref(10);
    const totalProjects = ref(0);
    const localValue = ref<number | null>(props.modelValue || null);  // 优化初始化
    const placeholderText = ref('请选择项目');
    const allowClear = ref(true);  // 动态设置可清除

    // 拉取项目数据
    const fetchProjects = async (query: string = '') => {
      try {
        const response = await getProjectOwners(10000000, 1, query); // 拉取所有项目数据
        projects.value = response.data.projects;
        totalProjects.value = projects.value.length;
        handleProjectPageChange(1); // 初始化分页
      } catch (error) {
        console.error('Failed to fetch projects', error);
      }
    };

    // 分页处理
    const handleProjectPageChange = (page: number) => {
      projectCurrentPage.value = page;
      currentProjects.value = projects.value.slice((projectCurrentPage.value - 1) * perPage.value, projectCurrentPage.value * perPage.value);
    };

    // 远程搜索
    const remoteMethod = async (query: string) => {
      try {
        const response = await getProjectOwners(10000000, 1, query); // 根据查询条件筛选项目
        projects.value = response.data.projects;
        totalProjects.value = projects.value.length;
        handleProjectPageChange(1); // 重置分页
      } catch (error) {
        console.error('Failed to fetch filtered projects', error);
      }
    };

    // 监听 localValue 变化，并同步到父组件
    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue === null ? 0 : newValue);
    });

    // 监听 props 变化，同步至 localValue
    watch(() => props.modelValue, (newValue) => {
      localValue.value = newValue === 0 ? null : newValue;
    });

    return {
      projects,
      currentProjects,
      projectCurrentPage,
      perPage,
      totalProjects,
      fetchProjects,
      handleProjectPageChange,
      localValue,
      placeholderText,
      allowClear,
      remoteMethod,
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

.el-select .custom-select .el-select-dropdown__list {
  max-height: 300px;
  overflow-y: auto;
}
</style>
