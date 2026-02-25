<script lang="ts">
	import { invalidate } from '$app/navigation'
	import { errStr, LinkerStatus, pb, type ICE, type Linker } from '$lib/pb'
	import { withPending } from '$lib/pending.svelte.js'
	let { data } = $props()
	import Edit from '@iconify-icons/heroicons/pencil-square'
	import Plus from '@iconify-icons/heroicons/plus'
	import Iconify from '@iconify/svelte'
	function emptyLinker() {
		return {
			id: '',
			name: '',
			disabled: false,
			status: '',
			linker: '',
			whip: '',
		}
	}
	let linkerState = $state<Linker>(emptyLinker() as any)
	async function deleteLinker(id: string) {
		await pb.collection('linkers').delete(id)
		await invalidate('app:linkers')
	}
	async function updateICE(data: FormData) {
		if (!data.get('disabled')) {
			data.set('disabled', 'false')
		}
		if (linkerState.id) {
			await pb.collection('linkers').update(linkerState.id, data)
		} else {
			await pb.collection('linkers').create(data)
		}
		await invalidate('app:linkers')
	}
	let pending = withPending()
	let deleteModalOpen = $state(false)
	let editModalOpen = $state(false)
	let moreOptsOpened = $state(false)
	import { setActions } from '../header.svelte'
	setActions(actions)
	import { getShowToast } from '$lib/Toast.svelte'
	import { onMount } from 'svelte'
	const showToast = getShowToast()
	onMount(() => {
		let t = setInterval(() => {
			invalidate('app:linkers')
		}, 2e3)
		return () => {
			clearInterval(t)
		}
	})
	import LinkerItem from './item.svelte'
	import { m } from '$lib/paraglide/messages.js'
</script>

{#snippet actions()}
	<button
		type="button"
		class="btn btn-square btn-ghost"
		onclick={() => {
			Object.assign(linkerState, emptyLinker())
			editModalOpen = true
		}}
	>
		<Iconify icon={Plus}></Iconify>
	</button>
{/snippet}

<div class="container mx-auto">
	<ul class="list">
		{#each data.linkers as linker}
			<LinkerItem
				{linker}
				editLinker={(linker) => {
					Object.assign(linkerState, linker)
					editModalOpen = true
				}}
			></LinkerItem>
		{/each}
		<li class="list-row px-0">
			<div></div>
			<div class="label mx-auto">{m.linkers_no_more()}</div>
			<div></div>
		</li>
	</ul>
</div>

<input type="checkbox" id="linker-update-modal" class="modal-toggle" bind:checked={editModalOpen} />
<div class="modal" role="dialog">
	<div class="modal-box">
		<form
			onsubmit={(e) => {
				e.preventDefault()
				let data = new FormData(e.currentTarget)
				pending
					.call(async () => {
						await updateICE(data)
					})
					.then(
						() => {
							editModalOpen = false
						},
						(err) => {
							showToast({
								color: 'error',
								msg: `${m.linkers_modal_submit_failed()}: ${errStr(err)}`,
							})
						},
					)
			}}
		>
			<h3 class="text-lg font-bold">
				{#if linkerState.id}
					{m.linkers_modal_update_title()}
				{:else}
					{m.linkers_modal_add_title()}
				{/if}
			</h3>
			<fieldset class="fieldset">
				<fieldset-legend class="fieldset-legend">{m.linkers_name_input_title()}</fieldset-legend>
				<input
					name="name"
					type="text"
					class="input w-full"
					placeholder={m.linkers_name_input_placeholder()}
					bind:value={linkerState.name}
					disabled={pending.value}
				/>
				<div class="label">{m.linkers_name_input_label()}</div>
			</fieldset>
			<fieldset class="fieldset">
				<fieldset-legend class="fieldset-legend">
					<span>{m.linkers_linker_input_title()}</span>
					<div class="label">
						{m.linkers_linker_disable_btn()}
						<input
							name="disabled"
							value="true"
							type="checkbox"
							class="toggle"
							bind:checked={linkerState.disabled}
						/>
					</div>
				</fieldset-legend>
				<input
					name="linker"
					type="url"
					class="input w-full"
					placeholder={m.linkers_linker_input_placeholder()}
					bind:value={linkerState.linker}
					disabled={pending.value}
					required
				/>
				<div class="label">
					{@html m.linkers_linker_input_label()}
				</div>
			</fieldset>
			<fieldset class="fieldset">
				<fieldset-legend class="fieldset-legend">{m.linkers_whip_input_title()}</fieldset-legend>
				<input
					name="whip"
					type="text"
					class="input w-full"
					placeholder={m.linkers_whip_input_placeholder()}
					bind:value={linkerState.whip}
					disabled={pending.value}
				/>
				<div class="label">{m.linkers_whip_input_label()}</div>
			</fieldset>
			<div class="modal-action">
				<div class="flex-1">
					{#if linkerState.id}
						<button
							type="button"
							class="btn btn-secondary btn-outline"
							onclick={() => {
								editModalOpen = false
								deleteModalOpen = true
							}}
						>
							{m.linkers_modal_delete_btn_label()}
						</button>
					{/if}
				</div>
				<label for="linker-update-modal" class="btn btn-outline" class:btn-disabled={pending.value}>
					{m.linkers_modal_close_btn_label()}
				</label>
				<button type="submit" class="btn btn-primary" disabled={pending.value}>
					{#if linkerState.id}
						{m.linkers_modal_update_btn_label()}
					{:else}
						{m.linkers_modal_add_btn_label()}
					{/if}
				</button>
			</div>
		</form>
	</div>
	<label class="modal-backdrop" for="linker-update-modal">Close</label>
</div>

<input
	type="checkbox"
	id="linker-delete-modal"
	class="modal-toggle"
	bind:checked={deleteModalOpen}
/>
<div class="modal" role="dialog">
	<div class="modal-box">
		<h3 class="text-lg font-bold">{m.linkers_del_modal_title()}</h3>
		<p class="py-4 break-all">
			{m.linkers_del_modal_content()}:<br />
			<b>{linkerState.name || linkerState.id}</b><br />
			{linkerState.urls}
		</p>
		<div class="modal-action">
			<label for="linker-delete-modal" class="btn btn-outline" class:btn-disabled={pending.value}>
				{m.linkers_del_modal_close_btn()}
			</label>
			<button
				type="button"
				class="btn btn-error"
				onclick={() => {
					pending
						.call(async () => {
							await deleteLinker(linkerState.id)
						})
						.then(
							() => {
								deleteModalOpen = false
							},
							(err) => {
								showToast({
									color: 'error',
									msg: `${m.linkers_del_modal_submit_failed()}: ${errStr(err)}`,
								})
							},
						)
				}}
				disabled={pending.value}
			>
				{m.linkers_del_modal_submit_btn()}
			</button>
		</div>
	</div>
	<label class="modal-backdrop" for="linker-delete-modal">Close</label>
</div>

<style>
	.show-x-hidden {
		overflow: unset;
	}
</style>
