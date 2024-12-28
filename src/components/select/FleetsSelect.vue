<template>
  <div class="fleets-select">
    <div class="input-group">
      <el-select v-model="selectedVehicleId" filterable placeholder="请选择车辆" @visible-change="fetchFleets"
        class="vehicle-select" clearable :filter-method="remoteMethod">
        <el-option v-for="vehicle in currentVehicles" :key="vehicle.id"
          :label="`${vehicle.license} (${vehicle.driver})`" :value="vehicle.id"></el-option>
        <div class="pagination-container">
          <el-pagination @current-change="handleVehiclePageChange" :current-page="vehicleCurrentPage"
            :page-size="perPage" layout="prev, pager, next" :total="totalVehicles" />
        </div>
      </el-select>
      <el-input v-model="vehicleQuantity" type="number" placeholder="输入数量" class="quantity-input" />
      <el-button type="primary" @click="addVehicle" :disabled="!canAddVehicle" plain>
        添加
      </el-button>
    </div>

    <el-collapse v-if="addedVehicles.length" class="added-vehicles-list">
      <el-collapse-item title="已添加的车辆">
        <el-descriptions border column="1">
          <el-descriptions-item v-for="(vehicle, index) in addedVehicles" :key="index" :label="'车辆 ' + (index + 1)">
            <div style="display: flex; align-items: center;">
              <span>{{ vehicle.license }}({{ vehicle.driver }})</span>
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
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
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
  emits: ['update:vehicleIds', 'update:quantities'],
  setup(props, { emit }) {
    const vehicles = ref<Vehicle[]>([]);
    const currentVehicles = ref<Vehicle[]>([]);
    const selectedVehicleId = ref<number | null>(null);
    const vehicleQuantity = ref<number | null>(null);
    const vehicleCurrentPage = ref(1);
    const perPage = ref(10);
    const totalVehicles = ref(0);
    const addedVehicles = ref<{ id: number; license: string; driver: string; quantity: number }[]>([]);

    // 异步获取车辆列表
    const fetchFleets = async () => {
      try {
        const response = await getFleets(1000000000, 1);
        vehicles.value = response.data.vehicle;
        totalVehicles.value = vehicles.value.length;
        handleVehiclePageChange(1);
      } catch (error) {
        console.error('Failed to fetch fleets', error);
      }
    };

    // 远程搜索车辆的方法
    const remoteMethod = async (query: string) => {
      try {
        const response = await getFleets(1000000000, 1, query);
        vehicles.value = response.data.vehicle;
        totalVehicles.value = vehicles.value.length;
        handleVehiclePageChange(1);
      } catch (error) {
        console.error('Failed to fetch fleets', error);
      }
    };

    // 处理车辆分页
    const handleVehiclePageChange = (page: number) => {
      vehicleCurrentPage.value = page;
      currentVehicles.value = vehicles.value.slice(
        (vehicleCurrentPage.value - 1) * perPage.value,
        vehicleCurrentPage.value * perPage.value
      );
    };

    // 计算是否可以添加车辆
    const canAddVehicle = computed(() => {
      return selectedVehicleId.value !== null && vehicleQuantity.value !== null && vehicleQuantity.value > 0;
    });

    // 添加车辆到已添加列表
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
          emit('update:vehicleIds', addedVehicles.value.map(v => v.id));
          emit('update:quantities', addedVehicles.value.map(v => v.quantity));
        }
      }
    };

    // 重置选择
    const resetSelections = () => {
      selectedVehicleId.value = null;
      vehicleQuantity.value = null;
    };

    // 删除已添加的车辆
    const removeVehicle = (index: number) => {
      addedVehicles.value.splice(index, 1);
      emit('update:vehicleIds', addedVehicles.value.map(v => v.id));
      emit('update:quantities', addedVehicles.value.map(v => v.quantity));
    };

    // 初始化已添加的车辆
    const initializeAddedVehicles = () => {
      addedVehicles.value = [];
      props.vehicleIds.forEach((id, index) => {
        const vehicle = vehicles.value.find(v => v.id === id);
        if (vehicle && props.quantities[index]) {
          addedVehicles.value.push({
            id: vehicle.id,
            license: vehicle.license,
            driver: vehicle.driver,
            quantity: props.quantities[index]
          });
        }
      });
    };

    // 监听 vehicles 数据加载完成后初始化已添加车辆
    watch(vehicles, (newVehicles) => {
      if (newVehicles.length > 0 && props.vehicleIds.length > 0) {
        initializeAddedVehicles();
      }
    });

    // 监听 props.vehicleIds 和 props.quantities 的变化以更新已添加车辆
    watch(
      () => [props.vehicleIds, props.quantities],
      ([newVehicleIds, newQuantities]) => {
        initializeAddedVehicles();
      },
      { deep: true }
    );

    // 组件挂载时获取车辆数据并初始化已添加车辆
    onMounted(async () => {
      await fetchFleets();
      initializeAddedVehicles();
    });

    return {
      vehicles,
      selectedVehicleId,
      vehicleQuantity,
      addedVehicles,
      vehicleCurrentPage,
      perPage,
      currentVehicles,
      totalVehicles,
      fetchFleets,
      handleVehiclePageChange,
      addVehicle,
      removeVehicle,
      canAddVehicle,
      remoteMethod
    };
  }
});
</script>
