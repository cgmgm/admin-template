import type { DirectiveBinding } from 'vue'

export default {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
        const dialogHeaderEl = el.querySelector('.el-dialog__header')
        const dragDom = el.querySelector('.el-dialog') as HTMLElement
        if (!dialogHeaderEl || !dragDom) return

        dialogHeaderEl.style.cursor = 'move'

        // 获取原有属性 ie dom元素.currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
        const sty = dragDom.currentStyle || window.getComputedStyle(dragDom, null)
        const moveDown = (e: MouseEvent) => {
            // 鼠标按下，计算当前元素距离可视区的距离
            const disX = e.clientX - dialogHeaderEl.offsetLeft
            const disY = e.clientY - dialogHeaderEl.offsetTop

            // 获取到的值带px 正则匹配替换
            let styL: number, styT: number

            // 注意在ie中 第一次获取到的值为组件自带50% 移动之后赋值为px
            if (sty.left.includes('%')) {
                styL = +document.body.clientWidth * (+sty.left.replace(/%/g, '') / 100)
                styT = +document.body.clientHeight * (+sty.top.replace(/%/g, '') / 100)
            } else {
                styL = +sty.left.replace(/px/g, '')
                styT = +sty.top.replace(/px/g, '')
            }

            const minDragDomLeft = dragDom.offsetLeft
            const maxDragDomLeft = document.body.clientWidth - dragDom.offsetLeft - dragDom.clientWidth
            const minDragDomTop = dragDom.offsetTop
            const maxDragDomTop = document.body.clientHeight - dragDom.offsetTop - dragDom.clientHeight

            document.onmousemove = function (e) {
                // 通过事件委托，计算移动的距离
                let left = e.clientX - disX
                let top = e.clientY - disY

                // 边界处理
                if (-(left) > minDragDomLeft) {
                    left = -minDragDomLeft
                } else if (left > maxDragDomLeft) {
                    left = maxDragDomLeft
                }

                if (-(top) > minDragDomTop) {
                    top = -minDragDomTop
                } else if (top > maxDragDomTop) {
                    top = maxDragDomTop
                }

                // 移动当前元素
                dragDom.style.cssText += `;left:${left + styL}px;top:${top + styT}px;`
            }

            document.onmouseup = function () {
                document.onmousemove = null
                document.onmouseup = null
            }
        }

        dialogHeaderEl.onmousedown = moveDown
    }
} 