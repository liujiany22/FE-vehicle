import apiClient from './api';

export const addTransportDetail = (data: {
    project_id: number;
    startsite_id: number;
    endsite_id: number;
    
    vehicle_ids: number[];
    goods_id: number;
    load: string;
    quantity: number;
    unit: string;
    date: string;
    
    note?: string;
}) => {
    return apiClient.post('/item/transport_item', data);
};

export const delTransportDetail = (item_id: number) => {
    return apiClient.delete(`/item/del_item/${item_id}`);
};

export const getTransportDetails = (perPage: number, page: number) => {
    return apiClient.get(`/item/item_list/${perPage}/${page}`);
};

export const updateTransportDetail = (data: {
    item_id: number;
    project_id?: number;
    startsite_id?: number;
    endsite_id?: number;
    
    vehicle_ids?: number[];
    goods_id?: number;
    load?: string;
    quantity: number;
    unit: string;
    date?: string;
    note?: string;
}) => {
    return apiClient.post('/item/change_item', data);
};

export const searchTransportDetails = (
    params: {
        project_id?: number;
        startsite_id?: number;
        endsite_id?: number;
        goods_id?: number;
        start_date?: string | null;
        end_date?: string | null;
    },
    perPage: number,
    page: number
) => {
    const queryParams = new URLSearchParams();

    if (params.project_id && params.project_id !== 0) queryParams.append('project_id', params.project_id.toString());
    if (params.startsite_id && params.startsite_id !== 0) queryParams.append('startsite_id', params.startsite_id.toString());
    if (params.endsite_id && params.endsite_id !== 0) queryParams.append('endsite_id', params.endsite_id.toString());
    if (params.goods_id && params.goods_id !== 0) queryParams.append('goods_id', params.goods_id.toString());
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);

    return apiClient.get(`/item/search4item/${perPage}/${page}?${queryParams.toString()}`);
};





export const getOwners = (perPage: number, page: number) => {
    return apiClient.get(`/parameter/owner_list/${perPage}/${page}`)
};

export const getOwner2Projects = (ownerName: string | null, per_page: number, page: number) => {
    const params: any = {};
    if (ownerName) {
        params.ownerName = ownerName;
    }
    return apiClient.get(`/parameter/owner2project/${per_page}/${page}`, { params });
};


export const getOwnerEntry = (data : {
    item_ids: number[], 
    owner: string, 
    start_date: string, 
    end_date: string 
}) => {
    return apiClient.post('/item/item2excel_boss', data, { responseType: 'blob' });
}