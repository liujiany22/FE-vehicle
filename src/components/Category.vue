<template>
  <div class="category">
    <el-card>
      <h2>运输品类参数</h2>
      <el-form @submit.prevent="addParameter">
        <el-form-item label="名称">
          <el-input v-model="newParameter.name" placeholder="请输入运输品类名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addParameter">添加</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="parameters" style="width: 100%">
        <el-table-column prop="name" label="名称"></el-table-column>
        <el-table-column label="操作">
          <template v-slot:default="scope">
            <el-button type="danger" @click="removeParameter(scope.$index, scope.row.id)">删除</el-button>
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
import { addCategory, delCategory, getCategories } from '@/services/transportService';

export default defineComponent({
  name: 'Category',
  setup() {
    const parameters = ref<{ id: number, name: string }[]>([]);
    const newParameter = ref({ name: '' });
    const currentPage = ref(1);
    const perPage = ref(20);
    const totalPages = ref(0);

    const fetchParameters = async () => {
      try {
        const response = await getCategories(perPage.value, currentPage.value);
        parameters.value = response.data.goods;
        totalPages.value = response.data.total_pages;
      } catch (error) {
        console.error('Failed to fetch parameters', error);
      }
    };

    const addParameter = async () => {
      if (newParameter.value.name.trim()) {
        try {
          const response = await addCategory(newParameter.value);
          fetchParameters();
          newParameter.value = { name: '' };
        } catch (error) {
          console.error('Failed to add parameter', error);
        }
      }
    };

    const removeParameter = async (index: number, id: number) => {
      try {
        await delCategory(id);
        fetchParameters();
      } catch (error) {
        console.error('Failed to delete parameter', error);
      }
    };

    const handlePageChange = (page: number) => {
      currentPage.value = page;
      fetchParameters();
    };

    onMounted(fetchParameters);

    return {
      parameters,
      newParameter,
      currentPage,
      perPage,
      totalPages,
      addParameter,
      removeParameter,
      handlePageChange,
    };
  },
});
</script>

<style scoped>
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
