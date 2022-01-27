
export type Struct = {
    _id:string|number,
    structType:string,
    timestamp?:string|number,
    ownerId?:string|number,
    parent?:{structType:string,_id:string|number}
}

export type Data = {
    type: string, //helps the frontend identify this object
    data: any, //arrays, objects, links, API refrences, pdfs, csvs, xls, etc.
    timestamp?:string|number
}

export type DataStruct = {
    title:      string|undefined,
    author:     string|undefined,
    expires:    boolean|number|string, //date of expiration, or never. Data that never expires should generally only be patient controlled stuff so its transparent
    type:       string, //graph, file, table, fitbit_hr, fitbit_diet, etc.
    data:       Data[] //arrays, objects, links, API refrences, pdfs, csvs, xls, etc.
} & Struct

export type EventStruct = {
    event:string, //event type e.g. relapse, hospitalization
    author:string,
    startTime:string,  //event began
    endTime:string,    //event ended
    grade:string,  //severity
    notes:string, //additional details
    attachments:Data|string|number[], //can be data or struct Ids
    users:string[], //users to be informed (i.e. peers)
} & Struct

export type ChatroomStruct = {
    message:string,
    topic:string,
    author:string,
    attachments: Data|string|number[],
    comments: string[], //all comment struct Ids
    replies: string[], //first level reply comment struct Ids
    users: string[], //user Ids
    audioChatActive: boolean,
    videoChatActive: boolean
} & Struct

export type CommentStruct = {
    author:string,
    replyTo:string,
    attachments: Data|string|number[],
    replies: string[], //struct Ids
    users: string[], //user Ids
} & Struct

export type NotificationStruct = {
    note:string,
    parentUserId:string
} & Struct

export type ScheduleStruct = {
    title:string,
    author:string,
    attachments: Data|string|number[],
    dates: string[]
} & Struct

export type DateStruct = {
    timeSet:string|number,
    notes:string,
    recurs:number|string|boolean,
    attachments: Data|string|number[],
} & Struct

export type ProfileStruct = {
    username:  string,
    name?:      string, 
    firstName?: string, 
    lastName?:  string, 
    email?:     string, 
    sex?:       string,
    birthday?:  string,
    userRoles?: string[],
    type?:      string,
    id?:        string|number 
} & Struct

export type AuthorizationStruct = {
    authorizedId:     string,
    authorizedName:   string,
    authorizerId:     string,
    authorizerName:   string,
    authorizations:   string[], //authorization types e.g. what types of data the person has access to
    structs:          string|number[], //specific structs, contains structrefs
    excluded:         string|number[], 
    groups:           string[],
    status:           "PENDING"|"OKAY",
    expires:          string|boolean, 
    associatedAuthId: string|number //other authorization id belonging to other user
} & Struct


export type GroupStruct = {
    name:string,
    details:string,
    admins:string|number[], //user ids
    peers:string|number[],  //user ids
    clients:string|number[], 
    users:string|number[] //all users (for notifying)   
} & Struct;


type FreqBand = [number[],number[]]

export type FrequencyBandsStruct = {
    scp: FreqBand|[], 
    delta: FreqBand|[], 
    theta: FreqBand|[], 
    alpha1: FreqBand|[], 
    alpha2: FreqBand|[], 
    beta: FreqBand|[], 
    lowgamma: FreqBand|[], 
    highgamma: FreqBand|[]
}

export type EEGStruct = {
    tag:string|number, 
    position:{x:number,y:number,z:number},
    count:number,
    times:number[], 
    raw:number[], 
    filtered:number[], 
    fftCount:number,
    fftTimes:number[], //Separate timing for ffts on workers
    ffts:[][], 
    slices:FrequencyBandsStruct, 
    means:FrequencyBandsStruct,
    startTime:number|string
} & Struct

export type CoherenceStruct = {
    tag: string,
    x0: number,
    y0: number,
    z0: number,
    x1: number,
    y1: number,
    z1: number,
    fftCount: number,
    fftTimes:number[],
    ffts:[][],
    slices:FrequencyBandsStruct,
    means: FrequencyBandsStruct,  // counter value when this struct was last read from (for using get functions)
    startTime:number|string
} & Struct

export type FNIRSStruct = {
    tag:string|number,
    position:{x:number,y:number,z:number},
    count:number,
    times:number[],
    red:number[],
    ir:number[],
    ir2:number[], //if there is a second IR led for the site
    ambient:number[],
    ratio:number[],
    temp:number[],
    beat_detect: {
        beats:any[],
        breaths:any[],
        rir:any[],
        rir2:any[],
        drir_dt:any[],
        localmins:any[],
        localmaxs:any[],
        val_dists:any[],
        peak_dists:any[],
        localmins2:any[],
        localmaxs2:any[],
        val_dists2:any[],
        peak_dists2:any[]
    },
    startTime:number|string
} & Struct

export type IMUStruct = {
    tag:string,
    Ax:number[],
    Ay:number[],
    Az:number[],
    Gx:number[],
    Gy:number[],
    Gz:number[],
    startTime:number|string
} & Struct

export type ECGStruct = {
    tag:string|number,
    count:number,
    times:number[],
    raw:number[],
    filtered:number[],
    bpm:number[],
    hrv:number[],
    startTime:number|string
} & Struct

export type SPO2Struct = FNIRSStruct;
export type HRVStruct = ECGStruct;
export type EMGStruct = EEGStruct;
