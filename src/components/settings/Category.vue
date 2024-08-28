<template>
  <div class="category">
    <el-card>
      <h2>运输品类参数</h2>
      <el-form @submit.prevent="addParameter" label-width="auto" label-position="left">
        <el-form-item label="名称" :error="errors.name">
          <el-input v-model="newParameter.name" placeholder="请输入运输品类名称" class="custom-input"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addParameter" plain>添加</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="parameters" style="width: 100%" border>
        <el-table-column prop="name" label="名称" show-overflow-tooltip>
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <el-input v-model="editingParameter.name" />
            </div>
            <div v-else>
              {{ scope.row.name }}
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
import { addCategory, delCategory, getCategories, updateCategory } from '@/services/transportService';

export default defineComponent({
  name: 'Category',
  setup() {
    const parameters = ref<{ id: number, name: string }[]>([]);
    const newParameter = ref({ name: '' });
    const editingParameter = ref({ name: '' });
    const editingId = ref<number | null>(null);
    const currentPage = ref(1);
    const perPage = ref(20);
    const totalPages = ref(0);
    const errors = ref<{ name: string | null }>({
      name: null,
    });

    const fetchParameters = async () => {
      try {
        const response = await getCategories(perPage.value, currentPage.value);
        parameters.value = response.data.goods;
        totalPages.value = response.data.total_pages;
      } catch (error) {
        console.error('Failed to fetch parameters', error);
      }
    };

    const validateInputs = () => {
      errors.value.name = newParameter.value.name.trim() ? null : '名称不能为空';
      return !errors.value.name;
    };

    const addParameter = async () => {
      if (validateInputs()) {
        try {
          await addCategory(newParameter.value);
          fetchParameters();
          newParameter.value = { name: '' };
        } catch (error) {
          console.error('Failed to add parameter', error);
        }
      }
    };

    const removeParameter = async (id: number) => {
      try {
        await delCategory(id);
        fetchParameters();
      } catch (error) {
        console.error('Failed to delete parameter', error);
      }
    };

    const editParameter = (parameter: { id: number, name: string }) => {
      editingId.value = parameter.id;
      editingParameter.value = { ...parameter };
    };

    const saveParameter = async (id: number) => {
      try {
        await updateCategory({ goods_id: id, name: editingParameter.value.name });
        fetchParameters();
        cancelEdit();
      } catch (error) {
        console.error('Failed to update parameter', error);
      }
    };

    const cancelEdit = () => {
      editingId.value = null;
      editingParameter.value = { name: '' };
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

.category {
  padding: 20px;
}

.el-card {
  margin-bottom: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>
