<template>
  <div class="driver-excel">
    <el-card>
      <h2>司机对账表</h2>
      <el-form @submit.prevent="validateAndFetchDetails">
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
          <el-button type="primary" @click="validateAndFetchDetails">筛选</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="details.length">
      <el-table :data="details" style="width: 100%" :row-key="getRowKey">
        <el-table-column prop="vehicle" label="车队">
          <template v-slot="scope">
            {{ scope.row.vehicle ? `${scope.row.vehicle.license} (${scope.row.vehicle?.driver || '无司机'})` : '无' }}
          </template>
        </el-table-column>
        <el-table-column prop="goods.name" label="品类">
          <template v-slot="scope">
            {{ scope.row.goods?.name || '无' }}
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量">
          <template v-slot="scope">
            {{ scope.row.quantity || '无' }}
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位">
          <template v-slot="scope">
            {{ scope.row.unit || '无' }}
          </template>
        </el-table-column>
        <el-table-column prop="load" label="装载方式">
          <template v-slot="scope">
            {{ formatLoad(scope.row.load) || '无' }}
          </template>
        </el-table-column>
        <el-table-column prop="driverPrice" label="给司机单价">
          <template v-slot="scope">
            {{ scope.row.driverPrice || '无' }}
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @current-change="handleDetailPageChange" :current-page="detailCurrentPage" :page-size="perPage"
        layout="prev, pager, next" :total="totalDetails" />
      <el-button type="primary" @click="handleExport" :disabled="isExportDisabled">
        导出
      </el-button>
      <el-button type="primary" @click="handlePrint" :disabled="isExportDisabled || !details.length">
        打印
      </el-button>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import FleetSelect from '@/components/select/FleetSelect.vue';
import GoodsSelect from '@/components/select/GoodsSelect.vue';
import { searchTransportDetails } from '@/services/detailService';
import { getDriverExcel, getDriverPDF } from '@/services/export';
import { saveAs } from 'file-saver';
import { formatLoad } from '@/utils/load';

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
    const details = ref<Detail[]>([]);
    const filters = ref({
      vehicle_id: 0,
      goods_id: 0,
      dateRange: [null, null] as [Date | null, Date | null],
    });
    const errors = ref({
      vehicle_id: null as string | null,
      dateRange: null as string | null,
    });
    const detailCurrentPage = ref(1);
    const perPage = ref(10);
    const totalDetails = ref(0);
    const isExportDisabled = ref(true);

    const getRowKey = (row: Detail) => {
      return row.id;
    };

    const handleFilterChange = () => {
      isExportDisabled.value = true; // Disable export and print when filters are changed
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
        isExportDisabled.value = false; // Enable export and print after successful filtering
      }
    };

    const fetchFilteredDetails = async () => {
      try {
        const params = {
          vehicle_id: filters.value.vehicle_id,
          goods_id: filters.value.goods_id,
          start_date: filters.value.dateRange[0] ? filters.value.dateRange[0]!.toISOString() : null,
          end_date: filters.value.dateRange[1] ? filters.value.dateRange[1]!.toISOString() : null,
        };
        const response = await searchTransportDetails(params, perPage.value, detailCurrentPage.value);
        details.value = response.data.items.map((item: any) => ({
          id: item.id,
          vehicle: item.vehicle || { license: '', driver: '' },
          goods: item.goods || { name: '' },
          quantity: item.quantity || 0,
          unit: item.unit || '',
          load: item.load || '',
          driverPrice: item.driverPrice || 0,
        }));
        totalDetails.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch details', error);
      }
    };

    const handleDetailPageChange = (page: number) => {
      detailCurrentPage.value = page;
      fetchFilteredDetails();
    };

    const handleExport = async () => {
      const exportData = {
        vehicle_id: filters.value.vehicle_id,
        start_date: filters.value.dateRange[0] ? filters.value.dateRange[0]!.toISOString() : '',
        end_date: filters.value.dateRange[1] ? filters.value.dateRange[1]!.toISOString() : '',
        goods_id: filters.value.goods_id,
      };

      try {
        const exportResponse = await getDriverExcel(exportData);
        const blob = new Blob([exportResponse.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, '驾驶员对账表.xlsx');
      } catch (error) {
        console.error('Error exporting driver statement:', error);
      }
    };

    const handlePrint = async () => {
      const printData = {
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
            printWindow.focus();
            printWindow.print();
            printWindow.onafterprint = () => {
              printWindow.close();
            };
          });
        }
      } catch (error) {
        console.error('Error printing driver statement:', error);
      }
    };

    onMounted(() => {
      fetchFilteredDetails();
    });

    return {
      filters,
      errors,
      details,
      detailCurrentPage,
      perPage,
      totalDetails,
      isExportDisabled,
      getRowKey,
      handleFilterChange,
      validateAndFetchDetails,
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
