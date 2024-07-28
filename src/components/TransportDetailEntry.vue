<template>
  <div class="transport-detail-entry">
    <el-card>
      <h2>运输明细录入</h2>
      <el-form @submit.prevent="addDetail">
        <el-form-item label="运输起点">
          <el-select v-model="form.start_site_id" placeholder="请选择运输起点" @visible-change="fetchStartSites">
            <el-option v-for="item in start_sites" :key="item.id" :label="item.name" :value="item.id"></el-option>
            <div class="pagination-container">
              <el-pagination @current-change="handleStartSitePageChange" :current-page="startSiteCurrentPage" :page-size="perPage" layout="prev, pager, next" :total="totalStartSites" />
            </div>
          </el-select>
        </el-form-item>
        <el-form-item label="运输起点描述">
          <el-input v-model="form.start_spot" placeholder="请输入运输起点描述"></el-input>
        </el-form-item>
        <el-form-item label="运输终点">
          <el-select v-model="form.end_site_id" placeholder="请选择运输终点" @visible-change="fetchEndSites">
            <el-option v-for="item in end_sites" :key="item.id" :label="item.name" :value="item.id"></el-option>
            <div class="pagination-container">
              <el-pagination @current-change="handleEndSitePageChange" :current-page="endSiteCurrentPage" :page-size="perPage" layout="prev, pager, next" :total="totalEndSites" />
            </div>
          </el-select>
        </el-form-item>
        <el-form-item label="运输车队">
          <el-select v-model="form.vehicle_id" placeholder="请选择运输车队" @visible-change="fetchFleets">
            <el-option v-for="item in vehicles" :key="item.id" :label="item.driver" :value="item.id"></el-option>
            <div class="pagination-container">
              <el-pagination @current-change="handleVehiclePageChange" :current-page="vehicleCurrentPage" :page-size="perPage" layout="prev, pager, next" :total="totalVehicles" />
            </div>
          </el-select>
        </el-form-item>
        <el-form-item label="运输品类">
          <el-select v-model="form.goods_id" placeholder="请选择运输品类" @visible-change="fetchGoods">
            <el-option v-for="item in goods" :key="item.id" :label="item.name" :value="item.id"></el-option>
            <div class="pagination-container">
              <el-pagination @current-change="handleGoodsPageChange" :current-page="goodsCurrentPage" :page-size="perPage" layout="prev, pager, next" :total="totalGoods" />
            </div>
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker v-model="form.date_range" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addDetail">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <h2>已录入的运输明细</h2>
      <el-table :data="details" style="width: 100%">
        <el-table-column prop="start_site.name" label="运输起点">
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <el-select v-model="editingDetail.start_site_id" placeholder="请选择运输起点" @visible-change="fetchStartSites">
                <el-option v-for="item in start_sites" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </div>
            <div v-else>
              {{ scope.row.start_site.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="start_spot" label="运输起点描述">
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <el-input v-model="editingDetail.start_spot" placeholder="请输入运输起点描述"></el-input>
            </div>
            <div v-else>
              {{ scope.row.start_spot }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="end_site.name" label="运输终点">
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <el-select v-model="editingDetail.end_site_id" placeholder="请选择运输终点" @visible-change="fetchEndSites">
                <el-option v-for="item in end_sites" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </div>
            <div v-else>
              {{ scope.row.end_site.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="vehicle.driver" label="运输车队">
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <el-select v-model="editingDetail.vehicle_id" placeholder="请选择运输车队" @visible-change="fetchFleets">
                <el-option v-for="item in vehicles" :key="item.id" :label="item.driver" :value="item.id"></el-option>
              </el-select>
            </div>
            <div v-else>
              {{ scope.row.vehicle.driver }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="goods.name" label="运输品类">
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <el-select v-model="editingDetail.goods_id" placeholder="请选择运输品类" @visible-change="fetchGoods">
                <el-option v-for="item in goods" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </div>
            <div v-else>
              {{ scope.row.goods.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="start_date" label="开始日期">
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <el-date-picker v-model="editingDetail.start_date" type="date" placeholder="选择开始日期"></el-date-picker>
            </div>
            <div v-else>
              {{ scope.row.start_date }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="end_date" label="结束日期">
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <el-date-picker v-model="editingDetail.end_date" type="date" placeholder="选择结束日期"></el-date-picker>
            </div>
            <div v-else>
              {{ scope.row.end_date }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <el-button type="primary" @click="saveDetail(scope.row.id)">保存</el-button>
              <el-button @click="cancelEdit">取消</el-button>
            </div>
            <div v-else>
              <el-button @click="editDetail(scope.row)">修改</el-button>
              <el-button type="danger" @click="removeDetail(scope.row.id)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @current-change="handleDetailPageChange" :current-page="detailCurrentPage" :page-size="perPage" layout="prev, pager, next" :total="totalDetails" />
      <el-button type="primary" @click="exportToExcel">导出为Excel</el-button>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import {
  getStartSites,
  getEndSites,
  getCategories,
  getFleets,
  addTransportDetail,
  delTransportDetail,
  getTransportDetails,
  updateTransportDetail
} from '@/services/transportService';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default defineComponent({
  name: 'TransportDetailEntry',
  setup() {
    const start_sites = ref<{ id: number, name: string }[]>([]);
    const end_sites = ref<{ id: number, name: string }[]>([]);
    const vehicles = ref<{ id: number, driver: string }[]>([]);
    const goods = ref<{ id: number, name: string }[]>([]);
    const details = ref<{
      id: number,
      start_site: { name: string },
      start_spot: string,
      end_site: { name: string },
      vehicle: { driver: string },
      goods: { name: string },
      start_date: string,
      end_date: string
    }[]>([]);
    const form = ref({
      start_site_id: 0,
      start_spot: '',
      end_site_id: 0,
      vehicle_id: 0,
      goods_id: 0,
      date_range: ['', ''],
    });
    const editingDetail = ref({
      start_site_id: 0,
      start_spot: '',
      end_site_id: 0,
      vehicle_id: 0,
      goods_id: 0,
      start_date: '',
      end_date: '',
    });

    const editingId = ref<number | null>(null);

    const startSiteCurrentPage = ref(1);
    const endSiteCurrentPage = ref(1);
    const vehicleCurrentPage = ref(1);
    const goodsCurrentPage = ref(1);
    const detailCurrentPage = ref(1);
    const perPage = ref(10);
    const totalStartSites = ref(0);
    const totalEndSites = ref(0);
    const totalVehicles = ref(0);
    const totalGoods = ref(0);
    const totalDetails = ref(0);

    const fetchStartSites = async () => {
      try {
        const response = await getStartSites(perPage.value, startSiteCurrentPage.value);
        start_sites.value = response.data.start_sites;
        totalStartSites.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch start sites', error);
      }
    };

    const fetchEndSites = async () => {
      try {
        const response = await getEndSites(perPage.value, endSiteCurrentPage.value);
        end_sites.value = response.data.end_sites;
        totalEndSites.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch end sites', error);
      }
    };

    const fetchFleets = async () => {
      try {
        const response = await getFleets(perPage.value, vehicleCurrentPage.value);
        vehicles.value = response.data.vehicle;
        totalVehicles.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch fleets', error);
      }
    };

    const fetchGoods = async () => {
      try {
        const response = await getCategories(perPage.value, goodsCurrentPage.value);
        goods.value = response.data.goods;
        totalGoods.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch goods', error);
      }
    };

    const fetchDetails = async () => {
      try {
        const response = await getTransportDetails(perPage.value, detailCurrentPage.value);
        details.value = response.data.items;
        totalDetails.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch details', error);
      }
    };

    const addDetail = async () => {
      try {
        const data = {
          startsite_id: form.value.start_site_id,
          start_spot: form.value.start_spot,
          endsite_id: form.value.end_site_id,
          vehicle_id: form.value.vehicle_id,
          goods_id: form.value.goods_id,
          start_date: form.value.date_range[0],
          end_date: form.value.date_range[1],
        };
        await addTransportDetail(data);
        alert('运输明细录入成功');
        form.value = {
          start_site_id: 0,
          start_spot: '',
          end_site_id: 0,
          vehicle_id: 0,
          goods_id: 0,
          date_range: ['', ''],
        };
        fetchDetails(); // 刷新列表
      } catch (error) {
        console.error('Failed to add transport detail', error);
      }
    };

    const removeDetail = async (itemId: number) => {
      try {
        await delTransportDetail(itemId);
        alert('运输明细删除成功');
        fetchDetails(); // 刷新列表
      } catch (error) {
        console.error('Failed to delete transport detail', error);
      }
    };

    const editDetail = (detail: { id: number, start_site: { id: number }, start_spot: string, end_site: { id: number }, vehicle: { id: number }, goods: { id: number }, start_date: string, end_date: string }) => {
      editingDetail.value = {
        start_site_id: detail.start_site.id,
        start_spot: detail.start_spot,
        end_site_id: detail.end_site.id,
        vehicle_id: detail.vehicle.id,
        goods_id: detail.goods.id,
        start_date: detail.start_date,
        end_date: detail.end_date,
      };
      editingId.value = detail.id;
    };

    const saveDetail = async (itemId: number) => {
      try {
        const data = {
          item_id: itemId,
          startsite_id: editingDetail.value.start_site_id,
          start_spot: editingDetail.value.start_spot,
          endsite_id: editingDetail.value.end_site_id,
          vehicle_id: editingDetail.value.vehicle_id,
          goods_id: editingDetail.value.goods_id,
          start_date: editingDetail.value.start_date,
          end_date: editingDetail.value.end_date,
        };
        await updateTransportDetail(data);
        alert('运输明细更新成功');
        editingDetail.value = {
          start_site_id: 0,
          start_spot: '',
          end_site_id: 0,
          vehicle_id: 0,
          goods_id: 0,
          start_date: '',
          end_date: '',
        };
        fetchDetails(); // 刷新列表
        editingId.value = null;
      } catch (error) {
        console.error('Failed to update transport detail', error);
      }
    };

    const cancelEdit = () => {
      editingDetail.value = {
        start_site_id: 0,
        start_spot: '',
        end_site_id: 0,
        vehicle_id: 0,
        goods_id: 0,
        start_date: '',
        end_date: '',
      };
      editingId.value = null;
    };

    const exportToExcel = async () => {
      const response = await getTransportDetails(totalDetails.value * perPage.value, 1);
      const allDetails = response.data.items;
      const header1 = ['宏图运输每月对账单'];
      const header2 = ['对账起始日期', form.value.date_range[0], '对账截止日期', form.value.date_range[1]];
      const header3 = ['序号', '运输起点名', '运输品类名', '数量', '单位', '工地承接单价', '起点工地补贴金额', '终点工地补贴金额'];

      const dataToExport = allDetails.map((detail, index) => ({
        '序号': index + 1,
        '运输起点名': detail.start_spot,
        '运输品类名': detail.goods.name,
        '数量': '', // Assuming this information is not available in the current details
        '单位': '', // Assuming this information is not available in the current details
        '工地承接单价': '', // Assuming this information is not available in the current details
        '起点工地补贴金额': '', // Assuming this information is not available in the current details
        '终点工地补贴金额': '' // Assuming this information is not available in the current details
      }));

      const footer1 = ['工地负责人（签字确认）：', '', '运输单位负责人（签字确认）：', ''];
      const footer2 = ['经营范围：本公司承接土石方工程、渣土、建筑垃圾运输、砂石料、柴油配送等。'];

      const worksheet = XLSX.utils.aoa_to_sheet([header1, header2, header3]);
      XLSX.utils.sheet_add_json(worksheet, dataToExport, { skipHeader: true, origin: 'A4' });
      XLSX.utils.sheet_add_aoa(worksheet, [footer1], { origin: `A${4 + dataToExport.length + 1}` });
      XLSX.utils.sheet_add_aoa(worksheet, [footer2], { origin: `A${4 + dataToExport.length + 2}` });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'TransportDetails');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, 'transport_details.xlsx');
    };

    const handleStartSitePageChange = (page: number) => {
      startSiteCurrentPage.value = page;
      fetchStartSites();
    };

    const handleEndSitePageChange = (page: number) => {
      endSiteCurrentPage.value = page;
      fetchEndSites();
    };

    const handleVehiclePageChange = (page: number) => {
      vehicleCurrentPage.value = page;
      fetchFleets();
    };

    const handleGoodsPageChange = (page: number) => {
      goodsCurrentPage.value = page;
      fetchGoods();
    };

    const handleDetailPageChange = (page: number) => {
      detailCurrentPage.value = page;
      fetchDetails();
    };

    onMounted(() => {
      fetchStartSites();
      fetchEndSites();
      fetchFleets();
      fetchGoods();
      fetchDetails();
    });

    return {
      start_sites,
      end_sites,
      vehicles,
      goods,
      details,
      form,
      editingDetail,
      editingId,
      startSiteCurrentPage,
      endSiteCurrentPage,
      vehicleCurrentPage,
      goodsCurrentPage,
      detailCurrentPage,
      perPage,
      totalStartSites,
      totalEndSites,
      totalVehicles,
      totalGoods,
      totalDetails,
      exportToExcel,
      addDetail,
      removeDetail,
      editDetail,
      saveDetail,
      cancelEdit,
      handleStartSitePageChange,
      handleEndSitePageChange,
      handleVehiclePageChange,
      handleGoodsPageChange,
      handleDetailPageChange,
      fetchStartSites,
      fetchEndSites,
      fetchFleets,
      fetchGoods,
    };
  },
});
</script>

<style scoped>
.detail-entry {
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
