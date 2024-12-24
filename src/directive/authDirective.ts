import type { App } from 'vue';
import { useUserInfo } from '@/stores/userInfo';

/**
 * 用户权限指令
 * @directive 单个权限验证（v-auth="xxx"）
 * @directive 多个权限验证，满足一个则显示（v-auths="[xxx,xxx]"）
 * @directive 多个权限验证，全部满足则显示（v-auth-all="[xxx,xxx]"）
 */
export function authDirective(app: App) {
	// 单个权限验证（v-auth="xxx"）
	app.directive('auth', {
		mounted(el, binding) {
			const stores = useUserInfo();
			const allPermission = '*'
			// const hasPerm = stores.userInfos.authBtnList.some((v: string) => {
			// 	return v === binding.value || allPermission == v || binding.value == allPermission
			// })
			const hasPerm = true;

			if (!hasPerm) {
				el.parentNode && el.parentNode.removeChild(el);
			}
		},
	});
	// 多个权限验证，满足一个则显示（v-auths="[xxx,xxx]"）
	app.directive('auths', {
		mounted(el, binding) {
			// let flag = false;
			const allPermission = '*'
			const stores = useUserInfo();
			// const hasPerm = stores.userInfos.authBtnList.some((val: string) => {
			// 	return allPermission == val || binding.value.includes(val)
			// });
			const hasPerm = true;
			//
			// stores.userInfos.authBtnList.map((val: string) => {
			// 	binding.value.map((v: string) => {
			// 		if (val === v || allPermission == val) flag = true;
			// 	});
			// });
			if (!hasPerm) {
				el.parentNode && el.parentNode.removeChild(el);
			}
		},
	});
	// 多个权限验证，全部满足则显示（v-auth-all="[xxx,xxx]"）
	app.directive('auth-all', {
		mounted(el, binding) {
			// const stores = useUserInfo();
			// const flag = judementSameArr(binding.value, stores.userInfos.authBtnList);
			// if (!flag) el.parentNode.removeChild(el);
			let flag = [];
			const allPermission = '*'
			const stores = useUserInfo();
			// stores.userInfos.authBtnList.map((val: string) => {
			// 	binding.value.map((v: string) => {
			// 		if (val === v || allPermission == val) flag.push(true);
			// 	});
			// });
			// if (flag.length > 0 && flag.length == binding.value.length) {
			// 	el.parentNode && el.parentNode.removeChild(el);
			// }
		},
	});
}
