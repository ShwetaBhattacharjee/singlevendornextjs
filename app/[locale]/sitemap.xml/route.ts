const BASE_URL = "https://www.hdpartz.com";

function generateSiteMap(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>${BASE_URL}/</loc>
      <lastmod>2024-12-25</lastmod>
      <priority>1.0</priority>
    </url>
  </urlset>`;
}

export async function GET() {
  try {
    // Generate the XML sitemap
    const sitemap = generateSiteMap();

    // Return the static sitemap with proper headers
    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}