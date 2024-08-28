<template>
  <div class="detail-excel">
    <el-card>
      <h2>运输明细导出</h2>
      <el-form @submit.prevent="validateAndFetchDetails" label-position="left" label-width="auto">
        <el-form-item label="老板">
          <OwnerSelect v-model="filters.owner" @change="handleFilterChange" />
        </el-form-item>
        <el-form-item label="项目">
          <OwnerProjectsSelect v-model="filters.projectId" :ownerName="filters.owner" @change="handleFilterChange" />
        </el-form-item>
        <el-form-item label="运输起点">
          <OwnerStartSitesSelect v-model="filters.startsite_id" :ownerName="filters.owner"
            :project_id="filters.projectId" @change="handleFilterChange" />
        </el-form-item>
        <el-form-item label="运输终点">
          <OwnerEndSitesSelect v-model="filters.endsite_id" :ownerName="filters.owner" :project_id="filters.projectId"
            @change="handleFilterChange" />
        </el-form-item>
        <el-form-item label="运输品类">
          <GoodsSelect v-model="filters.goods_id" @change="handleFilterChange" />
        </el-form-item>
        <el-form-item label="时间范围" class="custom-date-picker" :error="errors.dateRange">
          <el-date-picker v-model="filters.dateRange" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期"
            @change="handleFilterChange" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="validateAndFetchDetails" plain>筛选</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="currentDetails.length">
      <el-table :data="currentDetails" style="width: 100%" @selection-change="handleSelectionChange" ref="detailTable"
        :row-key="getRowKey" border>
        <el-table-column type="selection" width="55" :reserve-selection="true"></el-table-column>
        <el-table-column prop="project.owner" label="老板" show-overflow-tooltip>
          <template v-slot="scope">
            {{ scope.row.project?.owner || '无' }}
          </template>
        </el-table-column>
        <el-table-column prop="project.name" label="项目名称" show-overflow-tooltip>
          <template v-slot="scope">
            {{ scope.row.project?.name || '无' }}
          </template>
        </el-table-column>
        <el-table-column prop="start_site.name" label="运输起点" show-overflow-tooltip>
          <template v-slot="scope">
            {{ scope.row.start_site?.name || '无' }}
          </template>
        </el-table-column>
        <el-table-column prop="end_site.name" label="运输终点" show-overflow-tooltip>
          <template v-slot="scope">
            {{ scope.row.end_site?.name || '无' }}
          </template>
        </el-table-column>
        <el-table-column prop="vehicle.license" label="运输车队" show-overflow-tooltip>
          <template v-slot="scope">
            {{ scope.row.vehicle ? `${scope.row.vehicle.license} (${scope.row.vehicle.driver || '无司机'})` : '无' }}
          </template>
        </el-table-column>
        <el-table-column prop="goods.name" label="运输品类" show-overflow-tooltip>
          <template v-slot="scope">
            {{ scope.row.goods?.name || '无' }}
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" show-overflow-tooltip>
          <template v-slot="scope">
            {{ scope.row.quantity }}
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" show-overflow-tooltip>
          <template v-slot="scope">
            {{ scope.row.unit || '无' }}
          </template>
        </el-table-column>
        <el-table-column prop="contractorPrice" label="工地承接单价" show-overflow-tooltip>
          <template v-slot="scope">
            {{ scope.row.contractorPrice }}
          </template>
        </el-table-column>
        <el-table-column prop="startSubsidy" label="起点补贴金额" show-overflow-tooltip>
          <template v-slot="scope">
            {{ scope.row.startSubsidy }}
          </template>
        </el-table-column>
        <el-table-column prop="endSubsidy" label="弃点付费金额" show-overflow-tooltip>
          <template v-slot="scope">
            {{ scope.row.endSubsidy }}
          </template>
        </el-table-column>
        <el-table-column prop="endPayment" label="终点付费金额" show-overflow-tooltip>
          <template v-slot="scope">
            {{ scope.row.endPayment }}
          </template>
        </el-table-column>
        <el-table-column prop="driverPrice" label="给司机单价" show-overflow-tooltip>
          <template v-slot="scope">
            {{ scope.row.driverPrice }}
          </template>
        </el-table-column>
        <el-table-column prop="date" label="日期" show-overflow-tooltip>
          <template v-slot="scope">
            {{ formatDate(scope.row.date) || '无' }}
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @current-change="handleDetailPageChange" :current-page="detailCurrentPage" :page-size="perPage"
        layout="prev, pager, next" :total="totalDetails" />
      <div style="margin-top: 10px;">
        <el-button type="primary" @click="toggleAllSelection" plain>{{ isAllSelected ? '取消全选' : '全选' }}</el-button>
        <el-button type="primary" @click="handleExport" :disabled="isExportDisabled || !selectedDetails.length" plain>
          导出
        </el-button>
        <!-- <el-button type="primary" @click="handlePrint" :disabled="isExportDisabled || !selectedDetails.length" plain>
          打印
        </el-button> -->
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import OwnerSelect from '@/components/select/OwnerSelect.vue';
import OwnerProjectsSelect from '@/components/select/OwnerProjectsSelect.vue';
import OwnerStartSitesSelect from '../select/OwnerStartSitesSelect.vue';
import OwnerEndSitesSelect from '../select/OwnerEndSitesSelect.vue';
import GoodsSelect from '@/components/select/GoodsSelect.vue';
import { searchTransportDetails } from '@/services/detailService';
import { getDetailExcel, getDetailPDF } from '@/services/export';
import { saveAs } from 'file-saver';
import { formatDate } from '@/utils/time';
import { ElMessage, ElLoading } from 'element-plus';
import { ElTable } from 'element-plus';

