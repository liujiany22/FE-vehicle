<template>
  <el-select v-model="localValue" placeholder="请选择项目" @visible-change="fetchProjects" class="custom-select" clearable>
    <!-- 默认的取消选项 -->
    <el-option v-if="allowClear" :key="null" :label="placeholderText" :value="null">
    </el-option>
    <el-option v-for="item in projects" :key="item.id" :label="`${item.name} (${item.owner})`" :value="item.id">
    </el-option>
    <div class="pagination-container">
      <el-pagination @current-change="handleProjectPageChange" :current-page="projectCurrentPage" :page-size="perPage"
        layout="prev, pager, next" :total="totalProjects" />
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
    const projectCurrentPage = ref(1);
    const perPage = ref(10);
    const totalProjects = ref(0);
    const localValue = ref<number | null>(props.modelValue === 0 ? null : props.modelValue);
    const placeholderText = ref('请选择运输起点');
    const allowClear = ref(true);  // 允许清除选项

    const fetchProjects = async () => {
      try {
        const response = await getProjectOwners(perPage.value, projectCurrentPage.value);
        projects.value = response.data.projects;
        totalProjects.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch projects', error);
      }
    };

    const handleProjectPageChange = (page: number) => {
      projectCurrentPage.value = page;
      fetchProjects();
    };

    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue);
    });

    watch(
      () => props.modelValue,
      (newValue) => {
        localValue.value = newValue === 0 ? null : newValue;
      }
    );

    return {
      projects,
      projectCurrentPage,
      perPage,
      totalProjects,
      fetchProjects,
      handleProjectPageChange,
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
