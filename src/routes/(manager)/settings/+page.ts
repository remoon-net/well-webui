import { pb } from '$lib/pb.js'

export async function load({ fetch, depends }) {
	depends('app:settings')
	let settings = await pb.send<Settings>('/api/ipc/settings', { fetch })
	// console.log(settings)
	return {
		settings,
	}
}

interface Settings {
	auto_start: boolean
	ip6_addr: string
	ip4_route: string
	listen: string
	tun: string
	wg_key: string
	running: boolean
	mac: string
}
