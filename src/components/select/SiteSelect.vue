<template>
  <el-form-item :label="label">
    <el-select v-model="localValue" placeholder="请选择" @visible-change="fetchSites" class="custom-select">
      <el-option v-for="site in sites" :key="site.id" :label="site.name" :value="site.id"></el-option>
      <div class="pagination-container">
        <el-pagination @current-change="handlePageChange" :current-page="currentPage" :page-size="perPage"
          layout="prev, pager, next" :total="totalSites" />
      </div>
    </el-select>
  </el-form-item>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { getStartSites, getEndSites, getOwner2Sites } from '@/services/transportService';

export default defineComponent({
  name: 'SiteSelect',
  props: {
    modelValue: {
      type: Number,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    owner: {
      type: String,
      default: '', // Make it optional
    },
    siteType: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const sites = ref<{ id: number, name: string }[]>([]);
    const currentPage = ref(1);
    const perPage = ref(10);
    const totalSites = ref(0);
    const localValue = ref<number | null>(props.modelValue);

    const fetchSites = async () => {
      try {
        let responseSites;
        
        if (props.siteType === 'start') {
          responseSites = await getStartSites(perPage.value, currentPage.value, props.owner || undefined);
        } else {
          responseSites = await getEndSites(perPage.value, currentPage.value, props.owner || undefined);
        }

        const sitesFromService = responseSites.data[props.siteType === 'start' ? 'start_sites' : 'end_sites'];

        if (props.owner) {
          const responseOwner2Sites = await getOwner2Sites(props.owner, perPage.value, currentPage.value);
          const owner2Sites = responseOwner2Sites.data.site;

          // Find intersection of the two sets of sites
          const siteSet = new Set(sitesFromService.map((site: { id: number }) => site.id));
          sites.value = owner2Sites.filter((site: { id: number }) => siteSet.has(site.id));
        } else {
          sites.value = sitesFromService;
        }

        totalSites.value = sites.value.length; // Assuming total pages are same for both requests
      } catch (error) {
        console.error('Failed to fetch sites', error);
      }
    };

    const handlePageChange = (page: number) => {
      currentPage.value = page;
      fetchSites();
    };

    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue);
    });

    watch(() => props.modelValue, (newValue) => {
      localValue.value = newValue;
    });

    watch(() => props.owner, () => {
      localValue.value = null; // Reset the selected value
      fetchSites();
    });

    return {
      sites,
      currentPage,
      perPage,
      totalSites,
      fetchSites,
      handlePageChange,
      localValue
    };
  }
});
</script>

<style scoped>
@import '@/assets/select.css'; /* 引入共享样式 */

.pagination-container {
  padding: 10px;
  text-align: center;
}
</style>
