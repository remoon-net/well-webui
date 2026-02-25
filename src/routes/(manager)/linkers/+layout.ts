import { m } from '$lib/paraglide/messages.js'
import { pb, type ICE } from '$lib/pb'

export async function load({ parent, depends, fetch, url }) {
	let { subnavs } = await parent()

	return {
		subnavs: [...subnavs, { name: m.navs_linkers_title(), link: '/linkers/' }],
	}
}
