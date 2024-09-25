export default function robots() {
	return {
		rules: [
			{
				userAgent: "*",
				allow: ["/"],
				// disallow: [""],
			},
		],
		sitemap: "https://litequeen.com/sitemap.xml",
	};
}
