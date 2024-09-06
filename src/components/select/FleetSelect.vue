<template>
  <el-select 
    v-model="localValue" 
    :placeholder="placeholderText" 
    @visible-change="fetchFleets" 
    :filter-method="remoteMethod" 
    class="custom-select" 
    filterable 
    clearable>
    
    <!-- 默认的取消选项 -->
    <el-option v-if="allowClear" :key="null" :label="placeholderText" :value="null">
    </el-option>

    <!-- 车辆选项 -->
    <el-option v-for="vehicle in currentVehicles" :key="vehicle.id" :label="`${vehicle.license} (${vehicle.driver})`"
      :value="vehicle.id">
    </el-option>

    <!-- 分页控制 -->
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
    const currentVehicles = ref<Vehicle[]>([]);
    const vehicleCurrentPage = ref(1);
    const perPage = ref(10);
    const totalVehicles = ref(0);
    const localValue = ref<number | null>(props.modelValue === 0 ? null : props.modelValue);
    const placeholderText = ref('请选择运输车队');
    const allowClear = ref(true);  // 允许清除选项

    // 获取车队数据
    const fetchFleets = async () => {
      try {
        const response = await getFleets(10000000, 1); // 获取所有车辆数据
        vehicles.value = response.data.vehicle;
        totalVehicles.value = vehicles.value.length;
        handleVehiclePageChange(1); // 初始化分页
      } catch (error) {
        console.error('Failed to fetch fleets', error);
      }
    };

    // 分页处理
    const handleVehiclePageChange = (page: number) => {
      vehicleCurrentPage.value = page;
      currentVehicles.value = vehicles.value.slice((vehicleCurrentPage.value - 1) * perPage.value, vehicleCurrentPage.value * perPage.value);
    };

    // 远程搜索方法
    const remoteMethod = async (query: string) => {
      try {
        const response = await getFleets(10000000, 1, query); // 根据查询条件筛选
        vehicles.value = response.data.vehicle;
        totalVehicles.value = vehicles.value.length;
        handleVehiclePageChange(1); // 重置分页
      } catch (error) {
        console.error('Failed to fetch filtered fleets', error);
      }
    };

    // 监听 localValue 变化，并同步到父组件
    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue === null ? 0 : newValue);
    });

    // 监听 props 传入的值变化，同步至 localValue
    watch(() => props.modelValue, (newValue) => {
      localValue.value = newValue === 0 ? null : newValue;
    });

    return {
      vehicles,
      currentVehicles,
      vehicleCurrentPage,
      perPage,
      totalVehicles,
      fetchFleets,
      handleVehiclePageChange,
      localValue,
      placeholderText,
      allowClear,
      remoteMethod
    };
  }
});
</script>

<style scoped>
@import '@/assets/select.css';
/* 引入共享样式 */

.pagination-container {
  padding: 10px;
  text-align: center;
}
</style>
