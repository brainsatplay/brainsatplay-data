import {structRegistry} from './DataStructures'

//we need to make a list of input -> output mappings for all desired data to get 
// any data we want into a unified, json-friendly data schema so 
//   different sources can be cross-referenced uniformly in our system
export const structInterpreters = {
    'any': (inp, outp=structRegistry.Struct()) => { //generic
        if(Array.isArray(inp)) {
            Object.assign(outp,{data:inp});
        }
        else if(typeof inp === 'object') {
            Object.assign(outp, inp);
        }
        else Object.assign(outp,{data:inp});
    },
    // 'fitbitsleep': (inp, outp) => { //e.g.

    // },
    // 'fitbithr': (inp, outp) => {

    // }
}
//if you are streaming data in rapidly, you should fill up a 
//  single object by pushing arrays etc. rather than creating a new struct each time, but it's all relative

//Data in struct out
export function convertToStruct(
    input,      //input data
    structType, //struct function (or string) to use as output template
    arg0=undefined, //usually just a tag, special cases are structs like CoherenceStruct
    assignProps={}, //additional props you may want to assign (e.g. just use DS.Struct to assign these yourself)
    parentUser,    //parent user e.g. a profile struct
    parentStruct,  //parent struct e.g. chatroom > comment
    converter='any' // (input={},output={})=>{} //mutate the output (e.g. a bare struct) with the input e.g. an object with mismatching keys for our desired data type
) {
    let regs = Object.keys(structRegistry);
    let structFunc;
    if(typeof structType === 'string') {
        structFunc = regs.find((o) => {
            if(o.name.toLowerCase().includes(structType)) { //e.g. get EEGStruct with 'eeg' or 'EEGStruct' etc 
                return true;
            }
        });
    } else { 
        structFunc = structType; 
    }

    if(typeof structFunc === 'function' && structType.toLowerCase() !== 'struct') {
        if(typeof converter === 'string') converter = structInterpreters[converter];
        else converter = structInterpreters[structType]; //try grabbing a converter by struct type (e.g. you can add your generic 'eeg' or, say, 'muse_eeg' interpreters) 
        
        if(!converter) converter = structInterpreters['any'];

        let output = structFunc(
            arg0,       //first property depends on struct type, set it in converter
            assignProps,
            parentUser,
            parentStruct
        )

        if(converter) {
            converter( //function to assign input properties to output properties
                input, 
                output
            );
        }
        
            return output;
    } else {
        return structRegistry.Struct( //should just use DS.Struct(...) for this
            structType,
            assignProps,
            parentUser,
            parentStruct
        );
    }

}