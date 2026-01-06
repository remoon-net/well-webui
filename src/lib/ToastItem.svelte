<script lang="ts">
	import { onMount } from 'svelte'
	import type { Item } from './Toast.svelte'
	interface Props {
		item: Item
		hide: (k: string) => void
	}
	let { item, hide }: Props = $props()
	let root = $state<HTMLElement>()
	onMount(() => {
		let t = setTimeout(() => hide(item.id!), 3_000)
		root?.addEventListener('mouseenter', () => {
			clearTimeout(t)
		})
		root?.addEventListener('mouseleave', () => {
			setTimeout(() => hide(item.id!), 2_000)
		})
		return () => {
			clearTimeout(t)
		}
	})
	import { fly } from 'svelte/transition'
</script>

<div
	bind:this={root}
	class="alert"
	class:alert-info={item.color == 'info'}
	class:alert-success={item.color == 'success'}
	class:alert-warning={item.color == 'warning'}
	class:alert-error={item.color == 'error'}
	out:fly={{ x: -50 }}
>
	<span>{item.msg}</span>
	<!-- <div>
		<button
			type="button"
			class="btn btn-primary btn-sm btn-close"
			onclick={() => {
				hide(item.id!)
			}}
		>
			隐藏
		</button>
	</div> -->
</div>
