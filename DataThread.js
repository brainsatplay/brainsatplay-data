import {WorkerManager} from 'magicworker'
import {DataTablet} from './DataTablet.js'

//Creates a thread that can be used for caching data and performing operations on it without issues on the main thread.
//This will need extensive testing
export class DataThread {
    constructor(workermanager, workerId) {
        if(!workermanager) {
            this.workers = new WorkerManager();

            this.workers = window.workers;
        } else this.workers = workermanager;
        this.workerId = workerId;
        if(!workerId) this.workerId = this.workers.addWorker();

        this.origin = Math.floor(Math.random()*10000);

        this.setupDataThread();

        this.tablet = new DataTablet(undefined,true,this.workers,this.workerId);

    }


    setupDataThread() {

        this.workers.addWorkerFunction(
            'rolloverBuffers',
            function rollover(self,args,origin) {
                if(typeof args === 'object' && args.limit) {
                    args.props.forEach((prop) => {
                        if(Array.isArray(self[prop])) {
                            if(self[prop].length > args.limit) {
                                self[prop] = self[prop].slice(self[prop].length-args.limit);
                            }
                        }
                    });
                }    
            },
            this.workerId,
            this.origin
        );


        this.workers.runWorkerFunction(
            'transferClassObject',
            {tabletClass:DataTablet.toString()},
            this.workerId,
            this.origin
        );

        this.workers.addWorkerFunction(
            'makeTablet',
            (self,args,origin) => {
                self.tablet = new self.tabletClass(args[0]);

                self.tablet.onSorted = (newdata) => {
                    postMessage({foo:'onSorted',output:newdata});
                }
                return true;
            },
            this.workerId,
            this.origin
        );

        this.workers.addWorkerFunction(
            'runSort',
            (self,args,origin) => {
                if(Array.isArray(args[0])) {
                    args.forEach((arg) => {
                        self.tablet.runSort(...arg);
                    });
                } else {
                    self.tablet.runSort(...args);
                }
                return true;
            },
            this.workerId,
            this.origin
        );

        this.workers.addWorkerFunction(
            'setSort',
            (self,args,origin) => {
                self.tablet.setSort(...args);
                return true;
            },
            this.workerId,
            this.origin
        );

        this.workers.addWorkerFunction(
            'getSort',
            (self,args,origin) => {
                if(Array.isArray(args)) {
                    let results = [];
                    args.forEach((arg) => {
                        let sort = self.tablet.getSort(arg);
                        if(typeof sort === 'function') sort = sort.toString();
                        results.push(sort);
                    });
                    return results;
                } 
            },
            this.workerId,
            this.origin
        );

        this.workers.addWorkerFunction(
            'getDataByTimeRange',
            (self,args,origin) => {
                return self.tablet.getDataByTimeRange(...args);
            },
            this.workerId,
            this.origin
        );

        this.workers.addWorkerFunction(
            'getDataByTimestamp',
            (self,args,origin) => {
                return self.tablet.getDataByTimestamp(...args);
            },
            this.workerId,
            this.origin
        );

        this.workers.runWorkerFunction(
            'makeTablet', 
            props, 
            this.workerId,
            this.origin
        );
    }

    transferData(data={}) {
        for(let prop in data) {
            if(Array.isArray(data[prop])) {
                data[prop] = Float32Array.from(data[prop]);
            }
        }
        this.workers.runWorkerFunction('setValuesFromArrayBuffers',data,this.workerId,this.id);
    }

    transferAndAppendArrays(data={}) {
        for(let prop in data) {
            if(Array.isArray(data[prop])) {
                data[prop] = Float32Array.from(data[prop]); //converts any arrays to arraybuffers for transfer, they are then deconverted
            }
        }
        this.workers.runWorkerFunction('appendValuesFromArrayBuffers',data,this.workerId,this.id);
    }


}