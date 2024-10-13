import Link from "next/link";
import clsx from "clsx";

export function IconLink({
	children,
	className,
	iconClassName,
	compact = false,
	icon: Icon,
	external = undefined, // New prop to determine if it should use <a>
	...props
}) {
	const LinkComponent = external ? "a" : Link;

	return (
		<LinkComponent
			{...props}
			className={clsx(
				className,
				"group relative isolate flex items-center rounded-lg px-2 py-0.5 text-[0.8125rem]/6 font-medium dark:text-white/30 transition-colors hover:text-landing-accent-light",
				compact ? "gap-x-2" : "gap-x-3",
			)}
		>
			<span className="absolute inset-0 -z-10 scale-75 rounded-lg dark:bg-white/5 opacity-0 transition group-hover:scale-100 group-hover:opacity-100" />
			{Icon && (
				<Icon
					className={clsx(iconClassName ? iconClassName : "h-4 w-4 flex-none")}
				/>
			)}
			<span className="self-baseline dark:text-white">{children}</span>
		</LinkComponent>
	);
}
