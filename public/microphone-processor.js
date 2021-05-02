
registerProcessor('microphone-processor', class extends AudioWorkletProcessor {
    isEnable;
    constructor () {
        super();
        this.isEnable = false;
        this.port.onmessage = (event) => {
        if (event.data.hasOwnProperty("isEnable"))
            this.isEnable = event.data.isEnable;
        }
    }

    process (inputs, outputs, parameters) {
        if(this.isEnable){
            // this.port.postMessage({samples: inputs[0][0]});
        }
        
        return true;
    }
});