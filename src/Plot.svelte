<script lang="ts">
    
    // import echarts from "echarts/lib/echarts";
    // import bar from "echarts/lib/chart/bar";

    let plot = () => {
        let ece = document.getElementById("echart") as HTMLDivElement;
        if(ece){
            let myChart = echarts.init(ece);
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
                    wireframe: {
                        // show: false
                    },
                    equation: {
                        x: {
                            step: 0.05
                        },
                        y: {
                            step: 0.05
                        },
                        z: function (x, y) {
                            if (Math.abs(x) < 0.1 && Math.abs(y) < 0.1) {
                                return '-';
                            }
                            return Math.sin(x * Math.PI) * Math.sin(y * Math.PI);
                        }
                    }
                }]
            };
           
            // @ts-ignore
            myChart.setOption(option);
        }
        else{
            console.log("NOT FOUND");
        }
    }
</script>



<div use:plot>
    <div id="echart"></div>
</div>



<style>
    #echart{
        width: 100%;
        height: 500px;
    }
</style>