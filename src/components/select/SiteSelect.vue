<template>
    <el-form-item :label="label">
      <el-select v-model="modelValue" placeholder="请选择" @visible-change="fetchSites">
        <el-option v-for="site in sites" :key="site.id" :label="site.name" :value="site.id"></el-option>
        <div class="pagination-container">
          <el-pagination @current-change="handlePageChange" :current-page="currentPage" :page-size="perPage"
            layout="prev, pager, next" :total="totalSites" />
        </div>
      </el-select>
    </el-form-item>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, watch } from 'vue';
  import { getStartSites, getEndSites } from '@/services/transportService';
  
  export default defineComponent({
    name: 'SiteSelect',
    props: {
      modelValue: {
        type: Number,
        required: true
      },
      label: {
        type: String,
        required: true
      },
      owner: {
        type: String,
        required: true
      },
      siteType: {
        type: String,
        required: true
      }
    },
    setup(props, { emit }) {
      const sites = ref<{ id: number, name: string }[]>([]);
      const currentPage = ref(1);
      const perPage = ref(10);
      const totalSites = ref(0);
  
      const fetchSites = async () => {
        try {
          const response = await (props.siteType === 'start'
            ? getStartSites(perPage.value, currentPage.value, props.owner)
            : getEndSites(perPage.value, currentPage.value, props.owner));
          sites.value = response.data[props.siteType === 'start' ? 'start_sites' : 'end_sites'];
          totalSites.value = response.data.total_pages * perPage.value;
        } catch (error) {
          console.error('Failed to fetch sites', error);
        }
      };
  
      const handlePageChange = (page: number) => {
        currentPage.value = page;
        fetchSites();
      };
  
      watch(() => props.modelValue, (newValue) => {
        emit('update:modelValue', newValue);
      });
  
      watch(() => props.owner, () => {
        fetchSites();
      });
  
      return {
        sites,
        currentPage,
        perPage,
        totalSites,
        fetchSites,
        handlePageChange
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
  