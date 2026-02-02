<script lang="ts">
	import Iconify from '@iconify/svelte'
	let { data } = $props()
	import Panel from './panel.svelte'
	import { invalidate, invalidateAll } from '$app/navigation'
	import { DateTime } from 'luxon'
	let expired = $derived.by(() => {
		data
		let now = DateTime.now()
		return now.plus({ seconds: -120 })
	})
	const showToast = getShowToast()
	import Edit from '@iconify-icons/heroicons/pencil-square'
	import Plus from '@iconify-icons/heroicons/plus'
	import Refresh from '@iconify-icons/heroicons/arrow-path'
	import Connected from '@iconify-icons/heroicons/link'
	import Copy from '@iconify-icons/heroicons/clipboard'
	import PubkeyICON from '@iconify-icons/heroicons/computer-desktop'
	import ImportPeerICON from '@iconify-icons/heroicons/arrow-up-tray'
	import { copy } from 'svelte-copy'
	let pending = withPending()
	import { setActions } from '../header.svelte'
	import { withPending } from '$lib/pending.svelte'
	import { getShowToast } from '$lib/Toast.svelte'
	import { onMount } from 'svelte'
	import { LinkerStatus } from '$lib/pb.js'
	setActions(actions)
	onMount(() => {
		let t = setInterval(() => {
			invalidate('wg:status')
		}, 2e3)
		return () => {
			clearInterval(t)
		}
	})
	import ImportPeerModal from './import-peer.svelte'
</script>

{#snippet actions()}
	<button
		type="button"
		class="btn btn-square btn-ghost"
		disabled={pending.value}
		onclick={() => {
			pending.call(async () => {
				await invalidate('app:peers')
			})
		}}
	>
		{#if pending.value}
			<span class="loading loading-spinner loading-xs"></span>
		{:else}
			<Iconify icon={Refresh}></Iconify>
		{/if}
	</button>
	<a href="/peer/?id=add" class="btn btn-square btn-ghost">
		<Iconify icon={Plus}></Iconify>
	</a>
{/snippet}

<ImportPeerModal></ImportPeerModal>
<Panel></Panel>
<div class="container mx-auto">
	<ul class="list">
		{#if true}
			{@const connected = data.ds.Running}
			{@const routes = data.ds.Routes}
			<li class="list-row px-0">
				<div class="label">
					<a
						href="/settings/"
						class="btn btn-sm btn-square btn-outline"
						class:btn-success={connected}
					>
						<Iconify icon={PubkeyICON}></Iconify>
					</a>
				</div>
				<div>
					<div class="mb-1">
						<span>{data.ds.Pubkey}</span>
						(本机公钥)
					</div>
					<div>
						<span class="label">IPv4</span>:
						<span class:label={!connected}>{routes[1]}</span>
						<br />
						<span class="label">IPv6</span>: <span class:label={!connected}>{routes[0]}</span>
						<br />
						<a href="/linkers/" class="label link">WHIP</a>:
						<div class="inline">
							{#if data.linkers.length === 0}
								<a href="/linkers" class="link">暂无信令中继器, 点击去设置</a>
							{/if}
							{#each data.linkers as lk}
								{#if lk.disabled}
									<span class="me-1 text-neutral">O</span>
								{:else if lk.status == LinkerStatus.Connected}
									<span class="me-1 text-success">O</span>
								{:else}
									<span class="me-1 text-warning">o</span>
								{/if}
							{/each}
						</div>
					</div>
				</div>
				<label
					for="import_peer_modal"
					class="btn btn-square btn-ghost self-center tooltip tooltip-left"
					data-tip="导入节点"
				>
					<Iconify icon={ImportPeerICON}></Iconify>
				</label>
				<button
					type="button"
					class="btn btn-square btn-ghost self-center tooltip tooltip-left"
					data-tip="复制节点分享链接"
					use:copy={{
						text: data.share_link,
						onCopy: () => {
							showToast({ msg: '复制节点分享链接成功' })
						},
					}}
				>
					<Iconify icon={Copy}></Iconify>
				</button>
			</li>
		{/if}
		{#each data.peers as p, i}
			{@const handshaked = DateTime.fromSQL(p.handshaked)}
			{@const connected = handshaked > expired}
			{@const ip4in6 = p.expand.ip4in6}
			<li class="list-row px-0">
				<div class="label">
					<button
						type="button"
						class="btn btn-sm btn-square"
						disabled={p.disabled}
						class:btn-outline={p.auto == 0}
						class:btn-dash={p.auto > 0}
						class:btn-success={connected}
					>
						<Iconify icon={Connected}></Iconify>
					</button>
				</div>
				<div>
					<div class="mb-1">
						<span class:label={p.disabled}>{p.name || p.pubkey}</span>
						{#if p.disabled}
							(未启用)
						{/if}
					</div>
					<div>
						<span class="label">IPv4</span>:
						<span class:label={!connected}>{p.ipv4 || '无连接地址'}</span>
						<br />
						{#if p.ipv6}
							<span class="label">IPv6</span>: <span class:label={!connected}>{p.ipv6}</span>
						{:else if ip4in6}
							<span class="label">IPv6</span>:
							<span class:label={!connected}>{ip4in6}</span>
						{/if}
					</div>
				</div>
				<a href="/peer/?id={p.id}" class="btn btn-square btn-ghost self-center">
					<Iconify icon={Edit}></Iconify>
				</a>
			</li>
		{/each}
		<li class="list-row px-0">
			<div></div>
			<div class="label mx-auto">没有更多啦</div>
			<div></div>
		</li>
	</ul>
</div>
<!-- 添加一个隐藏的 Panel 避免滚动遮盖 -->
<Panel hide></Panel>
