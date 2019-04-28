function Watcher(vm, key, id, callBack, upviewcb) {
    this.vm = vm; // 绑定作用域，指向入口函数的作用域
    this.key = key;
    this.cb = callBack;
    this.id = id; // 区别 data 和 computed
    this.upviewcb = upviewcb; // computed 更新视图回调函数
    this.value = this.get();
}

Watcher.prototype = {
    update() {
        this.run();
    },
    run() {
        if (this.id === 1) {
            this.cb.call(this.vm, this.vm.data[this.key]);
        } else {
            let value = this.cb.bind(this.vm)();
            let oldValue = this.value;
            if (value === oldValue) return; // 值未发生改变则返回
            this.value = value; // 更新旧值
            this.upviewcb.call(this.vm, value); // 更新视图
        }
    },
    get() {
        if (this.id === 1) {
            Dep.target = this;
            this.vm.data[this.key];
            Dep.target = null;
        } else {
            dep.addSub(this);
            return this.cb.bind(this.vm)();
        }
    }
}