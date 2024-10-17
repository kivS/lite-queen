import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BookIcon, DrumstickIcon } from "@/components/icons";
import Link from "next/link";
import { Suspense } from "react";

export const metadata = {
	title: "Guides - Lite Queen | Guides About Using Lite Queen",
	description:
		"Learn how to use Lite Queen with guides covering topics from installation and more.",
};

export default function GuidesLayout({ children }) {
	return (
		<main>
			<nav className="max-w-screen-2xl mx-auto flex gap-4 items-center place-content-between my-4  font-medium">
				<Link href="/" className="ml-6">
					<Logo className="size-10" />
				</Link>

				<Link
					href="/guides/"
					className="text-xl flex gap-2 items-center hover:scale-105"
				>
					<BookIcon className="size-5" />
					Guides
				</Link>

				<ThemeToggle className="mr-5 size-5 " />
			</nav>

			<div className="flex justify-center my-20">{children}</div>
		</main>
	);
}
