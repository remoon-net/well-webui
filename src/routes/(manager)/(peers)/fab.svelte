<script lang="ts">
	import Iconify from '@iconify/svelte'
	import { withPending } from '$lib/pending.svelte'
	import { errStr, pb } from '$lib/pb'
	import { invalidate } from '$app/navigation'
	let pending = withPending()
	import type { PageData } from './$types'
	import { page } from '$app/state'
	let data = $derived(page.data as PageData)
	async function startWG() {
		await pb.send('/api/ipc/device', { method: 'post' })
		await invalidate('wg:status')
	}
	async function stopWG() {
		await pb.send('/api/ipc/device', { method: 'delete' })
		await invalidate('wg:status')
	}
	import Pause from '@iconify-icons/heroicons/pause'
	import Play from '@iconify-icons/heroicons/play'
	import { getShowToast } from '$lib/Toast.svelte'
	let showToast = getShowToast()
</script>

{#if pending.value}
	<button type="button" class="btn btn-lg btn-circle btn-primary" disabled={pending.value}>
		<span class="loading loading-spinner">pending</span>
	</button>
{:else if data.running}
	<button
		type="button"
		class="btn btn-lg btn-circle btn-error"
		disabled={pending.value}
		onclick={() => {
			pending
				.call(async () => {
					await stopWG()
				})
				.then(
					() => {},
					(err) => {
						showToast({
							color: 'error',
							msg: `WireGuard停止出错: ${errStr(err)}`,
						})
					},
				)
		}}
	>
		<Iconify icon={Pause}></Iconify>
	</button>
{:else}
	<button
		type="button"
		class="btn btn-lg btn-circle btn-primary"
		disabled={pending.value}
		onclick={() => {
			pending
				.call(async () => {
					await startWG()
				})
				.then(
					() => {},
					(err) => {
						showToast({
							color: 'error',
							msg: `WireGuard启动出错: ${errStr(err)}`,
						})
					},
				)
		}}
	>
		<Iconify icon={Play}></Iconify>
	</button>
{/if}
