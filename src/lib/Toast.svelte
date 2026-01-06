<script module lang="ts">
	export const key = Symbol('toast')

	import { getContext, setContext } from 'svelte'
	import { SvelteMap } from 'svelte/reactivity'
	export interface Item {
		id?: string
		color?: 'info' | 'success' | 'warning' | 'error'
		msg: string
	}

	export function getShowToast(): (item: Item) => void {
		return getContext(key)
	}
	import ToastItem from './ToastItem.svelte'
</script>

<script lang="ts">
	let { children } = $props()
	let toasts = new SvelteMap<string, Item>()
	let i = 0 // 不太可能溢出
	function showToast(item: Item) {
		if (!item.id) {
			item.id = `${Date.now()}+${i++}`
		}
		if (!item.color) {
			item.color = 'info'
		}
		if (toasts.size >= 3) {
			let item = toasts.keys().next()
			toasts.delete(item.value!)
		}
		toasts.set(item.id, item)
	}
	setContext(key, showToast)
	function hide(k: string) {
		toasts.delete(k)
	}
</script>

<div class="toast toast-top toast-start z-999">
	{#each Array.from(toasts).reverse() as [k, item] (k)}
		<ToastItem {item} {hide}></ToastItem>
	{/each}
</div>

{@render children()}
