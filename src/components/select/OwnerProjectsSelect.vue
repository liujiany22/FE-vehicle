<template>
  <el-select v-model="localValue" :placeholder="placeholderText" @visible-change="fetchProjects"
    :filter-method="remoteMethod" class="custom-select" filterable clearable>

    <!-- 默认的取消选项 -->
    <el-option v-if="allowClear" :key="null" :label="placeholderText" :value="null">
    </el-option>

    <!-- 项目选项 -->
    <el-option v-for="project in currentProjects" :key="project.id" :label="project.name" :value="project.id">
    </el-option>

    <!-- 分页控制 -->
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
    const currentProjects = ref<{ id: number; name: string }[]>([]);
    const currentPage = ref(1);
    const perPage = ref(10);
    const totalProjects = ref(0);
    const localValue = ref<number | null>(props.modelValue === 0 ? null : props.modelValue);
    const placeholderText = ref('请选择项目');
    const allowClear = ref(true);  // 允许清除选项

    // 获取项目数据
    const fetchProjects = async () => {
      try {
        const ownerName = props.ownerName || null;  // 如果没有提供 ownerName 则传 null
        const response = await getOwner2Projects(ownerName, 100000000, 1);
        projects.value = response.data.project;
        totalProjects.value = projects.value.length;
        handlePageChange(1);  // 初始化分页
      } catch (error) {
        console.error('Failed to fetch projects', error);
      }
    };

    // 分页处理
    const handlePageChange = (page: number) => {
      currentPage.value = page;
      currentProjects.value = projects.value.slice((currentPage.value - 1) * perPage.value, currentPage.value * perPage.value);
    };

    // 远程搜索方法
    const remoteMethod = async (query: string) => {

      try {
        const ownerName = props.ownerName || null;  // 如果没有提供 ownerName 则传 null
        const response = await getOwner2Projects(ownerName, 1000000000, 1, query);
        projects.value = response.data.project;
        totalProjects.value = projects.value.length;
        handlePageChange(1);  // 初始化分页
      } catch (error) {
        console.error('Failed to fetch projects', error);
      }
    };

    // 监听 localValue 变化，更新父组件的值
    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue === null ? 0 : newValue);
    });

    // 监听 props 变化，同步 localValue
    watch(() => props.modelValue, (newValue) => {
      localValue.value = newValue === 0 ? null : newValue;
    });

    // 监听 ownerName 变化时，重新获取项目数据
    watch(() => props.ownerName, () => {
      localValue.value = null; // 重置选择
      fetchProjects();  // 根据新的 ownerName 重新获取项目
    });

    return {
      projects,
      currentProjects,
      currentPage,
      perPage,
      totalProjects,
      fetchProjects,
      handlePageChange,
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
</style>
