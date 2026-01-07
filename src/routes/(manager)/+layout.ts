import { pb } from '$lib/pb'
import { redirect } from '@sveltejs/kit'

export async function load({ url, fetch }) {
	let u = new URL('/login/', url)
	u.searchParams.set('redirect', url.toString())
	if (!pb.authStore.isValid) {
		redirect(307, u)
	}
	await pb
		.collection('_superusers')
		.authRefresh({ fetch })
		.catch(() => {
			redirect(307, u)
		})
}
