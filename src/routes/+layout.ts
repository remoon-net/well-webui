export const prerender = true

export const trailingSlash = 'always'

export const ssr = false

export async function load() {
	return {
		subnavs: [] as Nav[],
	}
}

export interface Nav {
	name: string
	link: string
}
