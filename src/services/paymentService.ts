import apiClient from './api';

export const addPaymentDetail = (data: {
    owner: string;
    
    pay_id: number;
    amount: number;
    balance_amount: number;
    date: string;
    
    note?: string;
}) => {
    return apiClient.post('/finance/payment', data);
};

export const delPaymentDetail = (item_id: number) => {
    return apiClient.delete(`/finance/del_payment/${item_id}`);
};

export const getPaymentDetails = (perPage: number, page: number) => {
    return apiClient.get(`/finance/payment_list/${perPage}/${page}`);
};

export const updatePaymentDetail = (data: {
    payment_id: number;
    owner?: string;
    
    pay_id?: number;
    amount?: number;
    balance_amount?: number;
    date?: string;
    note?: string;
}) => {
    return apiClient.post('/finance/change_payment', data);
};

export const searchPaymentDetails = (
    params: {
        owner?: string;
        start_date?: string | null;
        end_date?: string | null;
    },
    perPage: number,
    page: number
) => {
    const queryParams = new URLSearchParams();

    if (params.owner && params.owner !== '') queryParams.append('owner', params.owner.toString());
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);

    return apiClient.get(`/finance/search4payment/${perPage}/${page}?${queryParams.toString()}`);
};