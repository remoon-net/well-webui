import { pb, type Linker } from '$lib/pb'

export async function load({ parent, depends, fetch }) {
	let { subnavs } = await parent()

	depends('wg:status')
	depends('app:linkers')

	let ds = await pb.send<DeviceStatus>('/api/ipc/device', { fetch })
	let linkers = await pb.collection<Linker>('linkers').getFullList({ fetch })

	return {
		subnavs: [...subnavs, { name: 'well net', link: '/' }],
		ds: ds,
		linkers,
	}
}

interface DeviceStatus {
	Pubkey: string
	Routes: string[]
	Running: boolean
	Android: boolean
}
