<script lang="ts">
	import { withPending } from '$lib/pending.svelte'
	import { tick } from 'svelte'
	import { setActions } from '../header.svelte'
	import { getShowToast } from '$lib/Toast.svelte'
	import { goto, invalidate } from '$app/navigation'
	import { errStr, pb } from '$lib/pb.js'
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
				msg: '错误的MAC地址!',
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
			<h3 class="text-lg font-bold">节点导入</h3>
			<input type="hidden" name="id" value="add" />
			<fieldset class="fieldset">
				<fieldset-legend class="fieldset-legend">网卡MAC地址</fieldset-legend>
				<input
					type="text"
					class="input w-full"
					name="mac"
					value={settings.mac}
					bind:this={macInput}
					required
				/>
				<div class="label">
					默认有的话是获取到的第一张网卡MAC地址. <br />
					如果是虚拟机的话需要自行设置, 因为虚拟机网卡MAC地址是模拟的不能避免冲突
				</div>
			</fieldset>
			<div class="modal-action mt-2">
				<label for="mac_input_modal" class="btn btn-ghost" class:btn-disabled={pending.value}>
					取消
				</label>
				<button type="submit" class="btn btn-outline btn-primary" disabled={pending.value}>
					确认
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
							msg: `更新设置成功`,
						})
					},
					(err) => {
						showToast({
							color: 'error',
							msg: `更新设置出错: ${errStr(err)}`,
						})
					},
				)
		}}
	>
		<fieldset class="fieldset">
			<fieldset-legend class="fieldset-legend">本机私钥 (wg_key)</fieldset-legend>
			<div class="join">
				<input
					name="wg_key"
					type="text"
					class="input w-full join-item"
					placeholder="wg genpsk生成"
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
					修改
				</label>
			</div>
			<div class="label">修改私钥将会导致其他节点无法连接你, 谨慎修改</div>
		</fieldset>
		<fieldset class="fieldset">
			<fieldset-legend class="fieldset-legend">固定 IPv6 地址 (ip6_addr)</fieldset-legend>
			<div class="join">
				<input
					name="ip6_addr"
					type="text"
					class="input w-full"
					placeholder="2001:00f0::1"
					value={settings.ip6_addr}
					bind:this={ip6Input}
					disabled={pending.value}
				/>
				<label for="mac_input_modal" class="btn">使用MAC生成</label>
			</div>
			<div class="label">设置固定 IPv6 地址, 由网卡MAC地址生成(EUI-64)</div>
		</fieldset>
		<fieldset class="fieldset">
			<fieldset-legend class="fieldset-legend">监听地址 (ip4_route)</fieldset-legend>
			<input
				name="ip4_route"
				type="text"
				class="input w-full"
				placeholder="192.168.211.1/20"
				value={settings.ip4_route}
				disabled={pending.value}
			/>
			<div class="label">IPv4路由冲突的话可以修改这个</div>
		</fieldset>
		<div class="join flex gap-4">
			<div class="join-item flex-1">
				<fieldset class="fieldset">
					<fieldset-legend class="fieldset-legend">Tun (tun)</fieldset-legend>
					<input
						name="tun"
						type="text"
						class="input w-full"
						placeholder="well-net"
						value={settings.tun}
						disabled={pending.value}
					/>
					<div class="label">tun设备名称</div>
				</fieldset>
			</div>
			<div class="join-item flex-1">
				<fieldset class="fieldset">
					<fieldset-legend class="fieldset-legend">随应用启动 (auto_start)</fieldset-legend>
					<select
						name="auto_start"
						class="select w-full"
						value={`${settings.auto_start}`}
						disabled={pending.value}
					>
						<option value="true">开启</option>
						<option value="false">不开启</option>
					</select>
					<div class="label">未填写的话则会使用id来做显示</div>
				</fieldset>
			</div>
		</div>
		<fieldset class="fieldset">
			<fieldset-legend class="fieldset-legend">监听地址 (listen)</fieldset-legend>
			<div class="join">
				<input
					name="listen"
					type="text"
					class="input w-full join-item"
					placeholder="127.0.0.1:7799"
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
					修改
				</label>
			</div>
			<div class="label">监听地址修改后需要重启并会跳转到新地址</div>
		</fieldset>
		<div class="my-6">
			<button type="submit" class="btn btn-primary btn-block my-1" disabled={pending.value}>
				{#if newSite != data.settings.listen}
					保存后退出并重启
				{:else}
					<!--  -->
					{#if settings.running}
						保存并重启
					{:else}
						保存
					{/if}
				{/if}
			</button>
			<div class="label text-sm">此处的配置需要重启后才能生效</div>
		</div>
	</form>
</div>
