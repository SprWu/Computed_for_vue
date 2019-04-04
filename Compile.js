/**
 * 
 * @param {Element} el 需要绑定的DOM节点
 * @param {上下文环境} vm 指向SelfVue的作用域
 */
function Compile(el, vm) {
    this.vm = vm; //指向SelfVue的作用域
    this.el = document.querySelector(el); // 绑定DOM节点
    this.fragment = null; // 虚拟DOM节点
    this.init();
}

Compile.prototype = {
    /* Compile初始化函数 */
    init() {
        if (this.el) {
            this.fragment = this.nodeToFragment(this.el); //生成完整的虚拟DOM节点
            this.compileElement(this.fragment); // 遍历fragment，对指定指令进行处理
            this.el.appendChild(this.fragment); // 将处理完成的fragment渲染到页面
        } else {
            alert("DOM元素不存在");
        }
    },
    /* 将el节点的所有节点加入到fragment虚拟节点中 */
    nodeToFragment(el) {
        //创建节点对象(空的文档片段)
        let child, fragment = document.createDocumentFragment();
        while (child = el.firstChild) {
            fragment.appendChild(child);
        }
        return fragment;
    },
    /* 遍历fragment所有节点，对指定的节点进行特殊处理 */
    compileElement(el) {
        let childNodes = el.childNodes;
        let reg = /\{\{(.*)\}\}/; // 匹配的正则表达式
        // [].slice.call 将伪数组转化为数组
        // [].slice === Array.protoType.slice
        [].slice.call(childNodes).forEach(node => {
            // textContent 属性设置或返回指定节点的文本内容，以及它的所有后代(文本内容)
            let text = node.textContent;
            if (this.isElementNode(node)) {
                this.compile(node); // 进行指令解析
            } else if (this.isTextNode(node) && reg.test(text)) {
                // exec()方法由于检索字符串中的正则表达式的匹配
                // 返回一个数组，其中存放匹配的结果，如果未找到匹配，
                // 则返回null
                this.compileText(node, reg.exec(text)[1].trim());
            }
            // 如果还有子节点，则继续遍历
            if (node.childNodes && node.childNodes.length) {
                this.compileElement(node);
            }
        })
    },
    /* 指令解析 */
    compile(node) {
        let nodeAttrs = node.attributes; // attributes 属性返回指定DOM节点的属性合集
        let self = this;
        //Array.prototype属性表示Array构造函数的原型，并允许为所有Array对象添加新的属性和方法。
        //Array.prototype本身就是一个Array
        Array.prototype.forEach.call(nodeAttrs, function (attr) {
            // 添加事件的方法名和前缀
            // v-on:click="func",则attrName = 'v-on:click'
            let attrName = attr.name;
            if (self.isDirective(attrName)) { // 是以 'v-' 开头
                //添加事件的方法值
                // v-on:click = 'func',则 exp = 'func'
                let exp = attr.value;
                let dir = attrName.substring(2); // 去除 'v-'
                if (self.isEventDirective(dir)) { // 事件指令解析
                    self.compileEvent(node, self.vm, exp, dir);
                } else { // model指令解析
                    self.compileModel(node, self.vm, exp, dir);
                }
                node.removeAttribute(attrName); // 移除指令属性
            }
        })
    },
    /* model指令解析实现 */
    compileModel(node, vm, exp, dir) {
        let self = this;
        let value = this.vm[exp]; // 等价于 this.data[exp]
        this.modelUpdater(node, value); // 初始化视图(input框默认值)
        // 是否可去掉
        new Watcher(this.vm, exp, function (value) {
            self.modelUpdater(node, value);
        });
        // 监听input的输入操作
        node.addEventListener('input', function (e) {
            let newValue = e.target.value; // 获取输入的最新内容
            if (value === newValue) return;
            self.vm[exp] = newValue; // 更新SelfVue.data[exp]的值
            value = newValue; // 旧值更新
        })
    },
    /* model 初始化/更新视图函数 */
    // 主要是初始化，更新视图功能重复了
    modelUpdater(node, value) {
        node.value = typeof value === 'undefined' ? '' : value;
    },
    /* v-on指令解析实现 */
    compileEvent(node, vm, exp, dir) {
        // 获取事件名, v-on:click => click
        let eventType = dir.split(':')[1];
        let cb = vm.methods && vm.methods[exp]; // 是否声明了methods
        if (eventType && cb) {
            node.addEventListener(eventType, cb.bind(vm), false);
        }
    },
    /* 文本属性解析 */
    compileText(node, key) {
        let self = this;
        let initText = this.vm[key]; // 等价于 SelfVue.data[key]
        this.updateText(node, initText); //文本节点初始化视图
        new Watcher(this.vm, key, function (value) {
            self.updateText(node, value);
        })
    },
    /* 文本节点 初始化/更新视图函数 */
    updateText(node, value) {
        node.textContent = typeof value === 'undefined' ? '' : value;
    },
    /* 判断是否是 v-on: 指令 */
    isEventDirective(dir) {
        return dir.indexOf('on:') === 0;
    },
    /**
     * nodeType === 1 : DOM节点
     * nodeType === 2 : 属性(attr属性)节点
     * nodeType === 3 : 文本节点
     */
    /* 判断是否是DOM节点 */
    isElementNode(node) {
        return node.nodeType === 1;
    },
    /* 判断是否是文本节点 */
    isTextNode(node) {
        return node.nodeType === 3;
    },
    /* 判断是否是以 v- 开头 */
    isDirective(attr) {
        return attr.indexOf('v-') === 0;
    }
}