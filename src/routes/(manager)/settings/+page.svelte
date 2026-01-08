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
</script>

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
