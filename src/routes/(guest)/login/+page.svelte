<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { m } from '$lib/paraglide/messages'
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
									showToast({ msg: m.login_card_submit_ok() })
								},
								(err) => {
									showToast({
										color: 'error',
										msg: `${m.login_card_submit_failed()}: ${errStr(err)}`,
									})
								},
							)
					}}
				>
					<div class="flex items-center justify-between">
						<h2 class="card-title text-xl">{m.login_card_title()}</h2>
						<a
							href="https://github.com/remoon-net/well/issues"
							class="link"
							target="source_repo_issues"
						>
							{m.login_card_report()}
						</a>
					</div>
					<fieldset class="fieldset">
						<fieldset-legend class="fieldset-legend">{m.login_email_input_title()}</fieldset-legend>
						<input
							name="email"
							type="email"
							class="input w-full"
							placeholder={m.login_email_input_placeholder()}
							bind:value={email}
							disabled={pending.value}
							required
						/>
						<div class="label">
							{m.login_email_input_label()}
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
						<fieldset-legend class="fieldset-legend"
							>{m.login_password_input_title()}</fieldset-legend
						>
						<input
							name="password"
							type="password"
							class="input w-full"
							placeholder={m.login_password_input_placeholder()}
							bind:value={pass}
							required
							disabled={pending.value}
						/>
						<div class="label">
							{m.login_password_input_label()}
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
							{m.login_card_submit_btn()}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</div>
