import apiClient from './api';

// 起点
export const addStartSite = (data: { name: string, manager: string, phone: string }) => {
    return apiClient.post('/parameter/start_site', data);
};
export const delStartSite = (site_id: number) => {
    return apiClient.delete(`/parameter/del_site/${site_id}`);
};
export const getStartSites = (per_page: number, page: number, ownerName?: string) => {
    return apiClient.get(`/parameter/start_site_list/${per_page}/${page}?${ownerName}`);
};
export const updateStartSite = (data: { site_id: number, name?: string, manager?: string, phone?: string }) => {
    return apiClient.post('/parameter/change_site', data);
};

// 终点
export const addEndSite = (data: { name: string, manager: string, phone: string }) => {
    return apiClient.post('/parameter/end_site', data);
};
export const delEndSite = (site_id: number) => {
    return apiClient.delete(`/parameter/del_site/${site_id}`);
};
export const getEndSites = (per_page: number, page: number, ownerName?: string) => {
    return apiClient.get(`/parameter/end_site_list/${per_page}/${page}?${ownerName}`);
};
export const updateEndSite = (data: { site_id: number, name?: string, manager?: string, phone?: string }) => {
    return apiClient.post('/parameter/change_site', data);
};

// 品类
export const addCategory = (data: { name: string }) => {
    return apiClient.post('/parameter/new_goods', data);
};
export const delCategory = (goods_id: number) => {
    return apiClient.delete(`/parameter/del_goods/${goods_id}`);
};
export const getCategories = (per_page: number, page: number) => {
    return apiClient.get(`/parameter/goods_list/${per_page}/${page}`);
};
export const updateCategory = (data: { goods_id: number, name?: string }) => {
    return apiClient.post('/parameter/change_goods', data);
};

// 车队
export const addFleet = (data: { license: string, driver: string, phone: string }) => {
    return apiClient.post('/parameter/new_vehicle', data);
};
export const delFleet = (vehicle_id: number) => {
    return apiClient.delete(`/parameter/del_vehicle/${vehicle_id}`);
};
export const getFleets = (per_page: number, page: number) => {
    return apiClient.get(`/parameter/vehicle_list/${per_page}/${page}`);
};
export const updateFleet = (data: { vehicle_id: number, license?: string, driver?: string, phone?: string }) => {
    return apiClient.post('/parameter/change_vehicle', data);
};

// 项目-老板
export const addProjectOwner = (data: { site_id: number, owner: string, phone: string, name: string }) => {
    return apiClient.post('/parameter/project', data);
};
export const delProjectOwner = (project_id: number) => {
    return apiClient.delete(`/parameter/del_project/${project_id}`);
};
export const updateProjectOwner = (data: { project_id: number, owner?: string, owner_phone?: string, name?: string }) => {
    return apiClient.post('/parameter/change_project', data);
};
export const getProjectOwners = (perPage: number, page: number) => {
    return apiClient.get(`/parameter/project_list/${perPage}/${page}`)
};

// 付款方式
export const addPaymentMethod = (data: { method: string }) => {
    return apiClient.post('/parameter/new_pay', data);
};
export const delPaymentMethod = (pay_id: number) => {
    return apiClient.delete(`/parameter/del_pay/${pay_id}`);
};
export const getPaymentMethods = (per_page: number, page: number) => {
    return apiClient.get(`/parameter/pay_list/${per_page}/${page}`);
};
export const updatePaymentMethod = (data: { pay_id: number, method?: string }) => {
    return apiClient.post('/parameter/change_pay', data);
};