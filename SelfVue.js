function SelfVue(object) {
    this.vm = this;
    this.data = object.data;
    this.methods = object.methods;
    this.computed = object.computed || '';
    Object.keys(this.data).forEach( key => this.proxykeysData(key));
    Object.keys(this.computed).forEach( key => this.proxykeysCMP(key));
    observe(this.data);
    new Compile(object.el, this.vm);
    return this;
}

SelfVue.prototype = {
    proxykeysData(key) {
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
    }, 
    proxykeysCMP(key) { // 设置computed属性访问的代理
        Object.defineProperty(this, key, {
            enumerable: false,
            configurable: true,
            get() {
                return this.computed[key].bind(this.data); 
            },
            set(newValue) {
                this.computed[key] = newValue; // 实现属性代理访问
            }
        })
    }
}