class localDB {
    constructor(openRequest = {}, db = {}, objectStore = {}) {
        this.openRequest = openRequest;
        this.db = db;
        this.objectStore = objectStore;
        Object.getOwnPropertyNames(this.__proto__).map(fn => {
            if (this.__proto__[fn] === 'function') {
                this[fn] = this[fn].bind(this);
            }
        })
    }
    
    openDB(ops) {
        let db =ops;// Object.assign(new defaultVaule('db'), ops);
        this.openRequest = !!db.version ? window.indexedDB.open(db.dataBaseName, db.version) : window.indexedDB.open(db.dataBaseName);
    }
    
    onupgradeneeded() {
        const upgradeneed = new Promise((resolve, reject) => {
            this.openRequest.onupgradeneeded = (event) => {
                this.db = event.target.result;
                console.log("db1 =",this.db);
                resolve(this);
            }
        })
        return upgradeneed;
    }
    
    onsuccess() {
        const success = new Promise((resolve, reject) => {
            this.openRequest.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this);
            }
        })
        return success;
    }
    
    //初始化写表 
    initTable(parma){
        for (var i in parma){
            var tableName=parma[i].tableName;
            var keyPath=parma[i].keyPath;
            var fileds=parma[i].fileds;
            this.createObjectStore({name:tableName,keyPath:keyPath.name,auto:true});
            this.createIndex(fileds);
        }
    }
    
    createObjectStore(ops) {
        let list =ops;
        const store = new Promise((resolve, reject) => {
            this.objectStore = this.db.createObjectStore(list.name, {
                keyPath: list.keyPath,
                autoIncrement: list.auto
            });
            resolve(this);
        })
        return store;
    }
    
    createIndex(ops, save) {
        const store = new Promise((resolve, reject) => {
        ops.map(data => {
            let o =data;
            this.objectStore.createIndex(o.name, o.name, {
                unique: false
            })
            // unique: false 在这里封装代代值可以相同
        })    
            resolve(this);
        })
        return store;
    }
    
    //保存多行数据
    saveData(type = {}, savedata) {
        let save =type;
        const transAction = new Promise((resolve, reject) => {
            let preStore = this.objectStore = this.getObjectStore(save);
            preStore.transaction.oncomplete = (event) => {
                let f = 0;
                let store = this.objectStore = this.getObjectStore(save);
                savedata.map(data => {
                    let request = store.add(data);
                    request.onsuccess = (event) => {
                        // t odo 这里相当于每个存储完成后的回调，可以做点其他事，也可以啥都不干，反正留出来吧 :)
                    }
                    request.onerror=(res)=>{
                        console.log("saveData err");
                    }
                    f++;
                })
                if (f == savedata.length) {
                    resolve(this);
                }
            }
        })
        return transAction;
    }
    
    getData(ops, name, value) {
        let store = this.getObjectStore(ops);
        let data = new Promise((resolve, reject) => {
            store.index(name).get(value).onsuccess = (event) => {
                event.target.result ? resolve(event.target.result) : resolve('None Data')
            }
        })
        return data;
    }
    
    //根据游标获取指定数据
    getCursorData(ops){

        var store = this.getObjectStore(ops);
        let data = new Promise((resolve, reject) => {
            var result=[];
            var cursor = store.openCursor();
            cursor.onsuccess = function (event) {
              var res = event.target.result;
              if (res) {
                  //resolve(res.value);
                  result.push(res.value);
                  res.continue();
              }
              resolve(result);
            }
            
        })
        return data;
    }
    
    //根据key查表并通过index取值
    getKeyData(ops,key,val,index,callback=null){
        var arr=[];
        var i=0;
        var store = this.getObjectStore(ops);
        var storeIndex = store.index(key);
        //打开游标，通过IDBKeyRange设置游标范围，这里设置为只获取key等于val的数据
        var c = storeIndex.openCursor(IDBKeyRange.only(val));
        c.onsuccess = function(e) {//成功执行回调
            var cursor = e.target.result;
            if (cursor){
                //key是表的主键
                var stu = cursor.value;
                // console.log(stu.UUID);
                if (i==index){
                    arr.push(stu);
                }
                i++;
                //继续下一个
                cursor.continue();
            }else{
                callback(arr,i-1);
            }
        }
        
    }     
     
    //根据key查表并通过index更新指定行 
    updateRowData(ops,key,index,val,data,callback=null){
        //根据表主键索引
        var i=0;
        var store = this.getObjectStore(ops);
        var storeIndex = store.index(key);
        var c = storeIndex.openCursor();
        c.onsuccess = function(e) {//成功执行回调
            var cursor = e.target.result;
            if (cursor){
            //如果存在
                if (i==index){
                    //console.log(cursor);
                    for (key in data[0]){
                        cursor.value[key]=data[0][key];
                    }
                    cursor.update(cursor.value); 
                }
                i++;
                cursor.continue();
            }else{
                return false
            }
        }
    }  
    
    //删除行数据 根据key查表并通过index删除指定行 
    deleteRowData(ops,key,index,val,callback=null){
        //根据表主键索引
        var i=0;
        var store = this.getObjectStore(ops);
        var storeIndex = store.index(key);
        var c = storeIndex.openCursor();
        c.onsuccess = function(e) {//成功执行回调
            var cursor = e.target.result;
            if (cursor){//如果存在
                if (i==index){
                    cursor.delete(); 
                }
                i++;
                cursor.continue();
            }else{
                return false
            }
        }
    }  
    
    //删除指定行后面数据 根据key查表并通过index删除指定行之后的数据 
    deleteAfterData(ops,key,index,val,callback=null){
        //根据表主键索引
        var i=0;
        var store = this.getObjectStore(ops);
        var storeIndex = store.index(key);
        var c = storeIndex.openCursor(IDBKeyRange.only(val));
        c.onsuccess = function(e) {
            //成功执行回调
            var cursor = e.target.result;
            if (cursor){//如果存在
                if (i>index){
                    cursor.delete(); 
                }
                i++;
                cursor.continue();
            }else{
                return false
            }
        }
        
    } 
    
    getAllData(ops) {
        let store = this.getObjectStore(ops);
        let data = new Promise((resolve, reject) => {
            store.getAll().onsuccess = (event) => {
                event.target.result ? resolve(event.target.result) : resolve('暂无相关数据')
            };
        })
        return data;
    }
    
    deleteData(ops,name) { // 主键名
        let store = this.getObjectStore(ops);
        store.delete(name).onsuccess = (event) => {
            console.log(event);
            console.log(this);
        }
    }

    getObjectStore(ops) {
        return this.db.transaction(ops.name, ops.type).objectStore(ops.name);
    }
    clear(ops) {
        let clear = new Promise((resolve, reject) => {
            this.getObjectStore(ops).clear();
            resolve(this);
        })
        return clear
    }
    deleteStore(name) {
        let store = new Promise((resolve, reject) => {
            this.db.deleteObjectStore(name);
            resolve(this);
        })
        return store;
    }
    updateDB() {
        let version = this.db.version;
        let name = this.db.name;
        let update = new Promise((resolve, reject) => {
            this.closeDB();
            this.openDB({
                name: name
            }, ++version);
            resolve(this);
        })
        return update;
    }
    closeDB() {
        this.db.close();
        this.objectStore = this.db = this.request = {};
    }
}

class defaultVaule {
    constructor(fn) {
        if (typeof this.__proto__[fn] === 'function') {
            return this.__proto__[fn]();
        }
    }
    db() {
        return {
            name: 'myDB',
        }
    }
    list() {
        return {
            name: 'myList',
            keyPath: 'id',
            auto: false,
        }
    }
    idx() {
        return {
            name: 'myIndex',
            unique: false,
        }
    }
    save() {
        return {
            name: 'myList',
            type: 'readwrite'
        }
    }
}

console.log("load db ok");