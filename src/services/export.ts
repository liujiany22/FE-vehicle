import apiClient from './api';

export const getStartExcel = (data : {
    item_ids: number[], 
    project_id: number, 
    start_date: string, 
    end_date: string 
}) => {
    return apiClient.post('/item/start_excel', data, { responseType: 'blob' });
}

export const getEndExcel = (data : {
    item_ids: number[], 
    project_id: number, 
    start_date: string, 
    end_date: string 
}) => {
    return apiClient.post('/item/end_excel', data, { responseType: 'blob' });
}