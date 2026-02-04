<script lang="ts">
	import { invalidate } from '$app/navigation'
	import { errStr, LinkerStatus, pb, type ICE, type Linker } from '$lib/pb'
	import { withPending } from '$lib/pending.svelte.js'
	let { data } = $props()
	import Edit from '@iconify-icons/heroicons/pencil-square'
	import Plus from '@iconify-icons/heroicons/plus'
	import Iconify from '@iconify/svelte'
	function emptyLinker() {
		return {
			id: '',
			name: '',
			disabled: false,
			status: '',
			linker: '',
			whip: '',
		}
	}
	let linkerState = $state<Linker>(emptyLinker() as any)
	async function deleteLinker(id: string) {
		await pb.collection('linkers').delete(id)
		await invalidate('app:linkers')
	}
	async function updateICE(data: FormData) {
		if (!data.get('disabled')) {
			data.set('disabled', 'false')
		}
		if (linkerState.id) {
			await pb.collection('linkers').update(linkerState.id, data)
		} else {
			await pb.collection('linkers').create(data)
		}
		await invalidate('app:linkers')
	}
	let pending = withPending()
	let deleteModalOpen = $state(false)
	let editModalOpen = $state(false)
	let moreOptsOpened = $state(false)
	import { setActions } from '../header.svelte'
	setActions(actions)
	import { getShowToast } from '$lib/Toast.svelte'
	import { onMount } from 'svelte'
	const showToast = getShowToast()
	onMount(() => {
		let t = setInterval(() => {
			invalidate('app:linkers')
		}, 2e3)
		return () => {
			clearInterval(t)
		}
	})
	import LinkerItem from './item.svelte'
</script>

{#snippet actions()}
	<button
		type="button"
		class="btn btn-square btn-ghost"
		onclick={() => {
			Object.assign(linkerState, emptyLinker())
			editModalOpen = true
		}}
	>
		<Iconify icon={Plus}></Iconify>
	</button>
{/snippet}

<div class="container mx-auto">
	<ul class="list">
		{#each data.linkers as linker}
			<LinkerItem
				{linker}
				editLinker={(linker) => {
					Object.assign(linkerState, linker)
					editModalOpen = true
				}}
			></LinkerItem>
		{/each}
		<li class="list-row px-0">
			<div></div>
			<div class="label mx-auto">没有更多啦</div>
			<div></div>
		</li>
	</ul>
</div>

<input type="checkbox" id="linker-update-modal" class="modal-toggle" bind:checked={editModalOpen} />
<div class="modal" role="dialog">
	<div class="modal-box">
		<form
			onsubmit={(e) => {
				e.preventDefault()
				let data = new FormData(e.currentTarget)
				pending
					.call(async () => {
						await updateICE(data)
					})
					.then(
						() => {
							editModalOpen = false
						},
						(err) => {
							showToast({
								color: 'error',
								msg: `Linker更新出错: ${errStr(err)}`,
							})
						},
					)
			}}
		>
			<h3 class="text-lg font-bold">
				{#if linkerState.id}
					更新信令中继器
				{:else}
					添加信令中继器
				{/if}
			</h3>
			<fieldset class="fieldset">
				<fieldset-legend class="fieldset-legend">称呼 (name)</fieldset-legend>
				<input
					name="name"
					type="text"
					class="input w-full"
					placeholder="输入便于分辨的称呼"
					bind:value={linkerState.name}
					disabled={pending.value}
				/>
				<div class="label">未填写的话则会使用id来做显示</div>
			</fieldset>
			<fieldset class="fieldset">
				<fieldset-legend class="fieldset-legend">
					<span>中继器地址 (linker)*</span>
					<div class="label">
						禁用
						<input
							name="disabled"
							value="true"
							type="checkbox"
							class="toggle"
							bind:checked={linkerState.disabled}
						/>
					</div>
				</fieldset-legend>
				<input
					name="linker"
					type="url"
					class="input w-full"
					placeholder="https://linker.remoon.net/connect/xxx?token=yyyy"
					bind:value={linkerState.linker}
					disabled={pending.value}
					required
				/>
				<div class="label">
					服务方提供给你的中继器连接地址
					<br />
					也支持 ssh 协议. ssh://user:pass@sshd.host:22/80/127.0.0.1
				</div>
			</fieldset>
			<fieldset class="fieldset">
				<fieldset-legend class="fieldset-legend">信令地址 (whip)</fieldset-legend>
				<input
					name="whip"
					type="text"
					class="input w-full"
					placeholder="https://linker.remoon.net/whip/xxx"
					bind:value={linkerState.whip}
					disabled={pending.value}
				/>
				<div class="label">其他节点用来连接的信令地址</div>
			</fieldset>
			<div class="modal-action">
				<div class="flex-1">
					{#if linkerState.id}
						<button
							type="button"
							class="btn btn-secondary btn-outline"
							onclick={() => {
								editModalOpen = false
								deleteModalOpen = true
							}}
						>
							删除
						</button>
					{/if}
				</div>
				<label for="linker-update-modal" class="btn btn-outline" class:btn-disabled={pending.value}>
					取消
				</label>
				<button type="submit" class="btn btn-primary" disabled={pending.value}>
					{#if linkerState.id}
						更新
					{:else}
						添加
					{/if}
				</button>
			</div>
		</form>
	</div>
	<label class="modal-backdrop" for="linker-update-modal">Close</label>
</div>

<input
	type="checkbox"
	id="linker-delete-modal"
	class="modal-toggle"
	bind:checked={deleteModalOpen}
/>
<div class="modal" role="dialog">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Linker删除确认</h3>
		<p class="py-4 break-all">
			你将要删除Linker:<br />
			<b>{linkerState.name || linkerState.id}</b><br />
			{linkerState.urls}
		</p>
		<div class="modal-action">
			<label for="linker-delete-modal" class="btn btn-outline" class:btn-disabled={pending.value}>
				取消
			</label>
			<button
				type="button"
				class="btn btn-error"
				onclick={() => {
					pending
						.call(async () => {
							await deleteLinker(linkerState.id)
						})
						.then(
							() => {
								deleteModalOpen = false
							},
							(err) => {
								showToast({
									color: 'error',
									msg: `Linker删除出错: ${errStr(err)}`,
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
	<label class="modal-backdrop" for="linker-delete-modal">Close</label>
</div>

<style>
	.show-x-hidden {
		overflow: unset;
	}
</style>
