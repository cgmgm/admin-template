import { defineStore } from 'pinia';
import { getStatus, getAllGame, getAllDesk, getAllDept, getAllrole, getAllMerchantRole, getAllMerchant } from '@/api';
/**
 * 全局配置
 */
export const useCats = defineStore('cats', {
	state: () => ({
		// 状态字典
		dictData: {} as DictData,
		// 部门
		depts: [] as any[],
		// 游戏
		game: [] as any[],
		// 台桌
		desk: [] as any[],
		// 角色
		role: [] as any[],
		// 商户角色
		merchanRole: [] as any[],
		// 商户角色
		merchan: [] as any[],

	}),
	actions: {
		// 获取配置，不存在则请求接口
		async getDict(key: any) {
			if (this.dictData[key] === undefined) {
				const res = await getStatus({ dictType: key });
				this.dictData[key] = {} as DictData;
				res.data?.rows?.forEach((e: any) => {
					this.dictData[key][e.dictValue] = e.dictLabel;
				});
			}
			return this.dictData[key];
		},
		// 获取全部配置
		async getAllDict() {
			// const d = ['sys_normal_disable', 'sys_role_type', 'sys_show_hide', 'sys_menu_type', 'sys_merchant_role_type', 'sys_yes_no', 'sys_oper_type', 'sys_common_status'];
			// const promises = d.map(key => this.getDict(key));
			// await Promise.all(promises);
			// this.getAllGame();
			// this.getAllDept();
			// this.getAllDesk();
			// return this.dictData;
			this.getAllDept();
			this.getAllrole();
		},
		// 获取所有游戏
		async getAllGame() {
			if (this.game?.length === 0) {
				const res = await getAllGame();
				this.game = res.data;
			}
			return this.game;
		},
		// 获取所有台桌
		async getAllDesk() {
			if (this.desk?.length === 0) {
				const res = await getAllDesk();
				this.desk = res.data;
			}
			return this.desk;
		},
		// 获取所有部门
		async getAllDept() {
			if (this.depts?.length === 0) {
				const res = await getAllDept();
				this.depts = res.data;
			}
			return this.depts;
		},
		// 获取所有部门
		async getAllrole() {
			if (this.role?.length === 0) {
				const res = await getAllrole();
				this.role = res.data;
			}
			return this.role;
		},
		// 获取所有部门
		async getAllMerchanRole() {
			if (this.merchanRole?.length === 0) {
				const res = await getAllMerchantRole();
				this.merchanRole = res.data;
			}
			return this.merchanRole;
		},
		// 获取所有部门
		async getAllMerchan() {
			if (this.merchan?.length === 0) {
				const res = await getAllMerchant();
				this.merchan = res.data;
			}
			return this.merchan;
		}
	},
});
