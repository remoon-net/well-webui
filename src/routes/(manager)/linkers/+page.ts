import { pb, type Linker } from '$lib/pb.js'

export async function load({ fetch, depends }) {
	depends('app:linkers')
	let linkers = await pb.collection<Linker>('linkers').getFullList({ fetch })
	return {
		linkers,
	}
}
