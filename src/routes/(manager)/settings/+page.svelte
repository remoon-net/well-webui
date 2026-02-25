<script lang="ts">
	import { withPending } from '$lib/pending.svelte'
	import { tick } from 'svelte'
	import { setActions } from '../header.svelte'
	import { getShowToast } from '$lib/Toast.svelte'
	import { goto, invalidate } from '$app/navigation'
	import { errStr, pb } from '$lib/pb.js'
	import { m } from '$lib/paraglide/messages.js'
	setActions(undefined)
	let pending = withPending()
	let { data } = $props()
	let settings = $derived(data.settings)
	let listenReadonly = $state(true)
	let wgkeyReadonly = $state(true)
	// svelte-ignore state_referenced_locally
	let newSite = $state(data.settings.listen)
	async function updateSettings(data: FormData) {
		await pb.send('/api/ipc/settings', { body: data, method: 'post' })
		if (newSite != settings.listen) {
			let u = new URL('/settings/', `http://${newSite}`)
			await new Promise((rl) => setTimeout(rl, 2e3))
			location.href = u.toString()
		} else {
			await invalidate('app:settings')
		}
	}
	let showToast = getShowToast()
	let ip6Input = $state<HTMLInputElement>()
	function mac2EUI64(mac: string) {
		const bytes = mac.split(':').map((b) => parseInt(b, 16))
		if (bytes.length !== 6) {
			showToast({
				color: 'error',
				msg: m.settings_fixed_ip6_modal_submit_wrong_mac_addr(),
			})
			return
		}

		// Flip the U/L bit (bit 7 of first byte)
		bytes[0] ^= 0x02

		// Insert ff:fe in the middle
		const eui64 = [bytes[0], bytes[1], bytes[2], 0xff, 0xfe, bytes[3], bytes[4], bytes[5]]

		let s = eui64.map((b) => b.toString(16).padStart(2, '0')).join(':')
		console.log(s)

		const parts = []
		for (let i = 0; i < 8; i += 2) {
			// 每两字节合成一个 16-bit hex
			const part = (eui64[i] << 8) | eui64[i + 1]
			parts.push(part.toString(16).padStart(4, '0'))
		}
		let s2 = parts.join(':')
		console.log(s2)

		let s3 = `2001:00ff::1:${s2}`
		console.log(s3)
		ip6Input!.value = s3
	}
	let open = $state(false)
	let macInput = $state<HTMLInputElement>()
	$effect(() => {
		if (!open) {
			return
		}
		tick().then(() => {
			macInput!.select()
		})
	})
</script>

<input type="checkbox" id="mac_input_modal" class="modal-toggle" bind:checked={open} />
<div class="modal" role="dialog">
	<div class="modal-box p-4">
		<form
			action="/peer/"
			method="get"
			onsubmit={(e) => {
				e.preventDefault()
				let data = new FormData(e.currentTarget)
				let mac = data.get('mac') as string
				mac2EUI64(mac)
				open = false
			}}
		>
			<h3 class="text-lg font-bold">{m.settings_fixed_ip6_modal_title()}</h3>
			<input type="hidden" name="id" value="add" />
			<fieldset class="fieldset">
				<fieldset-legend class="fieldset-legend"
					>{m.settings_fixed_ip6_modal_mac_input_title()}</fieldset-legend
				>
				<input
					type="text"
					class="input w-full"
					name="mac"
					value={settings.mac}
					bind:this={macInput}
					placeholder={m.settings_fixed_ip6_modal_mac_input_placeholder()}
					required
				/>
				<div class="label">
					{@html m.settings_fixed_ip6_modal_mac_input_label()}
				</div>
			</fieldset>
			<div class="modal-action mt-2">
				<label for="mac_input_modal" class="btn btn-ghost" class:btn-disabled={pending.value}>
					{m.settings_fixed_ip6_modal_close()}
				</label>
				<button type="submit" class="btn btn-outline btn-primary" disabled={pending.value}>
					{m.settings_fixed_ip6_modal_submit()}
				</button>
			</div>
		</form>
	</div>
	<label class="modal-backdrop" for="mac_input_modal">Close</label>
</div>

