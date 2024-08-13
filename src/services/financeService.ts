import apiClient from './api';


export const addAdvance = (data: { vehicle_id: number, amount: number, pay_id: number, advance_time: string, note:string}) => {
    return apiClient.post(`/finance/advance`, data);
};
export const delAdvance = (advance_id: number) => {
    return apiClient.delete(`/finance/del_advance/${advance_id}`);
};
export const getAdvances = (per_page: number, page: number, driver?: string) => {
    return apiClient.get(`/finance/advance_list/${per_page}/${page}?${driver}`);
};
export const updateAdvance = (data: { advance_id: number, vehicle_id?: number, amount?: number, pay_id?:number, advance_time?: string, note?: string }) => {
    return apiClient.post('/finance/change_advance', data);
};

export const getSettlement = (
    params: {
        ownerName?: string;
        project_id?: number;
        startsite_id?: number;
        endsite_id?: number;
        start_date?: string | null;
        end_date?: string | null;
    },
) => {
    const queryParams = new URLSearchParams();

    if (params.ownerName && params.ownerName !== '') queryParams.append('ownerName', params.ownerName.toString());
    if (params.project_id && params.project_id !== 0) queryParams.append('project_id', params.project_id.toString());
    if (params.startsite_id && params.startsite_id !== 0) queryParams.append('startsite_id', params.startsite_id.toString());
    if (params.endsite_id && params.endsite_id !== 0) queryParams.append('endsite_id', params.endsite_id.toString());
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);

    return apiClient.get(`/finance/total_amount?${queryParams.toString()}`);
};