import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";

export const metadata = {
	title: "FAQ - Lite Queen | Common Questions Answered",
	description: "Find answers to the most common questions about Lite Queen.",
};

export default async function FaqPage() {
	return (
		<main>
			<nav className="max-w-screen-2xl mx-auto flex gap-4 items-center place-content-between mt-2  font-medium">
				<Link href="/" className="ml-6">
					<Logo className="size-10" />
				</Link>

				<ThemeToggle className="mr-5 size-5 " />
			</nav>

			<div className="flex flex-col">
				<h1
					className="text-4xl text-center font-bold  mt-10 mb-20"
					title="Frequently Asked Questions"
				>
					FAQ
				</h1>

				<div className="w-full px-20  *:my-3 ">
					<details>
						<summary className="text-xl">
							<strong>What about my data, what do you do with it?</strong>
						</summary>
						<p>
							<strong>Nothing!</strong> All the data is kept on your servers and
							nothing is sent outside nor used.
						</p>
					</details>
				</div>

				<p className="text-center mt-20">
					You still have questions?{" "}
					<a
						href="https://github.com/kivS/lite-queen/discussions/new?category=q-a"
						className="underline"
					>
						Let's us know.
					</a>
				</p>
			</div>
		</main>
	);
}
