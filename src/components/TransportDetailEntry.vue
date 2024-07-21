<template>
  <div class="transport-detail-entry">
    <el-card>
      <h2>运输明细录入</h2>
      <el-form @submit.prevent="addTransportDetail">
        <el-form-item label="运输起点">
          <el-select v-model="form.startsite_id" placeholder="请选择运输起点" @change="handleStartPointChange"
            @visible-change="handleStartPointVisibleChange">
            <el-option v-for="item in startPoints" :key="item.id" :label="item.name" :value="item.id"></el-option>
            <div class="pagination-container">
              <el-pagination @current-change="handleStartPointPageChange" :current-page="startPointCurrentPage"
                :page-size="perPage" layout="prev, pager, next" :total="totalStartPoints" />
            </div>
          </el-select>
        </el-form-item>
        <el-form-item label="运输终点">
          <el-select v-model="form.endsite_id" placeholder="请选择运输终点" @change="handleEndPointChange"
            @visible-change="handleEndPointVisibleChange">
            <el-option v-for="item in endPoints" :key="item.id" :label="item.name" :value="item.id"></el-option>
            <div class="pagination-container">
              <el-pagination @current-change="handleEndPointPageChange" :current-page="endPointCurrentPage"
                :page-size="perPage" layout="prev, pager, next" :total="totalEndPoints" />
            </div>
          </el-select>
        </el-form-item>
        <el-form-item label="运输车队">
          <el-select v-model="form.vehicle_id" placeholder="请选择运输车队" @change="handleFleetChange"
            @visible-change="handleFleetVisibleChange">
            <el-option v-for="item in fleets" :key="item.id" :label="item.license" :value="item.id"></el-option>
            <div class="pagination-container">
              <el-pagination @current-change="handleFleetPageChange" :current-page="fleetCurrentPage"
                :page-size="perPage" layout="prev, pager, next" :total="totalFleets" />
            </div>
          </el-select>
        </el-form-item>
        <el-form-item label="运输品类">
          <el-select v-model="form.goods_id" placeholder="请选择运输品类" @change="handleCategoryChange"
            @visible-change="handleCategoryVisibleChange">
            <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id"></el-option>
            <div class="pagination-container">
              <el-pagination @current-change="handleCategoryPageChange" :current-page="categoryCurrentPage"
                :page-size="perPage" layout="prev, pager, next" :total="totalCategories" />
            </div>
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker v-model="form.dateRange" type="daterange" start-placeholder="开始日期"
            end-placeholder="结束日期"></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addTransportDetail">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <h2>已录入的运输明细</h2>
      <el-table :data="details" style="width: 100%">
        <el-table-column prop="startsite_name" label="运输起点"></el-table-column>
        <el-table-column prop="endsite_name" label="运输终点"></el-table-column>
        <el-table-column prop="vehicle_license" label="运输车队"></el-table-column>
        <el-table-column prop="goods_name" label="运输品类"></el-table-column>
        <el-table-column prop="start_date" label="开始日期"></el-table-column>
        <el-table-column prop="end_date" label="结束日期"></el-table-column>
        <el-table-column label="操作">
          <template v-slot:default="scope">
            <el-button type="danger" @click="removeDetail(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @current-change="handleDetailPageChange" :current-page="detailCurrentPage" :page-size="perPage"
        layout="prev, pager, next" :total="totalDetails" />
      <el-button type="primary" @click="exportToExcel">导出为Excel</el-button>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import {
  getTransportStartPoints,
  getTransportEndPoints,
  getTransportCategories,
  getTransportFleets,
  addTransportDetail,
  deleteTransportDetail,
  getTransportDetails,
} from '@/services/transportService';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default defineComponent({
  name: 'TransportDetailEntry',
  setup() {
    const startPoints = ref<{ id: number, name: string }[]>([]);
    const endPoints = ref<{ id: number, name: string }[]>([]);
    const fleets = ref<{ id: number, license: string }[]>([]);
    const categories = ref<{ id: number, name: string }[]>([]);
    const details = ref<{
      id: number,
      startsite_name: string,
      endsite_name: string,
      vehicle_license: string,
      goods_name: string,
      start_date: string,
      end_date: string
    }[]>([]);
    const form = ref({
      startsite_id: 0,
      endsite_id: 0,
      vehicle_id: 0,
      goods_id: 0,
      dateRange: ['', ''],
    });

    const startPointCurrentPage = ref(1);
    const endPointCurrentPage = ref(1);
    const fleetCurrentPage = ref(1);
    const categoryCurrentPage = ref(1);
    const detailCurrentPage = ref(1);
    const perPage = ref(10);
    const totalStartPoints = ref(0);
    const totalEndPoints = ref(0);
    const totalFleets = ref(0);
    const totalCategories = ref(0);
    const totalDetails = ref(0);

    const fetchStartPoints = async () => {
      try {
        const response = await getTransportStartPoints(perPage.value, startPointCurrentPage.value);
        startPoints.value = response.data.start_sites;
        totalStartPoints.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch start points', error);
      }
    };

    const fetchEndPoints = async () => {
      try {
        const response = await getTransportEndPoints(perPage.value, endPointCurrentPage.value);
        endPoints.value = response.data.end_sites;
        totalEndPoints.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch end points', error);
      }
    };

    const fetchFleets = async () => {
      try {
        const response = await getTransportFleets(perPage.value, fleetCurrentPage.value);
        fleets.value = response.data.vehicle;
        totalFleets.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch fleets', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await getTransportCategories(perPage.value, categoryCurrentPage.value);
        categories.value = response.data.goods;
        totalCategories.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };

    const fetchParameters = async () => {
      try {
        const response = await getTransportDetails(perPage.value, detailCurrentPage.value);
        details.value = response.data.items;
        totalDetails.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch details', error);
      }
    };

    const addParameter = async () => {
      try {
        const data = {
          startsite_id: form.value.startsite_id,
          endsite_id: form.value.endsite_id,
          vehicle_id: form.value.vehicle_id,
          goods_id: form.value.goods_id,
          start_date: form.value.dateRange[0],
          end_date: form.value.dateRange[1],
        };
        await addTransportDetail(data);
        alert('运输明细录入成功');
        form.value = {
          startsite_id: 0,
          endsite_id: 0,
          vehicle_id: 0,
          goods_id: 0,
          dateRange: ['', ''],
        };
        fetchParameters(); // 刷新列表
      } catch (error) {
        console.error('Failed to add transport detail', error);
      }
    };

    const removeParameter = async (itemId: number) => {
      try {
        await deleteTransportDetail(itemId);
        alert('运输明细删除成功');
        fetchParameters(); // 刷新列表
      } catch (error) {
        console.error('Failed to delete transport detail', error);
      }
    };

    const exportToExcel = async () => {
      const response = await getTransportDetails(totalDetails.value * perPage.value, 1);
      const allDetails = response.data.items;
      const dataToExport = allDetails.map(detail => ({
        '运输起点': detail.startsite_name,
        '运输终点': detail.endsite_name,
        '运输车队': detail.vehicle_license,
        '运输品类': detail.goods_name,
        '开始日期': detail.start_date,
        '结束日期': detail.end_date,
      }));
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'TransportDetails');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, 'transport_details.xlsx');
    };

    const handleStartPointChange = (value: string) => {
      console.log('Selected start point:', value);
    };

    const handleStartPointPageChange = (page: number) => {
      startPointCurrentPage.value = page;
      fetchStartPoints();
    };

    const handleStartPointVisibleChange = (visible: boolean) => {
      if (visible) {
        fetchStartPoints();
      }
    };

    const handleEndPointChange = (value: string) => {
      console.log('Selected end point:', value);
    };

    const handleEndPointPageChange = (page: number) => {
      endPointCurrentPage.value = page;
      fetchEndPoints();
    };

    const handleEndPointVisibleChange = (visible: boolean) => {
      if (visible) {
        fetchEndPoints();
      }
    };

    const handleFleetChange = (value: string) => {
      console.log('Selected fleet:', value);
    };

    const handleFleetPageChange = (page: number) => {
      fleetCurrentPage.value = page;
      fetchFleets();
    };

    const handleFleetVisibleChange = (visible: boolean) => {
      if (visible) {
        fetchFleets();
      }
    };

    const handleCategoryChange = (value: string) => {
      console.log('Selected category:', value);
    };

    const handleCategoryPageChange = (page: number) => {
      categoryCurrentPage.value = page;
      fetchCategories();
    };

    const handleCategoryVisibleChange = (visible: boolean) => {
      if (visible) {
        fetchCategories();
      }
    };

    const handleDetailPageChange = (page: number) => {
      detailCurrentPage.value = page;
      fetchParameters();
    };

    onMounted(() => {
      fetchStartPoints();
      fetchEndPoints();
      fetchFleets();
      fetchCategories();
      fetchParameters();
    });

    return {
      startPoints,
      endPoints,
      fleets,
      categories,
      details,
      form,
      startPointCurrentPage,
      endPointCurrentPage,
      fleetCurrentPage,
      categoryCurrentPage,
      detailCurrentPage,
      perPage,
      totalStartPoints,
      totalEndPoints,
      totalFleets,
      totalCategories,
      totalDetails,
      exportToExcel,
      addTransportDetail: addParameter,
      removeDetail: removeParameter,
      handleStartPointChange,
      handleStartPointPageChange,
      handleStartPointVisibleChange,
      handleEndPointChange,
      handleEndPointPageChange,
      handleEndPointVisibleChange,
      handleFleetChange,
      handleFleetPageChange,
      handleFleetVisibleChange,
      handleCategoryChange,
      handleCategoryPageChange,
      handleCategoryVisibleChange,
      handleDetailPageChange,
    };
  },
});
</script>

<style scoped>
.transport-detail-entry {
  padding: 20px;
}

.el-card {
  margin-bottom: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}

.pagination-container {
  padding: 10px;
  text-align: center;
}
</style>
