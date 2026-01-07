<script lang="ts">
	const { children } = $props()
	import Header, { key as ctxKey } from './header.svelte'
	import { page } from '$app/state'
	import { setContext, type Snippet } from 'svelte'
	import { beforeNavigate } from '$app/navigation'
	let actions = $state<Snippet>()
	setContext(ctxKey, (btns: Snippet) => {
		actions = btns
	})
</script>

<div class="flex flex-col min-h-screen">
	<header class="sticky bg-base-100 top-0 shadow-sm z-99">
		<Header
			{actions}
			navs={[
				{
					name: '主页',
					link: '/',
				},
				{
					name: '信令中继器',
					link: '/linkers/',
				},
				{
					name: '打洞服务器',
					link: '/ices/',
				},
				{
					name: '设置',
					link: '/settings/',
					disabled: true,
				},
			]}
		/>
	</header>
	{#if page.data.heroLayout}
		<div class="flex-1 flex flex-col justify-center">
			<div>
				{@render children()}
			</div>
		</div>
	{:else}
		<div class="flex-1">
			<div>
				{@render children()}
			</div>
		</div>
	{/if}
	<footer class="footer sm:footer-horizontal footer-center bg-base-200 text-base-content p-3">
		<aside>
			<p>
				自由软件. 源代码仓库:
				<a target="source_repo" class="link" href="https://github.com/remoon-net/well">
					remoon.net/well
				</a>
			</p>
		</aside>
	</footer>
</div>
