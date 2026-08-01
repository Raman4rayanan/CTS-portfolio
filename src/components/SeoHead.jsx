import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SeoHead({
  title,
  description,
  canonicalUrl,
  imageUrl,
  pageUrl,
  type = 'website',
  robots = 'index, follow',
  googleSiteVerification,
  bingSiteVerification,
  ga4Id,
  gtmId,
  schema = [], // Array of JSON-LD objects
}) {
  const siteName = 'CTS';
  
  const formattedTitle = title ? `${title} | ${siteName}` : siteName;

  return (
    <Helmet>
      <title>{formattedTitle}</title>
      {description && <meta name="description" content={description} />}
      {robots && <meta name="robots" content={robots} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={formattedTitle} />
      {description && <meta property="og:description" content={description} />}
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      {pageUrl && <meta property="og:url" content={pageUrl} />}
      <meta property="og:type" content={type} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={formattedTitle} />
      {description && <meta name="twitter:description" content={description} />}
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}

      {/* Verification Tags */}
      {googleSiteVerification && <meta name="google-site-verification" content={googleSiteVerification} />}
      {bingSiteVerification && <meta name="msvalidate.01" content={bingSiteVerification} />}

      {/* Google Analytics 4 */}
      {ga4Id && (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}></script>
      )}
      {ga4Id && (
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${ga4Id}');
          `}
        </script>
      )}

      {/* Google Tag Manager */}
      {gtmId && (
        <script>
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}
        </script>
      )}

      {/* Structured Data (JSON-LD) */}
      {schema && schema.map((schemaObj, index) => (
        <script type="application/ld+json" key={`schema-${index}`}>
          {JSON.stringify(schemaObj)}
        </script>
      ))}
    </Helmet>
  );
}