<div class="container mx-auto my-6">
	<form
		action="/api/ipc/settings"
		method="post"
		onsubmit={(e) => {
			e.preventDefault()
			let data = new FormData(e.currentTarget)
			pending
				.call(async () => {
					await updateSettings(data)
				})
				.then(
					() => {
						showToast({
							msg: m.settings_form_submit_ok(),
						})
					},
					(err) => {
						showToast({
							color: 'error',
							msg: `${m.settings_form_submit_failed()}: ${errStr(err)}`,
						})
					},
				)
		}}
	>
		<fieldset class="fieldset">
			<fieldset-legend class="fieldset-legend">{m.settings_wg_key_input_title()}</fieldset-legend>
			<div class="join">
				<input
					name="wg_key"
					type="text"
					class="input w-full join-item"
					placeholder={m.settings_wg_key_input_placeholder()}
					value={settings.wg_key}
					disabled={pending.value}
					readonly={wgkeyReadonly}
					id="wg_key"
				/>
				<label
					for="wg_key"
					class="btn join-item"
					class:btn-disabled={pending.value}
					onclick={async () => {
						wgkeyReadonly = false
					}}
				>
					{m.settings_change_enable_btn_label()}
				</label>
			</div>
			<div class="label">{m.settings_wg_key_input_label()}</div>
		</fieldset>
		<fieldset class="fieldset">
			<fieldset-legend class="fieldset-legend">{m.settings_ip6_addr_input_title()}</fieldset-legend>
			<div class="join">
				<input
					name="ip6_addr"
					type="text"
					class="input w-full"
					placeholder={m.settings_ip6_addr_input_placeholder()}
					value={settings.ip6_addr}
					bind:this={ip6Input}
					disabled={pending.value}
				/>
				<label for="mac_input_modal" class="btn">{m.settings_ip6_addr_gen_by_mac_label()}</label>
			</div>
			<div class="label">{m.settings_ip6_addr_input_placeholder()}</div>
		</fieldset>
		<fieldset class="fieldset">
			<fieldset-legend class="fieldset-legend">{m.settings_ip4_route_input_title()}</fieldset-legend
			>
			<input
				name="ip4_route"
				type="text"
				class="input w-full"
				placeholder={m.settings_ip4_route_input_placeholder()}
				value={settings.ip4_route}
				disabled={pending.value}
			/>
			<div class="label">{m.settings_ip4_route_input_label()}</div>
		</fieldset>
		<div class="join flex gap-4">
			<div class="join-item flex-1">
				<fieldset class="fieldset">
					<fieldset-legend class="fieldset-legend">{m.settings_tun_input_title()}</fieldset-legend>
					<input
						name="tun"
						type="text"
						class="input w-full"
						placeholder={m.settings_tun_input_placeholder()}
						value={settings.tun}
						disabled={pending.value}
					/>
					<div class="label">{m.settings_tun_input_label()}</div>
				</fieldset>
			</div>
			<div class="join-item flex-1">
				<fieldset class="fieldset">
					<fieldset-legend class="fieldset-legend"
						>{m.settings_auto_start_input_title()}</fieldset-legend
					>
					<select
						name="auto_start"
						class="select w-full"
						value={`${settings.auto_start}`}
						disabled={pending.value}
					>
						<option value="true">{m.settings_auto_start_input_opt_enable()}</option>
						<option value="false">{m.settings_auto_start_input_opt_disable()}</option>
					</select>
					<div class="label">{m.settings_auto_start_input_label()}</div>
				</fieldset>
			</div>
		</div>
		<fieldset class="fieldset">
			<fieldset-legend class="fieldset-legend">{m.settings_listen_input_title()}</fieldset-legend>
			<div class="join">
				<input
					name="listen"
					type="text"
					class="input w-full join-item"
					placeholder={m.settings_listen_input_placeholder()}
					value={settings.listen}
					disabled={pending.value}
					readonly={listenReadonly}
					id="listen_addr"
					onchange={(e) => {
						newSite = e.currentTarget.value
					}}
				/>
				<label
					for="listen_addr"
					class="btn join-item"
					class:btn-disabled={pending.value}
					onclick={async () => {
						listenReadonly = false
					}}
				>
					{m.settings_change_enable_btn_label()}
				</label>
			</div>
			<div class="label">{m.settings_listen_input_label()}</div>
		</fieldset>
		<div class="my-6">
			<button type="submit" class="btn btn-primary btn-block my-1" disabled={pending.value}>
				{#if newSite != data.settings.listen}
					{m.settings_form_submit_with_restart_app()}
				{:else}
					<!--  -->
					{#if settings.running}
						{m.settings_form_submit_with_restart_vpn()}
					{:else}
						{m.settings_form_submit_with_save()}
					{/if}
				{/if}
			</button>
			<div class="label text-sm">{m.settings_form_submit_label()}</div>
		</div>
	</form>
</div>
