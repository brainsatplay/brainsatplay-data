import * as DS from './DataStructures'

export class DataTablet {

    constructor(
        props={},
        threaded=false, // Use this with the DataThread class
        magicworker=undefined
    ) {

        this.threaded = threaded;
        if(magicworker) this.workers=magicworker;
        else if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
            this.threaded = 2;
        }

        this.DS = DS;

        this.collections = new Map();

        this.data = {
            byTime:{}, //everything is arranged by time
            notes:{},
            events:{},
            sleep:{}, //or everything is arranged by type (then by time)
            food:{},
            hr:{},
            ppg:{},
            ecg:{},
            emg:{},
            eeg:{},
            fnirs:{}
        }

        this.rolloverLimit = 50000;

        Object.assign(this.data,props);

        this.dataSorts = new Map(); //what to do with data based on struct or data type
        this.watches = {};

        this.setSort(
            'event',
            (dataObj,newdata,tablet=this)=>{
                if(!this.data.events[dataObj.timestamp])
                    this.data.events[dataObj.timestamp] = [dataObj];
                else this.data.events[dataObj.timestamp].push(dataObj);

                if(dataObj.event === 'sleep') {
                    if(!this.data.sleep[dataObj.timestamp])
                        this.data.sleep[dataObj.timestamp] = [dataObj];
                    else this.data.sleep[dataObj.timestamp].push(dataObj);
                }

                return dataObj;
            }
        );

        this.setSort(
            ['notes','note','link'],
            (dataObj,newdata,tablet=this) => {
                if(!this.data.notes[dataObj.timestamp])
                    this.data.notes[dataObj.timestamp] = [dataObj];
                else this.data.notes[dataObj.timestamp].push(dataObj);
                                    
                if(!this.data.byTime[dataObj.timestamp])
                    this.data.byTime[dataObj.timestamp] = [dataObj];
                else this.data.byTime[dataObj.timestamp].push(dataObj);

                return dataObj;
            }
        );

        //this.setSort();

