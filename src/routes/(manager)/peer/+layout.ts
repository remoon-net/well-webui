import { m } from '$lib/paraglide/messages.js'
import { pb, type ICE } from '$lib/pb'

export async function load({ parent, depends, fetch, url }) {
	let { subnavs } = await parent()

	depends('app:ices')
	let ices = await await pb.collection<ICE>('ices').getFullList({ fetch })
	let add = url.searchParams.get('id') == 'add'

	return {
		subnavs: [
			...subnavs,
			{ name: add ? m.navs_peer_add_title() : m.navs_peer_edit_title(), link: '/peer/' },
		],
		ices,
	}
}
