import { useRoutesList } from '@/stores/routesList';
import { judementSameArr } from '@/utils/arrayOperation';

/**
 * 单个权限验证
 * @param value 权限值
 * @returns 有权限，返回 `true`，反之则反
 */
export function auth(value: string): boolean {
	const stores = useRoutesList();
	return stores.btnList.some((v: any) => value == v.name);
}

/**
 * 多个权限验证，满足一个则为 true
 * @param value 权限值
 * @returns 有权限，返回 `true`，反之则反
 */
export function auths(value: Array<string> | string): boolean {
	if (typeof value === 'string') return auth(value);
	const stores = useRoutesList();
	return stores.btnList.some((val: any) => {
		return val.name == value || value.includes(val.name)
	});
}

/**
 * 多个权限验证，全部满足则为 true
 * @param value 权限值
 * @returns 有权限，返回 `true`，反之则反
 */
export function authAll(value: Array<string>): boolean {
	const stores = useRoutesList();
	return judementSameArr(value, stores.btnList.map((v: any) => v.name));
}
