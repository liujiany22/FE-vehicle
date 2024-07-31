<template>
  <el-select 
    v-model="localValue" 
    placeholder="请选择运输车队" 
    @visible-change="fetchFleets" 
    class="custom-select">
    <el-option 
      v-for="vehicle in vehicles" 
      :key="vehicle.id" 
      :label="`${vehicle.license} (${vehicle.driver})`" 
      :value="vehicle.id">
    </el-option>
    <div class="pagination-container">
      <el-pagination 
        @current-change="handleVehiclePageChange" 
        :current-page="vehicleCurrentPage" 
        :page-size="perPage" 
        layout="prev, pager, next" 
        :total="totalVehicles" />
    </div>
  </el-select>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { getFleets } from '@/services/transportService';

interface Vehicle {
  id: number;
  license: string;
  driver: string; // 添加 driver 字段
}

export default defineComponent({
  name: 'FleetSelect',
  props: {
    modelValue: {
      type: Number,
      required: true
    }
  },
  setup(props, { emit }) {
    const vehicles = ref<Vehicle[]>([]);
    const vehicleCurrentPage = ref(1);
    const perPage = ref(10);
    const totalVehicles = ref(0);
    const localValue = ref(props.modelValue);

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

    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue);
    });

    watch(() => props.modelValue, (newValue) => {
      localValue.value = newValue;
    });

    return {
      vehicles,
      vehicleCurrentPage,
      perPage,
      totalVehicles,
      fetchFleets,
      handleVehiclePageChange,
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
