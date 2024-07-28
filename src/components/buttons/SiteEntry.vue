<template>
    <el-button type="primary" @click="exportToExcel">生成工地月对账单</el-button>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue';
  import * as XLSX from 'xlsx';
  import { saveAs } from 'file-saver';
  import { getTransportDetails } from '@/services/transportService';
  
  export default defineComponent({
    name: 'SiteEntry',
    props: {
      dateRange: {
        type: Array as unknown as () => [string, string],
        required: true,
      },
      totalDetails: {
        type: Number,
        required: true,
      },
      perPage: {
        type: Number,
        required: true,
      }
    },
    setup(props) {
      const exportToExcel = async () => {
        const response = await getTransportDetails(props.totalDetails * props.perPage, 1);
        const allDetails = response.data.items;
        const header1 = [{ v: '宏图运输每月对账单', s: { font: { sz: 24, name: '宋体' }, alignment: { horizontal: 'center' } } }];
        const header2 = [
          { v: '对账起始日期', s: { font: { sz: 12, name: '宋体' }, alignment: { horizontal: 'left' } } },
          { v: props.dateRange[0], s: { font: { sz: 12, name: '宋体' }, alignment: { horizontal: 'left' } } },
          { v: '对账截止日期', s: { font: { sz: 12, name: '宋体' }, alignment: { horizontal: 'left' } } },
          { v: props.dateRange[1], s: { font: { sz: 12, name: '宋体' }, alignment: { horizontal: 'left' } } }
        ];
        const header3 = [
          { v: '序号', s: { font: { sz: 12, name: '宋体' }, alignment: { horizontal: 'center' } } },
          { v: '运输起点名', s: { font: { sz: 12, name: '宋体' }, alignment: { horizontal: 'center' } } },
          { v: '运输品类名', s: { font: { sz: 12, name: '宋体' }, alignment: { horizontal: 'center' } } },
          { v: '数量', s: { font: { sz: 12, name: '宋体' }, alignment: { horizontal: 'center' } } },
          { v: '单位', s: { font: { sz: 12, name: '宋体' }, alignment: { horizontal: 'center' } } },
          { v: '工地承接单价', s: { font: { sz: 12, name: '宋体' }, alignment: { horizontal: 'center' } } },
          { v: '起点工地补贴金额', s: { font: { sz: 12, name: '宋体' }, alignment: { horizontal: 'center' } } },
          { v: '终点工地补贴金额', s: { font: { sz: 12, name: '宋体' }, alignment: { horizontal: 'center' } } }
        ];
  
        const dataToExport = allDetails.map((detail: { start_spot: any; goods: { name: any; }; }, index: number) => ([
          { v: index + 1, s: { alignment: { horizontal: 'center' } } },
          { v: detail.start_spot, s: { alignment: { horizontal: 'center' } } },
          { v: detail.goods.name, s: { alignment: { horizontal: 'center' } } },
          { v: '', s: { alignment: { horizontal: 'center' } } }, // Assuming this information is not available in the current details
          { v: '', s: { alignment: { horizontal: 'center' } } }, // Assuming this information is not available in the current details
          { v: '', s: { alignment: { horizontal: 'center' } } }, // Assuming this information is not available in the current details
          { v: '', s: { alignment: { horizontal: 'center' } } }, // Assuming this information is not available in the current details
          { v: '', s: { alignment: { horizontal: 'center' } } }  // Assuming this information is not available in the current details
        ]));
  
        const footer1 = [
          { v: '工地负责人（签字确认）：', s: { font: { sz: 12, name: '宋体' }, alignment: { horizontal: 'left' } } },
          { v: '', s: { font: { sz: 12, name: '宋体' }, alignment: { horizontal: 'left' } } },
          { v: '运输单位负责人（签字确认）：', s: { font: { sz: 12, name: '宋体' }, alignment: { horizontal: 'right' } } },
          { v: '', s: { font: { sz: 12, name: '宋体' }, alignment: { horizontal: 'right' } } }
        ];
        const footer2 = [
          { v: '经营范围：本公司承接土石方工程、渣土、建筑垃圾运输、砂石料、柴油配送等。', s: { font: { sz: 12, name: '宋体' }, alignment: { horizontal: 'left' } } }
        ];
  
        const worksheet = XLSX.utils.aoa_to_sheet([header1]);
        XLSX.utils.sheet_add_aoa(worksheet, [header2], { origin: 'A2' });
        XLSX.utils.sheet_add_aoa(worksheet, [header3], { origin: 'A3' });
        XLSX.utils.sheet_add_json(worksheet, dataToExport, { skipHeader: true, origin: 'A4' });
        XLSX.utils.sheet_add_aoa(worksheet, [footer1], { origin: `A${4 + dataToExport.length + 1}` });
        XLSX.utils.sheet_add_aoa(worksheet, [footer2], { origin: `A${4 + dataToExport.length + 3}` });
  
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'TransportDetails');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, 'transport_details.xlsx');
      };
  
      return {
        exportToExcel,
      };
    },
  });
  </script>
  
  <style scoped>
  </style>
  