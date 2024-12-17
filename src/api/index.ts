import request from '@/utils/request';

export function post(url: string, params?: any) {
	return request({
		url: url,
		method: 'post',
		data: params || {},
	});
}

export function get(url: string, params?: any) {
	return request({
		url: url,
		params: params || {},
	});
}
// 登陆
export const login = (data?: any) => post('syslogin/index', data);

// 获取游戏类型
export const getAllGame = (data?: any) => post('shop/game/list', data);

// 获取所有台桌
export const getAllDesk = (data?: any) => post('shop/desk/list', data);

// 获取所有角色
export const getAllrole = (data?: any) => post('auth/role/all', data);

// 获取所有商户角色
export const getAllMerchantRole = (data?: any) => post('merchant/role/all', data);

// 获取所有商户
export const getAllMerchant = (data?: any) => post('merchant/onemerchant/all', data);

// 获取所有部门
export const getAllDept = (data?: any) => post('sys/dept/list', data);

/* 获取状态信息
 * @param data 参数{dictType} sys_normal_disable 部门状态
	sys_role_type 角色状态
	sys_show_hide 显示隐藏
	sys_menu_type 菜单状态
	sys_merchant_role_type 代理状态
	sys_yes_no 是否
	sys_common_status 成功失败
	sys_oper_type 开关
 * */
export const getStatus = (data?: any) => get('sys/dictData/list', data);


// 获取所有用户
export const getUserList = (data?: any) => post('sys/user/list', data);
// 获取用户信息
export const getUserInfo = (data?: any) => post('sys/user/get', data);
// 删除用户
export const addUser = (data?: any) => post('sys/user/add', data);
// 删除用户
export const delUser = (data?: any) => post('sys/user/del', data);

// 重置密码
export const resetpwd = (data?: any) => post('sys/user/resetpwd', data);
// 重置密码
export const getGoogleCode = (data?: any) => post('getGoogleCode', data);



