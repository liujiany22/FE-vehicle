<template>
  <div class="transport-price-entry">
    <el-card>
      <h2>运输单价录入</h2>
      <el-form @submit.prevent="fetchFilteredDetails">
        <el-form-item label="起点工地">
          <el-select v-model="filters.startsite_id" placeholder="请选择起点工地" @visible-change="fetchStartSites">
            <el-option v-for="item in startSites" :key="item.id" :label="item.name" :value="item.id"></el-option>
            <div class="pagination-container">
              <el-pagination @current-change="handleStartSitePageChange" :current-page="startSiteCurrentPage"
                :page-size="perPage" layout="prev, pager, next" :total="totalStartSites" />
            </div>
          </el-select>
        </el-form-item>
        <el-form-item label="终点工地">
          <el-select v-model="filters.endsite_id" placeholder="请选择终点工地" @visible-change="fetchEndSites">
            <el-option v-for="item in endSites" :key="item.id" :label="item.name" :value="item.id"></el-option>
            <div class="pagination-container">
              <el-pagination @current-change="handleEndSitePageChange" :current-page="endSiteCurrentPage"
                :page-size="perPage" layout="prev, pager, next" :total="totalEndSites" />
            </div>
          </el-select>
        </el-form-item>
        <el-form-item label="运输品类">
          <el-select v-model="filters.goods_id" placeholder="请选择运输品类" @visible-change="fetchGoods">
            <el-option v-for="item in goods" :key="item.id" :label="item.name" :value="item.id"></el-option>
            <div class="pagination-container">
              <el-pagination @current-change="handleGoodsPageChange" :current-page="goodsCurrentPage"
                :page-size="perPage" layout="prev, pager, next" :total="totalGoods" />
            </div>
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker v-model="filters.dateRange" type="daterange" start-placeholder="开始日期"
            end-placeholder="结束日期"></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchFilteredDetails">筛选</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="details" style="width: 100%" @selection-change="handleSelectionChange" ref="detailTable">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="start_site.name" label="起点工地"></el-table-column>
        <el-table-column prop="end_site.name" label="终点工地"></el-table-column>
        <el-table-column prop="goods.name" label="运输品类"></el-table-column>
        <el-table-column prop="start_date" label="开始日期"></el-table-column>
        <el-table-column prop="end_date" label="结束日期"></el-table-column>
        <el-table-column prop="unit" label="计量单位">
          <template v-slot:default="scope">
            <el-input v-model="scope.row.unit" placeholder="请输入"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="contractorPrice" label="工地承接单价">
          <template v-slot:default="scope">
            <el-input v-model.number="scope.row.contractorPrice" placeholder="请输入"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="startSubsidy" label="起点补贴金额">
          <template v-slot:default="scope">
            <el-input v-model.number="scope.row.startSubsidy" placeholder="请输入"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="endSubsidy" label="终点补贴金额">
          <template v-slot:default="scope">
            <el-input v-model.number="scope.row.endSubsidy" placeholder="请输入"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="endPayment" label="终点付费金额">
          <template v-slot:default="scope">
            <el-input v-model.number="scope.row.endPayment" placeholder="请输入"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="driverPrice" label="给司机单价">
          <template v-slot:default="scope">
            <el-input v-model.number="scope.row.driverPrice" placeholder="请输入"></el-input>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @current-change="handleDetailPageChange" :current-page="detailCurrentPage" :page-size="perPage"
        layout="prev, pager, next" :total="totalDetails" />
      <el-button type="primary" @click="updatePrices">保存所有修改</el-button>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import {
  getTransportDetails,
  getStartSites,
  getEndSites,
  getCategories,
  updateTransportPrices,
  searchTransportDetails,
} from '@/services/transportService';

export default defineComponent({
  name: 'TransportPriceEntry',
  setup() {
    const startSites = ref<{ id: number, name: string }[]>([]);
    const endSites = ref<{ id: number, name: string }[]>([]);
    const goods = ref<{ id: number, name: string }[]>([]);
    const details = ref<any[]>([]);
    const filters = ref({
      startsite_id: 0,
      endsite_id: 0,
      goods_id: 0,
      dateRange: [],
    });
    const selectedDetails = ref<any[]>([]);

    const startSiteCurrentPage = ref(1);
    const endSiteCurrentPage = ref(1);
    const goodsCurrentPage = ref(1);
    const detailCurrentPage = ref(1);
    const perPage = ref(10);
    const totalStartSites = ref(0);
    const totalEndSites = ref(0);
    const totalGoods = ref(0);
    const totalDetails = ref(0);

    const fetchStartSites = async () => {
      try {
        const response = await getStartSites(perPage.value, startSiteCurrentPage.value);
        startSites.value = response.data.start_sites;
        totalStartSites.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch start sites', error);
      }
    };

    const fetchEndSites = async () => {
      try {
        const response = await getEndSites(perPage.value, endSiteCurrentPage.value);
        endSites.value = response.data.end_sites;
        totalEndSites.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch end sites', error);
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

    const fetchFilteredDetails = async () => {
      try {
        const params = {
          startsite_id: filters.value.startsite_id,
          endsite_id: filters.value.endsite_id,
          goods_id: filters.value.goods_id,
          start_date: filters.value.dateRange[0] ? new Date(filters.value.dateRange[0]).toISOString() : null,
          end_date: filters.value.dateRange[1] ? new Date(filters.value.dateRange[1]).toISOString() : null,
        };

        const response = await searchTransportDetails(params, perPage.value, detailCurrentPage.value);
        details.value = response.data.items;
        totalDetails.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch details', error);
      }
    };

    const handleSelectionChange = (selection: any[]) => {
      selectedDetails.value = selection;
    };

    const updatePrices = async () => {
      try {
        const data = selectedDetails.value.map(detail => ({
          item_id: detail.id,
          contractorPrice: detail.contractorPrice,
          startSubsidy: detail.startSubsidy,
          endSubsidy: detail.endSubsidy,
          endPayment: detail.endPayment,
          driverPrice: detail.driverPrice,
          unit: detail.unit,
        }));
        await updateTransportPrices(data);
        alert('价格更新成功');
      } catch (error) {
        console.error('Failed to update prices', error);
      }
    };

    const handleStartSitePageChange = (page: number) => {
      startSiteCurrentPage.value = page;
      fetchStartSites();
    };

    const handleEndSitePageChange = (page: number) => {
      endSiteCurrentPage.value = page;
      fetchEndSites();
    };

    const handleGoodsPageChange = (page: number) => {
      goodsCurrentPage.value = page;
      fetchGoods();
    };

    const handleDetailPageChange = (page: number) => {
      detailCurrentPage.value = page;
      fetchFilteredDetails();
    };

    onMounted(() => {
      fetchStartSites();
      fetchEndSites();
      fetchGoods();
      fetchFilteredDetails();
    });

    return {
      startSites,
      endSites,
      goods,
      details,
      filters,
      selectedDetails,
      startSiteCurrentPage,
      endSiteCurrentPage,
      goodsCurrentPage,
      detailCurrentPage,
      perPage,
      totalStartSites,
      totalEndSites,
      totalGoods,
      totalDetails,
      fetchFilteredDetails,
      handleSelectionChange,
      updatePrices,
      handleStartSitePageChange,
      handleEndSitePageChange,
      handleGoodsPageChange,
      handleDetailPageChange,
      fetchStartSites,
      fetchEndSites,
      fetchGoods,
    };
  },
});
</script>

<style scoped>
.transport-price-entry {
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
