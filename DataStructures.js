
//The data atlas is specifically for creating structs for location-based data.
// Uses MNI acoordinates for head placement.


/* Barebones struct format with basic metadata, append any additional props */
export function Struct(
    structType='struct', 
    additionalProps={},
    parentUser={_id:undefined}, 
    parentStruct={_id:undefined, structType:undefined}
) {
    
    function randomId(tag = '') {
        return `${tag+Math.floor(Math.random()+Math.random()*Math.random()*10000000000000000)}`;
    }
    
    let struct = {
        _id: randomId(structType+'defaultId'),   //random id associated for unique identification, used for lookup and indexing
        structType: structType,     //this is how you will look it up by type in the server
        ownerId: parentUser?._id,     //owner user
        timestamp: Date.now(),      //date of creation
        parent: {structType:parentStruct?.structType,_id:parentStruct?._id}, //parent struct it's associated with (e.g. if it needs to spawn with it)
    }

    if(!struct.ownerId) delete struct.ownerId;
    if(!struct.parent._id) delete struct.parent;
    if(Object.keys(additionalProps).length > 0) Object.assign(struct,additionalProps); //can overwrite any default props as well
    return struct;
}

export const eegCoordinates = {
    FP1: [-21.2, 66.9, 12.1],
    FPZ: [1.4, 65.1, 11.3],
    FP2: [24.3, 66.3, 12.5],
    AF7: [-41.7, 52.8, 11.3],
    AF3: [-32.7, 48.4, 32.8],
    AFZ: [1.8, 54.8, 37.9],
    AF4: [35.1, 50.1, 31.1],
    AF8: [43.9, 52.7, 9.3],
    F5:  [-51.4, 26.7, 24.7],
    F3:  [-39.7, 25.3, 44.7],
    F1:  [-22.1, 26.8, 54.9],
    FZ:  [0.0, 26.8, 60.6],
    F2:  [23.6, 28.2, 55.6],
    F4:  [41.9, 27.5, 43.9],
    F6:  [52.9, 28.7, 25.2],
    F7:  [-52.1, 28.6, 3.8],
    F8:  [53.2, 28.4, 3.1],
    FC5: [-59.1, 3.0, 26.1],
    FC3: [-45.5, 2.4, 51.3],
    FC1: [-24.7, 0.3, 66.4],
    FCZ: [1.0, 1.0, 72.8],
    FC2: [26.1, 3.2, 66.0],
    FC4: [47.5, 4.6, 49.7,],
    FC6: [60.5, 4.9, 25.5],
    FT9: [-53.8, -2.1, -29.1],
    FT7: [-59.2, 3.4, -2.1],
    FT8: [60.2, 4.7, -2.8],
    FT10: [55.0, -3.6, -31.0],
    T7: [-65.8, -17.8, -2.9],
    T5: [-61.5, -65.3, 1.1],
    T3: [-70.2, -21.3, -10.7],
    T4: [71.9,-25.2,-8.2],
    T6: [59.3, -67.6,  3.8],
    T8: [67.4, -18.5, -3.4],
    C5: [-63.6, -18.9, 25.8],
    C3: [-49.1, -20.7, 53.2],
    C1: [-25.1, -22.5, 70.1],
    CZ: [0.8, -21.9, 77.4],
    C2: [26.7, -20.9, 69.5],
    C4: [50.3, -18.8, 53.0],
    C6: [65.2, -18.0, 26.4],
    CP5: [-61.8, -46.2, 22.5],
    CP3: [-46.9, -47.7, 49.7],
    CP1: [-24.0, -49.1, 66.1],
    CPZ: [0.7, -47.9, 72.6],
    CP2: [25.8, -47.1, 66.0],
    CP4: [49.5, -45.5, 50.7],
    CP6: [62.9, -44.6, 24.4],
    TP9: [-73.6, -46.7, -4.0], // estimated
    TP7: [-63.6, -44.7, -4.0],
    TP8: [64.6, -45.4, -3.7],		
    TP10: [74.6, -47.4, -3.7], // estimated
    P9: [-50.8, -51.3, -37.7],
    P7: [-55.9, -64.8, 0.0],
    P5: [-52.7, -67.1, 19.9],
    P3: [-41.4, -67.8, 42.4],
    P1: [-21.6, -71.3, 52.6],
    PZ: [0.7, -69.3, 56.9],
    P2: [24.4, -69.9, 53.5],
    P4: [44.2, -65.8, 42.7],
    P6: [54.4, -65.3, 20.2],
    P8: [56.4, -64.4, 0.1],
    P10: [51.0, -53.9, -36.5],
    PO7: [-44.0, -81.7, 1.6],
    PO3: [-33.3, -84.3, 26.5],
    POZ: [0.0, -87.9, 33.5],
    PO4: [35.2, -82.6, 26.1],
    PO8: [43.3, -82.0, 0.7],
    O1: [-25.8, -93.3, 7.7],
    OZ: [0.3, -97.1, 8.7],
    O2: [25.0, -95.2, 6.2]
}

