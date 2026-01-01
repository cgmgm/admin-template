// 通用函数
import useClipboard from 'vue-clipboard3';
import { ElMessage } from 'element-plus';
import { formatDate } from '@/utils/formatTime';
import { useI18n } from 'vue-i18n';

export default function () {
	const { t } = useI18n();
	const { toClipboard } = useClipboard();

	// 百分比格式化
	const percentFormat = (row: EmptyArrayType, column: number, cellValue: string) => {
		return cellValue ? `${cellValue}%` : '-';
	};
	// 列表日期时间格式化
	const dateFormatYMD = (row: EmptyArrayType, column: number, cellValue: string) => {
		if (!cellValue) return '-';
		return formatDate(new Date(cellValue), 'YYYY-mm-dd');
	};
	// 列表日期时间格式化
	const dateFormatYMDHMS = (row: EmptyArrayType, column: number, cellValue: string) => {
		if (!cellValue) return '-';
		return formatDate(new Date(cellValue), 'YYYY-mm-dd HH:MM:SS');
	};
	// 列表日期时间格式化
	const dateFormatHMS = (row: EmptyArrayType, column: number, cellValue: string) => {
		if (!cellValue) return '-';
		let time = 0;
		if (typeof row === 'number') time = row;
		if (typeof cellValue === 'number') time = cellValue;
		return formatDate(new Date(time * 1000), 'HH:MM:SS');
	};
	// 小数格式化
	const scaleFormat = (value: string = '0', scale: number = 4) => {
		return Number.parseFloat(value).toFixed(scale);
	};
	// 小数格式化
	const scale2Format = (value: string = '0') => {
		return Number.parseFloat(value).toFixed(2);
	};
	// 点击复制文本
	const copyText = async (text: string) => {

		// 首选：现代剪贴板 API（完全无闪）
		if (navigator.clipboard?.writeText) {
			try {
				await navigator.clipboard.writeText(text);
				ElMessage.success(t('message.layout.copyTextSuccess'));
				return;
			} catch (_) { }
		}

		// fallback：无 focus 的 selection 方案
		const span = document.createElement('span');
		span.textContent = text;
		span.style.position = 'fixed';
		span.style.top = '-9999px';
		span.style.userSelect = 'text';

		document.body.appendChild(span);

		const range = document.createRange();
		range.selectNodeContents(span);

		const selection = window.getSelection();
		selection?.removeAllRanges();
		selection?.addRange(range);

		document.execCommand('copy');

		selection?.removeAllRanges();
		document.body.removeChild(span);

		ElMessage.success(t('message.layout.copyTextSuccess'));
	};
	return {
		percentFormat,
		dateFormatYMD,
		dateFormatYMDHMS,
		dateFormatHMS,
		scaleFormat,
		scale2Format,
		copyText,
	};
}
