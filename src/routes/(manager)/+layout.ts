import { pb } from '$lib/pb'
import { redirect } from '@sveltejs/kit'

export async function load({ url }) {
	if (!pb.authStore.isValid) {
		let u = new URL('/login', url)
		u.searchParams.set('redirect', url.toString())
		redirect(307, u)
	}
}