export function setCoordinate(channelDict={}, assignTo={}) {
    
    if(!eegCoordinates[channelDict.tag] && channelDict.position) {
        eegCoordinates[channelDict.tag] = channelDict.position;
    }

    let props = {
        channel:channelDict.ch,
        position:{
            x:eegCoordinates[channelDict.tag][0],
            y:eegCoordinates[channelDict.tag][1],
            z:eegCoordinates[channelDict.tag][2]
        }
    };

    return Object.assign(assignTo,props);

}

export function EEGCoordinates(channelDicts=[], genCoherenceMap=true) {
    let structs = [];
    for(let channelDict of channelDicts) {
        let struct = setCoordinate(channelDict);
        structs.push(struct);
    }
    if(genCoherenceMap) {
        structs.push(...CoherenceMap(channelDicts));
    }

    return structs;
}

//Returns an object with arrays for each key. These will denote the frequencies represented in the FFT, split for quick reference in each band.
export function FrequencyBandsStruct(additionalBands=[],assignTo={}) {
    let bands = {
        scp: [], 
        delta: [], 
        theta: [], 
        alpha1: [], 
        alpha2: [], 
        beta: [], 
        lowgamma: [], 
        highgamma: []
    };

    additionalBands.forEach(band => bands[band] = []); 

    return Object.assign(assignTo,bands);
}

export function EEGStruct(
    tag='',
    parentUser={_id:undefined},
    parentStruct={structType:undefined,_id:undefined},
    additionalProps={}
) {
    let bands = FrequencyBandsStruct();
    let props = {
        tag:tag, 
        position:{x:0,y:0,z:0},
        count:0,
        times:[], 
        raw:[], 
        filtered:[], 
        fftCount:0,
        fftTimes:[], //Separate timing for ffts on workers
        ffts:[], 
        slices:JSON.parse(JSON.stringify(bands)), 
        means:JSON.parse(JSON.stringify(bands)),
        lastReadFFT:0, // counter value when this struct was last read from (using get functions)
        lastRead:0,
        startTime:Date.now()
    };

    let struct = Struct('eeg',props,parentUser,parentStruct);
    
    return Object.assign(struct,additionalProps);
}

export function CoherenceStruct(
    coord0={},
    coord1={},
    parentUser={_id:undefined},
    parentStruct={structType:undefined,_id:undefined},
    additionalProps={}
) {
    let bands = FrequencyBandsStruct();
	let props =	{
        tag: coord0.tag+"::"+coord1.tag,
        x0: coord0?.x,
        y0: coord0?.y,
        z0: coord0?.z,
        x1: coord1?.x,
        y1: coord1?.y,
        z1: coord1?.z,
        fftCount: 0,
        fftTimes:[],
        ffts:[],
        slices: JSON.parse(JSON.stringify(bands)),
        means: JSON.parse(JSON.stringify(bands)),  // counter value when this struct was last read from (for using get functions)
        lastRead:0,
        startTime:Date.now()
    };

    let struct = Struct('coherence',props,parentUser,parentStruct);
    
    return Object.assign(struct,additionalProps);
    
}

export function CoherenceMap(
    channelDicts = [{ch:0,tag:'FP1'}], 
    taggedOnly = true,
    parentUser={_id:undefined},
    parentStruct={structType:undefined,_id:undefined},
    additionalProps={}
) {
    var cmap = [];
    var l = 1, k = 0;

    for( var i = 0; i < (channelDicts.length*(channelDicts.length + 1)/2)-channelDicts.length; i++){
        if(taggedOnly === false || (taggedOnly === true && ((channelDicts[k].tag !== null && channelDicts[k+l].tag !== null)&&(channelDicts[k].tag !== 'other' && channelDicts[k+l].tag !== 'other')&&(channelDicts[k].analyze === true && channelDicts[k+l].analyze === true)))) {
            var coord0 = EEGStruct(channelDicts[k].tag);
            var coord1 = EEGStruct(channelDicts[k+l].tag);

            cmap.push(CoherenceStruct(coord0,coord1,parentUser,parentStruct,additionalProps));
        }
        l++;
        if (l + k === channelDicts.length) {
            k++;
            l = 1;
        }
    }
    //console.log(cmap,channelTags);
    return cmap;
}

