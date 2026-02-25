<script lang="ts">
	import { LinkerStatus, pb, type Linker } from '$lib/pb'

	interface Props {
		linker: Linker
		editLinker: (linker: Linker) => void
	}
	let { linker, editLinker }: Props = $props()
	import Iconify from '@iconify/svelte'
	import Pause from '@iconify-icons/heroicons/pause'
	import Play from '@iconify-icons/heroicons/play'
	import Edit from '@iconify-icons/heroicons/pencil-square'
	import Connected from '@iconify-icons/heroicons/link'
	import { withPending } from '$lib/pending.svelte'
	import { invalidate } from '$app/navigation'
	import { m } from '$lib/paraglide/messages'
	let pending = withPending()
</script>

<li class="list-row px-0">
	{#if linker.disabled}
		<button
			type="button"
			class="btn btn-sm btn-square btn-outline self-center tooltip tooltip-right"
			disabled={pending.value}
			onclick={() => {
				pending.call(async () => {
					await pb.collection('linkers').update(linker.id, { disabled: false })
					await invalidate('app:linkers')
				})
			}}
			data-tip={m.linkers_item_enable_tip()}
		>
			<Iconify icon={Play}></Iconify>
		</button>
	{:else if linker.status === LinkerStatus.Connected}
		<button
			type="button"
			class="btn btn-sm btn-square btn-outline self-center btn-success tooltip tooltip-right"
			disabled={pending.value}
			onclick={() => {
				editLinker(linker)
			}}
			data-tip={m.linkers_item_connected_tip()}
		>
			<Iconify icon={Connected}></Iconify>
		</button>
	{:else}
		<!-- {:else if linker.status === LinkerStatus.Connecting} -->
		<button
			type="button"
			class="btn btn-sm btn-square btn-outline self-center btn-info tooltip tooltip-right"
			disabled={pending.value}
			onclick={() => {
				pending.call(async () => {
					await pb.collection('linkers').update(linker.id, { disabled: true })
					await invalidate('app:linkers')
				})
			}}
			data-tip={m.linkers_item_stop_tip()}
		>
			<span class="loading loading-spinner loading-sm">connecting</span>
		</button>
	{/if}
	<div>
		<h3>
			<span class="font-bold">
				{linker.name || linker.id}
			</span>
			{#if linker.disabled}
				{m.linkers_item_status_disabled()}
			{:else if linker.status === LinkerStatus.Connected}
				{m.linkers_item_status_connected()}
			{:else}
				<!-- {:else if linker.status === LinkerStatus.Connecting} -->
				{m.linkers_item_status_connecting()}
			{/if}
		</h3>
		<p>
			<b>linker</b>: {linker.linker}<br />
			<b>whip</b>:
			<a class="link" target="linker_{linker.id}" href={linker.whip}>{linker.whip}</a>
		</p>
	</div>
	<button
		type="button"
		class="btn btn-square btn-ghost self-center"
		onclick={() => {
			editLinker(linker)
		}}
	>
		<Iconify icon={Edit}></Iconify>
	</button>
</li>
