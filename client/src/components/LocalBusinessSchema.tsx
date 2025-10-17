export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "DriveEase",
    "description": "Self-drive car and bike rental service in Bhubaneswar, Odisha. Rent vehicles hourly, daily, or weekly with flexible pickup options and premium membership benefits.",
    "url": typeof window !== 'undefined' ? window.location.origin : '',
    "telephone": "+91-674-212-3456",
    "email": "support@driveease.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Patia",
      "addressLocality": "Bhubaneswar",
      "addressRegion": "Odisha",
      "postalCode": "751024",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "20.3489",
      "longitude": "85.8172"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "20:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "18:00"
      }
    ],
    "priceRange": "₹₹",
    "areaServed": {
      "@type": "City",
      "name": "Bhubaneswar",
      "containedInPlace": {
        "@type": "State",
        "name": "Odisha",
        "containedInPlace": {
          "@type": "Country",
          "name": "India"
        }
      }
    },
    "serviceType": ["Self-drive car rental", "Self-drive bike rental", "Vehicle rental"],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Vehicle Rental Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Hourly Car Rental"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Daily Car Rental"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Weekly Car Rental"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Bike & Scooter Rental"
          }
        }
      ]
    },
    "paymentAccepted": "Cash, Credit Card, Debit Card, PayUMoney",
    "keywords": "self drive car rental bhubaneswar, bike rental odisha, car rental patia, vehicle rental bhubaneswar, hourly car rental odisha, premium car rental bhubaneswar",
    "founder": [
      {
        "@type": "Person",
        "name": "Nitikesh Pattanayak"
      },
      {
        "@type": "Person",
        "name": "Chinmay Gayan"
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