interface Detail {
  id: number;
  owner: { name: string };
  project: { name: string };
  start_site: { name: string };
  end_site: { name: string };
  vehicle: { license: string };
  goods: { name: string };
  quantity: number;
  unit: string;
  start_site_price: number;
  start_subsidy: number;
  end_charge: number;
  end_site_price: number;
  driver_price: number;
  date: string | null;
}

export default defineComponent({
  name: 'DetailExcel',
  components: {
    OwnerSelect,
    OwnerProjectsSelect,
    OwnerStartSitesSelect,
    OwnerEndSitesSelect,
    GoodsSelect,
  },
  setup() {
    const filters = ref({
      owner: '',
      projectId: 0,
      startsite_id: 0,
      endsite_id: 0,
      goods_id: 0,
      dateRange: [null, null] as [Date | null, Date | null],
    });

    const errors = ref({
      dateRange: null as string | null,
    });

    const details = ref<Detail[]>([]);
    const currentDetails = ref<Detail[]>([]);
    const selectedDetails = ref<Detail[]>([]);
    const detailTable = ref<InstanceType<typeof ElTable>>();

    const detailCurrentPage = ref(1);
    const perPage = ref(10);
    const totalDetails = ref(0);

    const isExportDisabled = ref(true);

    const getRowKey = (row: Detail) => {
      return row.id;
    };

    const handleFilterChange = () => {
      isExportDisabled.value = true;
    };

    const validateAndFetchDetails = async () => {
      if (!filters.value.dateRange || !filters.value.dateRange[0] || !filters.value.dateRange[1]) {
        errors.value.dateRange = '请选择时间范围';
        return;
      } else {
        errors.value.dateRange = null;
      }

      await fetchFilteredDetails();
      isExportDisabled.value = false;
      selectedDetails.value = [];
      if (detailTable.value) {
        detailTable.value.clearSelection();
      }
    };

    const fetchFilteredDetails = async () => {
      const loadingInstance = ElLoading.service({
        lock: true,
        text: '正在加载，请稍候...',
        background: 'rgba(0, 0, 0, 0.7)',
      });
      try {
        const params = {
          project_id: filters.value.projectId,
          startsite_id: filters.value.startsite_id,
          endsite_id: filters.value.endsite_id,
          goods_id: filters.value.goods_id,
          start_date: filters.value.dateRange[0] ? filters.value.dateRange[0]!.toISOString() : null,
          end_date: filters.value.dateRange[1] ? filters.value.dateRange[1]!.toISOString() : null,
        };
        const response = await searchTransportDetails(params, 100000, 1);
        details.value = response.data.items;
        totalDetails.value = details.value.length;

        currentDetails.value = details.value.slice((detailCurrentPage.value - 1) * perPage.value, detailCurrentPage.value * perPage.value);

        loadingInstance.close();
      } catch (error) {
        loadingInstance.close();
        console.error('Failed to fetch details', error);
      }
    };

    const handleSelectionChange = (selection: Detail[]) => {
      selectedDetails.value = selection;
    };

    const isAllSelected = computed(() => {
      return selectedDetails.value.length === details.value.length && details.value.length > 0;
    });
    const toggleAllSelection = () => {
      if (detailTable.value) {
        if (isAllSelected.value) {
          details.value.forEach(row => {
            detailTable.value!.toggleRowSelection(row, false);
          });
        } else {
          details.value.forEach(row => {
            detailTable.value!.toggleRowSelection(row, true);
          });
        }
      }
    };

    const handleDetailPageChange = (page: number) => {
      detailCurrentPage.value = page;
      currentDetails.value = details.value.slice((detailCurrentPage.value - 1) * perPage.value, detailCurrentPage.value * perPage.value);
    };

    const handleExport = async () => {
      const loadingInstance = ElLoading.service({
        lock: true,
        text: '正在导出，请稍候...',
        background: 'rgba(0, 0, 0, 0.7)',
      });

      const item_ids = selectedDetails.value.map(detail => detail.id);

      try {
        const exportResponse = await getDetailExcel({ item_ids });
        const blob = new Blob([exportResponse.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, '运输详情对账表.xlsx');
        loadingInstance.close();
      } catch (error) {
        loadingInstance.close();
        console.error('Error exporting details:', error);
      }
    };

    const handlePrint = async () => {
      const loadingInstance = ElLoading.service({
        lock: true,
        text: '正在生成打印文件，请稍候...',
        background: 'rgba(0, 0, 0, 0.7)',
      });

      const item_ids = selectedDetails.value.map(detail => detail.id);

      try {
        const pdfResponse = await getDetailPDF({ item_ids });
        const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
        const pdfURL = URL.createObjectURL(blob);

        const printWindow = window.open(pdfURL);
        if (printWindow) {
          printWindow.addEventListener('load', () => {
            loadingInstance.close();
            printWindow.focus();
            printWindow.print();
            printWindow.onafterprint = () => {
              printWindow.close();
            };
          });
        }
      } catch (error) {
        loadingInstance.close();
        ElMessage.error('生成打印文件失败，请稍后再试');
        console.error('Error printing details:', error);
      }
    };
    const showExportNotSupportedMessage = () => {
      // ElMessage.warning('暂不支持此功能')
    };
    onMounted(() => {
      fetchFilteredDetails();
      showExportNotSupportedMessage();
    });

    return {
      detailTable,
      filters,
      errors,
      details,
      currentDetails,
      selectedDetails,
      detailCurrentPage,
      perPage,
      totalDetails,
      isExportDisabled,
      isAllSelected,
      showExportNotSupportedMessage,
      toggleAllSelection,
      getRowKey,
      handleFilterChange,
      validateAndFetchDetails,
      handleSelectionChange,
      handleExport,
      handlePrint,
      handleDetailPageChange,
      formatDate,
    };
  },
});
</script>

<style scoped>
@import '@/assets/select.css';
</style>