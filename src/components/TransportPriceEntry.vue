<template>
  <div class="transport-price-entry">
    <el-card>
      <h2>运输单价录入</h2>
      <el-form @submit.prevent="fetchFilteredDetails" label-width="auto" label-position="left">
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
        <el-form-item label="时间范围" class="custom-date-picker">
          <el-date-picker v-model="filters.dateRange" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期"
            @change="handleFilterChange"></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchFilteredDetails" plain>筛选</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="currentDetails" style="width: 100%" @selection-change="handleSelectionChange" ref="detailTable"
        :row-key="getRowKey" border>
        <el-table-column type="selection" width="55" :reserve-selection="true"></el-table-column>
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
      <div style="margin-top: 10px;">
        <el-button type="primary" @click="toggleAllSelection" plain>{{ isAllSelected ? '取消全选' : '全选' }}</el-button>
        <el-button v-if="!isEditing" type="primary" @click="toggleEditMode"
          :disabled="!selectedDetails.length || isEditingDisabled" plain>
          修改
        </el-button>
      </div>
    </el-card>

    <el-dialog title="修改选中的运输单价" v-model="isEditing" width="30%">
      <el-form @submit.prevent="saveDetail" label-position="left" label-width="auto">
        <el-form-item label="工地承接单价">
          <el-input v-model="editForm.contractorPrice" type="number" placeholder="请输入工地承接单价" class="custom-input" />
        </el-form-item>
        <el-form-item label="起点补贴金额">
          <el-input v-model="editForm.startSubsidy" type="number" placeholder="请输入起点补贴金额"
            class="custom-input"></el-input>
        </el-form-item>
        <el-form-item label="弃点付费金额">
          <el-input v-model="editForm.endSubsidy" type="number" placeholder="请输入弃点付费金额"
            class="custom-input"></el-input>
        </el-form-item>
        <el-form-item label="终点付费金额">
          <el-input v-model="editForm.endPayment" type="number" placeholder="请输入终点付费金额"
            class="custom-input"></el-input>
        </el-form-item>
        <el-form-item label="给司机运费">
          <el-input v-model="editForm.driverPrice" type="number" placeholder="请输入给司机运费"
            class="custom-input"></el-input>
        </el-form-item>
        <el-button type="primary" @click="saveDetail" plain>保存</el-button>
        <el-button @click="cancelEdit" plain>取消</el-button>
      </el-form>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import OwnerSelect from '@/components/select/OwnerSelect.vue';
import OwnerProjectsSelect from '@/components/select/OwnerProjectsSelect.vue';
import GoodsSelect from '@/components/select/GoodsSelect.vue';
import OwnerStartSitesSelect from '@/components/select/OwnerStartSitesSelect.vue';
import OwnerEndSitesSelect from '@/components/select/OwnerEndSitesSelect.vue';
import UnitSelect from './select/UnitSelect.vue';
import { formatDate } from '../utils/time';
import { searchTransportDetails, updateTransportPrices } from '@/services/detailService';
import { ElLoading, ElMessage, ElTable } from 'element-plus';

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

interface EditForm {
  contractorPrice?: number;
  startSubsidy?: number;
  endSubsidy?: number;
  endPayment?: number;
  driverPrice?: number;
}

export default defineComponent({
  name: 'TransportPriceEntry',
  components: {
    OwnerSelect,
    OwnerProjectsSelect,
    GoodsSelect,
    OwnerStartSitesSelect,
    OwnerEndSitesSelect,
    UnitSelect,
  },
  setup() {
    // 表格引用
    const detailTable = ref<InstanceType<typeof ElTable>>();
    // 条目
    const details = ref<Detail[]>([]);
    const currentDetails = ref<Detail[]>([]);
    // 筛选器
    const filters = ref({
      owner: '',
      projectId: 0,
      goods_id: 0,
      startsite_id: 0,
      endsite_id: 0,
      dateRange: [],
    });
    // 选择条目
    const selectedDetails = ref<Detail[]>([]);
    // 修改框
    const editForm = ref<EditForm>({});

    const detailCurrentPage = ref(1);
    const perPage = ref(10);
    const totalDetails = ref(0);

    const isEditing = ref(false);
    const isEditingDisabled = ref(true);  // 用于禁用“修改”按钮

    const getRowKey = (row: Detail) => {
      return row.id;
    };

    const fetchFilteredDetails = async () => {
      const loadingInstance = ElLoading.service({
        lock: true,
        text: '正在加载，请稍候...',
        background: 'rgba(0, 0, 0, 0.7)',
      });
      try {


        const date_check = filters.value.dateRange;
        const params = {
          ownerName: filters.value.owner,
          project_id: filters.value.projectId,
          goods_id: filters.value.goods_id,
          startsite_id: filters.value.startsite_id,
          endsite_id: filters.value.endsite_id,
          start_date: date_check ? (filters.value.dateRange[0] ? new Date(filters.value.dateRange[0]).toISOString() : null) : null,
          end_date: date_check ? (filters.value.dateRange[1] ? new Date(filters.value.dateRange[1]).toISOString() : null) : null,
        };

        const response = await searchTransportDetails(params, 100000, 1);
        details.value = response.data.items;
        totalDetails.value = details.value.length;

        // 切换到第一页
        handleDetailPageChange(1);

        // 清空选中项
        if (detailTable.value) {
          detailTable.value.clearSelection(); // 清除表格中的选择状态
        }
        selectedDetails.value = [];
        cancelEdit();
        isEditingDisabled.value = false;  // 启用“修改”按钮
        loadingInstance.close(); // 关闭加载框
      } catch (error) {
        loadingInstance.close(); // 关闭加载框
        ElMessage.error('运输明细获取失败，请稍后再试');
        console.error('Failed to fetch details', error);
      }
    };

    const handleFilterChange = () => {
      isEditingDisabled.value = true;  // 禁用“修改”按钮
      cancelEdit();

      selectedDetails.value = [];  // 清空选中项
      if (detailTable.value) {
        detailTable.value.clearSelection(); // 清除表格中的选择状态
      }
    };
    // 切换页码
    const handleDetailPageChange = (page: number) => {
      detailCurrentPage.value = page;
      currentDetails.value = details.value.slice((detailCurrentPage.value - 1) * perPage.value, detailCurrentPage.value * perPage.value);
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
        ElMessage.success('价格更新成功');
        fetchFilteredDetails(); // 刷新列表
      } catch (error) {
        ElMessage.error('价格更新失败，请稍后再试');
        console.error('Failed to update prices', error);
      }
    };

    const cancelEdit = () => {
      isEditing.value = false;
      editForm.value = {
        contractorPrice: undefined,
        startSubsidy: undefined,
        endSubsidy: undefined,
        endPayment: undefined,
        driverPrice: undefined,
      };
    };
    const showMessage = () => {
      ElMessage.warning('修改功能维护中');
    };
    onMounted(() => {
      // showMessage();
      fetchFilteredDetails();
    });

    return {
      details,
      detailTable,
      currentDetails,
      filters,
      selectedDetails,
      editForm,
      detailCurrentPage,
      perPage,
      totalDetails,
      isEditing,
      isEditingDisabled,
      showMessage,
      getRowKey,
      fetchFilteredDetails,
      handleFilterChange,
      handleSelectionChange,
      toggleAllSelection,
      isAllSelected,
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
@import '@/assets/select.css';
</style>
