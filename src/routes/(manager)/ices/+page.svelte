<script lang="ts">
	import { invalidate } from '$app/navigation'
	import { errStr, pb, type ICE } from '$lib/pb'
	import { withPending } from '$lib/pending.svelte.js'
	let { data } = $props()
	import Edit from '@iconify-icons/heroicons/pencil-square'
	import Plus from '@iconify-icons/heroicons/plus'
	import Iconify from '@iconify/svelte'
	function emptyICE() {
		return {
			id: '',
			name: '',
			urls: '',
			username: '',
			credential: '',
			default: true,
		}
	}
	let iceState = $state<ICE>(emptyICE() as any)
	async function deleteICE(id: string) {
		await pb.collection('ices').delete(id)
		await invalidate('app:ices')
	}
	async function updateICE(data: FormData) {
		if (!data.get('default')) {
			data.set('default', 'false')
		}
		if (iceState.id) {
			await pb.collection('ices').update(iceState.id, data)
		} else {
			await pb.collection('ices').create(data)
		}
		await invalidate('app:ices')
	}
	let pending = withPending()
	let deleteModalOpen = $state(false)
	let editModalOpen = $state(false)
	let moreOptsOpened = $state(false)
	import { setActions } from '../header.svelte'
	import { getShowToast } from '$lib/Toast.svelte'
	setActions(actions)
	const showToast = getShowToast()
</script>

{#snippet actions()}
	<button
		type="button"
		class="btn btn-square btn-ghost"
		onclick={() => {
			Object.assign(iceState, emptyICE())
			editModalOpen = true
		}}
	>
		<Iconify icon={Plus}></Iconify>
	</button>
{/snippet}

<div class="container mx-auto">
	<ul class="list">
		{#each data.ices as ice}
			<li class="list-row px-0">
				<div class="label tooltip tooltip-right" data-tip="默认使用">
					<input
						type="checkbox"
						class="checkbox"
						name="default"
						value="true"
						readonly
						checked={ice.default}
						onclick={(e) => e.preventDefault()}
					/>
				</div>
				<div>
					<h3 class="font-bold">{ice.name || ice.id}</h3>
					<p>{ice.urls}</p>
				</div>
				<button
					type="button"
					class="btn btn-square btn-ghost"
					onclick={() => {
						Object.assign(iceState, ice)
						editModalOpen = true
						if (ice.username) {
							moreOptsOpened = true
						} else {
							moreOptsOpened = false
						}
					}}
				>
					<Iconify icon={Edit}></Iconify>
				</button>
			</li>
		{/each}
		<li class="list-row px-0">
			<div></div>
			<div class="label mx-auto">没有更多啦</div>
			<div></div>
		</li>
	</ul>
</div>

<input type="checkbox" id="peer-update-modal" class="modal-toggle" bind:checked={editModalOpen} />
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
								msg: `登录出错: ${errStr(err)}`,
							})
						},
					)
			}}
		>
			<h3 class="text-lg font-bold">
				{#if iceState.id}
					更新STUN
				{:else}
					添加STUN
				{/if}
			</h3>
			<fieldset class="fieldset">
				<fieldset-legend class="fieldset-legend">称呼 (name)</fieldset-legend>
				<input
					name="name"
					type="text"
					class="input w-full"
					placeholder="输入便于分辨的称呼"
					bind:value={iceState.name}
					disabled={pending.value}
				/>
				<div class="label">未填写的话则会使用id来做显示</div>
			</fieldset>
			<fieldset class="fieldset">
				<fieldset-legend class="fieldset-legend">
					<span> 地址 (urls)* </span>
					<div class="label">
						默认使用
						<input
							name="default"
							value="true"
							type="checkbox"
							class="toggle"
							bind:checked={iceState.default}
						/>
					</div>
				</fieldset-legend>
				<input
					name="urls"
					type="url"
					class="input w-full"
					placeholder="stun://stun.remoon.net:80"
					bind:value={iceState.urls}
					disabled={pending.value}
					required
				/>
				<div class="label">填stun服务器即可</div>
			</fieldset>
			<div class="collapse collapse-arrow" class:show-x-hidden={moreOptsOpened}>
				<input type="checkbox" bind:checked={moreOptsOpened} />
				<div class="collapse-title ps-0">认证选项</div>
				<div class="collapse-content p-0">
					<fieldset class="fieldset">
						<fieldset-legend class="fieldset-legend">用户名 (username)</fieldset-legend>
						<input
							name="username"
							type="text"
							class="input w-full"
							placeholder="TURN Server 用户名"
							bind:value={iceState.username}
							disabled={pending.value}
						/>
						<div class="label">TURN Server 用户名</div>
					</fieldset>
					<fieldset class="fieldset">
						<fieldset-legend class="fieldset-legend">密码 (credential)</fieldset-legend>
						<input
							name="credential"
							type="text"
							class="input w-full"
							placeholder="TURN Server 密码"
							bind:value={iceState.credential}
							disabled={pending.value}
						/>
						<div class="label">只支持密码方式认证</div>
					</fieldset>
				</div>
			</div>
			<div class="modal-action">
				<div class="flex-1">
					{#if iceState.id}
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
				<label for="peer-update-modal" class="btn btn-outline" class:btn-disabled={pending.value}>
					取消
				</label>
				<button type="submit" class="btn btn-primary" disabled={pending.value}>
					{#if iceState.id}
						更新
					{:else}
						添加
					{/if}
				</button>
			</div>
		</form>
	</div>
	<label class="modal-backdrop" for="peer-update-modal">Close</label>
</div>

<input type="checkbox" id="peer-delete-modal" class="modal-toggle" bind:checked={deleteModalOpen} />
<div class="modal" role="dialog">
	<div class="modal-box">
		<h3 class="text-lg font-bold">ICE删除确认</h3>
		<p class="py-4 break-all">
			你将要删除ICE:<br />
			<b>{iceState.name || iceState.id}</b><br />
			{iceState.urls}
		</p>
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
							await deleteICE(iceState.id)
						})
						.then(
							() => {
								deleteModalOpen = false
							},
							(err) => {
								showToast({
									color: 'error',
									msg: `登录出错: ${errStr(err)}`,
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
