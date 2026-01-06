import { pb } from '$lib/pb'
import type { Peer } from '$lib/pb'

export async function load({ fetch, depends }) {
	depends('app:peers')
	let peers = await pb.collection<Peer>('peers').getFullList({ fetch })
	// peers = peers.concat(peers, peers, peers)
	// peers = peers.concat(peers, peers, peers)
	return {
		peers,
	}
}
