<template>
  <div class="fleets-select">
    <div class="input-group">
      <el-select 
        v-model="selectedVehicleId" 
        filterable 
        placeholder="请选择车辆" 
        @visible-change="fetchFleets" 
        class="vehicle-select">
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
      <el-input 
        v-model="vehicleQuantity" 
        type="number" 
        placeholder="输入数量" 
        class="quantity-input" />
      <el-button 
        type="primary" 
        @click="addVehicle" 
        :disabled="!canAddVehicle">添加</el-button>
    </div>
    
    <div v-if="addedVehicles.length" class="added-vehicles-list">
      <h3>已添加的车辆</h3>
      <ul>
        <li v-for="(vehicle, index) in addedVehicles" :key="index">
          车辆: {{ vehicle.license }} - 数量: {{ vehicle.quantity }}
          <el-button type="danger" @click="removeVehicle(index)">删除</el-button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { getFleets } from '@/services/transportService';

interface Vehicle {
  id: number;
  license: string;
  driver: string;
}

export default defineComponent({
  name: 'FleetsSelect',
  props: {
    vehicleIds: {
      type: Array as () => number[],
      required: true
    },
    quantities: {
      type: Array as () => number[],
      required: true
    }
  },
  setup(props, { emit }) {
    const vehicles = ref<Vehicle[]>([]);
    const selectedVehicleId = ref<number | null>(null);
    const vehicleQuantity = ref<number | null>(null);
    const vehicleCurrentPage = ref(1);
    const perPage = ref(10);
    const totalVehicles = ref(0);
    const addedVehicles = ref<{ id: number; license: string; quantity: number }[]>([]);

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

    onMounted(() => {
      fetchFleets();
    });

    const canAddVehicle = computed(() => {
      return selectedVehicleId.value !== null && vehicleQuantity.value !== null && vehicleQuantity.value > 0;
    });

    const addVehicle = () => {
      if (canAddVehicle.value) {
        const vehicle = vehicles.value.find(v => v.id === selectedVehicleId.value);
        if (vehicle) {
          addedVehicles.value.push({
            id: vehicle.id,
            license: vehicle.license,
            quantity: vehicleQuantity.value as number
          });
          resetSelections();
        }
        emit('update:vehicleIds', addedVehicles.value.map(v => v.id));
        emit('update:quantities', addedVehicles.value.map(v => v.quantity));
      }
    };

    const resetSelections = () => {
      selectedVehicleId.value = null;
      vehicleQuantity.value = null;
    };

    const removeVehicle = (index: number) => {
      addedVehicles.value.splice(index, 1);
      emit('update:vehicleIds', addedVehicles.value.map(v => v.id));
      emit('update:quantities', addedVehicles.value.map(v => v.quantity));
    };

    return {
      vehicles,
      selectedVehicleId,
      vehicleQuantity,
      addedVehicles,
      vehicleCurrentPage,
      perPage,
      totalVehicles,
      fetchFleets,
      handleVehiclePageChange,
      addVehicle,
      removeVehicle,
      canAddVehicle
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
