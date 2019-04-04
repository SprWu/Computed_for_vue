nodeToFragment(el) {
    var child,
        fragment = document.createDocumentFragment(); // 创建fragment
    while (child = el.firstChild) { // 遍历节点
        fragment.appendChild(child); // 创建fragment
    }
    return fragment;
}

isTextNode(node) {
    return node.nodeType === 3;
}

isElementNode(node) {
    return node.nodeType === 1
}

compileElement(el) {
    var childNodes = el.childNodes; //取得el节点的子节点合集
    var reg = /\{\{(.*)\}\}/; // 匹配 '{{ }}' 的正则表达式
    [].slice.call(childNodes).forEach(node => {
        var text = node.textContent;
        /* 判断是DOM节点还是文本节点 */
        if (this.isElementNode(node)) {
            // 进行指令解析
        } else if (this.isTextNode(node) && reg.test(text)) {
            //exec() 方法用于检索字符串中的正则表达式的匹配。
            //返回一个数组，其中存放匹配的结果。如果未找到匹配，则返回值为 null。
            this.compileText(node, reg.exec(text)[1].trim());
        }
        if (node.childNodes && node.childNodes.length) {
            this.compileElement(node); // 继续遍历子节点
        }
    })
}
/* 文本节点订阅者初始化调用 */
compileText(node, key) {
    var self = this;
    var initText = this.vm[key]; // data: { exp : 'xxx' }
    this.updateText(node, initText);
    new Watcher(this.vm, key, function (value) {
        self.updateText(node, value);
    })
}
// 文本节点 更新视图/初始化 函数
updateText(node, value) {
    // textContent 属性设置或返回指定节点的文本内容
    node.textContent = typeof value == 'undefined' ? '' : value;
}

isDirective(attr) {
    return attr.indexOf('v-') === 0;
}
isEventDirective(dir) {
    return dir.indexOf('on:') === 0;
}


compile(node) {
    var nodeAttrs = node.attributes; //attributes 属性返回指定节点的属性集合，即 NamedNodeMap
    var self = this;
    //Array.prototype属性表示Array构造函数的原型，并允许为所有Array对象添加新的属性和方法。
    //Array.prototype本身就是一个Array
    Array.prototype.forEach.call(nodeAttrs, function (attr) {
        //添加事件的方法名和前缀:
        // v-on:click="onClick" ,则attrName = 'v-on:click' id="app" attrname= 'id'
        var attrName = attr.name;
        if (self.isDirective(attrName)) { //如果是指令：'v-'开头
            //添加事件的方法名和前缀:v-on:click="onClick" ,exp = 'onClick'
            var exp = attr.value;
            var dir = attrName.substring(2); // 去除 'v-'
            if (self.isEventDirective(dir)) { // 事件指令解析
                self.compileEvent(node, self.vm, exp, dir);
            } else { // model指令解析
                self.compileModel(node, self.vm, exp, dir);
            }
            node.removeAttribute(attrName); // 解析完成，移除该属性
        }
    })
}
compileModel(node, vm, exp, dir) {
    var self = this;
    var val = this.vm[exp]; // this.data[exp];
    this.modelUpdater(node, val); // 更新函数
    new Watcher(this.vm, exp, function (value) {
        self.modelUpdater(node, value);
    });
    /* 监听input的输入操作 */
    node.addEventListener('input', function (e) {
        var newValue = e.target.value; // 获取输入框的最新内容
        if (val === newValue) return;
        self.vm[exp] = newValue; // SelfVue.data[exp] = newValue
        val = newValue; // 旧值更新
    })
}
compileEvent(node, vm, exp, dir) {
    // 获取事件名, v-on:click => click
    let eventType = dir.split(':')[1];
    let cb = vm.methods && vm.methods[exp]; // 是否声明了methods
    if (eventType && cb) {
        node.addEventListener(eventType, cb.bind(vm), false);
    }
}
modelUpdater(node, value) {
    node.value = typeof value === 'undefined' ? '' : value;
}