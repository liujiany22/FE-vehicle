<template>
  <el-select 
    v-model="localValue" 
    :placeholder="placeholderText" 
    @visible-change="fetchFleets" 
    @input="handleInput"
    class="custom-select"
    filterable
    clearable>
    <!-- 默认的取消选项 -->
    <el-option 
      v-if="allowClear" 
      :key="null" 
      :label="placeholderText" 
      :value="null">
    </el-option>

    <el-option 
      v-for="vehicle in filteredVehicles" 
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
  driver: string;
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
    const localValue = ref<number | null>(props.modelValue === 0 ? null : props.modelValue);
    const searchQuery = ref(''); // 存储搜索查询
    const placeholderText = ref('请选择运输车队');
    const allowClear = ref(true);  // 允许清除选项

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

    const handleInput = (query: string) => {
      searchQuery.value = query;
      filterVehicles();
    };

    const filterVehicles = () => {
      return vehicles.value.filter(vehicle => 
        vehicle.license.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        vehicle.driver.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    };

    const filteredVehicles = ref(filterVehicles());

    watch([searchQuery, vehicles], () => {
      filteredVehicles.value = filterVehicles();
    });

    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue === null ? 0 : newValue);
    });

    watch(() => props.modelValue, (newValue) => {
      localValue.value = newValue === 0 ? null : newValue;
    });

    return {
      vehicles,
      vehicleCurrentPage,
      perPage,
      totalVehicles,
      fetchFleets,
      handleVehiclePageChange,
      localValue,
      placeholderText,
      allowClear,
      handleInput,
      filteredVehicles
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
