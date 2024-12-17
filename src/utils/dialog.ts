import { createVNode, render, type Component, type VNode, createApp } from 'vue'
import dialogWrap from '/@/components/dialogWrap/index.vue'
import { i18n } from '/@/i18n/index'

interface DialogOptions {
    modal?: boolean
    subtitle?: string
    top?: string
    [key: string]: any
}

interface DialogProps {
    title: string
    visible: boolean
    option: DialogOptions
}

let currentDialog: { vm: VNode | null } = {
    vm: null
}

let appInstance: any = null

export function $dialog(
    title: string,
    component: Component,
    props: Record<string, any> = {},
    options: DialogOptions = {}
) {
    if (!appInstance) {
        console.error('Please call setupDialog first')
        return { close: () => { } }
    }

    // 创建容器
    const container = document.createElement('div')
    document.body.appendChild(container)

    // 创建事件处理器
    const handlers: Record<string, Function[]> = {};

    const dialogInstance = {
        $on: (event: string, handler: Function) => {
            if (!handlers[event]) {
                handlers[event] = [];
            }
            handlers[event].push(handler);
            return dialogInstance;
        },
        $emit: (event: string, ...args: any[]) => {
            if (handlers[event]) {
                handlers[event].forEach(handler => handler(...args));
            }
        },
        close: () => {
            subApp.unmount()
            document.body.removeChild(container)
            currentDialog.vm = null
        }
    }

    // 创建一个新的应用实例
    const subApp = createApp({
        render() {
            return createVNode(dialogWrap, {
                title,
                visible: true,
                option: options,
                content: component,
                contentProps: props,
                onEmit: ({ event, args }) => {
                    // 统一处理所有事件
                    dialogInstance.$emit(event, ...args);
                },
                onClose: () => {
                    dialogInstance.close();
                }
            })
        }
    })

    // 创建内容组件
    const contentVNode = createVNode(component, {
        ...props,
        onClose: () => {
            // 处理内容组件的关闭事件
            subApp.unmount()
            document.body.removeChild(container)
            currentDialog.vm = null
        }
    })

    // 继承全局配置
    subApp.config.globalProperties = {
        ...appInstance.config.globalProperties,
        $t: i18n.global.t.bind(i18n.global),
        $i18n: i18n.global
    }

    // 使用全局组件和指令
    Object.keys(appInstance._context.components).forEach(name => {
        subApp.component(name, appInstance._context.components[name])
    })

    Object.keys(appInstance._context.directives).forEach(name => {
        subApp.directive(name, appInstance._context.directives[name])
    })

    // 使用插件
    subApp.use(i18n)

    // 挂载应用
    subApp.mount(container)

    currentDialog.vm = contentVNode

    return dialogInstance
}

// 为了在 Vue 应用中全局使用
export function setupDialog(app: any) {
    appInstance = app
    app.config.globalProperties.$dialog = $dialog
    // 添加到window对象
    window.$dialog = $dialog
} 