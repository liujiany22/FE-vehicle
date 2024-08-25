<template>
  <div class="start-excel">
    <el-card>
      <h2>起点对账表</h2>
      <el-form @submit.prevent="validateAndFetchDetails">
        <el-form-item label="老板">
          <OwnerSelect v-model="filters.owner" @change="handleFilterChange" />
        </el-form-item>
        <el-form-item label="项目" :error="errors.projectId">
          <OwnerProjectsSelect v-model="filters.projectId" :ownerName="filters.owner" @change="handleFilterChange" />
        </el-form-item>
        <el-form-item label="运输起点">
          <OwnerStartSitesSelect v-model="filters.startsite_id" :ownerName="filters.owner" :project_id="filters.projectId" @change="handleFilterChange" />
        </el-form-item>
        <el-form-item label="运输终点">
          <OwnerEndSitesSelect v-model="filters.endsite_id" :ownerName="filters.owner" :project_id="filters.projectId" @change="handleFilterChange" />
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
      <el-table :data="details" style="width: 100%" @selection-change="handleSelectionChange" ref="detailTable" :row-key="getRowKey">
        <el-table-column type="selection" width="55" :reserve-selecti="true"></el-table-column>
        <el-table-column prop="project.name" label="项目名称">
          <template v-slot="scope">
            {{ scope.row.project?.name || '无' }}
          </template>
        </el-table-column>
        <el-table-column prop="start_site.name" label="起点工地">
          <template v-slot="scope">
            {{ scope.row.start_site?.name || '无' }}
          </template>
        </el-table-column>
        <el-table-column prop="end_site.name" label="终点工地">
          <template v-slot="scope">
            {{ scope.row.end_site?.name || '无' }}
          </template>
        </el-table-column>
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
        <el-table-column prop="date" label="日期">
          <template v-slot="scope">
            {{ formatDate(scope.row.date) || '无' }}
          </template>
        </el-table-column>
        <el-table-column prop="load" label="装载方式">
          <template v-slot="scope">
            {{ formatLoad(scope.row.load) || '无' }}
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @current-change="handleDetailPageChange" :current-page="detailCurrentPage" :page-size="perPage"
        layout="prev, pager, next" :total="totalDetails" />
      <el-button type="primary" @click="handleExport" :disabled="isExportDisabled || !selectedDetails.length">
        导出
      </el-button>
      <el-button type="primary" @click="handlePrint" :disabled="isExportDisabled || !selectedDetails.length">
        打印
      </el-button>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import OwnerSelect from '@/components/select/OwnerSelect.vue';
import OwnerProjectsSelect from '@/components/select/OwnerProjectsSelect.vue';
import OwnerStartSitesSelect from '../select/OwnerStartSitesSelect.vue';
import OwnerEndSitesSelect from '../select/OwnerEndSitesSelect.vue';
import GoodsSelect from '@/components/select/GoodsSelect.vue';
import { searchTransportDetails } from '@/services/detailService';
import { getStartExcel, getStartPDF } from '@/services/export';
import { saveAs } from 'file-saver';
import { formatLoad } from '@/utils/load';
import { formatDate } from '@/utils/time';

interface Detail {
  id: number;
  project: { name: string };
  start_site: { name: string };
  end_site: { name: string };
  vehicle: { license: string };
  goods: { name: string };
  quantity: number;
  unit: string;
  date: string | null;
  load: string;
}

export default defineComponent({
  name: 'StartExcel',
  components: {
    OwnerSelect,
    OwnerProjectsSelect,
    OwnerStartSitesSelect,
    OwnerEndSitesSelect,
    GoodsSelect,
  },
  setup() {
    const details = ref<Detail[]>([]);
    const filters = ref({
      owner: '',
      projectId: 0,
      startsite_id: 0,
      endsite_id: 0,
      goods_id: 0,
      dateRange: [null, null] as [Date | null, Date | null],
    });
    const errors = ref({
      projectId: null as string | null,
      dateRange: null as string | null,
    });
    const selectedDetails = ref<Detail[]>([]);
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
      if (!filters.value.projectId) {
        errors.value.projectId = '请选择项目';
        return;
      } else {
        errors.value.projectId = null;
      }

      if (!filters.value.dateRange || !filters.value.dateRange[0] || !filters.value.dateRange[1]) {
        errors.value.dateRange = '请选择时间范围';
        return;
      } else {
        errors.value.dateRange = null;
      }
      
      await fetchFilteredDetails();
      isExportDisabled.value = false;
    };

    const fetchFilteredDetails = async () => {
      try {
        const params = {
          project_id: filters.value.projectId,
          startsite_id: filters.value.startsite_id,
          endsite_id: filters.value.endsite_id,
          goods_id: filters.value.goods_id,
          start_date: filters.value.dateRange[0] ? filters.value.dateRange[0]!.toISOString() : null,
          end_date: filters.value.dateRange[1] ? filters.value.dateRange[1]!.toISOString() : null,
        };
        const response = await searchTransportDetails(params, perPage.value, detailCurrentPage.value);
        details.value = response.data.items.map((item: any) => ({
          id: item.id,
          project: item.project || { name: '' },
          start_site: item.start_site || { name: '' },
          end_site: item.end_site || { name: '' },
          vehicle: item.vehicle || { license: '', driver: '' },
          goods: item.goods || { name: '' },
          quantity: item.quantity || 0,
          unit: item.unit || '',
          date: item.date || null,
          load: item.load || '',
        }));
        totalDetails.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch details', error);
      }
    };

    const handleSelectionChange = (selection: Detail[]) => {
      selectedDetails.value = selection;
    };

    const handleDetailPageChange = (page: number) => {
      detailCurrentPage.value = page;
      fetchFilteredDetails();
    };

    const handleExport = async () => {
      const item_ids = selectedDetails.value.map(detail => detail.id);

      const exportData = {
        item_ids: item_ids,
        project_id: filters.value.projectId,
        start_date: filters.value.dateRange[0] ? filters.value.dateRange[0]!.toISOString() : '',
        end_date: filters.value.dateRange[1] ? filters.value.dateRange[1]!.toISOString() : '',
        startsite_id: filters.value.startsite_id,
        endsite_id: filters.value.endsite_id,
        goods_id: filters.value.goods_id,
      };

      try {
        const exportResponse = await getStartExcel(exportData);
        const blob = new Blob([exportResponse.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, '起点对账表.xlsx');
      } catch (error) {
        console.error('Error exporting site entry:', error);
      }
    };

    const handlePrint = async () => {
      const item_ids = selectedDetails.value.map(detail => detail.id);

      const exportData = {
        item_ids: item_ids,
        project_id: filters.value.projectId,
        start_date: filters.value.dateRange[0] ? filters.value.dateRange[0]!.toISOString() : '',
        end_date: filters.value.dateRange[1] ? filters.value.dateRange[1]!.toISOString() : '',
        startsite_id: filters.value.startsite_id,
        endsite_id: filters.value.endsite_id,
        goods_id: filters.value.goods_id,
      };

      try {
        const pdfResponse = await getStartPDF(exportData);
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
        console.error('Error printing site entry:', error);
      }
    };

    onMounted(() => {
      fetchFilteredDetails();
    });

    return {
      filters,
      errors,
      details,
      selectedDetails,
      detailCurrentPage,
      perPage,
      totalDetails,
      isExportDisabled,
      getRowKey,
      handleFilterChange,
      validateAndFetchDetails,
      handleSelectionChange,
      handleExport,
      handlePrint,
      handleDetailPageChange,
      formatDate,
      formatLoad,
    };
  },
});
</script>

<style scoped>
@import '@/assets/select.css';
</style>
