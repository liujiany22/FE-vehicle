<template>
  <div>
    <el-button type="primary" @click="exportSiteEntry">导出工地月对账单</el-button>
  </div>
</template>

<script>
import { getSiteEntry } from '@/services/transportService';
import { saveAs } from 'file-saver';

export default {
  name: 'SiteEntry',
  props: {
    itemIds: {
      type: Array,
      required: true
    },
    startsiteId: {
      type: Number,
      required: true
    },
    startDate: {
      type: String,
      required: true
    },
    endDate: {
      type: String,
      required: true
    }
  },
  methods: {
    async exportSiteEntry() {
      const data = {
        item_ids: this.itemIds,
        startsite_id: this.startsiteId,
        start_date: this.startDate,
        end_date: this.endDate
      };
      try {
        const response = await getSiteEntry(data);
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'transport_statement.xlsx');
      } catch (error) {
        console.error('Error exporting site entry:', error);
      }
    }
  }
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
