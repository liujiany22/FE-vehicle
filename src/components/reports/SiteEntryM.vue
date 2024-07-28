<template>
    <div class="site-entry-m">
      <el-card>
        <h2>工地月对账表</h2>
        <el-form @submit.prevent="handleExport">
          <StartSiteSelect v-model="form.startsite_id" />
          <DateRangePicker v-model="form.date_range" />
          <el-form-item>
            <el-button type="primary" @click="handleExport">导出</el-button>
          </el-form-item>
        </el-form>
      </el-card>
  
      <el-card v-if="tableVisible">
        <h2>导出的对账表</h2>
        <div v-html="excelContent" class="excel-table"></div>
      </el-card>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue';
  import StartSiteSelect from '@/components/select/StartSiteSelect.vue';
  import DateRangePicker from '@/components/select/DateRangePicker.vue';
  import { searchTransportDetails, getSiteEntry } from '@/services/transportService';
  import { saveAs } from 'file-saver';
  import * as XLSX from 'xlsx';
  
  export default defineComponent({
    name: 'SiteEntryM',
    components: {
      StartSiteSelect,
      DateRangePicker,
    },
    setup() {
      const form = ref({
        startsite_id: 0,
        date_range: ['', ''],
      });
      const tableVisible = ref(false);
      const excelContent = ref('');
  
      const handleExport = async () => {
        const [start_date, end_date] = form.value.date_range;
        const params = {
          startsite_id: form.value.startsite_id,
          endsite_id: 0,
          goods_id: 0,
          start_date: form.value.date_range[0] ? new Date(form.value.date_range[0]).toISOString() : null,
          end_date: form.value.date_range[1] ? new Date(form.value.date_range[1]).toISOString() : null,
        };
        try {
          const searchResponse = await searchTransportDetails(params, 9999999, 1);
          const item_ids = searchResponse.data.items.map((item: any) => item.id);
  
          const exportData = {
            item_ids: item_ids,
            startsite_id: form.value.startsite_id,
            start_date: start_date,
            end_date: end_date,
          };
          const exportResponse = await getSiteEntry(exportData);
          const blob = new Blob([exportResponse.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = URL.createObjectURL(blob);
          saveAs(blob, 'transport_statement.xlsx');
  
          const reader = new FileReader();
          reader.onload = (e) => {
            const data = new Uint8Array(e.target.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const htmlContent = XLSX.utils.sheet_to_html(worksheet);
            excelContent.value = styleExcelTable(htmlContent);
            tableVisible.value = true;
          };
          reader.readAsArrayBuffer(blob);
        } catch (error) {
          console.error('Error exporting site entry:', error);
        }
      };
  
      const styleExcelTable = (html: string) => {
        // Wrap the table with a div to apply custom CSS styles
        return `
          <div class="styled-excel-table">
            ${html}
          </div>
        `;
      };
  
      return {
        form,
        tableVisible,
        excelContent,
        handleExport,
      };
    },
  });
  </script>
  
  <style scoped>
  .site-entry-m {
    padding: 20px;
  }
  
  .el-card {
    margin-bottom: 20px;
  }
  
  .el-form-item {
    margin-bottom: 20px;
  }
  
  .styled-excel-table {
    overflow-x: auto;
    margin-top: 20px;
  }
  
  .styled-excel-table table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .styled-excel-table th, .styled-excel-table td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: left;
  }
  
  .styled-excel-table th {
    background-color: #f2f2f2;
  }
  
  .styled-excel-table tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  </style>
  