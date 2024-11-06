<template>
    <div class="settlement-entry">
      <el-card>
        <h2>运输结算查询</h2>
        <el-form @submit.prevent="fetchFilteredDetailsAndSettlement" label-width="auto" label-position="left">
          <el-form-item label="老板">
            <OwnerSelect v-model="filters.owner" />
          </el-form-item>
          <el-form-item label="项目">
            <OwnerProjectsSelect v-model="filters.projectId" :ownerName="filters.owner" />
          </el-form-item>
          <el-form-item label="运输起点">
            <OwnerStartSitesSelect v-model="filters.startsite_id" :ownerName="filters.owner" :project_id="filters.projectId" />
          </el-form-item>
          <el-form-item label="运输终点">
            <OwnerEndSitesSelect v-model="filters.endsite_id" :ownerName="filters.owner" :project_id="filters.projectId" />
          </el-form-item>
  
          <el-form-item label="运输品类">
            <GoodsSelect v-model="filters.goods_id" />
          </el-form-item>
          <el-form-item label="时间范围" class="custom-date-picker">
            <el-date-picker v-model="filters.dateRange" type="daterange" start-placeholder="开始日期"
              end-placeholder="结束日期"></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchFilteredDetailsAndSettlement" plain>筛选</el-button>
          </el-form-item>
        </el-form>

        <div class="settlement-amount">
          <h3>结算总金额：{{ settlementAmount }}</h3>
        </div>

        <el-table :data="details" style="width: 100%" border>
          <el-table-column prop="project.name" label="项目名称" show-overflow-tooltip></el-table-column>
          <el-table-column prop="goods.name" label="运输品类" show-overflow-tooltip></el-table-column>
          <el-table-column prop="date" label="日期" :formatter="(row: Detail) => formatDate(row.date)" show-overflow-tooltip></el-table-column>
          <el-table-column prop="quantity" label="数量" show-overflow-tooltip></el-table-column>
          <el-table-column prop="unit" label="单位" show-overflow-tooltip></el-table-column>
          <el-table-column prop="contractorPrice" label="工地承接单价" show-overflow-tooltip></el-table-column>
          <el-table-column prop="startSubsidy" label="起点补贴金额" show-overflow-tooltip></el-table-column>
          <el-table-column prop="endSubsidy" label="弃点付费金额" show-overflow-tooltip></el-table-column>
          <el-table-column prop="endPayment" label="终点付费金额" show-overflow-tooltip></el-table-column>
          <el-table-column prop="driverPrice" label="给司机运费" show-overflow-tooltip></el-table-column>
        </el-table>
        <el-pagination @current-change="handleDetailPageChange" :current-page="detailCurrentPage" :page-size="perPage"
          layout="prev, pager, next" :total="totalDetails" />
  
        
      </el-card>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue';
  import OwnerSelect from '@/components/select/OwnerSelect.vue';
  import OwnerProjectsSelect from '@/components/select/OwnerProjectsSelect.vue';
  import GoodsSelect from '@/components/select/GoodsSelect.vue';
  import OwnerStartSitesSelect from '@/components/select/OwnerStartSitesSelect.vue';
  import OwnerEndSitesSelect from '@/components/select/OwnerEndSitesSelect.vue';
  import { formatDate } from '@/utils/time';
  import { searchTransportDetails } from '@/services/detailService';
  import { getSettlement } from '@/services/financeService';
import { ElLoading, ElMessage } from 'element-plus';
  
  interface Detail {
    id: number;
    project: { name: string };
    goods: { name: string };
    date: string | null;
    quantity: number;
    unit: string;
    contractorPrice: number;
    startSubsidy: number;
    endSubsidy: number;
    endPayment: number;
    driverPrice: number;
  }
  
  export default defineComponent({
    name: 'SettlementEntry',
    components: {
      OwnerSelect,
      OwnerProjectsSelect,
      GoodsSelect,
      OwnerStartSitesSelect,
      OwnerEndSitesSelect
    },
    setup() {
      const details = ref<Detail[]>([]);
      const filters = ref({
        owner: '',
        projectId: 0,
        goods_id: 0,
        startsite_id: 0,
        endsite_id: 0,
        dateRange: [],
      });
      const detailCurrentPage = ref(1);
      const perPage = ref(10);
      const totalDetails = ref(0);
      const settlementAmount = ref(0);
  
      const fetchFilteredDetailsAndSettlement = async () => {
        const loadingInstance = ElLoading.service({
        lock: true,
        text: '正在加载，请稍候...',
        background: 'rgba(0, 0, 0, 0.7)',
      });
        try {
          const check_date = filters.value.dateRange;
          const params = {
            ownerName: filters.value.owner,
            project_id: filters.value.projectId,
            goods_id: filters.value.goods_id,
            startsite_id: filters.value.startsite_id,
            endsite_id: filters.value.endsite_id,
            start_date: check_date ? (filters.value.dateRange[0] ? new Date(filters.value.dateRange[0]).toISOString() : null) : null,
            end_date: check_date ? (filters.value.dateRange[1] ? new Date(filters.value.dateRange[1]).toISOString() : null) : null,
          };
  
          // Fetching transport details
          const response = await searchTransportDetails(params, perPage.value, detailCurrentPage.value);
          details.value = response.data.items;
          totalDetails.value = response.data.total_pages * perPage.value;
  
          // Fetching settlement amount
          const settlementResponse = await getSettlement(params);
          settlementAmount.value = (settlementResponse.data.total_amount).toFixed(2);
          loadingInstance.close();
        } catch (error) {
          loadingInstance.close();
          ElMessage.error('明细获取失败，请稍后再试');
          console.error('Failed to fetch details or settlement amount', error);
        }
      };
  
      const handleDetailPageChange = (page: number) => {
        detailCurrentPage.value = page;
        fetchFilteredDetailsAndSettlement();
      };
  
      onMounted(() => {
        fetchFilteredDetailsAndSettlement();
      });
  
      return {
        details,
        filters,
        detailCurrentPage,
        perPage,
        totalDetails,
        settlementAmount,
        fetchFilteredDetailsAndSettlement,
        handleDetailPageChange,
        formatDate,
      };
    },
  });
  </script>
  
  <style scoped>
  @import '@/assets/select.css';

  .settlement-entry {
    margin: 20px;
  }
  
  .custom-date-picker {
    margin-bottom: 20px;
  }
  
  .settlement-amount {
    margin-top: 20px;
    text-align: center;
    font-size: 1.5em;
    font-weight: bold;
    color: #333;
  }
  </style>
  