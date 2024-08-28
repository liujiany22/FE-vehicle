<template>
  <div class="transport-detail-entry">
    <el-card>
      <h2>运输明细录入</h2>
      <el-form @submit.prevent="addDetail" label-position="left" label-width="auto">
        <el-form-item label="老板">
          <OwnerSelect v-model="form.owner" />
        </el-form-item>
        <el-form-item label="项目" :error="errors.project_id">
          <OwnerProjectsSelect v-model="form.project_id" :ownerName="form.owner" />
        </el-form-item>
        <el-form-item label="运输起点" :error="errors.start_site_id">
          <StartSiteSelect v-model="form.start_site_id" />
        </el-form-item>
        <el-form-item label="运输终点" :error="errors.end_site_id">
          <EndSiteSelect v-model="form.end_site_id" />
        </el-form-item>
        <el-form-item label="运输车队">
          <FleetsSelect ref="fleetsSelect" v-model:vehicleIds="form.vehicle_ids" v-model:quantities="form.quantities" />
        </el-form-item>
        <el-form-item label="运输品类" :error="errors.goods_id">
          <GoodsSelect v-model="form.goods_id" />
        </el-form-item>
        <el-form-item label="单位" :error="errors.unit">
          <el-input v-model="form.unit" placeholder="输入单位" class="custom-input" />
        </el-form-item>
        <el-form-item label="日期" :error="errors.date">
          <el-date-picker v-model="form.date" type="date" placeholder="选择日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="装载方式">
          <LoadSelect v-model="form.load" />
        </el-form-item>
        <el-form-item label="工地承接单价">
          <el-input v-model="form.contractorPrice" type="number" placeholder="输入承包价格" class="custom-input" />
        </el-form-item>
        <el-form-item label="起点补贴金额">
          <el-input v-model="form.startSubsidy" type="number" placeholder="输入起点补贴" class="custom-input" />
        </el-form-item>
        <el-form-item label="终点补贴金额">
          <el-input v-model="form.endSubsidy" type="number" placeholder="输入终点补贴" class="custom-input" />
        </el-form-item>
        <el-form-item label="弃点付费金额">
          <el-input v-model="form.endPayment" type="number" placeholder="输入终点支付" class="custom-input" />
        </el-form-item>
        <el-form-item label="给司机单价">
          <el-input v-model="form.driverPrice" type="number" placeholder="输入司机价格" class="custom-input" />
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="form.note" placeholder="输入备注" class="custom-input" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addDetail" plain>提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <h2>已录入的运输明细</h2>
      <el-table :data="details" style="width: 100%" border>
        <el-table-column prop="project.name" label="项目" v-slot="scope" show-overflow-tooltip>
          <div v-if="isEditing(scope.row.id)">
            <ProjectSelect v-model="editingDetail.project_id" />
          </div>
          <div v-else>
            {{ scope.row.project?.name || '无' }}
          </div>
        </el-table-column>
        <el-table-column prop="start_site.name" label="运输起点" v-slot="scope" show-overflow-tooltip>
          <div v-if="isEditing(scope.row.id)">
            <StartSiteSelect v-model="editingDetail.start_site_id" />
          </div>
          <div v-else>
            {{ scope.row.start_site?.name || '无' }}
          </div>
        </el-table-column>
        <el-table-column prop="end_site.name" label="运输终点" v-slot="scope" show-overflow-tooltip>
          <div v-if="isEditing(scope.row.id)">
            <EndSiteSelect v-model="editingDetail.end_site_id" />
          </div>
          <div v-else>
            {{ scope.row.end_site?.name || '无' }}
          </div>
        </el-table-column>
        <el-table-column prop="vehicle" label="运输车队" v-slot="scope" show-overflow-tooltip>
          <div v-if="isEditing(scope.row.id)">
            <FleetSelect v-model="editingDetail.vehicle_id" />
          </div>
          <div v-else>
            {{ scope.row.vehicle ? `${scope.row.vehicle.license} (${scope.row.vehicle?.driver || '无司机'})` : '无' }}
          </div>
        </el-table-column>

        <el-table-column prop="goods.name" label="运输品类" v-slot="scope" show-overflow-tooltip> 
          <div v-if="isEditing(scope.row.id)">
            <GoodsSelect v-model="editingDetail.goods_id" />
          </div>
          <div v-else>
            {{ scope.row.goods?.name || '无' }}
          </div>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" v-slot="scope" show-overflow-tooltip>
          <div v-if="isEditing(scope.row.id)">
            <el-input v-model="editingDetail.quantity" type="number" placeholder="输入数量" />
          </div>
          <div v-else>
            {{ scope.row.quantity || '无' }}
          </div>
        </el-table-column>
        <el-table-column prop="unit" label="单位" v-slot="scope" show-overflow-tooltip>
          <div v-if="isEditing(scope.row.id)">
            <el-input v-model="editingDetail.unit" placeholder="输入单位" />
          </div>
          <div v-else>
            {{ scope.row.unit || '无' }}
          </div>
        </el-table-column>
        <el-table-column prop="date" label="日期" v-slot="scope" show-overflow-tooltip>
          <div v-if="isEditing(scope.row.id)">
            <el-date-picker v-model="editingDetail.date" type="date" placeholder="选择日期"></el-date-picker>
          </div>
          <div v-else>
            {{ formatDate(scope.row.date) || '无' }}
          </div>
        </el-table-column>
        <el-table-column prop="load" label="装载方式" v-slot="scope" show-overflow-tooltip>
          <div v-if="isEditing(scope.row.id)">
            <LoadSelect v-model="editingDetail.load" />
          </div>
          <div v-else>
            {{ formatLoad(scope.row.load) || '无' }}
          </div>
        </el-table-column>

        <el-table-column prop="note" label="备注" v-slot="scope" show-overflow-tooltip>
          <div v-if="isEditing(scope.row.id)">
            <el-input v-model="editingDetail.note" placeholder="输入备注" />
          </div>
          <div v-else>
            {{ scope.row.note || '无' }}
          </div>
        </el-table-column>
        <el-table-column label="操作" v-slot="scope" show-overflow-tooltip>
          <div v-if="isEditing(scope.row.id)">
            <el-button type="primary" @click="saveDetail(scope.row.id)" plain size="small">保存</el-button>
            <el-button @click="cancelEdit" plain size="small">取消</el-button>
          </div>
          <div v-else>
            <el-button @click="editDetail(scope.row)" plain size="small">修改</el-button>
            <el-button type="danger" @click="removeDetail(scope.row.id)" plain size="small">删除</el-button>
          </div>
        </el-table-column>
      </el-table>
      <el-pagination @current-change="handleDetailPageChange" :current-page="detailCurrentPage" :page-size="perPage"
        layout="prev, pager, next" :total="totalDetails" />
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { formatDate } from '../utils/time';
import { formatLoad } from '../utils/load';
import ProjectSelect from './select/ProjectSelect.vue';
import StartSiteSelect from '@/components/select/StartSiteSelect.vue';
import EndSiteSelect from '@/components/select/EndSiteSelect.vue';
import FleetsSelect from '@/components/select/FleetsSelect.vue';
import FleetSelect from './select/FleetSelect.vue';
import GoodsSelect from '@/components/select/GoodsSelect.vue';
import LoadSelect from '@/components/select/LoadSelect.vue';
import OwnerSelect from './select/OwnerSelect.vue';
import OwnerProjectsSelect from './select/OwnerProjectsSelect.vue';
import {
  getTransportDetails,
  addTransportDetail,
  delTransportDetail,
  updateTransportDetail
} from '@/services/detailService';

