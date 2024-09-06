<template>
  <el-select v-model="localValue" :placeholder="placeholderText" @visible-change="fetchProjects" class="custom-select"
    filterable clearable>
    <!-- 默认的取消选项 -->
    <el-option v-if="allowClear" :key="null" :label="placeholderText" :value="null">
    </el-option>

    <el-option v-for="project in filteredProjects" :key="project.id" :label="project.name" :value="project.id">
    </el-option>

    <div class="pagination-container">
      <el-pagination @current-change="handlePageChange" :current-page="currentPage" :page-size="perPage"
        layout="prev, pager, next" :total="totalProjects" />
    </div>
  </el-select>
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
  },
  setup(props, { emit }) {
    const projects = ref<{ id: number; name: string }[]>([]);
    const currentPage = ref(1);
    const perPage = ref(10);
    const totalProjects = ref(0);
    const localValue = ref<number | null>(props.modelValue === 0 ? null : props.modelValue);
    const searchQuery = ref(''); // 存储搜索查询
    const placeholderText = ref('请选择项目');
    const allowClear = ref(true);  // 允许清除选项

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

    const handleInput = (query: string) => {
      searchQuery.value = query;
      filterProjects();
    };

    const filterProjects = () => {
      return projects.value.filter(project =>
        project.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    };

    const filteredProjects = ref(filterProjects());

    watch([searchQuery, projects], () => {
      filteredProjects.value = filterProjects();
    });

    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue === null ? 0 : newValue);
    });

    watch(() => props.modelValue, (newValue) => {
      localValue.value = newValue === 0 ? null : newValue;
    });

    watch(() => props.ownerName, () => {
      localValue.value = null; // 恢复默认值
      searchQuery.value = ''; // 清空搜索查询
      fetchProjects();
    });

    return {
      projects,
      currentPage,
      perPage,
      totalProjects,
      fetchProjects,
      handlePageChange,
      localValue,
      placeholderText,
      allowClear,
      handleInput,
      filteredProjects
    };
  }
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