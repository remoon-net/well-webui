<script lang="ts">
	import { page } from '$app/state'
	import type { PageData } from './$types'
	let data = $derived(page.data as PageData)
	import Fab from './fab.svelte'
	let routes = $derived(data.routes)
	let { hide = false } = $props()
</script>

<div class="well-panel z-98 bg-base-200" class:fixed={!hide} class:invisible={hide}>
	<div class="container mx-auto">
		<div class="flex flex-column items-center">
			<div class="flex-1 py-2">
				<div>
					<span class="label">IPv4</span>: <span class:label={!data.running}>{routes[1]}</span>
					<br />
					<span class="label">IPv6</span>: <span class:label={!data.running}>{routes[0]}</span>
				</div>
			</div>
			<div class="self-end">
				<div class="well-fab mx-2 pt-2 pb-5">
					<Fab></Fab>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.well-panel {
		bottom: 0;
		left: 0;
		width: 100%;
	}
	.well-fab {
		position: relative;
	}
</style>
