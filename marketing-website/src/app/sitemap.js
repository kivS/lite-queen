import { promises as fs } from "fs";
import path from "path";

async function loadData() {
	const jsonDirectory = path.join(process.cwd(), "src/app/guides/posts.json"); // Adjust the path as necessary
	const fileContents = await fs.readFile(jsonDirectory, "utf8");
	const posts = JSON.parse(fileContents); // Parse the JSON data
	// console.log({ posts });
	return posts;
}

export default async function sitemap() {
	const posts = await loadData();

	console.log({ posts });

	return [
		{
			url: "https://litequeen.com/",
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1,
		},
		{
			url: "https://litequeen.com/?show-buy-card=true",
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1,
		},
		{
			url: "https://litequeen.com/guides/",
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1,
		},
		{
			url: "https://litequeen.com/faq/",
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1,
		},

		...posts.map((post) => ({
			url: `https://litequeen.com/guides/${post.slug}`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1,
		})),
	];
}
