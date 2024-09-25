import guideList from "./posts.json";

export default function Guides() {
	return (
		<div>
			<ol className="flex flex-col gap-4 p-2 m-5 items-baseline">
				{guideList.map((g) => (
					<li key={g.slug} className="hover:underline list-decimal text-lg">
						<a href={`/guides/${g.slug}`}>{g.title}</a>
					</li>
				))}
			</ol>
		</div>
	);
}
