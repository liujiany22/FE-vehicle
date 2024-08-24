<template>
  <div class="end-excel">
    <el-card>
      <h2>终点对账表</h2>
      <el-form @submit.prevent="fetchFilteredDetails">
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
          <el-button type="primary" @click="fetchFilteredDetails">筛选</el-button>
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
      <el-button type="primary" @click="handleExport" :disabled="!selectedDetails.length">
        导出
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
import { getEndExcel } from '@/services/export';
import { saveAs } from 'file-saver';
import { formatLoad } from '@/utils/load';
import { formatDate } from '@/utils/time';

interface Detail {
  id: number;
  project: { name: string };
  start_site: { name: string };
  end_site: { name: string };
  vehicle: { license: string };  // 修改为单个 vehicle 对象
  goods: { name: string };
  quantity: number;
  unit: string;
  date: string | null;
  load: string;
}

export default defineComponent({
  name: 'EndExcel',
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
      dateRange: [],
    });
    const selectedDetails = ref<Detail[]>([]);
    const detailCurrentPage = ref(1);
    const perPage = ref(10);
    const totalDetails = ref(0);

    const getRowKey = (row: Detail) => {
  return row.id;
};

    const fetchFilteredDetails = async () => {
      try {
        const params = {
          project_id: filters.value.projectId,
          startsite_id: filters.value.startsite_id,
          endsite_id: filters.value.endsite_id,
          goods_id: filters.value.goods_id,
          start_date: filters.value.dateRange[0] ? new Date(filters.value.dateRange[0]).toISOString() : null,
          end_date: filters.value.dateRange[1] ? new Date(filters.value.dateRange[1]).toISOString() : null,
        };
        const response = await searchTransportDetails(params, perPage.value, detailCurrentPage.value);
        details.value = response.data.items.map((item: any) => ({
          id: item.id,
          project: item.project || { name: '' },
          start_site: item.start_site || { name: '' },
          end_site: item.end_site || { name: '' },
          vehicle: item.vehicle || { license: '', driver: '' },  // 修改为处理单个 vehicle 对象
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
        start_date: filters.value.dateRange[0] ? new Date(filters.value.dateRange[0]).toISOString() : '',
        end_date: filters.value.dateRange[1] ? new Date(filters.value.dateRange[1]).toISOString() : '',
        startsite_id: filters.value.startsite_id,
        endsite_id: filters.value.endsite_id,
        goods_id: filters.value.goods_id,
      };

      try {
        const exportResponse = await getEndExcel(exportData);
        const blob = new Blob([exportResponse.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, '终点对账表.xlsx');
      } catch (error) {
        console.error('Error exporting site entry:', error);
      }
    };

    onMounted(() => {
      fetchFilteredDetails();
    });

    return {
      filters,
      details,
      selectedDetails,
      detailCurrentPage,
      perPage,
      totalDetails,
      getRowKey,
      fetchFilteredDetails,
      handleSelectionChange,
      handleExport,
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
