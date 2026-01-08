import { pb, type ICE } from '$lib/pb'

export async function load({ parent, depends, fetch, url }) {
	let { subnavs } = await parent()

	return {
		subnavs: [...subnavs, { name: '本机设置', link: '/settings/' }],
	}
}
