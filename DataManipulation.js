import { Math2 } from "brainsatplay-math"

//Manipulation of biodata from structs in DataStructures.js

//Report moving average of frontal coherence
export let getCoherenceScore = (coh_data,band='alpha1') => {
    let scores = []
    if (!Array.isArray(coh_data)) coh_data = [coh_data]
    coh_data.forEach(data => {
        if(data.fftCount > 0) {
            let ct = data.fftCount;
            let avg = Math.min(20,ct)
            let slice = data.means[band].slice(ct-avg);
            // let score = coh_data.means.alpha1[ct-1] - Math2.mean(slice);
            scores.push(Math2.mean(slice));
        }
    })
    return Math2.mean(scores)
}

//Get alpha2/alpha1 ratio from bandpower averages
export let getAlphaRatio = (eeg_data) => {
    if(eeg_data.fftCount > 0) {
        let ratio = eeg_data.means.alpha2[eeg_data.fftCount-1] / eeg_data.means.alpha1[eeg_data.fftCount-1];
        return ratio;
    }
    else return 0;
}

//Calculate the latest theta/beta ratio from bandpower averages
export let getThetaBetaRatio = (eeg_data) => {
    if(eeg_data.fftCount > 0) {
        let ratio = eeg_data.means.theta[eeg_data.fftCount-1] / eeg_data.means.beta[eeg_data.fftCount-1]; // takes last fft average for each band
        return ratio;
    } else return 0;
}

//Calculate the latest alpha/beta ratio from bandpower averages
export let getAlphaBetaRatio = (eeg_data) => {
    if(eeg_data.fftCount > 0) {
        let ratio = ((eeg_data.means.alpha1[eeg_data.fftCount-1]+eeg_data.means.alpha2[eeg_data.fftCount-1])*.5) / eeg_data.means.beta[eeg_data.fftCount-1];
        return ratio;
    }
    else return 0;
}

//Calculate the latest alpha/theta ratio from bandpower averages
export let getAlphaThetaRatio = (eeg_data) => {
    if(eeg_data.fftCount > 0) {
        let ratio = ((eeg_data.means.alpha1[eeg_data.fftCount-1]+eeg_data.means.alpha2[eeg_data.fftCount-1])*.5) / eeg_data.means.theta[eeg_data.fftCount-1];
        return ratio;
    }
    else return 0;
}

//Get highest peak near 40Hz (38-42Hz)
export let get40HzGamma = (eeg_data, bandFreqs) => {
    if(eeg_data.fftCount > 0 && Array.isArray(bandFreqs)) {
        let lowgamma = eeg_data.slices.lowgamma[eeg_data.fftCount-1];
        let centered = [];
        lowgamma.forEach((val,i) => {
            if(bandFreqs.lowgamma[0][i] > 38 && bandFreqs.lowgamma[0][i] < 42) {
                centered.push(val);
            }
        });

        return Math.max(...centered);
    }
    else return 0;
}

//Calculate a score for the change in bandpower for low gamma (32-45Hz)
export let getLowGammaScore = (eeg_data) => {
    if(eeg_data.fftCount > 0) {
        let ct = eeg_data.fftCount;
        let avg = 20; if(ct < avg) { avg = ct; }
        let slice = eeg_data.means.lowgamma.slice(ct-avg);
        let score = eeg_data.means.lowgamma[ct-1] - Math2.mean(slice);
        return score;
    }
    else return 0;
}

export let getHEGRatioScore = (heg_ch) => {
    if(heg_ch.count > 0) {
        let ct = heg_ch.count;
        let avg = 40; if(ct < avg) { avg = ct; }
        let slice = heg_ch.ratio.slice(ct-avg);
        let score = heg_ch.ratio[ct-1] - Math2.mean(slice);
        return score;
    }
    else return 0;
}


//Returns an object with the frequencies and indices associated with the bandpass window (for processing the FFT results)
export function splitFrequencyBands(
    frequencies=[], 
    bands={
        scp:[0.1,1],
        delta:[1,4],
        theta:[4,8],
        alpha1:[8,12],
        alpha2:[12,16],
        beta:[16,30],
        lowgamma:[30,45],
        highgamma:[45,100]
    }) 
{
    let result = {};
    frequencies.forEach((item,idx) => {
       for(const prop in bands) {
            if(!result[prop]) 
               result[prop] = [[],[]];
            
            if(item >= bands[prop][0] && item <= bands[prop][1]) {
                result[prop][0].push(item);
                result[prop][1].push(idx);
            }
       }
    });

    return result;
    
}

export let mapFFTData = (fft,fft_timestamp, bands, coord) => {
    let i = 0;
    coord.fftCount++;
    coord.fftTimes.push(fft_timestamp);
    coord.ffts.push(fft);
    for(const prop in bands) { //assume the band properties are in the same order as the fft array (0Hz to 256Hz or whatever the upper limit is)
        let slice = fft.slice(i,i+bands[prop][1].length);
        coord.slices[prop].push(slice);
        coord.means[prop].push(slice.reduce((a,b)=>a+b)/slice.length);
        i += bands[prop][1].length;
    }
}

//The coherence map is formatted in an order so that the output order of our coherence algorithm 
// corresponds to the order of the coherence map indices. So it can just be mapped onto it. 
export let mapCoherenceData = (coherence_output, coherence_timestamp, bands, coherenceMap) => {
    coherence_output.forEach(row,i => {
        coherenceMap[i].fftCount++;
        coherenceMap[i].fftTimes.push(coherence_timestamp);
        coherenceMap[i].ffts.push(data);
        let i = 0;
        for(const prop in bands) { //assume the band properties are in the same order as the fft array (0Hz to 256Hz or whatever the upper limit is)
            let slice = fft.slice(i,i+bands[prop][1].length);
            coord.slices[prop].push(slice);
            coord.means[prop].push(slice.reduce((a,b)=>a+b)/slice.length);
            i += bands[prop][1].length;
        }
    });
}

//Returns a spread of the data in the provided window with set number of steps
export function bandpassWindow(freqStart,freqEnd,nSteps) {
    let diff = (freqEnd - freqStart)/nSteps;
    let fftwindow = [];
    let i = 0;
    while(i < freqEnd) {
        fftwindow.push(i);
        i += diff;
    }
    return fftwindow;
}

