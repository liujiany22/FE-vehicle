<template>
    <div class="driver-excel">
      <el-card>
        <h2>司机对账表</h2>
        <el-form @submit.prevent="handleExport">
          <el-form-item label="车队">
            <FleetSelect v-model="filters.vehicle_id" />
          </el-form-item>
  
          <el-form-item label="时间范围" class="custom-date-picker">
            <el-date-picker v-model="filters.dateRange" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" />
          </el-form-item>
  
          <el-form-item>
            <el-button type="primary" @click="handleExport">导出</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue';
  import FleetSelect from '@/components/select/FleetSelect.vue';
  import { getDriverExcel } from '@/services/export';
  import { saveAs } from 'file-saver';
  
  export default defineComponent({
    name: 'DriverExcel',
    components: {
      FleetSelect,
    },
    setup() {
      const filters = ref({
        vehicle_id: 0,
        dateRange: [],
      });
  
      const handleExport = async () => {
        const exportData = {
          vehicle_id: filters.value.vehicle_id,
          start_date: filters.value.dateRange[0] ? new Date(filters.value.dateRange[0]).toISOString() : '',
          end_date: filters.value.dateRange[1] ? new Date(filters.value.dateRange[1]).toISOString() : '',
        };
  
        try {
          const exportResponse = await getDriverExcel(exportData);
          const blob = new Blob([exportResponse.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          saveAs(blob, 'driver_statement.xlsx');
        } catch (error) {
          console.error('Error exporting driver statement:', error);
        }
      };
  
      return {
        filters,
        handleExport,
      };
    },
  });
  </script>
  
  <style scoped>
  @import '@/assets/select.css';
  </style>
  