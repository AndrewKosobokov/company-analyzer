export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Металл Вектор",
    "url": "https://metalvector.ru",
    "logo": "https://metalvector.ru/logo.png",
    "description": "B2B SaaS для анализа компаний-покупателей металлопроката",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "RU"
    },
    "sameAs": [
      // Добавь ссылки на соцсети когда будут
    ]
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function SoftwareApplicationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Металл Вектор",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "RUB",
      "lowPrice": "4500",
      "highPrice": "12000"
    },
    "operatingSystem": "Web",
    "description": "SaaS-платформа для анализа потенциальных клиентов в металлоторговле"
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Металл Вектор",
    "url": "https://metalvector.ru",
    "description": "B2B SaaS для анализа компаний-покупателей металлопроката",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://metalvector.ru/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}











































