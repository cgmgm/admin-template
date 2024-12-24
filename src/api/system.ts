import { post, get } from '@/api/index';

// 菜单
export const saveMenu = (data?: any) => post('saveMenu', data);

export const getMenus = (data?: any) => post('getMenus ', data);

export const delMenu = (data?: any) => post('delMenu', data);

// 用户
export const getUsers = (data?: any) => post('getUsers', data);

export const delUser = (data?: any) => post('delUser', data);

export const saveUser = (data?: any) => post('saveUser', data);

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

