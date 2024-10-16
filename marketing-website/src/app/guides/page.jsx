import Link from "next/link";
import guideList from "./posts.json";

export default function Guides() {
	return (
		<div className="container">
			<div className="flex flex-col gap-4 items-center">
				{guideList.map((post) => (
					<Link
						key={post.slug}
						href={`/guides/${post.slug}`}
						className="border p-2 rounded flex md:w-2/3  transition-transform hover:scale-105"
					>
						<div>
							<p className="font-semibold text-lg">{post.title}</p>
							<p className="text-sm text-muted-foreground">
								{new Date(post.created_at).toLocaleDateString("en-US", {
									day: "2-digit",
									month: "short",
									year: "numeric",
								})}
							</p>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
