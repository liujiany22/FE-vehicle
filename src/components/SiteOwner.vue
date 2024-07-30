<template>
  <div class="site-owner">
    <el-card>
      <h2>工地老板名参数</h2>
      <el-form @submit.prevent="addParameter">
        <el-form-item label="工地老板名">
          <el-input v-model="newParameter.owner" placeholder="请输入工地老板名"></el-input>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="newParameter.owner_phone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item label="下属工地">
          <SitesSelect v-model="selectedSites" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addParameter">添加</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="parameters" style="width: 100%">
        <el-table-column prop="owner" label="工地老板名">
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.owner">
              <el-input v-model="editingParameter.owner" />
            </div>
            <div v-else>
              {{ scope.row.owner }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="owner_phone" label="联系电话">
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.owner">
              <el-input v-model="editingParameter.owner_phone" />
            </div>
            <div v-else>
              {{ scope.row.owner_phone }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="下属工地">
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.owner">
              <SitesSelect v-model="editingParameter.sites" />
            </div>
            <div v-else>
              <ul class="site-list">
                <li v-for="site in scope.row.sites" :key="site.id" class="site-item">{{ site.name }}</li>
              </ul>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.owner">
              <el-button type="primary" @click="saveParameter(scope.row)">保存</el-button>
              <el-button @click="cancelEdit">取消</el-button>
            </div>
            <div v-else>
              <el-button @click="editParameter(scope.row)">修改</el-button>
              <el-button type="danger" @click="removeParameter(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @current-change="handlePageChange" :current-page="currentPage" :page-size="perPage" layout="prev, pager, next" :total="totalPages * perPage" />
    </el-card>
    <el-dialog title="下属工地" :visible.sync="showSitesDialog">
      <div v-for="site in allSites" :key="site.id">{{ site.name }}</div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { addSiteOwner, delSiteOwner, getOwners, getOwner2Sites, updateOwner } from '@/services/transportService';
import SitesSelect from './select/SitesSelect.vue';

interface Site {
  id: number;
  name: string;
}

interface Owner {
  owner: string;
  owner_phone: string;
  sites: Site[];
}

export default defineComponent({
  name: 'SiteOwner',
  components: { SitesSelect },
  setup() {
    const parameters = ref<Owner[]>([]);
    const newParameter = ref({ owner: '', owner_phone: '' });
    const editingParameter = ref<{ owner: string; owner_phone: string; sites: number[] }>({
      owner: '',
      owner_phone: '',
      sites: []
    });
    const editingId = ref<string | null>(null);
    const currentPage = ref(1);
    const perPage = ref(20);
    const totalPages = ref(0);
    const selectedSites = ref<number[]>([]);
    const showSitesDialog = ref(false);
    const allSites = ref<Site[]>([]);

    const fetchParameters = async () => {
      try {
        const response = await getOwners(perPage.value, currentPage.value);
        const owners = response.data.owner_list;
        const ownerDetails: Owner[] = await Promise.all(
          owners.map(async (ownerName: string) => {
            const sitesResponse = await getOwner2Sites(ownerName, perPage.value, 1);
            return {
              owner: ownerName,
              owner_phone: sitesResponse.data.site.length > 0 ? sitesResponse.data.site[0].owner_phone : '',
              sites: sitesResponse.data.site
            };
          })
        );
        parameters.value = ownerDetails;
        totalPages.value = response.data.total_pages;
      } catch (error) {
        console.error('Failed to fetch parameters', error);
      }
    };

    const addParameter = async () => {
      if (newParameter.value.owner.trim() && newParameter.value.owner_phone.trim() && selectedSites.value.length) {
        try {
          await Promise.all(selectedSites.value.map(site_id => addSiteOwner({ site_id, owner: newParameter.value.owner, owner_phone: newParameter.value.owner_phone })));
          fetchParameters();
          newParameter.value = { owner: '', owner_phone: '' };
          selectedSites.value = [];
        } catch (error) {
          console.error('Failed to add parameter', error);
        }
      }
    };

    const removeParameter = async (parameter: Owner) => {
      try {
        await Promise.all(parameter.sites.map(site => delSiteOwner(site.id)));
        fetchParameters();
      } catch (error) {
        console.error('Failed to delete parameter', error);
      }
    };

    const editParameter = (parameter: Owner) => {
      editingId.value = parameter.owner;
      editingParameter.value = {
        owner: parameter.owner,
        owner_phone: parameter.owner_phone,
        sites: parameter.sites.map(site => site.id)
      };
    };

    const saveParameter = async (parameter: Owner) => {
      try {
        const originalSiteIds = parameter.sites.map(site => site.id);
        const newSiteIds = editingParameter.value.sites;

        // Sites to add
        const sitesToAdd = newSiteIds.filter(id => !originalSiteIds.includes(id));
        // Sites to remove
        const sitesToRemove = originalSiteIds.filter(id => !newSiteIds.includes(id));

        await Promise.all([
          ...sitesToAdd.map(site_id => addSiteOwner({ site_id, owner: editingParameter.value.owner, owner_phone: editingParameter.value.owner_phone })),
          ...sitesToRemove.map(site_id => delSiteOwner(site_id))
        ]);

        fetchParameters();
        cancelEdit();
      } catch (error) {
        console.error('Failed to update parameter', error);
      }
    };

    const cancelEdit = () => {
      editingId.value = null;
      editingParameter.value = { owner: '', owner_phone: '', sites: [] };
    };

    const handlePageChange = (page: number) => {
      currentPage.value = page;
      fetchParameters();
    };

    const showAllSites = (sites: Site[]) => {
      allSites.value = sites;
      showSitesDialog.value = true;
    };

    onMounted(() => {
      fetchParameters();
    });

    return {
      parameters,
      newParameter,
      editingParameter,
      editingId,
      currentPage,
      perPage,
      totalPages,
      selectedSites,
      showSitesDialog,
      allSites,
      addParameter,
      removeParameter,
      editParameter,
      saveParameter,
      cancelEdit,
      handlePageChange,
      showAllSites,
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

.el-table-column .cell {
  display: flex;
  align-items: center;
}

.el-table-column .cell > span {
  margin-right: 5px;
}

.site-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.site-item {
  margin-bottom: 5px;
}
</style>
