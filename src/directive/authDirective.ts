import type { App } from 'vue';
import { auth, auths, authAll } from '@/utils/authFunction';

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
			const hasPerm = auth(binding.value);

			if (!hasPerm) {
				el.parentNode && el.parentNode.removeChild(el);
			}
		},
	});
	// 多个权限验证，满足一个则显示（v-auths="[xxx,xxx]"）
	app.directive('auths', {
		mounted(el, binding) {
			const hasPerm = auths(binding.value);
			if (!hasPerm) {
				el.parentNode && el.parentNode.removeChild(el);
			}
		},
	});
	// 多个权限验证，全部满足则显示（v-auth-all="[xxx,xxx]"）
	app.directive('auth-all', {
		mounted(el, binding) {
			const hasPerm = authAll(binding.value);
			if (!hasPerm) {
				el.parentNode && el.parentNode.removeChild(el);
			}
		},
	});
}
