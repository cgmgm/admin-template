import { defineStore } from 'pinia';
// 多级children路由转换为一维数组，需要递归
const formatRoutes = (routes: any[]) => {
	const result: any[] = [];

	const flattenRoutes = (routeList: any[]) => {
		routeList.forEach(route => {
			if (route.children && route.children.length > 0) {
				flattenRoutes(route.children);
			}
			result.push(route);
		});
	};

	flattenRoutes(routes);
	return result;
};
/**
 * 路由列表
 * @methods setRoutesList 设置路由数据
 * @methods setColumnsMenuHover 设置分栏布局菜单鼠标移入 boolean
 * @methods setColumnsNavHover 设置分栏布局最左侧导航鼠标移入 boolean
 */
export const useRoutesList = defineStore('routesList', {
	state: (): RoutesListState => ({
		routesList: [],
		btnList: [],
		backEndRoutes: [],
		isColumnsMenuHover: false,
		isColumnsNavHover: false,
	}),
	actions: {
		async setRoutesList(data: Array<string>) {
			this.routesList = data;
			this.setBackEndRoutes(data);
		},
		async setBtnList(data: Array<string>) {
			this.btnList = data.filter((item: any) => item.type === 'button').map((item: any) => {
				return {
					path: item.path,
					name: item.name
				}
			});
		},
		async setColumnsMenuHover(bool: Boolean) {
			this.isColumnsMenuHover = bool;
		},
		async setColumnsNavHover(bool: Boolean) {
			this.isColumnsNavHover = bool;
		},
		async setBackEndRoutes(data: Array<string>) {
			this.backEndRoutes = formatRoutes(data);
			this.setBtnList(this.backEndRoutes);
		},
	},
});
