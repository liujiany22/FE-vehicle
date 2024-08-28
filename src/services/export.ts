import apiClient from './api';

export const getStartExcel = (data: {
    item_ids: number[],
    project_id: number,
    start_date: string,
    end_date: string
}) => {
    return apiClient.post('/item/start_excel', data, { responseType: 'blob' });
}

export const getEndExcel = (data: {
    item_ids: number[],
    project_id: number,
    start_date: string,
    end_date: string
}) => {
    return apiClient.post('/item/end_excel', data, { responseType: 'blob' });
}

export const getDriverExcel = (data: {
    item_ids: number[],
    vehicle_id: number,
    start_date: string,
    end_date: string
}) => {
    return apiClient.post('/finance/driver_excel', data, { responseType: 'blob' });
}

export const getDetailExcel = (data: {
    item_ids: number[]
}) => {
    return apiClient.post('/item/detail_excel', data, {responseType: 'blob'});
}

export const getStartPDF = (data: {
    item_ids: number[],
    project_id: number,
    start_date: string,
    end_date: string,
}) => {
    return apiClient.post('/item/start_excel_pdf', data, { responseType: 'blob' });
};

export const getEndPDF = (data: {
    item_ids: number[],
    project_id: number,
    start_date: string,
    end_date: string,
}) => {
    return apiClient.post('/item/end_excel_pdf', data, { responseType: 'blob' });
};

export const getDriverPDF = (data: {
    item_ids: number[],
    vehicle_id: number,
    start_date: string,
    end_date: string
}) => {
    return apiClient.post('/finance/driver_excel_pdf', data, { responseType: 'blob' });
};

export const getDetailPDF = (data: {
    item_ids: number[],
}) => {
    return apiClient.post('/item/detail_excel_pdf', data, { responseType: 'blob' });
};