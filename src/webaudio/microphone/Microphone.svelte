<script lang="ts">
    // import echarts from "echarts/lib/echarts";

    let _log = console.log;
    let audioContext:AudioContext|null = null;
    
    let isEnable = false;
    const ENABLE_KEY = 'e';


    let msg = "";

    function onMicrophoneDenied() {
        console.log('denied');
    }



    async function onMicrophoneGranted(stream) {
        isEnable = true;

        if (!audioContext) {
            audioContext = new AudioContext();
            await audioContext.audioWorklet.addModule("./microphone-processor.js");
            let microphone = audioContext.createMediaStreamSource(stream);

            let lowpass = audioContext.createBiquadFilter();
            lowpass.type = "lowpass";
            lowpass.frequency.setValueAtTime(20000, 0);
            lowpass.Q.setValueAtTime(1, 0);

            let highpass = audioContext.createBiquadFilter();
            highpass.type = "highpass";
            highpass.frequency.setValueAtTime(100, 0);
            highpass.Q.setValueAtTime(1, 0);

            // fft
            let analyser = audioContext.createAnalyser();
            // analyser.smoothingTimeConstant = 0.5;
            analyser.fftSize = 1024;
            let bufferLength = analyser.frequencyBinCount;
            let dataArray = new Uint8Array(bufferLength);

            // audio worklet
            const workletNode = new AudioWorkletNode(audioContext, 'microphone-processor');
            workletNode.port.onmessage  = (event) => {
                _log(event.data);
                if(isEnable){
                }
            }
            // microphone.connect(lowpass).connect(highpass).connect(analyser).connect(workletNode).connect(audioContext.destination);
            microphone.connect(analyser);//.connect(workletNode).connect(audioContext.destination);

            let drawCircle = ()=>{
                let el = document.getElementById('circle-frequency');
                let maxChartValue = 250;
                let minChartValue = 100;
                let option = {
                    angleAxis: {
                        type: 'value',
                        clockwise: false,
                        axisLine: {
                            show: false,
                        },
                        axisTick: {
                            show: false,
                        },
                        axisLabel: {
                            show: false,
                        },
                        splitLine: {
                            show: false,
                        },
                    },
                    radiusAxis: {
                        min: 0,
                        max: maxChartValue + 50,
                        axisLine: {
                            show: false,
                        },
                        axisTick: {
                            show: false,
                        },
                        axisLabel: {
                            show: false,
                        },
                        splitLine: {
                            show: false,
                        },
                    },
                    polar: {
                        radius: '100%',
                    },
                    series: [{
                            animation: false,
                            coordinateSystem: 'polar',
                            name: 'line',
                            type: 'line',
                            showSymbol: false,
                            lineStyle: {
                                color: {
                                    colorStops: [{
                                            offset: 0.7,
                                            color: '#e91e63'
                                        },
                                        {
                                            offset: 0.3,
                                            color: '#3f51b5'
                                        }
                                    ],
                                },
                                shadowColor: 'blue',
                                shadowBlur: 10,
                            },
                            zlevel: 2,
                            data: Array(361).fill(0).map((_, i) => [minChartValue, i]),
                            silent: true,
                            hoverAnimation: false,
                        },
                        {
                            coordinateSystem: 'polar',
                            name: 'maxbar',
                            type: 'line',
                            showSymbol: false,
                            lineStyle: {
                                color: '#87b9ca',
                                shadowColor: '#87b9ca',
                                shadowBlur: 10,
                            },
                            data: Array(361).fill(0).map((_, i) => [minChartValue, i]),
                            silent: true,
                            hoverAnimation: false,
                        },
                        {
                            coordinateSystem: 'polar',
                            name: 'interior',
                            type: 'effectScatter',
                            showSymbol: false,
                            data: [0],
                            symbolSize: minChartValue,
                            rippleEffect: {
                                period: 3.5,
                                scale: 2,
                            },
                            itemStyle: {
                                color: {
                                    type: 'radial',
                                    colorStops: [{
                                        offset: 0,
                                        color: '#87b9ca'
                                    }, {
                                        offset: 1,
                                        color: 'white'
                                    }],
                                },
                            },
                            silent: true,
                            hoverAnimation: false,
                            animation: false,
                        },
                    ]
                };
                // let chartOption = JSON.parse(JSON.stringify(defaultChartOption));
                
                let chart = echarts.init(el);
                if(isEnable) option.series[2].rippleEffect.period = 2;
                chart.setOption(option, true);
    
    
                let lastMaxR = 0;
                let draw = ()=>{
                    requestAnimationFrame(draw);
                    
                    if(isEnable){
                        analyser.getByteFrequencyData(dataArray);
        
        
                        let waveData = [];
                        let maxR = 0;
                        for (let i = 0; i <= 360; i++) {
                            // (((OldValue - OldMin) * (NewMax - NewMin)) / (OldMax - OldMin)) + NewMin
                            let freq = dataArray[i];
                            var r = (((freq - 0) * (maxChartValue - minChartValue)) / (255 - 0)) + minChartValue;
                            if (r > maxR) {
                                maxR = r;
                            }
                            waveData.push([r, i]);
                        }
                        waveData.push([waveData[0][0], 360]);
        
        
        
        
                        option.series[0].data = waveData;
        
                        if (maxR > lastMaxR) {
                            lastMaxR = maxR + 4;
                        } else if (isEnable) {
                            lastMaxR -= 2;
                        } else {
                            lastMaxR = minChartValue;
                        }
        
                        // maxbar
                        option.series[1].data = Array(361).fill(0).map((_, i) => [lastMaxR, i]);
        
        
                        chart.setOption(option, true);
                    }
                }
                draw();



                document.addEventListener("keyup", function(e){
                    if(e.key === ENABLE_KEY){
                        setTimeout(function(){
                            if(isEnable){
                                option.series[2].rippleEffect.period = 2;
                                chart.setOption(option, true);
                            }
                            else{
                                option.series[2].rippleEffect.period = 100;
                                chart.setOption(option, true);
                            }
                        },1)
                    }
                });

            }


            let drawLine = ()=>{
                let el = document.getElementById('line-frequency');
                if(!el) return;

                let dataArray = new Float32Array(analyser.frequencyBinCount);
                let dataArrayPrev = new Float32Array(analyser.frequencyBinCount);
                let dataArrayUint = new Uint8Array(analyser.frequencyBinCount);

                let option = {
                    grid: {
                        left: '3%',
                        top: 0,
                        right: '3%',
                        bottom: '10%',
                    },
                    xAxis:{
                        // name: 'x',
                        axisLine: {
                            show: false,
                        },
                        axisTick: {
                            show: false,
                        },
                        axisLabel: {
                            show: false,
                        },
                        splitLine: {
                            show: false,
                        },
                        max: bufferLength
                    },
                    yAxis: [{
                        // name: 'y',
                        axisLine: {
                            show: false,
                        },
                        axisTick: {
                            show: false,
                        },
                        axisLabel: {
                            show: false,
                        },
                        splitLine: {
                            show: false,
                        },
                        max: 1.2,
                        min: -1.5,
                    },{
                        axisLine: {
                            show: false,
                        },
                        axisTick: {
                            show: false,
                        },
                        axisLabel: {
                            show: false,
                        },
                        splitLine: {
                            show: false,
                        },
                        max: 300,
                        min: 0,
                    }],
                    series: [{
                        name: 'line',
                        type: 'line',
                        animation: false,
                        showSymbol: false,
                        // smooth: true,
                        lineStyle: {
                            color: {
                                colorStops: [{
                                        offset: 0.7,
                                        color: '#e91e63'
                                    },
                                    {
                                        offset: 0.3,
                                        color: '#3f51b5'
                                    }
                                ],
                            },
                            // shadowColor: 'blue',
                            // shadowBlur: 10,
                        },
                        data: []
                    },{
                        name: 'uint8line',
                        type: 'line',
                        animation: false,
                        showSymbol: false,
                        // smooth: true,
                        yAxisIndex: 1,
                        lineStyle: {
                            color: {
                                colorStops: [{
                                        offset: 0.7,
                                        color: '#FF5F6D'
                                    },
                                    {
                                        offset: 0.3,
                                        color: '#FFC371'
                                    }
                                ],
                            },
                            // shadowColor: 'blue',
                            // shadowBlur: 10,
                        },
                        data: []
                    }]
                }
    
                
                let chart = echarts.init(el);
                chart.setOption(option, true);

                let draw = ()=>{
                    requestAnimationFrame(draw);
    
                    if(isEnable){
                        analyser.getFloatFrequencyData(dataArray);
                        
                        let data = [];
                        // let data2 = [];
                        let diff = false;
                        for (let i = 0; i < dataArray.length; i++) {
                            let freq = (dataArray[i] - analyser.minDecibels)/(analyser.maxDecibels - analyser.minDecibels);
                            let freqPrev = dataArrayPrev[i];
                            
                            if(!diff && freq !== freqPrev){
                                diff = true;
                            }
                            if(diff) dataArrayPrev[i] = freq;
                            
                            if(freq < 0) freq = 0;
                            data.push([i, freq]);
                        }

                        if(diff){
                            // analyser.getByteFrequencyData(dataArrayUint);
                            // let uintData = [];
                            // for (let i = 0; i < dataArrayUint.length; i++) {
                            //     let freq = dataArrayUint[i];
                            //     uintData.push([i, freq]);
                            // }
                            
                            // To know zero
                            // data[0][1] = 0;
                            // uintData[0][1] = 0;

                            option.series[0].data = data;
                            // option.series[1].data = uintData;
                            chart.setOption(option, true);
                        }
                    }
                }
                draw();
            }


            let drawSurface = ()=>{
                let el = document.getElementById("frequency-surface");
                if(!el) return;

                let dataArray = new Uint8Array(analyser.frequencyBinCount);
                let data = [];

                let option = {
                    tooltip: {},
                    backgroundColor: '#fff',
                    visualMap: {
                        show: false,
                        dimension: 2,
                        min: -1,
                        max: 1,
                        inRange: {
                            color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
                        }
                    },
                    
                    xAxis3D: {
                        type: 'value'
                    },
                    yAxis3D: {
                        type: 'value'
                    },
                    zAxis3D: {
                        type: 'value'
                    },
                    grid3D: {
                        viewControl: {
                            // projection: 'orthographic',
                            // autoRotate: true,
                            // autoRotateDirection: 'ccw',
                            // distance: 160,
                            // minDistance: 60,
                            // miaxDistance: 300,
                            autoRotateSpeed: 10,
                            autoRotateAfterStill: 8,
                            // targetCoord: [113.762137,34.711329]
                        },
                        light: {
                            ambient: {
                                intensity: 0.4
                            }
                        },
                    },
                    series: [{
                        type: 'surface',
                        // animation: false,
                        silent: true,
                        wireframe: {
                            show: false
                        },
                        equation: {
                            x: {
                                step: 1,
                                min: 0,
                                max: dataArray.length,
                            },
                            y: {
                                step: 1,
                                min: 0,
                                max: dataArray.length,
                            },
                            z: function (x, y) {
                                if(y < data.length && x < data[y].length){
                                    return data[y][x];
                                }
                                else{
                                    return 0;
                                }
                            }
                        }
                    }]
                };

                let chart = echarts.init(el);
                chart.setOption(option, true);


                let draw = ()=>{
                    requestAnimationFrame(draw);
    
                    if(isEnable){
                        analyser.getByteFrequencyData(dataArray);
                        if(data.length && String(data[0])===String(dataArray)){

                        }
                        else{
                            data.unshift(dataArray);
                        }
                        if(data.length>100)data.pop();
                    }

                    let timer = setInterval(function(){
                        if(isEnable){
                            chart.setOption(option, true);
                        }
                    }, 1000);
                }
                draw();
            }


            let initDraw = ()=>{
                // drawCircle();
                drawLine();
                // #drawSurface();
            }
            initDraw();





            document.addEventListener("keyup", function(e){
                if(e.key === ENABLE_KEY){
                    isEnable = !isEnable;
                    workletNode.port.postMessage({isEnable: isEnable});
                }
            });

        }
    }

    function activeSound () {
        try {
            
            // @ts-ignore
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            
            navigator.getUserMedia(
                { audio: true, video: false },
                onMicrophoneGranted,
                onMicrophoneDenied
            );
        } catch(e) {
            alert(e)
        }

        document.addEventListener("keyup", function(e){
            if(e.key == 'm'){
                msg = "Say Hello";
                let counter = 5;
                let iid = setInterval(()=>{
                    if(counter<1){
                        clearInterval(iid);
                        msg = "";
                    }
                    else{
                        msg = `Say Hello (${counter})`;
                    }
                    counter--;
                }, 1000);
            }
        });
        
    }

</script>

<style>
    /* #frequency-surface{
        border: 1px solid crimson;
    }
    #line-frequency{
        border: 1px solid crimson;
    }
    #circle-frequency{
        border: 1px solid cadetblue;
    } */
    
</style>

<div use:activeSound>
    <div>
        <!-- {isEnable?'ENABLED':'ℕ'} -->
        {msg}
    </div>

    <!-- <div id="circle-frequency" style="width: 100%; height: 200px;"></div> -->
    <div id="line-frequency" style="width: 100%; height: 800px;"></div>
    <!-- <div id="frequency-surface" style="width: 100%; height: 300px;"></div> -->
</div>
