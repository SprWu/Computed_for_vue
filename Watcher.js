function Watcher(vm, key, callBack) {
    this.vm = vm; // 绑定作用域，指向入口函数的作用域
    this.key = key;
    this.cb = callBack;
    this.value = this.get();
}

Watcher.prototype = {
    update() {
        this.run;
    },
    run() {
        let value = this.vm.data[this.key];
        let oldValue = this.value;
        if (value !== oldValue) {
            this.value = value;
            this.cb.call(this.vm, value);
        }
    },
    get() {
        Dep.target = this;
        var value = this.vm.data[this.key];
        Dep.target = null;
        return value;
    }
}