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
							msg: `${!p.id ? '添加' : '更新'}节点出错: ${errStr(err)}`,
						})
					},
				)
		}}
	>
		<fieldset class="fieldset">
			<fieldset-legend class="fieldset-legend">节点称呼 (name)</fieldset-legend>
			<input
				name="name"
				type="text"
				class="input w-full"
				placeholder="输入便于分辨节点的称呼"
				value={p.name}
				disabled={pending.value}
			/>
			<div class="label">未填写的话则会使用id来做显示</div>
		</fieldset>
		<fieldset class="fieldset">
			<fieldset-legend class="fieldset-legend">
				<span>公钥* (pubkey)</span>
				<label class="label">
					禁用
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
				placeholder="WireGuard公钥"
				value={p.pubkey}
				disabled={pending.value}
				required
				readonly={!!p.id}
			/>
			<div class="label">只读不可更改, 是节点的唯一标识</div>
		</fieldset>
		<fieldset class="fieldset">
			<fieldset-legend class="fieldset-legend">
				<span>信令地址 (whip)</span>
				<label class="label">
					始终连接
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
				placeholder="https://well.remoon.net/peer/xxxyyyzzz"
				value={p.whip}
				disabled={pending.value}
			/>
			<div class="label">连接地址. 启用始终连接后将会始终连接此节点</div>
		</fieldset>
		<div class="collapse collapse-arrow" class:show-x-hidden={moreOptsOpened}>
			<input type="checkbox" bind:checked={moreOptsOpened} />
			<div class="collapse-title ps-0">进阶选项</div>
			<div class="collapse-content px-0">
				<fieldset class="fieldset">
					<fieldset-legend class="fieldset-legend">备用连接地址 (whip2)</fieldset-legend>
					<input
						name="whip2"
						type="url"
						class="input w-full"
						placeholder="https://well.remoon.net/peer/xxxyyyzzz2"
						value={p.whip2}
						disabled={pending.value}
					/>
					<div class="label">备用连接地址. 希望永不失联</div>
				</fieldset>
				<fieldset class="fieldset">
					<fieldset-legend class="fieldset-legend">连接策略 (transport_mode)</fieldset-legend>
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
						NoWebSocket: 节省流量, 只使用p2p发送数据, 但有可能会连接失败<br />
						NoWebRTC: 可以保护你的隐私, 但这将会完全使用服务器中转, 极其消耗流量
					</div>
				</fieldset>
				<fieldset class="fieldset">
					<fieldset-legend class="fieldset-legend">IPv4</fieldset-legend>
					<input
						name="ipv4"
						type="text"
						class="input w-full"
						placeholder="填auto就是自动选择一个IPv4地址来使用"
						value={p.ipv4}
						disabled={pending.value}
					/>
					<div class="label">有很多旧的系统只支持IPv4, 所以需要这个, 一般来说更推荐使用IPv6</div>
				</fieldset>
				<fieldset class="fieldset">
					<fieldset-legend class="fieldset-legend">IPv6</fieldset-legend>
					<input
						name="ipv6"
						type="text"
						class="input w-full"
						placeholder="fdd9:f8ff:0:0:a2ce:c8ff:fe1a:2b3c/128"
						value={p.ipv6}
						disabled={pending.value}
					/>
					<div class="label">一般是固定 IPv6 会设置这个, IP范围在 fdd9:f800::/32</div>
				</fieldset>
				<fieldset class="fieldset">
					<fieldset-legend class="fieldset-legend">共享公钥 (psk)</fieldset-legend>
					<input
						name="psk"
						type="text"
						class="input w-full"
						placeholder="由 wg genpsk 生成"
						value={p.psk}
						disabled={pending.value}
					/>
					<div class="label">
						这个共享公钥据说可以用以对抗后量子时代, 但目前感觉没啥用, 所以放在高级选项中
					</div>
				</fieldset>
				<fieldset class="fieldset">
					<fieldset-legend class="fieldset-legend">
						<span>打洞服务器 (ices)</span>
						<label class="label">
							使用默认的
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
							<option value=""> 使用默认打洞服务器 </option>
						{/if}
						{#each data.ices as ice}
							<option value={ice.id} selected={p.ices.includes(ice.id)}>
								{ice.name || ice.id} ({ice.urls})
							</option>
						{/each}
					</select>
					<div class="label">
						<div>
							<a href="/ices/" class="link">打洞服务器</a>用于建立公网直连
						</div>
					</div>
				</fieldset>
			</div>
		</div>
		<div class="my-6">
			<button type="submit" class="btn btn-primary btn-block my-1" disabled={pending.value}>
				{#if p.id}
					更新
				{:else}
					添加
				{/if}
			</button>
			<label
				for="peer-delete-modal"
				class="btn btn-outline btn-secondary btn-block my-1"
				class:btn-disabled={pending.value}
				class:hidden={!p.id}
			>
				删除
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
		<h3 class="text-lg font-bold">节点更新成功</h3>
		<p class="py-4 break-all">节点已经更新成功:<br />{p.name}({p.pubkey})</p>
		<div class="modal-action">
			<label for="peer-updated-modal" class="btn btn-outline" class:btn-disabled={pending.value}>
				继续编辑
			</label>
			<a
				href="/"
				class="btn btn-primary"
				onclick={(e) => {
					e.preventDefault()
					history.back()
				}}
			>
				回到主页
			</a>
		</div>
	</div>
	<label class="modal-backdrop" for="peer-updated-modal">Close</label>
</div>

<!-- Put this part before </body> tag -->
<input type="checkbox" id="peer-delete-modal" class="modal-toggle" />
<div class="modal" role="dialog">
	<div class="modal-box">
		<h3 class="text-lg font-bold">节点删除确认</h3>
		<p class="py-4 break-all">你将要删除节点:<br />{p.name}({p.pubkey})</p>
		<div class="modal-action">
			<label for="peer-delete-modal" class="btn btn-outline" class:btn-disabled={pending.value}>
				取消
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
									msg: `节点删除出错: ${errStr(err)}`,
								})
							},
						)
				}}
				disabled={pending.value}
			>
				删除
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
