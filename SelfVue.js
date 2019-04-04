function SelfVue(object) {
    this.vm = this;
    this.data = object.data;
    this.methods = object.methods;
    observe(this.data);
    new Compile(object.el, this.vm);
    return this;
}