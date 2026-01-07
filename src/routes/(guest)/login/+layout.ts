import { pb } from '$lib/pb'

export async function load({ parent, depends, fetch }) {
	let { subnavs } = await parent()

	return {
		subnavs: [...subnavs, { name: '登录', link: '/login/' }],
	}
}
