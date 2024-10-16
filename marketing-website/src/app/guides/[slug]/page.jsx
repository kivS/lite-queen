import { notFound } from "next/navigation";
import posts from "../posts.json";
import Link from "next/link";
import { ArrowLeft } from "@/components/icons";
// import { ArrowLeftIcon } from "@heroicons/react/24/outline";

/**
 * Generate all the possible params for slug, ie, all the blog urls so we can
 * prerender all the blog posts
 * @returns
 */
export async function generateStaticParams() {
	return posts.map((post) => ({
		slug: post.slug,
	}));
}

export async function generateMetadata({ params }) {
	const post = posts.find((post) => post.slug === params.slug);

	if (post) {
		return {
			title: post.title,
			description: post.description,
		};
	}
}

export default async function PostPage({ params }) {
	const post = posts.find((post) => post.slug === params.slug);

	const ContentComponent = require(`../${post.path}`).default;

	if (!post) {
		return notFound();
	}

	return (
		<div className="prose w-[95%] p-2 mx-5 dark:prose-invert prose-h1:text-balance prose-h1:text-center typography">
			<div className="pb-8">
				<Link
					href="/guides/"
					className="no-underline  hover:underline flex gap-2 items-center"
				>
					<ArrowLeft className="size-5" />
					All the posts
				</Link>
			</div>

			<h1>{post.title}</h1>
			<p className="text-sm text-muted-foreground text-center">
				Published on{" "}
				{new Date(post.created_at).toLocaleDateString("en-US", {
					day: "2-digit",
					month: "short",
					year: "numeric",
				})}
			</p>

			{post?.updated_at ? (
				<p className="text-sm text-muted-foreground font-semibold text-center">
					Last updated on{" "}
					{new Date(post.updated_at).toLocaleDateString("en-US", {
						day: "2-digit",
						month: "short",
						year: "numeric",
					})}
				</p>
			) : null}

			<ContentComponent />
		</div>
	);
}
