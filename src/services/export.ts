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
    vehicle_id: number,
    start_date: string,
    end_date: string
}) => {
    return apiClient.post('/finance/driver_excel', data, { responseType: 'blob' });
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
    vehicle_id: number,
    start_date: string,
    end_date: string
}) => {
    return apiClient.post('/finance/driver_excel_pdf', data, { responseType: 'blob' });
};
