<template>
    <div class="add-info-container">
        <el-form ref="formRef" :model="state.form" label-width="120px">
            <el-row :gutter="35">
                <el-col :span="12">
                    <el-form-item label="用户昵称" prop="nickname">
                        <span style="color: red;">{{ state.form.nickname }}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="用户名" prop="username">
                        <span style="color: red;">{{ state.form.account }}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="24">
                    <el-form-item label="谷歌验证码">
                        <div>
                            <div ref="qrcodeRef"></div>
                            <span style="color: red;">* 打开APP google authenticator扫描二维码绑定验证器</span>
                        </div>
                    </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                    <el-form-item class="mt20">
                        <el-button @click="cancel">取 消</el-button>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, inject, onMounted } from 'vue';
import { getGoogleCode } from '@/api/system'
import { ElMessage } from 'element-plus';
import { md5 } from "js-md5";
import { useCat } from '@/mixins/useStore';
import QRCode from 'qrcodejs2-fixes';
// 定义变量内容
const dialogInstance = inject('dialogInstance');

const props = defineProps({
    data: {
        type: Object,
        default: null
    },
});
const state = reactive({
    form: {
        nickname: '',
        account: ''
    },
});
const qrcodeRef = ref();
// 转为树状结构
onMounted(async () => {

    state.form = props.data
    // 创建新的二维码实例
    const row = await getGoogleCode({ id: props.data.userId });

    new QRCode(qrcodeRef.value, {
        text: row.data, // 要编码的文本
        width: 300,
        height: 300,
        colorDark: '#000000',
        colorLight: '#ffffff',
    });
})

// 返回列表页
const cancel = () => {
    (dialogInstance as any)?.$close();
};
</script>

<style scoped lang="scss">
.add-info-container {
    padding: 15px;
    width: 800px;

}
</style>