import { useUserInfo } from '@/stores/userInfo';
import { judementSameArr } from '@/utils/arrayOperation';

/**
 * 单个权限验证
 * @param value 权限值
 * @returns 有权限，返回 `true`，反之则反
 */
export function auth(value: string): boolean {
	const stores = useUserInfo();
	const allPermission = '*'
	// return stores.userInfos.authBtnList.some((v: string) => allPermission == v || v === value);
	return true;
}

/**
 * 多个权限验证，满足一个则为 true
 * @param value 权限值
 * @returns 有权限，返回 `true`，反之则反
 */
export function auths(value: Array<string> | string): boolean {
	if (typeof value === 'string') return auth(value);
	const stores = useUserInfo();
	const allPermission = '*'
	// return stores.userInfos.authBtnList.some((val: string) => {
	// 	return allPermission == val || value.includes(val)
	// });
	return true;
}

/**
 * 多个权限验证，全部满足则为 true
 * @param value 权限值
 * @returns 有权限，返回 `true`，反之则反
 */
export function authAll(value: Array<string>): boolean {
	const stores = useUserInfo();
	// return judementSameArr(value, stores.userInfos.authBtnList);
	return true;
}