export function FNIRSStruct(
    tag='',
    parentUser={_id:undefined},
    parentStruct={structType:undefined,_id:undefined},
    additionalProps={}
) {
    let props = {
        tag:tag,
        position:{x:0,y:0,z:0},
        count:0,
        times:[],
        red:[],
        ir:[],
        ir2:[], //if there is a second IR led for the site
        ambient:[],
        ratio:[],
        temp:[],
        beat_detect: {
            beats:[],
            breaths:[],
            rir:[],
            rir2:[],
            drir_dt:[],
            localmins:[],
            localmaxs:[],
            val_dists:[],
            peak_dists:[],
            localmins2:[],
            localmaxs2:[],
            val_dists2:[],
            peak_dists2:[]
        },
        lastRead:0, 
        startTime:Date.now()
    };

    
    let struct = Struct('fnirs',props,parentUser,parentStruct);
    
    return Object.assign(struct,additionalProps);
	
}


export function IMUStruct(
    tag='',
    parentUser={_id:undefined},
    parentStruct={structType:undefined,_id:undefined},
    additionalProps={}
) {
    let props = {
        tag:tag,
        Ax:[],
        Ay:[],
        Az:[],
        Gx:[],
        Gy:[],
        Gz:[],
        lastRead:0, 
        startTime:Date.now()
    };

    let struct = Struct('imu',props,parentUser,parentStruct);
    
    return Object.assign(struct,additionalProps);

}

export function EyeTrackerStruct(
    tag='',
    parentUser={_id:undefined},
    parentStruct={structType:undefined,_id:undefined},
    additionalProps={}
) {

    let props = {
        tag:tag,
        count:0, 
        times:[], 
        x:[], 
        y:[], 
        smax:[],  //simple moving averages
        smay:[], 
        lastRead:0, 
        startTime:Date.now()
    };
    
    let struct = Struct('eyetracker',props,parentUser,parentStruct);
    
    return Object.assign(struct,additionalProps);

}


export function ECGStruct(
    tag='',
    parentUser={_id:undefined},
    parentStruct={structType:undefined,_id:undefined},
    additionalProps={}
) {

    let props = {
        tag:tag,
        count:0,
        times:[],
        raw:[],
        filtered:[],
        bpm:[],
        hrv:[],
        lastRead:0,
        startTime:Date.now()
    };
    
    let struct = Struct('ecg',props,parentUser,parentStruct);
    
    return Object.assign(struct,additionalProps);
    
}

export function EDAStruct(
    tag='',
    parentUser={_id:undefined},
    parentStruct={structType:undefined,_id:undefined},
    additionalProps={}
) {

}

export function NeosensoryStruct(
    tag='',
    parentUser={_id:undefined},
    parentStruct={structType:undefined,_id:undefined},
    additionalProps={}
) {

}

export function SPO2Struct(
    tag='',
    parentUser={_id:undefined},
    parentStruct={structType:undefined,_id:undefined},
    additionalProps={}
) { 
    let struct = FNIRSStruct(tag,parentUser,parentStruct,additionalProps);
    struct.structType = 'spo2';
    return struct;
}

export function HRVStruct(
    tag='',
    parentUser={_id:undefined},
    parentStruct={structType:undefined,_id:undefined},
    additionalProps={}
) { 
    let struct = ECGStruct(tag,parentUser,parentStruct,additionalProps);
    struct.structType = 'hrv';
    return struct;
}

export function EMGStruct(
    tag='',
    parentUser={_id:undefined},
    parentStruct={structType:undefined,_id:undefined},
    additionalProps={}
) { 
    let struct = EEGStruct(tag,parentUser,parentStruct,additionalProps);
    struct.structType = 'emg';
    return struct;
}


//User defined structs e.g. for building a communication database

export function ProfileStruct(
    parentUser={_id:undefined},
    parentStruct={structType:undefined,_id:undefined},
    additionalProps={}
) {

    let props = {
        name:      '', 
        username:  '',
        firstName: '', 
        lastName:  '', 
        email:     '', 
        sex:       '',
        birthday:  '',
        type:      '',
        userRoles: [],
        id:        '' //references the token id which is behind a collection permission
    };

    let struct = Struct('profile',props,parentUser,parentStruct);
    
    return Object.assign(struct,additionalProps);

}

