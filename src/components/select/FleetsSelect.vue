<template>
  <div class="fleets-select">
    <div class="input-group">
      <el-select v-model="selectedVehicleId" filterable placeholder="请选择车辆" @visible-change="fetchFleets"
        class="vehicle-select" clearable>
        <el-option v-for="vehicle in vehicles" :key="vehicle.id" :label="`${vehicle.license} (${vehicle.driver})`"
          :value="vehicle.id">
        </el-option>
        <div class="pagination-container">
          <el-pagination @current-change="handleVehiclePageChange" :current-page="vehicleCurrentPage"
            :page-size="perPage" layout="prev, pager, next" :total="totalVehicles" />
        </div>
      </el-select>
      <el-input v-model="vehicleQuantity" type="number" placeholder="输入数量" class="quantity-input" />
      <el-button type="primary" @click="addVehicle" :disabled="!canAddVehicle" plain>添加</el-button>
    </div>

    <el-collapse v-if="addedVehicles.length" class="added-vehicles-list">
      <el-collapse-item title="已添加的车辆">
        <el-descriptions border column="1">
          <el-descriptions-item v-for="(vehicle, index) in addedVehicles" :key="index" :label="'车辆 ' + (index + 1)">
            <div style="display: flex; align-items: center;">
              <span>{{ vehicle.license }}({{vehicle.driver}})</span>
              <span style="margin-left: 20px;">数量: {{ vehicle.quantity }}</span>
              <el-button type="danger" @click="removeVehicle(index)" plain size="small" style="margin-left: 20px;">
                删除
              </el-button>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </el-collapse-item>
    </el-collapse>



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
    const addedVehicles = ref<{ id: number; license: string; driver: string; quantity: number }[]>([]);

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
            driver: vehicle.driver,
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
.input-group {
  display: flex;
  align-items: center;
  gap: 10px;
  /* 设置两个框之间的间距 */
}

.pagination-container {
  padding: 10px;
  text-align: center;
}

.vehicle-select {
  flex: 1;
  width: 220px;
}

.quantity-input {
  width: 220px;
}
</style>
