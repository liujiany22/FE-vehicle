import apiClient from './api';


export const addAdvance = (data: { vehicle_id: number, amount: number, advance_time: string, note:string}) => {
    return apiClient.post(`/finance/advance`, data);
};
export const delAdvance = (advance_id: number) => {
    return apiClient.delete(`/finance/del_advance/${advance_id}`);
};
export const getAdvances = (per_page: number, page: number, driver?: string) => {
    return apiClient.get(`/finance/advance_list/${per_page}/${page}?${driver}`);
};
export const updateAdvance = (data: { advance_id: number, vehicle_id?: number, amount?: number, advance_time?: string, note?: string }) => {
    return apiClient.post('/finance/change_advance', data);
};