<template>
    <el-form-item :label="label">
      <el-select v-model="modelValue" :placeholder="placeholder" @visible-change="fetchOptions">
        <el-option v-for="item in options" :key="item.id" :label="item.name" :value="item.id"></el-option>
        <div class="pagination-container">
          <el-pagination @current-change="handlePageChange" :current-page="currentPage" :page-size="pageSize" layout="prev, pager, next" :total="totalOptions" />
        </div>
      </el-select>
    </el-form-item>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, watch } from 'vue';
  
  export default defineComponent({
    name: 'SelectInputField',
    props: {
      modelValue: {
        type: [String, Number],
        required: true,
      },
      label: {
        type: String,
        required: true,
      },
      placeholder: {
        type: String,
        required: true,
      },
      fetchOptions: {
        type: Function,
        required: true,
      },
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      const options = ref<{ id: number, name: string }[]>([]);
      const currentPage = ref(1);
      const pageSize = ref(10);
      const totalOptions = ref(0);
  
      const loadOptions = async () => {
        const response = await props.fetchOptions(pageSize.value, currentPage.value);
        options.value = response.data.items;
        totalOptions.value = response.data.total_pages * pageSize.value;
      };
  
      const handlePageChange = (page: number) => {
        currentPage.value = page;
        loadOptions();
      };
  
      watch(currentPage, loadOptions, { immediate: true });
  
      return {
        options,
        currentPage,
        pageSize,
        totalOptions,
        handlePageChange,
      };
    },
  });
  </script>
  
  <style scoped>
  .pagination-container {
    padding: 10px;
    text-align: center;
  }
  </style>
  