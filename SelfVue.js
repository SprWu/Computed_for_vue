function SelfVue(object) {
    this.vm = this;
    this.data = object.data;
    this.methods = object.methods;
    this.computed = object.computed;
    Object.keys(this.data).forEach( key => this.proxykeys(key));
    observe(this.data);
    new Compile(object.el, this.vm);
    return this;
}

SelfVue.prototype = {
    proxykeys(key) {
        Object.defineProperty(this, key, {
            enumerable: false,
            configurable: true,
            get() {
                return this.data[key]; // 用于页面初始化
            },
            set(newValue) {
                this.data[key] = newValue; // 实现属性代理访问
            }
        })
    }
}