<template>
  <div class="driver-excel">
    <el-card>
      <h2>司机对账表</h2>
      <el-form @submit.prevent="validateAndFetchDetails" label-width="auto" label-position="left">
        <el-form-item label="车队" :error="errors.vehicle_id">
          <FleetSelect v-model="filters.vehicle_id" @change="handleFilterChange" />
        </el-form-item>
        <el-form-item label="运输品类">
          <GoodsSelect v-model="filters.goods_id" @change="handleFilterChange" />
        </el-form-item>
        <el-form-item label="时间范围" class="custom-date-picker" :error="errors.dateRange">
          <el-date-picker v-model="filters.dateRange" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" @change="handleFilterChange" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="validateAndFetchDetails" plain>筛选</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="currentDetails.length">
      <el-table :data="currentDetails" style="width: 100%" @selection-change="handleSelectionChange" ref="detailTable" :row-key="getRowKey" border>
        <el-table-column type="selection" width="55" :reserve-selection="true"></el-table-column>
        <el-table-column prop="vehicle" label="车队" show-overflow-tooltip>
          <template v-slot="scope">
            {{ scope.row.vehicle ? `${scope.row.vehicle.license} (${scope.row.vehicle?.driver || '无司机'})` : '无' }}
          </template>
        </el-table-column>
        <el-table-column prop="goods.name" label="品类" show-overflow-tooltip>
          <template v-slot="scope">
            {{ scope.row.goods?.name || '无' }}
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" show-overflow-tooltip>
          <template v-slot="scope">
            {{ scope.row.quantity || '无' }}
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" show-overflow-tooltip>
          <template v-slot="scope">
            {{ scope.row.unit || '无' }}
          </template>
        </el-table-column>
        <el-table-column prop="load.method" label="装载方式" show-overflow-tooltip>
          <template v-slot="scope">
            {{ scope.row.load || '无' }}
          </template>
        </el-table-column>
        <el-table-column prop="driverPrice" label="给司机单价" show-overflow-tooltip>
          <template v-slot="scope">
            {{ scope.row.driverPrice || '无' }}
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
        <el-button type="primary" @click="handlePrint" :disabled="isExportDisabled || !selectedDetails.length" plain>
          打印
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import FleetSelect from '@/components/select/FleetSelect.vue';
import GoodsSelect from '@/components/select/GoodsSelect.vue';
import { searchTransportDetails } from '@/services/detailService';
import { getDriverExcel, getDriverPDF } from '@/services/export';
import { saveAs } from 'file-saver';
import { formatLoad } from '@/utils/load';
import { ElMessage, ElLoading } from 'element-plus';
import { ElTable } from 'element-plus';

interface Detail {
  id: number;
  vehicle: { license: string };
  goods: { name: string };
  quantity: number;
  unit: string;
  load: string;
  driverPrice: number;
}

export default defineComponent({
  name: 'DriverExcel',
  components: {
    FleetSelect,
    GoodsSelect,
  },
  setup() {
    const filters = ref({
      vehicle_id: 0,
      goods_id: 0,
      dateRange: [null, null] as [Date | null, Date | null],
    });
    const errors = ref({
      vehicle_id: null as string | null,
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
      let valid = true;

      if (!filters.value.vehicle_id) {
        errors.value.vehicle_id = '请选择车队';
        valid = false;
      } else {
        errors.value.vehicle_id = null;
      }

      if (!filters.value.dateRange || !filters.value.dateRange[0] || !filters.value.dateRange[1]) {
        errors.value.dateRange = '请选择时间范围';
        valid = false;
      } else {
        errors.value.dateRange = null;
      }

      if (valid) {
        await fetchFilteredDetails();
        isExportDisabled.value = false;
        selectedDetails.value = [];
        if (detailTable.value) {
          detailTable.value.clearSelection();
        }
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
          vehicle_id: filters.value.vehicle_id,
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
        ElMessage.error('筛选失败，请稍后再试');
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

      const exportData = {
        item_ids: item_ids,
        vehicle_id: filters.value.vehicle_id,
        start_date: filters.value.dateRange[0] ? filters.value.dateRange[0]!.toISOString() : '',
        end_date: filters.value.dateRange[1] ? filters.value.dateRange[1]!.toISOString() : '',
        goods_id: filters.value.goods_id,
      };

      try {
        const exportResponse = await getDriverExcel(exportData);
        const blob = new Blob([exportResponse.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, '驾驶员对账表.xlsx');
        loadingInstance.close();
      } catch (error) {
        loadingInstance.close();
        ElMessage.error('生成表格失败，请稍后再试');
        console.error('Error exporting driver statement:', error);
      }
    };

    const handlePrint = async () => {
      const loadingInstance = ElLoading.service({
        lock: true,
        text: '正在生成打印文件，请稍候...',
        background: 'rgba(0, 0, 0, 0.7)',
      });

      const item_ids = selectedDetails.value.map(detail => detail.id);

      const printData = {
        item_ids: item_ids,
        vehicle_id: filters.value.vehicle_id,
        start_date: filters.value.dateRange[0] ? filters.value.dateRange[0]!.toISOString() : '',
        end_date: filters.value.dateRange[1] ? filters.value.dateRange[1]!.toISOString() : '',
        goods_id: filters.value.goods_id,
      };

      try {
        const pdfResponse = await getDriverPDF(printData);
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
        console.error('Error printing driver statement:', error);
      }
    };

    const showExportNotSupportedMessage = () => {
      // ElMessage.warning('暂不支持选中导出功能')
    };

    onMounted(() => {
      fetchFilteredDetails();
      showExportNotSupportedMessage();
    });

    return {
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
      detailTable,
      showExportNotSupportedMessage,
      toggleAllSelection,
      getRowKey,
      handleFilterChange,
      validateAndFetchDetails,
      handleSelectionChange,
      handleExport,
      handlePrint,
      handleDetailPageChange,
      formatLoad,
    };
  },
});
</script>

<style scoped>
@import '@/assets/select.css';
</style>
