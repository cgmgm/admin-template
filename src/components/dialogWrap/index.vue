<!-- dialogWrap组件 -->
<template>
    <el-dialog class="dialog-wrap" :class="classObj" ref="dialogRef" :title="title" :modal="true" append-to-body
        draggable v-model="dialogVisible" :close-on-press-escape="true" :destroy-on-close="false"
        :close-on-click-modal="true" :width="isMobile ? '100%' : 'auto'" @closed="handleClosed" @close="handleClose">
        <template #title>
            {{ title }}
            <span v-if="dialogOptions.subtitle" class="subtitle">{{ dialogOptions.subtitle }}</span>
        </template>
        <component :is="content" v-if="content" v-bind="contentProps" />
        <slot v-else />
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick, defineAsyncComponent, provide, getCurrentInstance } from 'vue'
import { useWindowSize } from '@vueuse/core'

// Props定义
const props = defineProps({
    title: {
        type: String,
        default: 'dialog'
    },
    visible: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        default: 'normal'
    },
    option: {
        type: Object,
        default: () => ({})
    },
    content: {
        type: [Object, Function],
        default: null
    },
    contentProps: {
        type: Object,
        default: () => ({})
    }
})

// Emits定义 - 只保留基础事件
const emit = defineEmits(['update:visible', 'close', 'closed', 'emit'])

// 响应式状态
const dialogRef = ref()
const isCallback = ref(true)
const dialogVisible = ref(false)
const dialogInit = ref(false)

// 获取当前实例
const instance = getCurrentInstance();

// 计算移动端状态
const { width } = useWindowSize()
const isMobile = computed(() => width.value <= 768)

// 计算属性
const classObj = computed(() => ({
    'dialog-ops-modal': !!props.option.modal,
    'mobile-dialog': isMobile.value
}))

const dialogOptions = computed(() => ({
    top: isMobile.value ? '0px' : '6vh',
    subtitle: '',
    ...props.option
}))

// 监听器
watch(() => dialogVisible.value, (newVal) => {
    if (newVal) {
        initEmit()
    }
    emit('update:visible', newVal)
})

watch(() => props.visible, (newVal) => {
    dialogVisible.value = newVal
})

// 方法
const handleClosed = () => {
    isCallback.value && emit('closed')
}

const handleClose = () => {
    isCallback.value && emit('close')
}

const show = (callback?: () => void) => {
    dialogVisible.value = true
    if (callback) {
        nextTick(callback)
    }
}

const hide = (isCallbackVal = true) => {
    isCallback.value = isCallbackVal
    dialogVisible.value = false
}

// 提供实例给子组件
provide('dialogInstance', {
    $close: hide,
    $emit: (event: string, ...args: any[]) => {
        if (event === 'close') {
            hide();
        }
        // 向上传递事件给 dialog.ts
        emit('emit', { event, args });
    }
});

const initEmit = () => {
    if (!dialogInit.value && props.type === 'normal') {
        nextTick(() => {
            const instance = dialogRef.value?.children?.[0]
            if (instance) {
                instance.on?.('dialog-close', () => {
                    dialogVisible.value = false
                })
            }
        })
        dialogInit.value = true
    }
}

// 初始化
dialogVisible.value = props.visible

// 暴露方法
defineExpose({
    show,
    hide
})
</script>

<style lang="scss" scoped>
.subtitle {
    color: orangered;
}

.dialog-wrap {
    margin: 0 auto;
    top: 15vh;

    :deep(&.el-dialog) {

        @media screen and (max-width: 768px) {
            width: 90% !important;
            margin: 20vh auto 0;
        }
    }
}
</style>

<style lang="scss">
.dialog-wrap {
    margin: 0 auto;
    top: 15vh;

    &.el-dialog {

        @media screen and (max-width: 768px) {
            width: 90% !important;
            margin: 20vh auto 0;
        }
    }
}

.mobile-dialog {
    .el-dialog {
        margin: 0 auto;
        max-width: 90vw;

        &.mobile-dialog {
            max-width: 100vw;
        }

        .el-dialog__body {
            padding: 15px;
            max-height: calc(90vh - 100px);
            overflow-y: auto;
        }
    }
}
</style>
