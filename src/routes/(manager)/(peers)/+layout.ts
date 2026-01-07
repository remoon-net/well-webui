import { pb } from '$lib/pb'

export async function load({ parent, depends, fetch }) {
	let { subnavs } = await parent()

	depends('wg:status')

	let ds = await pb.send<DeviceStatus>('/api/ipc/device', { fetch })

	return {
		subnavs: [...subnavs, { name: 'well net', link: '/' }],
		ds: ds,
	}
}

interface DeviceStatus {
	Pubkey: string
	Routes: string[]
	Running: boolean
}
