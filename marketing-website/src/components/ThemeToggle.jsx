"use client";

import { Suspense, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }) {
	const [mounted, setMounted] = useState(false);
	const { resolvedTheme, setTheme } = useTheme();
	const otherTheme = resolvedTheme === "dark" ? "light" : "dark";
	const [count, setCount] = useState(0);

	useEffect(() => {
		setMounted(true);
		const theme = localStorage.getItem("theme");
		if (theme === "light") setCount(0);
		if (theme === "dark") setCount(1);
		if (theme === "system") setCount(2);
	}, []);

	if (!mounted) {
		return (
			<div className="size-5  mr-5">
				{" "}
				<SystemThemeIcon className="" />
			</div>
		);
	}

	return (
		<button
			type="button"
			className={cn("group", className)}
			title={
				count === 0
					? "Light theme"
					: count === 1
						? "Dark theme"
						: "System Theme"
			}
			onClick={(e) => {
				let nextCount;

				if (count >= 2) {
					nextCount = 0;
				} else {
					nextCount = count + 1;
				}

				setCount(nextCount);

				switch (nextCount) {
					case 0:
						setTheme("light");
						break;
					case 1:
						setTheme("dark");
						break;
					case 2:
						setTheme("system");
						break;
				}
			}}
		>
			<span className="sr-only">Switch to {otherTheme} theme</span>

			{count < 1 ? <SunIcon className="" /> : null}
			{count === 1 ? <MoonIcon className="" /> : null}
			{count === 2 ? <SystemThemeIcon className="" /> : null}
		</button>
	);
}

function MoonIcon({ className }) {
	return (
		// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={22}
			height={22}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
		</svg>
	);
}

function SunIcon() {
	return (
		// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={24}
			height={24}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			className="lucide lucide-sun"
		>
			<circle cx={12} cy={12} r={4} />
			<path d="M12 2v2" />
			<path d="M12 20v2" />
			<path d="m4.93 4.93 1.41 1.41" />
			<path d="m17.66 17.66 1.41 1.41" />
			<path d="M2 12h2" />
			<path d="M20 12h2" />
			<path d="m6.34 17.66-1.41 1.41" />
			<path d="m19.07 4.93-1.41 1.41" />
		</svg>
	);
}

function SystemThemeIcon() {
	return (
		// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={24}
			height={24}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			className="lucide lucide-sun-moon"
		>
			<path d="M12 8a2.83 2.83 0 0 0 4 4 4 4 0 1 1-4-4" />
			<path d="M12 2v2" />
			<path d="M12 20v2" />
			<path d="m4.9 4.9 1.4 1.4" />
			<path d="m17.7 17.7 1.4 1.4" />
			<path d="M2 12h2" />
			<path d="M20 12h2" />
			<path d="m6.3 17.7-1.4 1.4" />
			<path d="m19.1 4.9-1.4 1.4" />
		</svg>
	);
}
