import apiClient from './api';

export const addTransportStartPoint = (data: { name: string, manager: string, phone: string }) => {
    return apiClient.post('/parameter/start_site', data);
};
export const deleteTransportStartPoint = (site_id: number) => {
    return apiClient.delete(`/parameter/del_start_site/${site_id}`);
};
export const getTransportStartPoints = (per_page: number, page: number) => {
    return apiClient.get(`/parameter/start_site_list/${per_page}/${page}`);
};

export const addTransportEndPoint = (data: { name: string, manager: string, phone: string }) => {
    return apiClient.post('/parameter/end_site', data);
};
export const deleteTransportEndPoint = (site_id: number) => {
    return apiClient.delete(`/parameter/del_end_site/${site_id}`);
};
export const getTransportEndPoints = (per_page: number, page: number) => {
    return apiClient.get(`/parameter/end_site_list/${per_page}/${page}`);
};

// 新增运输品类参数的 API 函数
export const addTransportCategory = (data: { name: string }) => {
    return apiClient.post('/parameter/new_goods', data);
};
export const deleteTransportCategory = (goods_id: number) => {
    return apiClient.delete(`/parameter/del_goods/${goods_id}`);
};
export const getTransportCategories = (per_page: number, page: number) => {
    return apiClient.get(`/parameter/goods_list/${per_page}/${page}`);
};

// 新增运输车队参数的 API 函数
export const addTransportFleet = (data: { license: string, driver: string, phone: string }) => {
    return apiClient.post('/parameter/new_vehicle', data);
};
export const deleteTransportFleet = (vehicle_id: number) => {
    return apiClient.delete(`/parameter/del_vehicle/${vehicle_id}`);
};
export const getTransportFleets = (per_page: number, page: number) => {
    return apiClient.get(`/parameter/vehicle_list/${per_page}/${page}`);
};

// 新增工地老板名参数的 API 函数
export const addSiteOwner = (data: { siteName: string, ownerName: string, phone: string }) => {
    return apiClient.post('/parameter/new_site2owner', data);
};

export const deleteSiteOwner = (site2owner_id: number) => {
    return apiClient.delete(`/parameter/del_site2owner/${site2owner_id}`);
};

export const getSiteOwners = (per_page: number, page: number) => {
    return apiClient.get(`/parameter/site2owner_list/${per_page}/${page}`);
};

// 新增付款方式参数的 API 函数
export const addPaymentMethod = (data: { method: string }) => {
    return apiClient.post('/parameter/new_pay', data);
};

export const deletePaymentMethod = (pay_id: number) => {
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
    id: number;
    contractorPrice?: number;
    startSubsidy?: number;
    endSubsidy?: number;
    endPayment?: number;
    driverPrice?: number;
}[]) => {
    return apiClient.put('/item/transport-details/prices', data);
};


// 新增获取对账表的 API 函数
export const getReconciliationReport = (params: {
    startDate: string;
    endDate: string;
    ownerName?: string;
    site?: string;
    displayBy: 'day' | 'month' | 'range';
}) => {
    return apiClient.get('/parameter/reconciliation-report', { params });
};