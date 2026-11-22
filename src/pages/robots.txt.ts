import { getAbsoluteUrl } from '~/lib/posts'

export function GET() {
  return new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${getAbsoluteUrl('/sitemap.xml')}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  )
}
