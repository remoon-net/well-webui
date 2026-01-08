<script lang="ts">
	import '../app.css'
	import { page } from '$app/state'
	import { locales, localizeHref } from '$lib/paraglide/runtime'
	import favicon from '$lib/assets/favicon.png'
	import SEO from './seo.svelte'
	import Toast from '$lib/Toast.svelte'

	let { children } = $props()
</script>

<SEO></SEO>
<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div style="display:none">
	{#each locales as locale}
		<a href={localizeHref(page.url.pathname, { locale })}>
			{locale}
		</a>
	{/each}
</div>

<Toast>
	{@render children()}
</Toast>
