<script lang="ts">
	import { invalidate } from '$app/navigation'
	import { errStr, pb, type ICE } from '$lib/pb'
	import { withPending } from '$lib/pending.svelte.js'
	let { data } = $props()
	import Edit from '@iconify-icons/heroicons/pencil-square'
	import Plus from '@iconify-icons/heroicons/plus'
	import Iconify from '@iconify/svelte'
	function emptyICE() {
		return {
			id: '',
			name: '',
			urls: '',
			username: '',
			credential: '',
			default: true,
		}
	}
	let iceState = $state<ICE>(emptyICE() as any)
	async function deleteICE(id: string) {
		await pb.collection('ices').delete(id)
		await invalidate('app:ices')
	}
	async function updateICE(data: FormData) {
		if (!data.get('default')) {
			data.set('default', 'false')
		}
		if (iceState.id) {
			await pb.collection('ices').update(iceState.id, data)
		} else {
			await pb.collection('ices').create(data)
		}
		await invalidate('app:ices')
	}
	let pending = withPending()
	let deleteModalOpen = $state(false)
	let editModalOpen = $state(false)
	let moreOptsOpened = $state(false)
	import { setActions } from '../header.svelte'
	import { getShowToast } from '$lib/Toast.svelte'
	import { m } from '$lib/paraglide/messages.js'
	setActions(actions)
	const showToast = getShowToast()
</script>

{#snippet actions()}
	<button
		type="button"
		class="btn btn-square btn-ghost"
		onclick={() => {
			Object.assign(iceState, emptyICE())
			editModalOpen = true
		}}
	>
		<Iconify icon={Plus}></Iconify>
	</button>
{/snippet}

<div class="container mx-auto">
	<ul class="list">
		{#each data.ices as ice}
			<li class="list-row px-0">
				<div class="label tooltip tooltip-right" data-tip={m.ices_item_default_tip()}>
					<input
						type="checkbox"
						class="checkbox"
						name="default"
						value="true"
						readonly
						checked={ice.default}
						onclick={(e) => e.preventDefault()}
					/>
				</div>
				<div>
					<h3 class="font-bold">{ice.name || ice.id}</h3>
					<p>{ice.urls}</p>
				</div>
				<button
					type="button"
					class="btn btn-square btn-ghost"
					onclick={() => {
						Object.assign(iceState, ice)
						editModalOpen = true
						if (ice.username) {
							moreOptsOpened = true
						} else {
							moreOptsOpened = false
						}
					}}
				>
					<Iconify icon={Edit}></Iconify>
				</button>
			</li>
		{/each}
		<li class="list-row px-0">
			<div></div>
			<div class="label mx-auto">{m.ices_item_no_more()}</div>
			<div></div>
		</li>
	</ul>
</div>

<input type="checkbox" id="peer-update-modal" class="modal-toggle" bind:checked={editModalOpen} />
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
								msg: `${m.ices_update_modal_update_failed()}: ${errStr(err)}`,
							})
						},
					)
			}}
		>
			<h3 class="text-lg font-bold">
				{#if iceState.id}
					{m.ices_update_modal_update_title()}
				{:else}
					{m.ices_update_modal_add_title()}
				{/if}
			</h3>
			<fieldset class="fieldset">
				<fieldset-legend class="fieldset-legend">{m.ices_name_input_title()}</fieldset-legend>
				<input
					name="name"
					type="text"
					class="input w-full"
					placeholder={m.ices_name_input_placeholder()}
					bind:value={iceState.name}
					disabled={pending.value}
				/>
				<div class="label">{m.ices_name_input_label()}</div>
			</fieldset>
			<fieldset class="fieldset">
				<fieldset-legend class="fieldset-legend">
					<span>{m.ices_urls_input_title()}</span>
					<div class="label">
						{m.ices_urls_default_toggle_btn()}
						<input
							name="default"
							value="true"
							type="checkbox"
							class="toggle"
							bind:checked={iceState.default}
						/>
					</div>
				</fieldset-legend>
				<input
					name="urls"
					type="url"
					class="input w-full"
					placeholder={m.ices_urls_input_placeholder()}
					bind:value={iceState.urls}
					disabled={pending.value}
					required
				/>
				<div class="label">{m.ices_urls_input_label()}</div>
			</fieldset>
			<div class="collapse collapse-arrow" class:show-x-hidden={moreOptsOpened}>
				<input type="checkbox" bind:checked={moreOptsOpened} />
				<div class="collapse-title ps-0">{m.ices_auth_options_toggle()}</div>
				<div class="collapse-content p-0">
					<fieldset class="fieldset">
						<fieldset-legend class="fieldset-legend"
							>{m.ices_username_input_title()}</fieldset-legend
						>
						<input
							name="username"
							type="text"
							class="input w-full"
							placeholder={m.ices_username_input_placeholder()}
							bind:value={iceState.username}
							disabled={pending.value}
						/>
						<div class="label">{m.ices_username_input_label()}</div>
					</fieldset>
					<fieldset class="fieldset">
						<fieldset-legend class="fieldset-legend"
							>{m.ices_credential_input_title()}</fieldset-legend
						>
						<input
							name="credential"
							type="text"
							class="input w-full"
							placeholder={m.ices_credential_input_placeholder()}
							bind:value={iceState.credential}
							disabled={pending.value}
						/>
						<div class="label">{m.ices_credential_input_label()}</div>
					</fieldset>
				</div>
			</div>
			<div class="modal-action">
				<div class="flex-1">
					{#if iceState.id}
						<button
							type="button"
							class="btn btn-secondary btn-outline"
							onclick={() => {
								editModalOpen = false
								deleteModalOpen = true
							}}
						>
							{m.ices_update_modal_delete_btn()}
						</button>
					{/if}
				</div>
				<label for="peer-update-modal" class="btn btn-outline" class:btn-disabled={pending.value}>
					{m.ices_update_modal_cancel_btn()}
				</label>
				<button type="submit" class="btn btn-primary" disabled={pending.value}>
					{#if iceState.id}
						{m.ices_update_modal_update_btn()}
					{:else}
						{m.ices_update_modal_add_btn()}
					{/if}
				</button>
			</div>
		</form>
	</div>
	<label class="modal-backdrop" for="peer-update-modal">Close</label>
</div>

<input type="checkbox" id="peer-delete-modal" class="modal-toggle" bind:checked={deleteModalOpen} />
<div class="modal" role="dialog">
	<div class="modal-box">
		<h3 class="text-lg font-bold">{m.ices_del_modal_title()}</h3>
		<p class="py-4 break-all">
			{m.ices_del_modal_content()}:<br />
			<b>{iceState.name || iceState.id}</b><br />
			{iceState.urls}
		</p>
		<div class="modal-action">
			<label for="peer-delete-modal" class="btn btn-outline" class:btn-disabled={pending.value}>
				{m.ices_del_modal_cancel_btn()}
			</label>
			<button
				type="button"
				class="btn btn-error"
				onclick={() => {
					pending
						.call(async () => {
							await deleteICE(iceState.id)
						})
						.then(
							() => {
								deleteModalOpen = false
							},
							(err) => {
								showToast({
									color: 'error',
									msg: `${m.ices_del_modal_submit_failed()}: ${errStr(err)}`,
								})
							},
						)
				}}
				disabled={pending.value}
			>
				{m.ices_del_modal_submit_btn()}
			</button>
		</div>
	</div>
	<label class="modal-backdrop" for="peer-delete-modal">Close</label>
</div>

<style>
	.show-x-hidden {
		overflow: unset;
	}
</style>
