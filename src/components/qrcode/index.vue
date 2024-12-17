<template>
	<div class="qrcode-container layout-pd">
		<el-card shadow="hover" header="qrcodejs2 二维码生成">
			<el-alert title="感谢优秀的 `qrcodejs2`，项目地址：https://github.com/davidshimjs/qrcodejs" type="success"
				:closable="false" class="mb15"></el-alert>
			<div class="qrcode-img-warp">
				<div class="mb30 mt30 qrcode-img">
					<div class="qrcode" ref="qrcodeRef"></div>
				</div>
				<el-button type="primary" size="default" @click="onInitQrcode">
					<el-icon>
						<ele-Refresh />
					</el-icon>
					重新生成
				</el-button>
			</div>
		</el-card>
	</div>
</template>

<script setup lang="ts" name="funQrcode">
import { onMounted, ref, watch } from 'vue';
import QRCode from 'qrcodejs2-fixes';
const props = defineProps({
	text: {
		type: String,
		default: ''
	}
});
// 定义变量内容
const qrcodeRef = ref();

// 初始化生成二维码
const initQrcode = (text: String) => {
	new QRCode(qrcodeRef.value, {
		text: text,
		width: 125,
		height: 125,
		colorDark: '#000000',
		colorLight: '#ffffff',
	});
};
watch(() => props.text, (newVal) => {
	qrcodeRef.value.innerHTML = '';
	initQrcode(newVal);
});
// 页面加载时
onMounted(() => {
	initQrcode(props.text);
});
</script>

<style scoped lang="scss">
.qrcode-container {
	.qrcode-img-warp {
		text-align: center;

		.qrcode-img {
			display: flex;
			width: 100%;
			height: 125px;

			.qrcode {
				margin: auto;
				width: 125px;
				height: 125px;
			}
		}
	}
}
</style>
