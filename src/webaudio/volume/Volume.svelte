<script lang="ts">
    let audioContext:AudioContext|null = null;
    const ledColor = [
        "#064dac",
        "#064dac",
        "#064dac",
        "#06ac5b",
        "#15ac06",
        "#4bac06",
        "#80ac06",
        "#acaa06",
        "#ac8b06",
        "#ac5506",
    ]
    let isFirtsClick = true
    let listeing = false

    function onMicrophoneDenied() {
        console.log('denied')
    }

    function leds(vol) {
        let leds = [...document.getElementsByClassName('led')];
        let range = leds.slice(0, Math.round(vol));

        for (var i = 0; i < leds.length; i++) {
            // @ts-ignore
            leds[i].style.boxShadow = "-2px -2px 4px 0px #a7a7a73d inset, 2px 2px 4px 0px #0a0a0e5e inset";
        }
        
        for (var i = 0; i < range.length; i++) {
            // @ts-ignore
            range[i].style.boxShadow = `5px 2px 5px 0px #0a0a0e5e inset, -2px -2px 1px 0px #a7a7a73d inset, -2px -2px 30px 0px ${ledColor[i]} inset`;
        }
    }

    async function onMicrophoneGranted(stream) {
        if (isFirtsClick) {
            audioContext = new AudioContext();
            await audioContext.audioWorklet.addModule("./volume-processor.js");
            let microphone = audioContext.createMediaStreamSource(stream);

            const node = new AudioWorkletNode(audioContext, 'volume-processor');
            node.port.onmessage  = event => {
                let _volume = 0
                let _sensibility = 5
                if (event.data.volume)
                    _volume = event.data.volume;
                leds((_volume * 100) / _sensibility)
            }
            microphone.connect(node).connect(audioContext.destination)

            isFirtsClick = false
        }

        let audioButton = document.getElementsByClassName('audio-control')[0]
        if (listeing) {
            audioContext.suspend();
            // @ts-ignore
            audioButton.style.boxShadow = "-2px -2px 4px 0px #a7a7a73d, 2px 2px 4px 0px #0a0a0e5e"
            // @ts-ignore
            audioButton.style.fontSize = "25px"
        } else {
            audioContext.resume()
            // @ts-ignore
            audioButton.style.boxShadow = "5px 2px 5px 0px #0a0a0e5e inset, -2px -2px 1px 0px #a7a7a73d inset"
            // @ts-ignore
            audioButton.style.fontSize = "24px"
        }

        listeing = !listeing
    }

    function activeSound () {
        try {
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            
            navigator.getUserMedia(
                { audio: true, video: false },
                onMicrophoneGranted,
                onMicrophoneDenied
            );
        } catch(e) {
            alert(e)
        }
    }

</script>

<style>
    /* body {
        margin: 0;
        padding: 0;

        background-color: #20222e;
        font-family: "Verdana";
    } */
    .container {
        background-color: #292a38;
        border-radius: 8px;
        padding: 20px;

        /* position: relative; */
        /* top: 50%; */
        /* left: 50%; */
        /* transform: translate(-50%, -50%); */

        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;

        height: 150px;
    }
    span {
        font-size: 20px;
        font-weight: bold;
        color: #ffffff;
    }
    .volumen-wrapper {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
    .led {
        width: 40px;
        height: 25px;
        background-color: #292a38;
        border-radius: 4px;

        box-shadow: -2px -2px 4px 0px #a7a7a73d inset,
            2px 2px 4px 0px #0a0a0e5e inset;
        margin: 0 5px;
    }
    .audio-control {
        cursor: pointer;
        color: #fff;

        box-shadow: -2px -2px 4px 0px #a7a7a73d, 2px 2px 4px 0px #0a0a0e5e;
        padding: 8px;

        font-size: 25px;
        border-radius: 50%;
    }
</style>

<div use:activeSound class="container">
    <span>Microphone</span>
    <div class="volumen-wrapper">
        <div class="led" />
        <div class="led" />
        <div class="led" />
        <div class="led" />
        <div class="led" />
        <div class="led" />
        <div class="led" />
        <div class="led" />
        <div class="led" />
        <div class="led" />
    </div>

    <div class="control-audio-wrapper">
        <div on:click={activeSound} id="audio" class="audio-control">&#127908;</div>
    </div>
</div>
