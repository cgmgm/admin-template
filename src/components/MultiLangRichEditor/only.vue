<template>
	<div class="multi-lang-rich-editor">
			<Editor
				v-model:getHtml="content"
				:toolbarConfig="toolbarConfig"
				:editorConfig="editorConfig"
				height="300px"
				placeholder="请输入中文回复内容"
			/>
	</div>
</template>

<script setup lang="ts" name="MultiLangRichEditor">
import { ref, watch, reactive, defineAsyncComponent } from 'vue';

const Editor = defineAsyncComponent(() => import('@/components/editor/index.vue'));

const props = defineProps({
	modelValue: {
		type: String,
		default: '',
	},
	disabled: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(['update:modelValue']);

const content = ref<any>('');

// Configure toolbar to only show Telegram supported styles
const toolbarConfig = {
	toolbarKeys: [
		'bold',
		'italic',
		'underline',
		'through',
		'code',
		'blockquote', // Added blockquote
		'insertLink',
		'clearStyle',
		// 'codeBlock' // WangEditor codeBlock might need pre/code handling
	],
};

const editorConfig = {
	autoFocus: false,
};

// Process HTML to match Telegram requirements
const processHtml = (html: string) => {
	if (!html) return '';
	
	const div = document.createElement('div');
	div.innerHTML = html;
	
	const walk = (node: Node): string => {
		if (node.nodeType === Node.TEXT_NODE) {
			return node.textContent || '';
		}
		
		if (node.nodeType === Node.ELEMENT_NODE) {
			const el = node as HTMLElement;
			const tagName = el.tagName.toLowerCase();
			
			// Handle recursion
			let inner = '';
			el.childNodes.forEach(child => inner += walk(child));
			
			switch (tagName) {
				case 'p':
				case 'div': 
					return inner + '\n';
				case 'br':
					return '\n';
				case 'b':
				case 'strong':
					return `<b>${inner}</b>`;
				case 'i':
				case 'em':
					return `<i>${inner}</i>`;
				case 'u':
					return `<u>${inner}</u>`;
				case 's':
				case 'strike':
				case 'del':
					return `<s>${inner}</s>`;
				case 'a':
					return `<a href="${el.getAttribute('href') || ''}">${inner}</a>`;
				case 'code':
					// Preserve class for language (if used in pre>code)
					const cls = el.getAttribute('class');
					return cls ? `<code class="${cls}">${inner}</code>` : `<code>${inner}</code>`;
				case 'pre':
					return `<pre>${inner}</pre>`;
				case 'blockquote':
					return `<blockquote>${inner}</blockquote>`;
				case 'tg-spoiler':
					return `<tg-spoiler>${inner}</tg-spoiler>`;
				case 'tg-emoji':
					return `<tg-emoji emoji-id="${el.getAttribute('emoji-id')}">${inner}</tg-emoji>`;
				case 'span':
					const style = el.getAttribute('style') || '';
					if (style.includes('text-decoration: underline')) return `<u>${inner}</u>`;
					if (style.includes('text-decoration: line-through')) return `<s>${inner}</s>`;
					if (el.classList.contains('tg-spoiler')) return `<span class="tg-spoiler">${inner}</span>`;
					return inner;
				default:
					return inner;
			}
		}
		return '';
	};
	
	let res = '';
	div.childNodes.forEach(child => res += walk(child));
	
	// Trim ending newlines
	return res.replace(/\n+$/, '');
};

// Convert Telegram HTML to Editor HTML (ensure block wrapping)
const toEditorHtml = (html: string) => {
	if (!html) return '';
	// WangEditor v5 needs block elements at root.
	// If the content is just text or inline tags, wrap in <p>.
	// Also convert \n to <br> for display.
	return `<p>${html.replace(/\n/g, '<br/>')}</p>`;
};

// Watch prop change to update internal state
watch(
	() => props.modelValue,
	(val) => {
		// Only update if the parsed content is different to avoid formatting loops
		if (processHtml(content.value) === val) {
			return;
		}
		if (val || val === '') {
			content.value = toEditorHtml(val || '');
		}
	},
	{ immediate: true }
);

// Watch internal buffer change to emit update
watch(
	content,
	(val) => {
		// deep clone + process
		const processed = processHtml(val);
		// Only emit if the value actually changed
		if (processed !== props.modelValue) {
			emit('update:modelValue', processed);
		}
	}
);
</script>

<style scoped lang="scss">
.multi-lang-rich-editor {
	width: 100%;
}
</style>
