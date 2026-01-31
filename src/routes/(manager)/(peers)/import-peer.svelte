<script lang="ts">
	import { errStr } from '$lib/pb'
	import { withPending } from '$lib/pending.svelte'
	import { getShowToast } from '$lib/Toast.svelte'

	let pending = withPending()
	let open = $state(false)
	const showToast = getShowToast()
</script>

<input type="checkbox" id="import_peer_modal" class="modal-toggle" bind:checked={open} />
<div class="modal" role="dialog">
	<div class="modal-box p-4">
		<form action="/peer/" method="get">
			<h3 class="text-lg font-bold">节点导入</h3>
			<input type="hidden" name="id" value="add" />
			<fieldset class="fieldset">
				<fieldset-legend class="fieldset-legend">节点分享链接</fieldset-legend>
				<textarea
					name="share_link"
					class="textarea w-full"
					placeholder="well-net://[pubkey]/[psk]?[name=name]&[whip=whip1]&[whip=whip2]&[ip6=ip6_addr]"
					rows="7"
					required
				></textarea>
				<div class="label">导入分享链接</div>
			</fieldset>
			<div class="modal-action">
				<label for="import_peer_modal" class="btn btn-ghost" class:btn-disabled={pending.value}>
					取消
				</label>
				<button type="submit" class="btn btn-outline btn-primary" disabled={pending.value}>
					导入
				</button>
			</div>
		</form>
	</div>
	<label class="modal-backdrop" for="import_peer_modal">Close</label>
</div>
