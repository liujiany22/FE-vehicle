<template>
    <div class="load-method">
      <el-card>
        <h2>装载方式参数</h2>
        <el-form @submit.prevent="addParameter" label-width="auto" label-position="left">
          <el-form-item label="装载方式" :error="errors.method">
            <el-input v-model="newLoad.method" placeholder="请输入装载方式" class="custom-input"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addParameter" plain>添加</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="loads" style="width: 100%" border>
          <el-table-column prop="method" label="装载方式" show-overflow-tooltip>
            <template v-slot:default="scope">
              <div v-if="editingId === scope.row.id">
                <el-input v-model="editingLoad.method" />
              </div>
              <div v-else>
                {{ scope.row.method }}
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
  import { addLoad, delLoad, getLoads, updateLoad } from '@/services/transportService';
  
  export default defineComponent({
    name: 'LoadMethod',
    setup() {
      const loads = ref<{ id: number, method: string }[]>([]);
      const newLoad = ref({ method: '' });
      const editingLoad = ref({ method: '' });
      const editingId = ref<number | null>(null);
      const currentPage = ref(1);
      const perPage = ref(20);
      const totalPages = ref(0);
      const errors = ref<{ method: string | null }>({
        method: null,
      });
  
      const fetchParameters = async () => {
        try {
          const response = await getLoads(perPage.value, currentPage.value);
          loads.value = response.data.load;
          totalPages.value = response.data.total_pages;
        } catch (error) {
          console.error('Failed to fetch loads', error);
        }
      };
  
      const validateInputs = () => {
        errors.value.method = newLoad.value.method.trim() ? null : '装载方式不能为空';
        return !errors.value.method;
      };
  
      const addParameter = async () => {
        if (validateInputs()) {
          try {
            await addLoad(newLoad.value);
            fetchParameters();
            newLoad.value = { method: '' };
          } catch (error) {
            console.error('Failed to add load', error);
          }
        }
      };
  
      const removeParameter = async (id: number) => {
        try {
          await delLoad(id);
          fetchParameters();
        } catch (error) {
          console.error('Failed to delete load', error);
        }
      };
  
      const editParameter = (load: { id: number, method: string }) => {
        editingId.value = load.id;
        editingLoad.value = { ...load };
      };
  
      const saveParameter = async (id: number) => {
        try {
          await updateLoad({ load_id: id, method: editingLoad.value.method });
          fetchParameters();
          cancelEdit();
        } catch (error) {
          console.error('Failed to update load', error);
        }
      };
  
      const cancelEdit = () => {
        editingId.value = null;
        editingLoad.value = { method: '' };
      };
  
      const handlePageChange = (page: number) => {
        currentPage.value = page;
        fetchParameters();
      };
  
      onMounted(fetchParameters);
  
      return {
        loads,
        newLoad,
        editingLoad,
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
  
  .load-method {
    padding: 20px;
  }
  
  .el-card {
    margin-bottom: 20px;
  }
  
  .el-form-item {
    margin-bottom: 20px;
  }
  </style>
  