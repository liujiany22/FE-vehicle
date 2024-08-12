<template>
    <el-select v-model="localValue" placeholder="请选择项目" @visible-change="fetchProjects" class="custom-select">
      <el-option
        v-for="item in projects"
        :key="item.id"
        :label="`${item.name} (${item.owner})`"
        :value="item.id">
      </el-option>
      <div class="pagination-container">
        <el-pagination @current-change="handleProjectPageChange" :current-page="projectCurrentPage"
          :page-size="perPage" layout="prev, pager, next" :total="totalProjects" />
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
        required: true
      }
    },
    setup(props, { emit }) {
      const projects = ref<{ id: number, name: string, owner: string }[]>([]);
      const projectCurrentPage = ref(1);
      const perPage = ref(10);
      const totalProjects = ref(0);
      const localValue = ref(props.modelValue);
  
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
  
      watch(() => props.modelValue, (newValue) => {
        localValue.value = newValue;
      });
  
      return {
        projects,
        projectCurrentPage,
        perPage,
        totalProjects,
        fetchProjects,
        handleProjectPageChange,
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
  