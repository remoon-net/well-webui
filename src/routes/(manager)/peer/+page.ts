import { pb, type Peer } from '$lib/pb'
import { redirect } from '@sveltejs/kit'

export async function load({ fetch, url, depends }) {
	let id = url.searchParams.get('id')
	if (!id) {
		redirect(307, '/')
	}
	depends(`app:peer:${id}`)
	let peer: Peer = {
		id: '',
		name: '',
		disabled: false,
		pubkey: '',
		transport_mode: [],
		psk: '',
		ices: [],
		ipv4: 'auto',
		ipv6: '',
		whip: '',
		whip2: '',
		auto: 0,
	} as any
	if (id !== 'add') {
		peer = await pb.collection<Peer>('peers').getOne(id, { fetch })
	}
	return {
		peer,
	}
}
