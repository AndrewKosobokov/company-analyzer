import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/profile/', '/dashboard/', '/analysis/', '/companies/', '/report/'],
      },
    ],
    sitemap: 'https://metalvector.ru/sitemap.xml',
  }
}









