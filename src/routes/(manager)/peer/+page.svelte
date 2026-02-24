<script lang="ts">
	import { withPending } from '$lib/pending.svelte'

	let { data } = $props()
	let p = $derived(data.peer)
	import { errStr, pb, type Peer } from '$lib/pb'
	import { goto, invalidate } from '$app/navigation'
	async function deletePeer() {
		await pb.collection('peers').delete(p.id)
		await goto('/', { replaceState: true })
	}
	async function updatePeer(form: FormData) {
		if (!form.get('transport_mode')) {
			form.set('transport_mode', '')
		}
		if (!form.get('auto')) {
			form.set('auto', '')
		}
		if (!form.get('disabled')) {
			form.set('disabled', 'false')
		}
		if (!p.id) {
			let p = await pb.collection<Peer>('peers').create(form)
			await goto(`?id=${p.id}`, { replaceState: true })
		} else {
			await pb.collection('peers').update(p.id, form)
			await invalidate(`app:peer:${p.id}`)
		}
		await invalidate('app:peers')
		// history.back()
	}
	import { dev } from '$app/environment'
	import { onMount, tick } from 'svelte'
	import { getShowToast } from '$lib/Toast.svelte'
	let moreOptsOpened = $state(true)
	let updatedModalOpen = $state(false)
	let modes = $state<string[]>([])
	let useDefaultICEs = $state(false)
	onMount(() => {
		modes = p.transport_mode
		useDefaultICEs = p.ices.length == 0
		switch (true) {
			case p.psk != '':
			case p.whip2 != '':
			case p.transport_mode.length > 0:
			case p.ices.length > 0:
			case p.ipv6 != '':
				moreOptsOpened = true
				break
			default:
				moreOptsOpened = false
		}
	})
	let pending = withPending()
	let showToast = getShowToast()
	import { setActions } from '../header.svelte'
	import { m } from '$lib/paraglide/messages.js'
	setActions(undefined)
</script>

