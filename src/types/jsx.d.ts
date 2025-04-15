// 这个文件为JSX元素提供类型声明
import 'vue'

declare global {
    namespace JSX {
        interface IntrinsicElements {
            // 允许任何元素
            [elem: string]: any
        }
    }
}

// 确保这个文件被视为模块
export { } 