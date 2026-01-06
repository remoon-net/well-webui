import type { Handle } from '@sveltejs/kit'
import { paraglideMiddleware } from '$lib/paraglide/server'
import { PB_HOST } from '$env/static/private'

const handleParaglide: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/api')) {
		event.url.host = PB_HOST ?? '127.0.0.1:8090'
		if (PB_HOST.endsWith(':443')) {
			event.url.protocol = 'https'
		}
		event.request.headers.delete('host')
		const req = new Request(event.url, event.request)
		const resp = await fetch(req, { redirect: 'manual' })
		const headers = new Headers(resp.headers)
		headers.delete('Content-Encoding')
		return new Response(resp.body, {
			status: resp.status,
			statusText: resp.statusText,
			headers: headers,
		})
	}
	return paraglideMiddleware(event.request, async ({ request, locale }) => {
		event.request = request

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale),
		})
	})
}

export const handle: Handle = handleParaglide
