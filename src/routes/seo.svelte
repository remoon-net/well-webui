<script lang="ts">
	import { page } from '$app/state'
	import type { Nav } from './+layout'

	let subtitle = $derived.by(() => {
		let subnavs = page.data.subnavs as Nav[]
		let subtitle = (subnavs.length === 1 ? subnavs : subnavs.slice(1))
			.map((t) => t.name)
			.reverse()
			.join(' - ')
		return subtitle
	})
</script>

<svelte:head>
	<title>{subtitle} - well net</title>
</svelte:head>
