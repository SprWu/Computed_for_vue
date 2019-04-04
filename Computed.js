function Computed(obj, key, comFunc) {
    // 绑定调用函数的对象(可优化)
    comFUnc = comFunc.bind(sv.data); 
    let value = comFunc(); // 初始化计算结果
    sv.data.say = value; // 初始化 
}