        this.id = this.randomId('dataTablet');

    }

    randomId(tag = '') {
        return `${tag+Math.floor(Math.random()+Math.random()*Math.random()*10000000000000000)}`;
    }

    setLocalData (structs) {

        let setInCollection = (s) => {
            let type = s.structType;
        
            let collection = this.collections.get(type);
            if(!collection) {
                collection = new Map();
                this.collections.set(type,collection);
            }
            collection.set(s._id,s);
            this.onCollectionSet(type,collection);
        }

        if(Array.isArray(structs)) {
            structs.forEach((s)=>{
                setInCollection(s)
            });
        }
        else setInCollection(structs)
    }

    //pull a struct by collection, owner, and key/value pair from the local platform, leave collection blank to pull all ownerId associated data
    getLocalData(collection, query) {

        // Split Query
        let ownerId, key, value;
        if (typeof query === 'object'){
            ownerId = query.ownerId
            // TODO: Make more robust. Does not support more than one key (aside from ownerId)
            const keys = Object.keys(query).filter(k => k != 'ownerId')
            key = keys[0]
            value = query[key]
        } else value = query
        
        if (!collection && !ownerId && !key && !value) return [];

        let result = [];
        if(!collection && (ownerId || key)) {
            this.collections.forEach((c) => { //search all collections
                if((key === '_id' || key === 'id') && value) {
                    let found = c.get(value);
                    if(found) result.push(found);
                }
                else {
                    c.forEach((struct) => {
                        if(key && value) {
                            if(struct[key] === value && struct.ownerId === ownerId) {
                                result.push(struct);
                            }
                        }
                        else if(struct.ownerId === ownerId) {
                            result.push(struct);
                        }
                    });
                }
            });
            return result;
        }
        else {
            let c = this.collections.get(collection);
            if(!c) return result; 

            if(!key && !ownerId) {
                c.forEach((struct) => {result.push(struct);})
                return result; //return the whole collection
            }
            
            if((key === '_id' || key === 'id') && value) return c.get(value); //collections store structs by id so just get the one struct
            else {
                c.forEach((struct,k) => {
                    if(key && value && !ownerId) {
                        if(struct[key] === value) result.push(struct);
                    }   
                    else if(ownerId && !key) {
                        if(struct.ownerId === ownerId) result.push(struct);
                    } 
                    else if (ownerId && key && value) {
                        if(struct.ownerId === ownerId && struct[key]) {
                            if(struct[key] === value) result.push(struct);
                        }
                    }
                });
            }
        }
        return result;                            //return an array of results
    }

    //customize what to do with the updated collection after setting
    onCollectionSet = (typ,collection) => {
    
    }

    runSort(key,dataObj={},newdata=[],tablet=this) {
        if(this.threaded === false) {
            let result;
            let sort = this.getSort(key);
            if(sort) result = sort(dataObj,newdata,tablet);
            else return false;
        } else if (this.threaded === true) {
            return this.workers.runWorkerFunction('runSort',[key,dataObj,newdata],this.workerId,this.id);
        }
    }

    setSort(key,response=(dataObj)=>{return true;}) {
        if(this.threaded === false) {
            if(Array.isArray(key))
                key.forEach((k) => {this.dataSorts.set(k,response);});
            else
                this.dataSorts.set(key,response);
        } else if (this.threaded === true) {
            return this.workers.runWorkerFunction('setSort',[key,response.toString()],this.workerId,this.id);
        }
    }

    getSort(key) {
        if(this.threaded === false) {
            return this.dataSorts.get(key);
        } else if (this.threaded === true) {
            return this.workers.runWorkerFunction('getSort',[key],this.workerId,this.id);
        }
    }

    checkWatches(sorted) {
        for(const prop in this.watches) {
            this.watches[prop].ondata(sorted, this.watches[prop].accum, this.watches[prop]);
            if(this.watches[prop].triggered) { //manual trigger function
                this.ontrigger(this.watches[prop].accum);
                this.watches[prop].triggered = false;
            }
        }
    }

    //after the data is sorted these will trigger
    setWatch(name,ondata=(struct,accum,watch)=>{},ontrigger=(data)=>{}) {
        this.watches[name] = {
            triggered:false, //set the trigger to true in ondata to fire ontrigger and reset the trigger
            accum:this.DS.Struct('alert'), //data accumulated for checking a trigger
            ondata,
            ontrigger
        };
    }

    //after the data is sorted these will trigger
    getWatch(name) {
        return this.watches[name];   
    }

    async sortStructsIntoTable(datastructs=[]) {
        //sort by timestamp 
        let ascending = function(a,b) { return a.timestamp - b.timestamp; }
        /**
         * let descending = function(a,b) { return b.timestamp-a.timestamp };
         */
        datastructs.sort(ascending); //reorder

        let newdata = [];

        //now distribute into data
        for(let i = 0; i < datastructs.length; i++) {
            let struct = datastructs[i];
            if(!struct.timestamp) continue;
            let timestamp = struct.timestamp;

            if(!this.data.byTime[timestamp])
                this.data.byTime[timestamp] = [struct];
            else this.data.byTime[timestamp].push(struct);

            if(struct.structType === 'dataInstance') {
                //we should sort instanced fitbit data into timestamped bins with markers for different resolutions
                //other data in dataInstance.data array will be like {dataType:'notes',data:'abcdefg'} 
                struct.data.forEach(async (dat) => {
                    if(typeof dat === 'object' && !Array.isArray(dat)) {
                        let typ = dat.dataType;
                        dat.ownerId = struct.ownerId;
                        if(!dat.timestamp) dat.timestamp = timestamp;
                        if(typ) {
                            let sorted = this.runSort(typ,dat,newdata,this);
                            if(!sorted) { //generic
                                if(!this.data[typ]) this.data[typ] = {};
    
                                dat.timestamp = timestamp;
                                if(!this.data[typ][timestamp]) 
                                    this.data[typ][timestamp] = [dat];
                                else this.data[typ][timestamp].push(dat);
                                if(!this.data.byTime[timestamp])
                                    this.data.byTime[timestamp] = [dat];
                                else this.data.byTime[timestamp].push(dat); 
                                this.checkWatches(dat);
                                this.onUpdate(timestamp, dat);
                                newdata.push(dat);  
                            }
                            else {
                                if(sorted.constructor?.name !== 'Promise') {
                                    this.checkWatches(sorted);
                                    this.onUpdate(timestamp, sorted);
                                    newdata.push(sorted); 
                                }
                            }
                        }
                    }
                });
            }
            else {
                let sorted = this.runSort(struct.structType,struct,newdata,this);
                if(!sorted) { //generic
                    let typ = struct.structType;
                    if(!this.data[typ]) this.data[typ] = {};
                    if(!this.data[typ][timestamp])
                        this.data[typ][timestamp] = [struct];
                    else this.data[typ][timestamp].push(struct); 
                    this.checkWatches(struct);
                    this.onUpdate(timestamp, struct);
                    newdata.push(struct);
                } else {
                    this.checkWatches(sorted);
                    this.onUpdate(timestamp, sorted);
                    newdata.push(sorted);
                }
                
            }
            
        }

        for(const prop in this.data) {
            this.data[prop] = this.sortObjectByPropName(this.data[prop]); //should arrange the object by timestamp
        }


        this.onSorted(newdata);
    }

    onUpdate(timestamp, struct, data=this.data) {}

    onSorted(newdata=[]) {}

    getDataByTimestamp(timestamp,ownerId) {
        if(this.threaded === true) {
            //if running threads this needs to be awaited or do .then(res)
            return this.workers.runWorkerFunction('getDataByTimestamp',[timestamp,ownerId],this.workerId,this.id);
        }

        let result = this.data.byTime[timestamp];
        if(ownerId && result) result = result.filter((o)=>{if(!ownerId) return true; else if(ownerId === o.ownerId) return true;});
        return result;
    }

    getDataByTimeRange(begin,end,type,ownerId) {
        if(this.threaded === true) {
            //if running threads this needs to be awaited or do .then(res)
            return this.workers.runWorkerFunction('getDataByTimeRange',[begin,end,type,ownerId],this.workerId,this.id);
        }

        let result = {};
        if(type) {
            for(const key in this.data[type]) {
                let t = parseInt(key);
                if(t > begin && t < end){
                    result[key] = [...this.data[type][key]];
                }
            }
            if(type === 'sleep') {
                result = this.filterSleepResults(result);
            }
            
        }
        else {
            for(const key in this.data.byTime) {
                let t = parseInt(key);
                if(t > begin && t < end){
                    result[key] = [...this.data.byTime[key]];
                }
            }
        }
        if(ownerId && result) {
            for(const key in result) {
                let popidx = [];
                result[key] = result[key];
                result[key].forEach((o,i) => {
                    if(o.ownerId !== ownerId) {
                        popidx.push(i);
                    }
                });
                popidx.reverse().forEach((idx) => {
                    result[key].splice(idx,1);
                });
                if(result[key].length === 0) delete result[key];
            }
        }

        return result;
    }

    getDataByType(type,timestamp,ownerId) {
        if(!this.data[type]) return undefined;

        let result = {...this.data[type]};
        if(timestamp) result = [...result[timestamp]];

        if(ownerId && result) {
            for(const key in result) {
                let popidx = [];
                result[key] = [...result[key]];
                result[key].forEach((o,i) => {
                    if(o.ownerId !== ownerId) {
                        popidx.push(i);
                    }
                });
                popidx.reverse().forEach((idx) => {
                    result[key].splice(idx,1);
                });
                if(result[key].length === 0) delete result[key];
            }
        }
        if(type === 'sleep') {
            result = this.filterSleepResults(result);
        }
        return result;
        
    }

    filterSleepResults(unfiltered = {}) {
        //need to check if any events are overlapping with fitbit data then pop any fitbit data, assuming events are more accurate
        let events = [];
        for(const key in unfiltered) {
            unfiltered[key] = [...unfiltered[key]]; //copy result
            events.push(...unfiltered[key].filter((o) => {
                if(o.structType === 'event') return true;
            }));
        }

        events.forEach((ev) => {
            let foundidx = undefined;
            for(const key in unfiltered) {
                unfiltered[key].forEach((o) => {
                    //assume sleep data within 12 hours and longer than 2 hours is to be replaced
                    if(o.structType === 'fitbitsleep' && ev.startTime && ev.endTime) {
                        if(Math.abs(o.startTime - ev.startTime) < 1000*12*3600 && Math.abs(o.endTime - ev.endTime) < 1000*12*3600 && (ev.endTime - ev.startTime) > 1000*2*3600) {
                            foundidx = i;
                            return true;
                        }  
                    }
                }); 
                if(foundidx) unfiltered[key].splice(foundidx,1);
            }   
        });
        
        let result = unfiltered;
        return result;
    } 

    sortObjectByPropName(object) {

        const ordered = Object.keys(object).sort().reduce(
            (obj, key) => { 
              obj[key] = object[key]; 
              return obj;
            }, 
            {}
          );
    
        return ordered;
    }

    //cuts array sizes of object properties in the collection to the set limit (holdover from DataAtlas)
    checkRollover(collection, limit=this.rolloverLimit) { //'eeg','heg', etc
		if(!collection) return false;

        let c = this.collections.get(collection);
        if(!c) return false;

        c.forEach((struct) => {
            for(const prop in struct) {
                if(Array.isArray(struct[prop])) {
                    if(struct[prop].length > limit)  {
                        struct[prop].slice(struct[prop].length-limit);
                        if(prop === 'ffts') { //adjust counters
                            struct.fftCount = struct[prop].length;
                        }
                        else if (prop === 'times') {
                            struct.count = struct[prop].length;
                        }
                    }
                } else if (typeof struct[prop] === 'object') {
                    this.checkRollover(struct[prop]);
                }
            }
        });

	}


}