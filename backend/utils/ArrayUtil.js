Array.prototype.distinct = function(f) {
    if(!f) {
        f = e => e;
    }
    let r = [];
    let m = {};
    for(let i=0;i<this.length;i++) {
        let e = this[i];
        let k = f(e);
        if(m[k] === undefined) {
            m[k] = 1;
            r.push(e);
        }
    }
    return r;
}