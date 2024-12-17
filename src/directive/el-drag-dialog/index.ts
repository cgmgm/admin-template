import type { App } from 'vue'
import drag from './dialog-drag'

export default {
    install(app: App) {
        app.directive('el-drag-dialog', drag)
    }
} 