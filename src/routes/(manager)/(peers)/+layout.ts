import { pb } from '$lib/pb'

export async function load({ parent, depends, fetch }) {
	let { subnavs } = await parent()

	depends('wg:status')
	let running = await pb.send('/api/ipc/device', { fetch }).then(
		() => {
			return true
		},
		(e) => {
			// console.error(e)
			return false
		},
	)

	return {
		subnavs: [...subnavs, { name: 'well net', link: '/' }],
		running: running,
		routes: ['fdd9:f800::1/24', '192.168.211.1/20'],
	}
}
