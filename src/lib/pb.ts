import PocketBase, { LocalAuthStore } from 'pocketbase'
import type { RecordModel } from 'pocketbase'

const store = new LocalAuthStore('__pb_superuser_auth__')
const pb = new PocketBase(undefined, store)
const pb2 = new PocketBase(undefined, store)

export let authTry = pb2
	.collection('_superusers')
	.authWithPassword('well@remoon.net', 'well@remoon.net')
	.catch((err) => {
		console.error('authTry failed', err)
		return null
	})

pb.beforeSend = async (url, options) => {
	await authTry.then((r) => {
		if (!r) {
			return
		}
		if (!options.headers?.Authorization) {
			options.headers = Object.assign({}, options.headers, { Authorization: r.token })
		}
	})
	return { url, options }
}

export { pb }

export function errStr(err: any): string {
	console.error(err)
	if (typeof err === 'string') {
		return err
	}
	if (err instanceof Error) {
		return err.message
	}
	return '未知错误'
}

export interface BaseModel extends RecordModel {
	created: string
	updated: string
}

export interface Peer extends BaseModel {
	name: string
	disabled: boolean
	handshaked: string
	pubkey: string
	transport_mode: string[]
	psk: string
	ices: string[]
	ipv4: string
	ip_num: number
	ipv6: string
	whip: string
	whip2: string
	auto: number
	expand: {
		ip4in6?: string
		ices: ICE[]
	}
}

export interface ICE extends BaseModel {
	name: string
	urls: string
	username: string
	credential: string
	default: boolean
}

export const enum LinkerStatus {
	Ready = '',
	Connecting = 'connecting',
	Connected = 'connected',
}

export interface Linker extends BaseModel {
	name: string
	disabled: boolean
	status: LinkerStatus
	linker: string
	whip: string
}
