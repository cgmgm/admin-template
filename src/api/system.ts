import { post, get } from '@/api/index';

// 菜单
export const saveMenu = (data?: any) => post('saveMenu', data);

export const getMenus = (data?: any) => post('getMenus ', data);

export const delMenu = (data?: any) => post('delMenu', data);

// 用户
export const getAdmin = (data?: any) => post('getAdmin', data);

export const getAdminInfo = (data?: any) => post('getAdminInfo', data);

export const delAdmin = (data?: any) => post('delAdmin', data);

export const saveAdmin = (data?: any) => post('saveAdmin', data);

// 角色
export const getRoles = (data?: any) => post('getRoles', data);

export const delRole = (data?: any) => post('delRole', data);

export const saveRole = (data?: any) => post('saveRole', data);

// 获取部门列表
export const getDepartments = (data?: any) => post('getDepartments', data);

// 保存部门
export const saveDepartment = (data?: any) => post('saveDepartment', data);

// 删除部门
export const delDepartment = (data?: any) => post('delDepartment', data);


// 获取字典列表
// 参数：id
export const getDictionaries = (data?: object) => post('dictionaries', data);

// 获取字典详情
// 参数：id
export const getDictDetail = (data?: object) => post('dictionaries/show', data);

// 保存字典数据
export const saveDict = (data?: object) => post('dictionaries/store', data);

// 删除字典
// 参数：id
export const deleteDict = (data?: object) => post('dictionaries/destroy', data);

// 获取字典数据项
// code
export const getDictItems = (data?: object) => post('dictionaries/getItems', data);

// 保存字典项
export const saveDictItem = (data?: object) => post('dictionaries/storeItem', data);

// 删除字典项
// 参数：id
export const deleteDictItem = (data?: object) => post('dictionaries/destroyItem', data);

// 字典数据转换为下拉框选项
export const dictToOptions = (dictItems: any[]) => {
    return dictItems.map(item => ({
        label: item.name,
        value: item.value,
        disabled: item.status !== 1
    }));
};

// 操作日志
export const getOperationLogs = (data?: any) => post('logs/operation', data);

export const getOperationLogDetail = (data?: any) => post('logs/operation/show', data);

// 查询导出进度
export const getExportProgress = (data?: any) => get('logs/operation/export/progress', data);

// 获取谷歌验证码
export const getGoogleCode = (data?: any) => post('getGoogleCode', data);