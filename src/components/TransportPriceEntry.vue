<!-- <template>
  <div class="transport-price-entry">
    <el-card>
      <h2>运输单价录入</h2>
      <el-form @submit.prevent="fetchFilteredDetails">
        <el-form-item label="起点工地">
          <el-select v-model="filters.startPoint" placeholder="请选择起点工地" @change="handleStartPointChange" @visible-change="handleStartPointVisibleChange">
            <el-option v-for="item in startPoints" :key="item.id" :label="item.name" :value="item.name"></el-option>
            <div class="pagination-container">
              <el-pagination 
                @current-change="handleStartPointPageChange" 
                :current-page="startPointCurrentPage"
                :page-size="perPage" 
                layout="prev, pager, next" 
                :total="totalStartPoints" />
            </div>
          </el-select>
        </el-form-item>
        <el-form-item label="终点工地">
          <el-select v-model="filters.endPoint" placeholder="请选择终点工地" @change="handleEndPointChange" @visible-change="handleEndPointVisibleChange">
            <el-option v-for="item in endPoints" :key="item.id" :label="item.name" :value="item.name"></el-option>
            <div class="pagination-container">
              <el-pagination 
                @current-change="handleEndPointPageChange" 
                :current-page="endPointCurrentPage"
                :page-size="perPage" 
                layout="prev, pager, next" 
                :total="totalEndPoints" />
            </div>
          </el-select>
        </el-form-item>
        <el-form-item label="运输品类">
          <el-select v-model="filters.category" placeholder="请选择运输品类" @change="handleCategoryChange" @visible-change="handleCategoryVisibleChange">
            <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.name"></el-option>
            <div class="pagination-container">
              <el-pagination 
                @current-change="handleCategoryPageChange" 
                :current-page="categoryCurrentPage"
                :page-size="perPage" 
                layout="prev, pager, next" 
                :total="totalCategories" />
            </div>
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker v-model="filters.dateRange" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchFilteredDetails">筛选</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="details" style="width: 100%" @selection-change="handleSelectionChange" ref="detailTable">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="startPoint" label="起点工地"></el-table-column>
        <el-table-column prop="endPoint" label="终点工地"></el-table-column>
        <el-table-column prop="category" label="运输品类"></el-table-column>
        <el-table-column prop="date" label="日期"></el-table-column>
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
      <el-button type="primary" @click="updatePrices">保存所有修改</el-button>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import {
  getTransportDetails,
  getTransportStartPoints,
  getTransportEndPoints,
  getTransportCategories,
  updateTransportPrices,
} from '@/services/transportService';

export default defineComponent({
  name: 'TransportPriceEntry',
  setup() {
    const startPoints = ref<{ id: number, name: string }[]>([]);
    const endPoints = ref<{ id: number, name: string }[]>([]);
    const categories = ref<{ id: number, name: string }[]>([]);
    const details = ref<any[]>([]);
    const filters = ref({
      startPoint: '',
      endPoint: '',
      category: '',
      dateRange: [],
    });
    const selectedDetails = ref<any[]>([]);

    const startPointCurrentPage = ref(1);
    const endPointCurrentPage = ref(1);
    const categoryCurrentPage = ref(1);
    const perPage = ref(10);
    const totalStartPoints = ref(0);
    const totalEndPoints = ref(0);
    const totalCategories = ref(0);

    const fetchStartPoints = async () => {
      try {
        const response = await getTransportStartPoints(perPage.value, startPointCurrentPage.value);
        startPoints.value = response.data.start_sites;
        totalStartPoints.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch start points', error);
      }
    };

    const fetchEndPoints = async () => {
      try {
        const response = await getTransportEndPoints(perPage.value, endPointCurrentPage.value);
        endPoints.value = response.data.end_sites; // 假设终点和起点的数据结构相同
        totalEndPoints.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch end points', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await getTransportCategories(perPage.value, categoryCurrentPage.value);
        categories.value = response.data.goods;
        totalCategories.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };

    const fetchFilteredDetails = async () => {
      try {
        const response = await getTransportDetails();
        details.value = response.data.filter((detail: any) => {
          return (
            (!filters.value.startPoint || detail.startPoint === filters.value.startPoint) &&
            (!filters.value.endPoint || detail.endPoint === filters.value.endPoint) &&
            (!filters.value.category || detail.category === filters.value.category) &&
            (!filters.value.dateRange.length ||
              (new Date(detail.date) >= new Date(filters.value.dateRange[0]) &&
                new Date(detail.date) <= new Date(filters.value.dateRange[1])))
          );
        });
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

    const handleStartPointPageChange = (page: number) => {
      startPointCurrentPage.value = page;
      fetchStartPoints();
    };

    const handleStartPointVisibleChange = (visible: boolean) => {
      if (visible) {
        fetchStartPoints();
      }
    };

    const handleEndPointPageChange = (page: number) => {
      endPointCurrentPage.value = page;
      fetchEndPoints();
    };

    const handleEndPointVisibleChange = (visible: boolean) => {
      if (visible) {
        fetchEndPoints();
      }
    };

    const handleCategoryPageChange = (page: number) => {
      categoryCurrentPage.value = page;
      fetchCategories();
    };

    const handleCategoryVisibleChange = (visible: boolean) => {
      if (visible) {
        fetchCategories();
      }
    };

    onMounted(() => {
      fetchStartPoints();
      fetchEndPoints();
      fetchCategories();
      fetchFilteredDetails();
    });

    return {
      startPoints,
      endPoints,
      categories,
      details,
      filters,
      selectedDetails,
      startPointCurrentPage,
      endPointCurrentPage,
      categoryCurrentPage,
      perPage,
      totalStartPoints,
      totalEndPoints,
      totalCategories,
      fetchFilteredDetails,
      handleSelectionChange,
      updatePrices,
      handleStartPointPageChange,
      handleStartPointVisibleChange,
      handleEndPointPageChange,
      handleEndPointVisibleChange,
      handleCategoryPageChange,
      handleCategoryVisibleChange,
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
</style> -->
