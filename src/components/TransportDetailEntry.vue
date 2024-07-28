<template>
  <div class="transport-detail-entry">
    <el-card>
      <h2>运输明细录入</h2>
      <el-form @submit.prevent="addDetail">
        <StartSiteSelect v-model="form.start_site_id" />
        <StartSpotInput v-model="form.start_spot" />
        <EndSiteSelect v-model="form.end_site_id" />
        <FleetSelect v-model="form.vehicle_id" />
        <GoodsSelect v-model="form.goods_id" />
        <DateRangePicker v-model="form.date_range" />
        <el-form-item>
          <el-button type="primary" @click="addDetail">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <h2>已录入的运输明细</h2>
      <el-table :data="details" style="width: 100%">
        <el-table-column prop="start_site.name" label="运输起点">
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <StartSiteSelect v-model="editingDetail.start_site_id" />
            </div>
            <div v-else>
              {{ scope.row.start_site.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="start_spot" label="运输起点描述">
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <StartSpotInput v-model="editingDetail.start_spot" />
            </div>
            <div v-else>
              {{ scope.row.start_spot }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="end_site.name" label="运输终点">
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <EndSiteSelect v-model="editingDetail.end_site_id" />
            </div>
            <div v-else>
              {{ scope.row.end_site.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="vehicle.driver" label="运输车队">
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <FleetSelect v-model="editingDetail.vehicle_id" />
            </div>
            <div v-else>
              {{ scope.row.vehicle.driver }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="goods.name" label="运输品类">
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <GoodsSelect v-model="editingDetail.goods_id" />
            </div>
            <div v-else>
              {{ scope.row.goods.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="start_date" label="开始日期">
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <el-date-picker v-model="editingDetail.start_date" type="date" placeholder="选择开始日期"></el-date-picker>
            </div>
            <div v-else>
              {{ scope.row.start_date }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="end_date" label="结束日期">
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <el-date-picker v-model="editingDetail.end_date" type="date" placeholder="选择结束日期"></el-date-picker>
            </div>
            <div v-else>
              {{ scope.row.end_date }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <el-button type="primary" @click="saveDetail(scope.row.id)">保存</el-button>
              <el-button @click="cancelEdit">取消</el-button>
            </div>
            <div v-else>
              <el-button @click="editDetail(scope.row)">修改</el-button>
              <el-button type="danger" @click="removeDetail(scope.row.id)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @current-change="handleDetailPageChange" :current-page="detailCurrentPage" :page-size="perPage" layout="prev, pager, next" :total="totalDetails" />
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import StartSiteSelect from '@/components/select/StartSiteSelect.vue';
import StartSpotInput from '@/components/input/StartSpotInput.vue';
import EndSiteSelect from '@/components/select/EndSiteSelect.vue';
import FleetSelect from '@/components/select/FleetSelect.vue';
import GoodsSelect from '@/components/select/GoodsSelect.vue';
import DateRangePicker from '@/components/select/DateRangePicker.vue';
import {
  getTransportDetails,
  addTransportDetail,
  delTransportDetail,
  updateTransportDetail
} from '@/services/transportService';

export default defineComponent({
  name: 'TransportDetailEntry',
  components: {
    StartSiteSelect,
    StartSpotInput,
    EndSiteSelect,
    FleetSelect,
    GoodsSelect,
    DateRangePicker
  },
  setup() {
    const details = ref<{
      id: number,
      start_site: { name: string },
      start_spot: string,
      end_site: { name: string },
      vehicle: { driver: string },
      goods: { name: string },
      start_date: string,
      end_date: string
    }[]>([]);
    const form = ref({
      start_site_id: 0,
      start_spot: '',
      end_site_id: 0,
      vehicle_id: 0,
      goods_id: 0,
      date_range: ['', ''],
    });
    const editingDetail = ref({
      start_site_id: 0,
      start_spot: '',
      end_site_id: 0,
      vehicle_id: 0,
      goods_id: 0,
      start_date: '',
      end_date: '',
    });

    const editingId = ref<number | null>(null);

    const detailCurrentPage = ref(1);
    const perPage = ref(10);
    const totalDetails = ref(0);

    const fetchDetails = async () => {
      try {
        const response = await getTransportDetails(perPage.value, detailCurrentPage.value);
        details.value = response.data.items;
        totalDetails.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch details', error);
      }
    };

    const addDetail = async () => {
      try {
        const data = {
          startsite_id: form.value.start_site_id,
          start_spot: form.value.start_spot,
          endsite_id: form.value.end_site_id,
          vehicle_id: form.value.vehicle_id,
          goods_id: form.value.goods_id,
          start_date: form.value.date_range[0],
          end_date: form.value.date_range[1],
        };
        await addTransportDetail(data);
        alert('运输明细录入成功');
        form.value = {
          start_site_id: 0,
          start_spot: '',
          end_site_id: 0,
          vehicle_id: 0,
          goods_id: 0,
          date_range: ['', ''],
        };
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

    const editDetail = (detail: { id: number, start_site: { id: number }, start_spot: string, end_site: { id: number }, vehicle: { id: number }, goods: { id: number }, start_date: string, end_date: string }) => {
      editingDetail.value = {
        start_site_id: detail.start_site.id,
        start_spot: detail.start_spot,
        end_site_id: detail.end_site.id,
        vehicle_id: detail.vehicle.id,
        goods_id: detail.goods.id,
        start_date: detail.start_date,
        end_date: detail.end_date,
      };
      editingId.value = detail.id;
    };

    const saveDetail = async (itemId: number) => {
      try {
        const data = {
          item_id: itemId,
          startsite_id: editingDetail.value.start_site_id,
          start_spot: editingDetail.value.start_spot,
          endsite_id: editingDetail.value.end_site_id,
          vehicle_id: editingDetail.value.vehicle_id,
          goods_id: editingDetail.value.goods_id,
          start_date: editingDetail.value.start_date,
          end_date: editingDetail.value.end_date,
        };
        await updateTransportDetail(data);
        alert('运输明细更新成功');
        editingDetail.value = {
          start_site_id: 0,
          start_spot: '',
          end_site_id: 0,
          vehicle_id: 0,
          goods_id: 0,
          start_date: '',
          end_date: '',
        };
        fetchDetails(); // 刷新列表
        editingId.value = null;
      } catch (error) {
        console.error('Failed to update transport detail', error);
      }
    };

    const cancelEdit = () => {
      editingDetail.value = {
        start_site_id: 0,
        start_spot: '',
        end_site_id: 0,
        vehicle_id: 0,
        goods_id: 0,
        start_date: '',
        end_date: '',
      };
      editingId.value = null;
    };

    const handleDetailPageChange = (page: number) => {
      detailCurrentPage.value = page;
      fetchDetails();
    };

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
      addDetail,
      removeDetail,
      editDetail,
      saveDetail,
      cancelEdit,
      handleDetailPageChange,
    };
  },
});
</script>

<style scoped>
.detail-entry {
  padding: 20px;
}

.el-card {
  margin-bottom: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>
