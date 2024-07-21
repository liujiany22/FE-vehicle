<template>
    <div class="site-reconciliation-report">
      <el-card>
        <h2>工地日对账表</h2>
        <el-form @submit.prevent="fetchReconciliationReport">
          <el-form-item label="时间段">
            <el-date-picker v-model="filters.dateRange" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
          </el-form-item>
          <el-form-item label="老板名">
            <el-select v-model="filters.ownerName" placeholder="请选择老板名">
              <el-option v-for="item in owners" :key="item.id" :label="item.ownerName" :value="item.ownerName"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="工地">
            <el-select v-model="filters.site" placeholder="请选择工地">
              <el-option v-for="item in sites" :key="item.id" :label="item.name" :value="item.name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="显示方式">
            <el-radio-group v-model="filters.displayBy">
              <el-radio label="day">按天</el-radio>
              <el-radio label="month">按月</el-radio>
              <el-radio label="range">按时间段</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchReconciliationReport">生成对账表</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="reportData" style="width: 100%">
          <el-table-column prop="date" label="日期"></el-table-column>
          <el-table-column prop="startPoint" label="起点工地"></el-table-column>
          <el-table-column prop="endPoint" label="终点工地"></el-table-column>
          <el-table-column prop="category" label="运输品类"></el-table-column>
          <el-table-column prop="quantity" label="数量"></el-table-column>
          <el-table-column prop="totalPrice" label="总价"></el-table-column>
        </el-table>
      </el-card>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue';
  import { getSiteOwners, getTransportStartPoints, getTransportEndPoints, getReconciliationReport } from '@/services/transportService';
  
  export default defineComponent({
    name: 'SiteReconciliationReport',
    setup() {
      const owners = ref<{ id: number, ownerName: string }[]>([]);
      const startPoints = ref<{ id: number, name: string }[]>([]);
      const endPoints = ref<{ id: number, name: string }[]>([]);
      const sites = ref<{ id: number, name: string }[]>([]);
      const filters = ref({
        dateRange: [],
        ownerName: '',
        site: '',
        displayBy: 'day' as 'day' | 'month' | 'range',
      });
      const reportData = ref<any[]>([]);
  
      const fetchOwners = async () => {
        try {
          const response = await getSiteOwners();
          owners.value = response.data;
        } catch (error) {
          console.error('Failed to fetch owners', error);
        }
      };
  
      const fetchStartPoints = async () => {
        try {
          const response = await getTransportStartPoints();
          startPoints.value = response.data;
          combineSites();
        } catch (error) {
          console.error('Failed to fetch start points', error);
        }
      };
  
      const fetchEndPoints = async () => {
        try {
          const response = await getTransportEndPoints();
          endPoints.value = response.data;
          combineSites();
        } catch (error) {
          console.error('Failed to fetch end points', error);
        }
      };
  
      const combineSites = () => {
        const combinedSites = [...startPoints.value, ...endPoints.value];
        const uniqueSites = Array.from(new Set(combinedSites.map(site => site.name))).map(name => {
          return combinedSites.find(site => site.name === name);
        });
        sites.value = uniqueSites;
      };
  
      const fetchReconciliationReport = async () => {
        try {
          const response = await getReconciliationReport({
            startDate: filters.value.dateRange[0],
            endDate: filters.value.dateRange[1],
            ownerName: filters.value.ownerName,
            site: filters.value.site,
            displayBy: filters.value.displayBy,
          });
          reportData.value = response.data;
        } catch (error) {
          console.error('Failed to fetch reconciliation report', error);
        }
      };
  
      onMounted(() => {
        fetchOwners();
        fetchStartPoints();
        fetchEndPoints();
      });
  
      return {
        owners,
        sites,
        filters,
        reportData,
        fetchReconciliationReport,
      };
    },
  });
  </script>
  
  <style scoped>
  .site-reconciliation-report {
    padding: 20px;
  }
  
  .el-card {
    margin-bottom: 20px;
  }
  
  .el-form-item {
    margin-bottom: 20px;
  }
  </style>
  