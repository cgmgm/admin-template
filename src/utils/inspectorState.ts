import { ref } from 'vue'

// 创建一个全局的响应式状态
export const isInspectorActive = ref(false)

// 初始化监听器
let initialized = false

export function setupInspectorWatch() {
    if (initialized) return

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target instanceof HTMLElement) {
                isInspectorActive.value = mutation.target.classList.contains('active')
            }
        })
    })

    // 等待 Vue Devtools 加载完成
    const checkDevtools = () => {
        const inspectorButton = document.querySelector('.vue-devtools__inspector-button')
        if (inspectorButton) {
            observer.observe(inspectorButton, {
                attributes: true,
                attributeFilter: ['class']
            })
            initialized = true
        } else {
            // 如果还没加载完，继续等待
            setTimeout(checkDevtools, 1000)
        }
    }

    checkDevtools()

    // 清理函数
    window.addEventListener('beforeunload', () => {
        observer.disconnect()
    })
} 