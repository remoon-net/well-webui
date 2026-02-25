import { m } from '$lib/paraglide/messages.js'
import { pb } from '$lib/pb'

export async function load({ parent, depends, fetch }) {
	let { subnavs } = await parent()

	return {
		subnavs: [...subnavs, { name: m.navs_login_title(), link: '/login/' }],
	}
}