export function AuthorizationStruct(
    parentUser={_id:undefined},
    parentStruct={structType:undefined,_id:undefined},
    additionalProps={}
) {
    let props = {
        authorizedId:     '',
        authorizedName:   '',
        authorizerId:     '',
        authorizerName:   '',
        authorizations:   new Array(), //authorization types e.g. what types of data the person has access to
        structs:          new Array(), //specific structs, contains structrefs
        excluded:         new Array(), 
        groups:           new Array(),
        status:           'PENDING',
        expires:          '', //PENDING for non-approved auths
        associatedAuthId: '' //other authorization id belonging to other user
    };

    let struct = Struct('authorization',props,parentUser,parentStruct);

    return Object.assign(struct,additionalProps);

}

export function GroupStruct(
    parentUser={_id:undefined},
    parentStruct={structType:undefined,_id:undefined},
    additionalProps={}
) {
    let props = {
        name:"",
        details:"",
        admins:new Array(),
        peers:new Array(),
        clients:new Array(), //date of expiration, or never. Data that never expires should generally only be patient controlled stuff so its transparent
        users:new Array() //all users (for notifying)   
    };

    let struct = Struct('group',props,parentUser,parentStruct);

    return Object.assign(struct,additionalProps);
}

export function DataStruct(
    parentUser={_id:undefined},
    parentStruct={structType:undefined,_id:undefined},
    additionalProps={}
) {
    let props = {
        title:      "",
        author:     "",
        expires:    "NEVER", //date of expiration, or never. Data that never expires should generally only be patient controlled stuff so its transparent
        type:       "", //graph, file, table, fitbit_hr, fitbit_diet, etc.
        data:       new Array() //arrays, objects, links, API refrences, pdfs, csvs, xls, etc.
    };

    let struct = Struct('dataInstance',props,parentUser,parentStruct);

    return Object.assign(struct,additionalProps);
}

export function EventStruct(
    parentUser={_id:undefined},
    parentStruct={structType:undefined,_id:undefined},
    additionalProps={}
) {
    let props = {
        event:"",  //event type e.g. relapse, hospitalization
        authorId:"", //
        startTime:"",  //event began
        endTime:"",    //event ended
        grade:"",  //severity
        notes:"", //additional details
        attachments:new Array(),
        users:new Array(), //users to be informed (i.e. peers)
        data:new Array() //arrays of linked data
    };

    let struct = Struct('event',props,parentUser,parentStruct);

    return Object.assign(struct,additionalProps);

}

export function ChatroomStruct(
    parentUser={_id:undefined},
    parentStruct={structType:undefined,_id:undefined},
    additionalProps={}
) {
    let props = {
        message:'',
        topic:'',
        authorId:'',
        attachments: new Array(),
        comments: new Array(),
        replies: new Array(),
        users: new Array(),
        audioChatActive: false,
        videoChatActive: false
    };

    let struct = Struct('chatroom',props,parentUser,parentStruct);

    return Object.assign(struct,additionalProps);

}

export function CommentStruct(
    parentUser={_id:undefined},
    parentStruct={structType:undefined,_id:undefined},
    additionalProps={}
) {
    let props = {
        authorId:'',
        replyTo:'',
        message:'',
        rating:0,
        replies: new Array(),
        users: new Array(),
        attachments: new Array()
    };

    let struct = Struct('comment',props,parentUser,parentStruct);

    return Object.assign(struct,additionalProps);

}

export function NotificationStruct(
    parentUser={_id:undefined},
    parentStruct={structType:undefined,_id:undefined},
    additionalProps={}
) {
    let props = {
        note:'',
        parentUserId:''
    };

    let struct = Struct('notification',props,parentUser,parentStruct);

    return Object.assign(struct,additionalProps);

}


export function ScheduleStruct(
    parentUser={_id:undefined},
    parentStruct={structType:undefined,_id:undefined},
    additionalProps={}
) {
    let props = {
        title:'',
        author:'',
        attachments: new Array(),
        dates: new Array()
    };

    let struct = Struct('schedule',props,parentUser,parentStruct);

    return Object.assign(struct,additionalProps);

}

export function DateStruct(
    parentUser={_id:undefined},
    parentStruct={structType:undefined,_id:undefined},
    additionalProps={}
) {
    let props = {
        timeSet:'',
        notes:'',
        recurs:'NEVER',
        attachments: new Array(),
    };

    let struct = Struct('date',props,parentUser,parentStruct);

    return Object.assign(struct,additionalProps);

}