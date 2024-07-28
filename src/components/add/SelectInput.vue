<!-- src/add/SelectInput.vue -->
<template>
    <el-form-item :label="label">
      <el-select v-model="selectValue" :placeholder="placeholder" @visible-change="fetchOptions">
        <el-option v-for="item in options" :key="item.id" :label="item.name" :value="item.id"></el-option>
        <div class="pagination-container">
          <el-pagination @current-change="handlePageChange" :current-page="currentPage" :page-size="pageSize" layout="prev, pager, next" :total="total" />
        </div>
      </el-select>
    </el-form-item>
  </template>
  
  <script lang="ts">
  import { defineComponent, toRefs, ref, watch, type PropType } from 'vue';
  
  export default defineComponent({
    name: 'SelectInput',
    props: {
      modelValue: {
        type: [String, Number],
        required: true
      },
      label: {
        type: String,
        required: true
      },
      placeholder: {
        type: String,
        required: false,
        default: ''
      },
      options: {
        type: Array as PropType<{ id: number; name: string }[]>,
        required: true
      },
      fetchOptions: {
        type: Function as PropType<() => void>,
        required: true
      },
      currentPage: {
        type: Number,
        required: true
      },
      pageSize: {
        type: Number,
        required: true
      },
      total: {
        type: Number,
        required: true
      },
      handlePageChange: {
        type: Function as PropType<(page: number) => void>,
        required: true
      }
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      const { modelValue, currentPage, pageSize, total, options } = toRefs(props);
  
      const selectValue = ref(modelValue.value);
      
      watch(modelValue, (newValue) => {
        selectValue.value = newValue;
      });
  
      const updateValue = (value: number | string) => {
        emit('update:modelValue', value);
      };
  
      return {
        selectValue,
        updateValue,
        currentPage,
        pageSize,
        total,
        options,
        fetchOptions: props.fetchOptions,
        handlePageChange: props.handlePageChange,
      };
    }
  });
  </script>
  
  <style scoped>
  .pagination-container {
    padding: 10px;
    text-align: center;
  }
  </style>
  