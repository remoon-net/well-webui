import { pb, type ICE } from '$lib/pb'

export async function load({ parent, depends, fetch }) {
	let { subnavs } = await parent()

	return {
		subnavs: [...subnavs, { name: '打洞服务器', link: '/peer/' }],
	}
}
