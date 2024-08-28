<template>
    <div class="fleet">
      <el-card>
        <h2>运输车队参数</h2>
        <el-form @submit.prevent="addParameter" label-width="auto" label-position="left">
          <el-form-item label="司机车牌号" :error="errors.license">
            <el-input v-model="newParameter.license" placeholder="请输入司机车牌号" class="custom-input"></el-input>
          </el-form-item>
          <el-form-item label="司机名字" :error="errors.driver">
            <el-input v-model="newParameter.driver" placeholder="请输入司机名字" class="custom-input"></el-input>
          </el-form-item>
          <el-form-item label="司机电话号码" :error="errors.phone">
            <el-input v-model="newParameter.phone" placeholder="请输入司机电话号码" class="custom-input"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addParameter" plain>添加</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="parameters" style="width: 100%" border>
          <el-table-column prop="license" label="司机车牌号" show-overflow-tooltip>
            <template v-slot:default="scope">
              <div v-if="editingId === scope.row.id">
                <el-input v-model="editingParameter.license" />
              </div>
              <div v-else>
                {{ scope.row.license }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="driver" label="司机名字" show-overflow-tooltip>
            <template v-slot:default="scope">
              <div v-if="editingId === scope.row.id">
                <el-input v-model="editingParameter.driver" />
              </div>
              <div v-else>
                {{ scope.row.driver }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="司机电话号码" show-overflow-tooltip>
            <template v-slot:default="scope">
              <div v-if="editingId === scope.row.id">
                <el-input v-model="editingParameter.phone" />
              </div>
              <div v-else>
                {{ scope.row.phone }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" show-overflow-tooltip>
            <template v-slot:default="scope">
              <div v-if="editingId === scope.row.id">
                <el-button type="primary" @click="saveParameter(scope.row.id)" plain size="small">保存</el-button>
                <el-button @click="cancelEdit" plain size="small">取消</el-button>
              </div>
              <div v-else>
                <el-button @click="editParameter(scope.row)" plain size="small">修改</el-button>
                <el-button type="danger" @click="removeParameter(scope.row.id)" plain size="small">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          @current-change="handlePageChange"
          :current-page="currentPage"
          :page-size="perPage"
          layout="prev, pager, next"
          :total="totalPages * perPage"
        />
      </el-card>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue';
  import { addFleet, delFleet, getFleets, updateFleet } from '@/services/transportService';
  
  export default defineComponent({
    name: 'Fleet',
    setup() {
      const parameters = ref<{ id: number, license: string, driver: string, phone: string }[]>([]);
      const newParameter = ref({ license: '', driver: '', phone: '' });
      const editingParameter = ref({ license: '', driver: '', phone: '' });
      const editingId = ref<number | null>(null);
      const currentPage = ref(1);
      const perPage = ref(20);
      const totalPages = ref(0);
      const errors = ref<{ license: string | null; driver: string | null; phone: string | null }>({
        license: null,
        driver: null,
        phone: null,
      });
  
      const fetchParameters = async () => {
        try {
          const response = await getFleets(perPage.value, currentPage.value);
          parameters.value = response.data.vehicle;
          totalPages.value = response.data.total_pages;
        } catch (error) {
          console.error('Failed to fetch parameters', error);
        }
      };
  
      const validateInputs = () => {
        errors.value.license = newParameter.value.license.trim() ? null : '司机车牌号不能为空';
        errors.value.driver = newParameter.value.driver.trim() ? null : '司机名字不能为空';
        errors.value.phone = newParameter.value.phone.trim() ? null : '司机电话号码不能为空';
  
        return !errors.value.license && !errors.value.driver && !errors.value.phone;
      };
  
      const addParameter = async () => {
        if (validateInputs()) {
          try {
            await addFleet(newParameter.value);
            fetchParameters();
            newParameter.value = { license: '', driver: '', phone: '' };
          } catch (error) {
            console.error('Failed to add parameter', error);
          }
        }
      };
  
      const removeParameter = async (id: number) => {
        try {
          await delFleet(id);
          fetchParameters();
        } catch (error) {
          console.error('Failed to delete parameter', error);
        }
      };
  
      const editParameter = (parameter: { id: number, license: string, driver: string, phone: string }) => {
        editingId.value = parameter.id;
        editingParameter.value = { ...parameter };
      };
  
      const saveParameter = async (id: number) => {
        try {
          await updateFleet({ vehicle_id: id, ...editingParameter.value });
          fetchParameters();
          cancelEdit();
        } catch (error) {
          console.error('Failed to update parameter', error);
        }
      };
  
      const cancelEdit = () => {
        editingId.value = null;
        editingParameter.value = { license: '', driver: '', phone: '' };
      };
  
      const handlePageChange = (page: number) => {
        currentPage.value = page;
        fetchParameters();
      };
  
      onMounted(fetchParameters);
  
      return {
        parameters,
        newParameter,
        editingParameter,
        editingId,
        currentPage,
        perPage,
        totalPages,
        errors,
        addParameter,
        removeParameter,
        editParameter,
        saveParameter,
        cancelEdit,
        handlePageChange,
      };
    },
  });
  </script>
  
  <style scoped>
  @import '@/assets/select.css'; /* 引入共享样式 */
  
  .fleet {
    padding: 20px;
  }
  
  .el-card {
    margin-bottom: 20px;
  }
  
  .el-form-item {
    margin-bottom: 20px;
  }
  </style>
  