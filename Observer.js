//****************************发布者************************
function Dep() {
    this.subs = []; // 用来保存订阅者
}

Dep.prototype = {
    /* 添加一个订阅者 */
    addSub(sub) {
        this.subs.push(sub);
    },
    /* 遍历并通知所有的订阅者 */
    notify() {
        this.subs.forEach( sub => sub.update());
    }
}

Dep.target = null; // 用来暂存订阅者

//****************************监听器************************
function observe(data) {
    if(!data || typeof data !== 'object') return; // 如果已经是根节点则返回
    Object.keys(data).forEach(key => defineReactive(data, key, data[key]));
}

function defineReactive(data, key, value) {
    observe(value);
    var dep = new Dep();
    Object.defineProperty(data, key, {
        enumerable: true, // 可被循环
        configurable: true, // 可被修改
        get() {
            // 添加订阅者...
            if(Dep.target) {
                dep.addSub(Dep.target);
            }
            // 添加计算属性...
            return value;
        },
        set(newValue) {
            if(value === newValue) return; // 值未改变不执行
            // 值发生改变
            value = newValue;
            console.log(`属性${key}的值发生变化，现在为：${value}`);
        }
    })
}

// 进行验证
var library = {
    book1: {
        name: ''
    },
    book2: ''
};
observe(library);
library.book1.name = 'Vue权威指南';  // 属性 name的值发生变化，现在为 'Vue权威指南'
library.book2 = 'JavaScript进阶'; // 属性 book2的值发生变化，现在为 'JavaScript进阶'