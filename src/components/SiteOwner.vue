<template>
  <div class="site-owner">
    <el-card>
      <h2>工地老板名参数</h2>
      <el-form @submit.prevent="addParameter">
        <el-form-item label="工地老板名">
          <el-input v-model="newParameter.ownerName" placeholder="请输入工地老板名"></el-input>
        </el-form-item>
        <el-form-item label="工地名称">
          <el-select v-model="form.site_id" placeholder="请选择运输工地名称" @change="handleSiteChange"
            @visible-change="handleSiteVisibleChange">
            <el-option v-for="item in sites" :key="item.id" :label="item.name" :value="item.id"></el-option>
            <div class="pagination-container">
              <el-pagination @current-change="handleSitePageChange" :current-page="siteCurrentPage"
                :page-size="perPage" layout="prev, pager, next" :total="totalSites" />
            </div>
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="newParameter.phone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addParameter">添加</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="parameters" style="width: 100%">
        <el-table-column prop="name" label="工地名称"></el-table-column>
        <el-table-column prop="owner" label="工地老板名"></el-table-column>
        <el-table-column prop="phone" label="联系电话"></el-table-column>
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
import { addSiteOwner, delSiteOwner, getSiteOwners } from '@/services/transportService';

export default defineComponent({
  name: 'SiteOwner',
  setup() {
    const parameters = ref<{ id: number, name: string, owner: string, phone: string }[]>([]);
    const newParameter = ref({ siteName: '', ownerName: '', phone: '' });
    const currentPage = ref(1);
    const perPage = ref(20);
    const totalPages = ref(0);

    const fetchParameters = async () => {
      try {
        const response = await getSiteOwners(perPage.value, currentPage.value);
        parameters.value = response.data.site2owner;
        totalPages.value = response.data.total_pages;
      } catch (error) {
        console.error('Failed to fetch parameters', error);
      }
    };

    const addParameter = async () => {
      if (newParameter.value.siteName.trim() && newParameter.value.ownerName.trim() && newParameter.value.phone.trim()) {
        try {
          const response = await addSiteOwner(newParameter.value);
          fetchParameters();
          newParameter.value = { siteName: '', ownerName: '', phone: '' };
        } catch (error) {
          console.error('Failed to add parameter', error);
        }
      }
    };

    const removeParameter = async (index: number, id: number) => {
      try {
        await delSiteOwner(id);
        fetchParameters();
      } catch (error) {
        console.error('Failed to delete parameter', error);
      }
    };

    const handlePageChange = (page: number) => {
      currentPage.value = page;
      fetchParameters();
    };

    const sites = ref<{ id: number, name: string }[]>([]);
    const siteCurrentPage = ref(1);
    const totalSites = ref(0);

    const fetchSites = async () => {
      try {
        const response = await getSites(perPage.value, siteCurrentPage.value);
        sites.value = response.data.sites;
        totalSites.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch sites', error);
      }
    };

    const handleSiteChange = (value: string) => {
      console.log('Selected site:', value);
    };

    const handleSiteVisibleChange = (visible: boolean) => {
      if (visible) {
        fetchSites();
      }
    };

    const handleSitePageChange = (page: number) => {
      siteCurrentPage.value = page;
      fetchSites();
    };

    onMounted(() => {
      fetchSites();
      fetchParameters();
    });

    return {
      parameters,
      newParameter,
      currentPage,
      perPage,
      totalPages,
      addParameter,
      removeParameter,
      handlePageChange,
      handleSiteChange,
      handleSiteVisibleChange,
      handleSitePageChange,
    };
  },
});
</script>

<style scoped>
.site-owner {
  padding: 20px;
}

.el-card {
  margin-bottom: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>