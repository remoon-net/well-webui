import { pb, type Peer } from '$lib/pb'
import { redirect } from '@sveltejs/kit'
import { fromString, toString } from 'uint8arrays'

export async function load({ fetch, url, depends }) {
	let id = url.searchParams.get('id')
	if (!id) {
		redirect(307, '/')
	}
	depends(`app:peer:${id}`)
	let peer: Peer = {
		id: '',
		name: '',
		disabled: false,
		pubkey: '',
		transport_mode: [],
		psk: '',
		ices: [],
		ipv4: 'auto',
		ipv6: '',
		whip: '',
		whip2: '',
		auto: 0,
	} as any
	let shareLink = url.searchParams.get('share_link')
	if (id !== 'add') {
		peer = await pb.collection<Peer>('peers').getOne(id, { fetch })
	} else if (!!shareLink) {
		let u = new URL(shareLink)

		peer.ipv4 = '' // 通过分享链接导入的节点默认不设置 ipv4, 因为有很多服务监听在IPv4内网上
		peer.pubkey = toString(fromString(u.hostname, 'base64url'), 'base64pad')

		let pp = u.pathname.split('/')
		let psk = pp[1] ?? ''
		if (!!psk) {
			psk = toString(fromString(u.hostname, 'base64url'), 'base64pad')
			peer.psk = psk
		}

		let name = u.searchParams.get('name')
		if (!!name) {
			peer.name = name
		}

		let whips = u.searchParams.getAll('whip').slice(0, 2)
		if (!!whips[0]) {
			peer.whip = whips[0]
		}
		if (!!whips[1]) {
			peer.whip2 = whips[1]
		}

		let ip6 = u.searchParams.get('ip6')
		if (!!ip6) {
			peer.ipv6 = ip6
		}
	}
	return {
		peer,
	}
}
