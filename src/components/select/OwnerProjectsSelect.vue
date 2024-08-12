<template>
    <el-form-item :label="label">
      <el-select v-model="localValue" placeholder="请选择项目" @visible-change="fetchProjects" class="custom-select">
        <el-option v-for="project in projects" :key="project.id" :label="project.name" :value="project.id"></el-option>
        <div class="pagination-container">
          <el-pagination @current-change="handlePageChange" :current-page="currentPage" :page-size="perPage"
            layout="prev, pager, next" :total="totalProjects" />
        </div>
      </el-select>
    </el-form-item>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, watch } from 'vue';
  import { getOwner2Projects } from '@/services/detailService';
  
  export default defineComponent({
    name: 'OwnerProjectsSelect',
    props: {
      ownerName: {
        type: String,
        required: false,
        default: ''
      },
      modelValue: {
        type: Number,
        required: true
      },
      label: {
        type: String,
        required: true
      }
    },
    setup(props, { emit }) {
      const projects = ref<{ id: number; name: string }[]>([]);
      const currentPage = ref(1);
      const perPage = ref(10);
      const totalProjects = ref(0);
      const localValue = ref(props.modelValue);
  
      const fetchProjects = async () => {
        try {
          const ownerName = props.ownerName || null;  // 如果未提供ownerName，则传递null
          const response = await getOwner2Projects(ownerName, perPage.value, currentPage.value);
          projects.value = response.data.project;
          totalProjects.value = response.data.total_pages * perPage.value;
        } catch (error) {
          console.error('Failed to fetch projects', error);
        }
      };
  
      const handlePageChange = (page: number) => {
        currentPage.value = page;
        fetchProjects();
      };
  
      watch(localValue, (newValue) => {
        emit('update:modelValue', newValue);
      });
  
      watch(() => props.modelValue, (newValue) => {
        localValue.value = newValue;
      });
  
      watch(() => props.ownerName, () => {
        fetchProjects();
      });
  
      return {
        projects,
        currentPage,
        perPage,
        totalProjects,
        fetchProjects,
        handlePageChange,
        localValue
      };
    }
  });
  </script>
  
  <style scoped>
  @import '@/assets/select.css'; /* 引入共享样式 */
  
  .pagination-container {
    padding: 10px;
    text-align: center;
  }
  </style>
  