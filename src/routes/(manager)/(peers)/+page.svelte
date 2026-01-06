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
	import { setActions } from '../header.svelte'
	setActions(actions)
</script>

{#snippet actions()}
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
				<div class="label tooltip tooltip-right" data-tip="始终连接">
					<input
						type="checkbox"
						class="checkbox"
						name="default"
						value="true"
						readonly
						checked={p.auto > 0}
						onclick={(e) => e.preventDefault()}
					/>
				</div>
				<div>
					<div class="mb-1">
						{p.name || p.pubkey}
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
