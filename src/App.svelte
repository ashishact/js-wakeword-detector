<script lang="ts">
    import Plot from "./Plot.svelte";
    // import Volume from "./webaudio/volume/Volume.svelte";
    import Microphone from "./webaudio/microphone/Microphone.svelte";
    // import EchartSoundGraph from "./visualisation/EchartSoundGraph.svelte"



    export let name: string;
</script>

<main>
    <h2>Hello {name}!</h2>

    <!-- <Plot></Plot> -->
    <Microphone></Microphone>
    <!-- <EchartSoundGraph></EchartSoundGraph> -->
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h2 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 2em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>