export default defineComponent({
  name: 'TransportDetailEntry',
  components: {
    ProjectSelect,
    StartSiteSelect,
    EndSiteSelect,
    FleetsSelect,
    FleetSelect,
    GoodsSelect,
    LoadSelect,
    OwnerProjectsSelect,
    OwnerSelect,
  },
  setup() {
    const details = ref([]);
    const form = ref({
      owner: '',
      project_id: 0,
      start_site_id: 0,
      end_site_id: 0,
      vehicle_ids: [] as number[],  // 存储车辆ID数组
      quantities: [] as number[], // 存储数量数组
      goods_id: 0,
      unit: '',
      date: '',
      load: '',
      contractorPrice: 0,
      startSubsidy: 0,
      endSubsidy: 0,
      endPayment: 0,
      driverPrice: 0,
      note: ''
    });
    const editingDetail = ref({
      start_site_id: 0,
      end_site_id: 0,
      vehicle_id: 0,
      goods_id: 0,
      quantity: 0,
      unit: '',
      date: '',
      load: '',
      project_id: 0,
      note: ''
    });

    const editingId = ref<number | null>(null);
    const errors = ref<{
      project_id: string | null,
      start_site_id: string | null,
      end_site_id: string | null,
      goods_id: string | null,
      unit: string | null,
      date: string | null,
    }>({
      project_id: null,
      start_site_id: null,
      end_site_id: null,
      goods_id: null,
      unit: null,
      date: null,
    });

    const detailCurrentPage = ref(1);
    const perPage = ref(10);
    const totalDetails = ref(0);
    const fleetsSelect = ref<InstanceType<typeof FleetsSelect> | null>(null);

    const fetchDetails = async () => {
      try {
        const response = await getTransportDetails(perPage.value, detailCurrentPage.value);
        details.value = response.data.items.map((item: any) => ({
          ...item,
          start_site: item.start_site || { name: '' },
          end_site: item.end_site || { name: '' },
          vehicle: item.vehicle || { license:'', driver:''},
          goods: item.goods || { name: '' },
          load: item.load || '',
          project: item.project || { name: '' },
        }));
        totalDetails.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch details', error);
      }
    };

    const validateInputs = () => {
      errors.value.project_id = form.value.project_id ? null : '项目不能为空';
      errors.value.start_site_id = form.value.start_site_id ? null : '运输起点不能为空';
      errors.value.end_site_id = form.value.end_site_id ? null : '运输终点不能为空';
      errors.value.goods_id = form.value.goods_id ? null : '运输品类不能为空';
      errors.value.unit = form.value.unit.trim() ? null : '单位不能为空';
      errors.value.date = form.value.date ? null : '日期不能为空';

      return !errors.value.project_id && !errors.value.start_site_id && !errors.value.end_site_id && !errors.value.goods_id && !errors.value.unit && !errors.value.date;
    };

    const addDetail = async () => {
      try {
        if (!validateInputs()) {
          return;
        }

        if (form.value.vehicle_ids.length === 0) {
          alert('请先添加至少一辆车辆及其数量');
          return;
        }
        // 遍历每个 vehicle 对象并发送单独的请求
        for (let i = 0; i < form.value.vehicle_ids.length; i++) {
          const data = {
            startsite_id: form.value.start_site_id,
            endsite_id: form.value.end_site_id,
            vehicle_id: form.value.vehicle_ids[i],
            goods_id: form.value.goods_id,
            load: form.value.load,
            project_id: form.value.project_id,
            quantity: form.value.quantities[i],
            unit: form.value.unit,
            date: form.value.date,
            contractorPrice: form.value.contractorPrice,
            startSubsidy: form.value.startSubsidy,
            endSubsidy: form.value.endSubsidy,
            endPayment: form.value.endPayment,
            driverPrice: form.value.driverPrice,
            note: form.value.note,
          };
          await addTransportDetail(data);
        }
        alert('运输明细录入成功');
        resetForm();
        if(fleetsSelect.value){
          
          fleetsSelect.value.addedVehicles = [];
        }
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

    const editDetail = (detail: any) => {
      editingDetail.value = {
        start_site_id: detail.start_site?.id || 0,
        end_site_id: detail.end_site?.id || 0,
        vehicle_id: detail.vehicle?.id || 0,
        goods_id: detail.goods?.id || 0,
        quantity: detail.quantity || 0,
        unit: detail.unit || '',
        date: detail.date || '',
        load: detail.load || '',
        project_id: detail.project?.id || 0,
        note: detail.note || ''
      };
      editingId.value = detail.id;
    };

    const saveDetail = async (itemId: number) => {
      try {
        const data = {
          item_id: itemId,
          startsite_id: editingDetail.value.start_site_id,
          endsite_id: editingDetail.value.end_site_id,
          vehicle_id: editingDetail.value.vehicle_id, 
          goods_id: editingDetail.value.goods_id,
          load: editingDetail.value.load,
          project_id: editingDetail.value.project_id,
          quantity: editingDetail.value.quantity,
          unit: editingDetail.value.unit,
          date: editingDetail.value.date,
          note: editingDetail.value.note
        };
        await updateTransportDetail(data);
        alert('运输明细更新成功');
        resetEditingDetail();
        fetchDetails(); // 刷新列表
      } catch (error) {
        console.error('Failed to update transport detail', error);
      }
    };

    const cancelEdit = () => {
      resetEditingDetail();
    };

    const handleDetailPageChange = (page: number) => {
      detailCurrentPage.value = page;
      fetchDetails();
    };

    const resetForm = () => {
      form.value = {
        start_site_id: 0,
        end_site_id: 0,
        vehicle_ids: [],
        quantities: [],
        goods_id: 0,
        unit: '',
        date: '',
        load: '',
        owner: '',
        project_id: 0,
        contractorPrice: 0,
        startSubsidy: 0,
        endSubsidy: 0,
        endPayment: 0,
        driverPrice: 0,
        note: ''
      };
    };

    const resetEditingDetail = () => {
      editingDetail.value = {
        start_site_id: 0,
        end_site_id: 0,
        vehicle_id: 0,
        goods_id: 0,
        quantity: 0,
        unit: '',
        date: '',
        load: '',
        project_id: 0,
        note: ''
      };
      editingId.value = null;
    };

    const isEditing = (id: number) => editingId.value === id;

    onMounted(() => {
      fetchDetails();
    });

    return {
      details,
      form,
      editingDetail,
      editingId,
      detailCurrentPage,
      perPage,
      totalDetails,
      fleetsSelect,
      addDetail,
      removeDetail,
      editDetail,
      saveDetail,
      cancelEdit,
      handleDetailPageChange,
      isEditing,
      formatDate,
      formatLoad,
      errors,
    };
  },
});
</script>


<style scoped>
@import '@/assets/select.css';
</style>
