import { pb, type ICE } from '$lib/pb'

export async function load({ fetch, depends }) {
	depends('app:ices')
	let ices = await pb.collection<ICE>('ices').getFullList({ fetch })
	return {
		ices,
	}
}
