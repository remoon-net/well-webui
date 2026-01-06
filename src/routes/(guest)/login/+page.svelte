<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { errStr, pb } from '$lib/pb'
	import { withPending } from '$lib/pending.svelte'
	import { getShowToast } from '$lib/Toast.svelte'
	let email = $state('')
	let pass = $state('')
	async function login() {
		let u = page.url.searchParams.get('redirect')
		if (!u) {
			u = '/'
		}
		await pb.collection('_superusers').authWithPassword(email, pass)
		goto(u, { replaceState: true })
	}
	const showToast = getShowToast()
	let pending = withPending()
</script>

<div class="flex flex-col min-h-screen justify-center">
	<div class="container mx-auto">
		<div class="card shadow-sm max-w-sm mx-auto">
			<div class="card-body">
				<form
					method="post"
					onsubmit={(e) => {
						e.preventDefault()
						pending
							.call(async () => {
								await login()
							})
							.then(
								() => {
									showToast({ msg: '登录成功' })
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
					<div class="flex items-center justify-between">
						<h2 class="card-title text-xl">登录</h2>
						<a
							href="https://github.com/remoon-net/well/issues"
							class="link"
							target="source_repo_issues"
						>
							反馈
						</a>
					</div>
					<fieldset class="fieldset">
						<fieldset-legend class="fieldset-legend">邮箱</fieldset-legend>
						<input
							name="email"
							type="email"
							class="input w-full"
							placeholder="管理员邮箱帐号"
							bind:value={email}
							disabled={pending.value}
							required
						/>
						<div class="label">
							默认邮箱是:
							<a
								href="#"
								class="link"
								tabindex="-1"
								onclick={(e) => {
									e.preventDefault()
									email = 'well@remoon.net'
								}}
							>
								well@remoon.net
							</a>
						</div>
					</fieldset>
					<fieldset class="fieldset">
						<fieldset-legend class="fieldset-legend">密码</fieldset-legend>
						<input
							name="password"
							type="password"
							class="input w-full"
							placeholder="密码最短需要8位"
							bind:value={pass}
							required
							disabled={pending.value}
						/>
						<div class="label">
							默认密码是:
							<a
								href="#"
								class="link"
								tabindex="-1"
								onclick={(e) => {
									e.preventDefault()
									pass = 'well@remoon.net'
								}}
							>
								well@remoon.net
							</a>
						</div>
					</fieldset>
					<div class="card-actions mt-4">
						<button type="submit" class="btn btn-primary w-full" disabled={pending.value}>
							登录
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</div>
