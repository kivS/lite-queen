/**
 * Guide Layout is the layout we're going to put the mdx articles(children) inside of
 * Here we're using TailwindCSS typography to style all the markdown inside
 */
export function GuideLayout({ children }) {
	return (
		<div className="prose w-[95%] p-2 mx-5 dark:prose-invert prose-h1:text-balance prose-h1:text-center typography">
			{children}
		</div>
	);
}
