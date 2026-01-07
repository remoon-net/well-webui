<script lang="ts">
	import Iconify from '@iconify/svelte'
	let { data } = $props()
	import Panel from './panel.svelte'
	import { invalidate } from '$app/navigation'
	import { DateTime } from 'luxon'
	let expired = $derived.by(() => {
		data
		let now = DateTime.now()
		return now.plus({ seconds: -120 })
	})
	import Edit from '@iconify-icons/heroicons/pencil-square'
	import Plus from '@iconify-icons/heroicons/plus'
	import Refresh from '@iconify-icons/heroicons/arrow-path'
	import Connected from '@iconify-icons/heroicons/link'
	let pending = withPending()
	import { setActions } from '../header.svelte'
	import { withPending } from '$lib/pending.svelte'
	setActions(actions)
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

<Panel></Panel>
<div class="container mx-auto">
	<ul class="list">
		{#each data.peers as p, i}
			{@const handshaked = DateTime.fromSQL(p.handshaked)}
			{@const connected = handshaked > expired}
			{@const ip4in6 = p.expand.ip4in6}
			<li class="list-row px-0">
				<div class="label">
					<button
						type="button"
						class="btn btn-sm btn-square btn-outline"
						disabled={p.disabled}
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
						{#if ip4in6}
							<span class="label">IPv6</span>:
							<span class:label={!connected}>{ip4in6}</span>
							<br />
						{/if}
						{#if p.ipv6}
							<span class="label">IPv6</span>: <span class:label={!connected}>{p.ipv6}</span>
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
