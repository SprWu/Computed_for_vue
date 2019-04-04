nodeToFragment(el) {
    var child,
fragment = document.createDocumentFragment();// 创建fragment
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
        if(this.isElementNode(node)) {
            // 进行指令解析
        }
        else if (this.isTextNode(node) && reg.test(text)) {
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

