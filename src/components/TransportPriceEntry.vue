<template>
  <div class="transport-price-entry">
    <el-card>
      <h2>运输单价录入</h2>
      <el-form @submit.prevent="fetchFilteredDetails">
        <OwnerSelect v-model="filters.startOwner" label="起点老板" />
        <SiteSelect v-model="filters.startsite_id" label="起点工地" :owner="filters.startOwner" siteType="start" />
        <OwnerSelect v-model="filters.endOwner" label="终点老板" />
        <SiteSelect v-model="filters.endsite_id" label="终点工地" :owner="filters.endOwner" siteType="end" />
        <el-form-item label="运输品类">
        <GoodsSelect v-model="filters.goods_id" />
        </el-form-item>
        <el-form-item label="时间范围" class="custom-date-picker">
          <el-date-picker v-model="filters.dateRange" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
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
        <el-table-column
          prop="start_date"
          label="开始日期"
          :formatter="(row: Detail) => formatDate(row.start_date)"
        ></el-table-column>
        <el-table-column
          prop="end_date"
          label="结束日期"
          :formatter="(row: Detail) => formatDate(row.end_date)"
        ></el-table-column>
        <el-table-column prop="contractorPrice" label="工地承接单价"></el-table-column>
        <el-table-column prop="startSubsidy" label="起点补贴金额"></el-table-column>
        <el-table-column prop="endSubsidy" label="终点补贴金额"></el-table-column>
        <el-table-column prop="endPayment" label="终点付费金额"></el-table-column>
        <el-table-column prop="driverPrice" label="给司机单价"></el-table-column>
      </el-table>
      <el-pagination @current-change="handleDetailPageChange" :current-page="detailCurrentPage" :page-size="perPage"
        layout="prev, pager, next" :total="totalDetails" />
      <el-button v-if="!isEditing" type="primary" @click="toggleEditMode" :disabled="!selectedDetails.length">
        修改
      </el-button>
    </el-card>

    <div v-if="isEditing" class="edit-form">
      <el-card>
        <h2>修改选中的运输单价</h2>
        <el-form @submit.prevent="saveDetail">
          <el-form-item label="工地承接单价">
            <el-input v-model.number="editForm.contractorPrice" placeholder="请输入工地承接单价"></el-input>
          </el-form-item>
          <el-form-item label="起点补贴金额">
            <el-input v-model.number="editForm.startSubsidy" placeholder="请输入起点补贴金额"></el-input>
          </el-form-item>
          <el-form-item label="终点补贴金额">
            <el-input v-model.number="editForm.endSubsidy" placeholder="请输入终点补贴金额"></el-input>
          </el-form-item>
          <el-form-item label="终点付费金额">
            <el-input v-model.number="editForm.endPayment" placeholder="请输入终点付费金额"></el-input>
          </el-form-item>
          <el-form-item label="给司机单价">
            <el-input v-model.number="editForm.driverPrice" placeholder="请输入给司机单价"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveDetail">保存</el-button>
            <el-button @click="cancelEdit">取消</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import OwnerSelect from '@/components/select/OwnerSelect.vue';
import SiteSelect from '@/components/select/SiteSelect.vue';
import GoodsSelect from '@/components/select/GoodsSelect.vue';
import { formatDate } from '../utils/time';
import {
  getTransportDetails,
  searchTransportDetails,
  updateTransportPrices
} from '@/services/transportService';

interface Detail {
  id: number;
  start_site: { name: string };
  end_site: { name: string };
  goods: { name: string };
  start_date: string | null;
  end_date: string | null;
  contractorPrice: number;
  startSubsidy: number;
  endSubsidy: number;
  endPayment: number;
  driverPrice: number;
}

export default defineComponent({
  name: 'TransportPriceEntry',
  components: {
    OwnerSelect,
    SiteSelect,
    GoodsSelect
  },
  setup() {
    const details = ref<Detail[]>([]);
    const filters = ref({
      startOwner: '',
      endOwner: '',
      startsite_id: 0,
      endsite_id: 0,
      goods_id: 0,
      dateRange: [],
    });
    const selectedDetails = ref<Detail[]>([]);
    const editForm = ref({
      contractorPrice: 0,
      startSubsidy: 0,
      endSubsidy: 0,
      endPayment: 0,
      driverPrice: 0,
    });

    const detailCurrentPage = ref(1);
    const perPage = ref(10);
    const totalDetails = ref(0);

    const isEditing = ref(false);

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

    const handleSelectionChange = (selection: Detail[]) => {
      selectedDetails.value = selection;
    };

    const toggleEditMode = () => {
      if (isEditing.value) {
        saveDetail();
      } else {
        isEditing.value = true;
      }
    };

    const saveDetail = async () => {
      try {
        const data = selectedDetails.value.map(detail => ({
          item_id: detail.id,
          ...editForm.value,
        }));
        await updateTransportPrices(data);
        alert('价格更新成功');
        fetchFilteredDetails(); // 刷新列表
        isEditing.value = false;
      } catch (error) {
        console.error('Failed to update prices', error);
      }
    };

    const cancelEdit = () => {
      isEditing.value = false;
      editForm.value = {
        contractorPrice: 0,
        startSubsidy: 0,
        endSubsidy: 0,
        endPayment: 0,
        driverPrice: 0,
      };
    };

    const handleDetailPageChange = (page: number) => {
      detailCurrentPage.value = page;
      fetchFilteredDetails();
    };

    onMounted(() => {
      fetchFilteredDetails();
    });

    return {
      details,
      filters,
      selectedDetails,
      editForm,
      detailCurrentPage,
      perPage,
      totalDetails,
      isEditing,
      fetchFilteredDetails,
      handleSelectionChange,
      toggleEditMode,
      saveDetail,
      cancelEdit,
      handleDetailPageChange,
      formatDate,
    };
  },
});
</script>

<style scoped>
@import '@/assets/select.css'; /* 引入共享样式 */

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

.edit-form {
  margin-top: 20px;
}
</style>
