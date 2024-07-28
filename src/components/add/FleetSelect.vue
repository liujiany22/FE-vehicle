<template>
    <el-form-item label="运输车队">
      <el-select v-model="modelValue" placeholder="请选择运输车队" @visible-change="fetchFleets">
        <el-option v-for="item in vehicles" :key="item.id" :label="item.driver" :value="item.id"></el-option>
        <div class="pagination-container">
          <el-pagination @current-change="handleVehiclePageChange" :current-page="vehicleCurrentPage" :page-size="perPage" layout="prev, pager, next" :total="totalVehicles" />
        </div>
      </el-select>
    </el-form-item>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, watch } from 'vue';
  import { getFleets } from '@/services/transportService';
  
  export default defineComponent({
    name: 'FleetSelect',
    props: {
      modelValue: {
        type: Number,
        required: true
      }
    },
    setup(props, { emit }) {
      const vehicles = ref<{ id: number, driver: string }[]>([]);
      const vehicleCurrentPage = ref(1);
      const perPage = ref(10);
      const totalVehicles = ref(0);
  
      const fetchFleets = async () => {
        try {
          const response = await getFleets(perPage.value, vehicleCurrentPage.value);
          vehicles.value = response.data.vehicle;
          totalVehicles.value = response.data.total_pages * perPage.value;
        } catch (error) {
          console.error('Failed to fetch fleets', error);
        }
      };
  
      const handleVehiclePageChange = (page: number) => {
        vehicleCurrentPage.value = page;
        fetchFleets();
      };
  
      watch(() => props.modelValue, (newValue) => {
        emit('update:modelValue', newValue);
      });
  
      return {
        vehicles,
        vehicleCurrentPage,
        perPage,
        totalVehicles,
        fetchFleets,
        handleVehiclePageChange
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
  