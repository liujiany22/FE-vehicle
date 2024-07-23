import apiClient from './api';

export const addStartSite = (data: { name: string, manager: string, phone: string }) => {
    return apiClient.post('/parameter/start_site', data);
};
export const delStartSite = (site_id: number) => {
    return apiClient.delete(`/parameter/del_start_site/${site_id}`);
};
export const getStartSites = (per_page: number, page: number) => {
    return apiClient.get(`/parameter/start_site_list/${per_page}/${page}`);
};

export const addEndSite = (data: { name: string, manager: string, phone: string }) => {
    return apiClient.post('/parameter/end_site', data);
};
export const delEndSite = (site_id: number) => {
    return apiClient.delete(`/parameter/del_end_site/${site_id}`);
};
export const getEndSites = (per_page: number, page: number) => {
    return apiClient.get(`/parameter/end_site_list/${per_page}/${page}`);
};
export const updateEndSite = (data: { site_id: number, name?: string, manager?: string, phone?: string }) => {
    return apiClient.post('/parameter/change_site', data);
};

export const getSites = (per_page: number, page: number) => {
    return apiClient.get(`/parameter/site_list/${per_page}/${page}`);
};

// 新增运输品类参数的 API 函数
export const addCategory = (data: { name: string }) => {
    return apiClient.post('/parameter/new_goods', data);
};
export const delCategory = (goods_id: number) => {
    return apiClient.delete(`/parameter/del_goods/${goods_id}`);
};
export const getCategories = (per_page: number, page: number) => {
    return apiClient.get(`/parameter/goods_list/${per_page}/${page}`);
};

// 新增运输车队参数的 API 函数
export const addFleet = (data: { license: string, driver: string, phone: string }) => {
    return apiClient.post('/parameter/new_vehicle', data);
};
export const delFleet = (vehicle_id: number) => {
    return apiClient.delete(`/parameter/del_vehicle/${vehicle_id}`);
};
export const getFleets = (per_page: number, page: number) => {
    return apiClient.get(`/parameter/vehicle_list/${per_page}/${page}`);
};

// 新增工地老板名参数的 API 函数
export const addSiteOwner = (data: { site_id: number, owner: string, owner_phone: string }) => {
    return apiClient.post('/parameter/change_site', data);
};
export const delSiteOwner = (site_id: number) => {
    return apiClient.delete(`/parameter/del_site2owner/${site_id}`);
};

export const updateOwner = (data: { site_id: number, owner?: string, owner_phone?: string }) => {
    return apiClient.post('/parameter/change_site', data);
};


// 新增付款方式参数的 API 函数
export const addPaymentMethod = (data: { method: string }) => {
    return apiClient.post('/parameter/new_pay', data);
};
export const delPaymentMethod = (pay_id: number) => {
    return apiClient.delete(`/parameter/del_pay/${pay_id}`);
};
export const getPaymentMethods = (per_page: number, page: number) => {
    return apiClient.get(`/parameter/pay_list/${per_page}/${page}`);
};

// 新增运输明细录入的 API 函数
export const addTransportDetail = (data: {
    startsite_id: number;
    endsite_id: number;
    vehicle_id: number;
    goods_id: number;
    start_date: string;
    end_date: string;
}) => {
    return apiClient.post('/item/transport_item', data);
};

// 删除运输明细的 API 函数
export const deleteTransportDetail = (itemId: number) => {
    return apiClient.delete(`/item/del_item/${itemId}`);
};

// 获取运输明细列表的 API 函数
export const getTransportDetails = (perPage: number, page: number) => {
    return apiClient.get(`/item/item_list/${perPage}/${page}`);
};

export const updateTransportPrices = (data: {
    item_id: number;
    contractorPrice?: number;
    startSubsidy?: number;
    endSubsidy?: number;
    endPayment?: number;
    driverPrice?: number;
    unit? : string;
}[]) => {
    return apiClient.post('/item/item_price', data);
};


// 新增获取对账表的 API 函数
// export const getReconciliationReport = (params: {
//     startDate: string;
//     endDate: string;
//     ownerName?: string;
//     site?: string;
//     displayBy: 'day' | 'month' | 'range';
// }) => {
//     return apiClient.get('/parameter/reconciliation-report', { params });
// };