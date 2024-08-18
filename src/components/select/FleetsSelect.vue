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
import { defineComponent, ref } from 'vue';
import { getFleets } from '@/services/transportService';

interface Vehicle {
  id: number;
  license: string;
  driver: string;
}

export default defineComponent({
  name: 'FleetsSelect',
  props: {
    modelValue: {
      type: Array as () => { id: number; quantity: number }[],
      required: true
    }
  },
  setup(props, { emit }) {
    const vehicles = ref<Vehicle[]>([]);
    const selectedVehicleId = ref<number | null>(null);
    const vehicleQuantity = ref<number | null>(null); // 默认为 null
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

    const canAddVehicle = ref(false);
    const validateAddVehicle = () => {
      canAddVehicle.value = selectedVehicleId.value !== null && vehicleQuantity.value !== null && vehicleQuantity.value > 0;
    };

    const addVehicle = () => {
      if (canAddVehicle.value) {
        const vehicle = vehicles.value.find(v => v.id === selectedVehicleId.value);
        if (vehicle) {
          addedVehicles.value.push({
            id: vehicle.id,
            license: vehicle.license,
            quantity: vehicleQuantity.value as number // 必定有值
          });
          selectedVehicleId.value = null;
          vehicleQuantity.value = null;
          emit('update:modelValue', addedVehicles.value);
        }
      }
    };

    const removeVehicle = (index: number) => {
      addedVehicles.value.splice(index, 1);
      emit('update:modelValue', addedVehicles.value);
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
      addVehicle,
      removeVehicle,
      canAddVehicle,
      validateAddVehicle
    };
  },
  watch: {
  selectedVehicleId: {
    handler: 'validateAddVehicle',
    immediate: true // 确保在组件挂载时立即验证
  },
  vehicleQuantity: {
    handler: 'validateAddVehicle',
    immediate: true // 确保在组件挂载时立即验证
  }
}

});
</script>

<style scoped>
@import '@/assets/select.css'; /* 引入共享样式 */

.fleets-select {
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.vehicle-select {
  width: 300px;
}

.quantity-input {
  width: 150px;
}

.added-vehicles-list {
  margin-top: 20px;
}

.added-vehicles-list ul {
  list-style-type: none;
  padding: 0;
}

.added-vehicles-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
}
</style>
