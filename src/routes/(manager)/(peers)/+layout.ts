import { pb, type Linker } from '$lib/pb'
import { toString, fromString } from 'uint8arrays'

export async function load({ parent, depends, fetch }) {
	let { subnavs } = await parent()

	depends('wg:status')
	depends('app:linkers')

	let ds = await pb.send<DeviceStatus>('/api/ipc/device', { fetch })
	let linkers = await pb.collection<Linker>('linkers').getFullList({ fetch })

	let share_link = genShareLink(ds, linkers)
	console.log(share_link)

	return {
		subnavs: [...subnavs, { name: 'well net', link: '/' }],
		ds: ds,
		linkers,
		share_link,
	}
}

interface DeviceStatus {
	Pubkey: string
	Routes: string[]
	Running: boolean
	Android: boolean
}

function genShareLink(ds: DeviceStatus, linkers: Linker[]) {
	let u = new URL('well-net://pubkey')
	u.host = toString(fromString(ds.Pubkey, 'base64'), 'base64url')
	u.pathname = '/'
	let lks = linkers.filter((lk) => {
		if (!lk.whip) {
			return false
		}
		if (lk.disabled) {
			return false
		}
		return true
	})
	for (let lk of lks.slice(0, 2)) {
		u.searchParams.append('whip', lk.whip)
	}
	let ip6 = ds.Routes[0]
	if (!ip6.startsWith('fdd9:f800:')) {
		ip6 = ip6.replace('/24', '/128')
		u.searchParams.set('ip6', ip6)
	}
	return u.toString()
}
