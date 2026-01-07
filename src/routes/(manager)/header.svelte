<script lang="ts" module>
	import { getContext, type Snippet } from 'svelte'
	export const key = Symbol('')
	export function setActions(btns: Snippet | undefined) {
		let setActions: (btns: Snippet | undefined) => void = getContext(key)
		setActions(btns)
	}
</script>

<script lang="ts">
	interface Nav {
		name: string
		link: string
		disabled?: boolean
		subnav?: Nav[]
	}

	interface Props {
		navs: Nav[]
		actions?: Snippet
	}

	let { navs, actions }: Props = $props()
	import Icon from '@iconify/svelte'
	import Bars3 from '@iconify-icons/heroicons/bars-3'
	import { page } from '$app/state'
	import { beforeNavigate } from '$app/navigation'
	let navs2 = $derived((page.data.subnavs as Nav[]).slice(-2).reverse())
	let opened = $state(false)
	beforeNavigate(() => {
		opened = false
	})
</script>

<div class="drawer">
	<input type="checkbox" id="drawer-nav" class="drawer-toggle" bind:checked={opened} />
	<div class="drawer-content">
		<div class="navbar container mx-auto">
			<div class="navbar-start">
				<label for="drawer-nav" aria-label="open sidebar" class="btn btn-ghost -ms-4">
					<Icon class="text-3xl" icon={Bars3}></Icon>
				</label>
				<a
					href={navs2[1]?.link ?? '/'}
					class="btn btn-ghost text-xl"
					onclick={(e) => {
						// 首页无需返回
						if (!navs2[1]?.link) {
							return
						}
						if (history.length > 1) {
							e.preventDefault()
							history.back()
						}
					}}
				>
					{navs2[0]?.name}
				</a>
			</div>
			<div class="navbar-center"></div>
			<div class="navbar-end">
				{@render actions?.()}
			</div>
		</div>
	</div>
	<div class="drawer-side">
		<label for="drawer-nav" aria-label="close sidebar" class="drawer-overlay"></label>
		<ul tabindex="-1" class="menu menu-lg min-h-full bg-base-100 z-1 w-80 shadow">
			<li class="menu-title">更多设置</li>
			{#each navs as nav, i}
				{@const active = false}
				<li class:menu-disabled={nav.disabled}>
					<a href={nav.link} class:menu-active={active}>{nav.name}</a>
					{#if nav.subnav}
						<ul class="p-2">
							{#each nav.subnav as subnav, j}
								{@const active = false}
								<li>
									<a href={subnav.link} class:menu-active={active}>{subnav.name}</a>
								</li>
							{/each}
						</ul>
					{/if}
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	/* .navbar {
		position: relative;
	}
	.navbar::after {
		content: '';
		display: block;
		height: 700px;
		width: 2px;
		position: absolute;
		left: 50%;
		background-color: red;
	} */
</style>
