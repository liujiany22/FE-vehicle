import apiClient from './api';

export const addDetail = (data: {
    startsite_id: number;
    endsite_id: number;
    start_spot?: string;
    vehicle_id: number;
    goods_id: number;
    quantity: number;
    unit: string;
    start_date: string;
    end_date: string;
}) => {
    return apiClient.post('/item/transport_item', data);
};

export const delDetail = (item_id: number) => {
    return apiClient.delete(`/item/del_item/${item_id}`);
};

export const getDetails = (perPage: number, page: number) => {
    return apiClient.get(`/item/item_list/${perPage}/${page}`);
};

export const updateDetail = (data: {
    item_id: number;
    startsite_id?: number;
    endsite_id?: number;
    start_spot?: string;
    vehicle_id?: number;
    goods_id?: number;
    quantity: number;
    unit: string;
    start_date?: string;
    end_date?: string;
}) => {
    return apiClient.post('/item/change_item', data);
};

export const searchDetails = (
    params: {
        startsite_owner?: string;
        endsite_owner?: string;
        startsite_id: number;
        endsite_id: number;
        goods_id: number;
        start_date: string | null;
        end_date: string | null;
    },
    perPage: number,
    page: number
) => {
    const queryParams = new URLSearchParams();
    // TODO
    if (params.startsite_id !== 0) queryParams.append('startsite_id', params.startsite_id.toString());
    if (params.endsite_id !== 0) queryParams.append('endsite_id', params.endsite_id.toString());
    if (params.goods_id !== 0) queryParams.append('goods_id', params.goods_id.toString());
    if (params.start_date !== null) queryParams.append('start_date', params.start_date);
    if (params.end_date !== null) queryParams.append('end_date', params.end_date);

    return apiClient.get(`/item/search4item/${perPage}/${page}?${queryParams.toString()}`);
};