<div class="container mx-auto my-6">
	<form
		method="post"
		onsubmit={(e) => {
			e.preventDefault()
			let data = new FormData(e.currentTarget)
			pending
				.call(async () => {
					await updatePeer(data)
				})
				.then(
					() => {
						updatedModalOpen = true
					},
					(err) => {
						showToast({
							color: 'error',
							msg: `${!p.id ? m.peer_add_failed() : m.peer_update_failed()}: ${errStr(err)}`,
						})
					},
				)
		}}
	>
		<fieldset class="fieldset">
			<fieldset-legend class="fieldset-legend">{m.peer_name_input_title()}</fieldset-legend>
			<input
				name="name"
				type="text"
				class="input w-full"
				placeholder={m.peer_name_input_placeholder()}
				value={p.name}
				disabled={pending.value}
			/>
			<div class="label">{m.peer_name_input_label()}</div>
		</fieldset>
		<fieldset class="fieldset">
			<fieldset-legend class="fieldset-legend">
				<span>{m.peer_pubkey_input_title()}</span>
				<label class="label">
					{m.peer_pubkey_disabled_label()}
					<input
						type="checkbox"
						name="disabled"
						value="true"
						checked={p.disabled}
						class="toggle"
						disabled={pending.value}
					/>
				</label>
			</fieldset-legend>
			<input
				name="pubkey"
				type="text"
				class="input w-full"
				placeholder={m.peer_pubkey_input_placeholder()}
				value={p.pubkey}
				disabled={pending.value}
				required
				readonly={!!p.id}
			/>
			<div class="label">{m.peer_pubkey_input_label()}</div>
		</fieldset>
		<fieldset class="fieldset">
			<fieldset-legend class="fieldset-legend">
				<span>{m.peer_whip_input_title()}</span>
				<label class="label">
					{m.peer_whip_auto_label()}
					<input
						type="checkbox"
						name="auto"
						value={Math.max(15, p.auto)}
						checked={p.auto > 0}
						class="toggle"
						disabled={pending.value}
					/>
				</label>
			</fieldset-legend>
			<input
				name="whip"
				type="url"
				class="input w-full"
				placeholder={m.peer_whip_input_placeholder()}
				value={p.whip}
				disabled={pending.value}
			/>
			<div class="label">{m.peer_whip_input_label()}</div>
		</fieldset>
		<div class="collapse collapse-arrow" class:show-x-hidden={moreOptsOpened}>
			<input type="checkbox" bind:checked={moreOptsOpened} />
			<div class="collapse-title ps-0">{m.peer_advanced_options_toggle()}</div>
			<div class="collapse-content px-0">
				<fieldset class="fieldset">
					<fieldset-legend class="fieldset-legend">{m.peer_whip2_input_title()}</fieldset-legend>
					<input
						name="whip2"
						type="url"
						class="input w-full"
						placeholder={m.peer_whip2_input_placeholder()}
						value={p.whip2}
						disabled={pending.value}
					/>
					<div class="label">{m.peer_whip2_input_label()}</div>
				</fieldset>
				<fieldset class="fieldset">
					<fieldset-legend class="fieldset-legend">{m.peer_tm_input_title()}</fieldset-legend>
					<div>
						<input
							class="btn btn-sm"
							type="checkbox"
							name="transport_mode"
							value="NoWebSocket"
							aria-label="NoWebSocket"
							disabled={pending.value}
							bind:group={modes}
						/>
						<input
							class="btn btn-sm"
							type="checkbox"
							name="transport_mode"
							value="NoWebRTC"
							aria-label="NoWebRTC"
							disabled={pending.value}
							bind:group={modes}
						/>
						<input
							class="btn btn-sm hidden"
							type="checkbox"
							name="transport_mode"
							value="EnableWebSocketRedirect"
							aria-label="EnableWebSocketRedirect"
							disabled={pending.value}
						/>
					</div>
					<div class="label">
						NoWebSocket: {m.peer_tm_nowsc_label()}<br />
						NoWebRTC: {m.peer_tm_nowrtc_label()}
					</div>
				</fieldset>
				<fieldset class="fieldset">
					<fieldset-legend class="fieldset-legend">{m.peer_ip4_input_title()}</fieldset-legend>
					<input
						name="ipv4"
						type="text"
						class="input w-full"
						placeholder={m.peer_ip4_input_placeholder()}
						value={p.ipv4}
						disabled={pending.value}
					/>
					<div class="label">{m.peer_ip4_input_label()}</div>
				</fieldset>
				<fieldset class="fieldset">
					<fieldset-legend class="fieldset-legend">{m.peer_ip6_input_title()}</fieldset-legend>
					<input
						name="ipv6"
						type="text"
						class="input w-full"
						placeholder={m.peer_ip6_input_placeholder()}
						value={p.ipv6}
						disabled={pending.value}
					/>
					<div class="label">{m.peer_ip6_input_label()}</div>
				</fieldset>
				<fieldset class="fieldset">
					<fieldset-legend class="fieldset-legend">{m.peer_psk_input_title()}</fieldset-legend>
					<input
						name="psk"
						type="text"
						class="input w-full"
						placeholder={m.peer_psk_input_placeholder()}
						value={p.psk}
						disabled={pending.value}
					/>
					<div class="label">
						{m.peer_psk_input_label()}
					</div>
				</fieldset>
				<fieldset class="fieldset">
					<fieldset-legend class="fieldset-legend">
						<span>{m.peer_ices_input_title()}</span>
						<label class="label">
							{m.peer_ices_default_label()}
							<input
								type="checkbox"
								name="ices"
								value=""
								bind:checked={useDefaultICEs}
								class="toggle"
								disabled={pending.value}
							/>
						</label>
					</fieldset-legend>
					<select
						class="select w-full"
						name="ices"
						multiple
						disabled={pending.value || useDefaultICEs}
					>
						{#if data.ices.length == 0}
							<option value="">{m.peer_ices_input_placeholder()}</option>
						{/if}
						{#each data.ices as ice}
							<option value={ice.id} selected={p.ices.includes(ice.id)}>
								{ice.name || ice.id} ({ice.urls})
							</option>
						{/each}
					</select>
					<div class="label">
						<div>
							<a href="/ices/" class="link">{m.link_ices()}</a>
							{m.peer_ices_input_label()}
						</div>
					</div>
				</fieldset>
			</div>
		</div>
		<div class="my-6">
			<button type="submit" class="btn btn-primary btn-block my-1" disabled={pending.value}>
				{#if p.id}
					{m.peer_form_update_btn()}
				{:else}
					{m.peer_form_add_btn()}
				{/if}
			</button>
			<label
				for="peer-delete-modal"
				class="btn btn-outline btn-secondary btn-block my-1"
				class:btn-disabled={pending.value}
				class:hidden={!p.id}
			>
				{m.peer_form_del_btn()}
			</label>
		</div>
	</form>
</div>

<input
	type="checkbox"
	id="peer-updated-modal"
	class="modal-toggle"
	bind:checked={updatedModalOpen}
/>
<div class="modal" role="dialog">
	<div class="modal-box">
		<h3 class="text-lg font-bold">{m.peer_updated_modal_title()}</h3>
		<p class="py-4 break-all">{m.peer_updated_modal_content()}:<br />{p.name}({p.pubkey})</p>
		<div class="modal-action">
			<label for="peer-updated-modal" class="btn btn-outline" class:btn-disabled={pending.value}>
				{m.peer_updated_modal_stayhere()}
			</label>
			<a
				href="/"
				class="btn btn-primary"
				onclick={(e) => {
					e.preventDefault()
					history.back()
				}}
			>
				{m.peer_updated_modal_gohome()}
			</a>
		</div>
	</div>
	<label class="modal-backdrop" for="peer-updated-modal">Close</label>
</div>

<!-- Put this part before </body> tag -->
<input type="checkbox" id="peer-delete-modal" class="modal-toggle" />
<div class="modal" role="dialog">
	<div class="modal-box">
		<h3 class="text-lg font-bold">{m.peer_delete_modal_title()}</h3>
		<p class="py-4 break-all">{m.peer_delete_modal_content()}:<br />{p.name}({p.pubkey})</p>
		<div class="modal-action">
			<label for="peer-delete-modal" class="btn btn-outline" class:btn-disabled={pending.value}>
				{m.peer_delete_modal_cancel()}
			</label>
			<button
				type="button"
				class="btn btn-error"
				onclick={() => {
					pending
						.call(async () => {
							await deletePeer()
						})
						.then(
							() => {},
							(err) => {
								showToast({
									color: 'error',
									msg: `${m.peer_delete_failed()}: ${errStr(err)}`,
								})
							},
						)
				}}
				disabled={pending.value}
			>
				{m.peer_delete_modal_submit()}
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
