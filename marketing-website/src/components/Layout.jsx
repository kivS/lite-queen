import { useId } from "react";

import { Intro, IntroFooter } from "@/components/Intro";
import { StarField } from "@/components/StarField";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { Logo } from "./Logo";
import { BookIcon } from "./icons";
import Script from "next/script";

function Timeline() {
	let id = useId();

	return (
		<div className="pointer-events-none absolute inset-0 z-50 overflow-hidden lg:right-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-[32rem] lg:overflow-visible">
			<svg
				className="absolute left-[max(0px,calc(50%-18.125rem))] top-0 h-full w-1.5 lg:left-full lg:ml-1 xl:left-auto xl:right-1 xl:ml-0"
				aria-hidden="true"
			>
				<defs>
					<pattern id={id} width="6" height="8" patternUnits="userSpaceOnUse">
						<path
							d="M0 0H6M0 8H6"
							className="stroke-sky-900/10 xl:stroke-white/10 dark:stroke-white/10"
							fill="none"
						/>
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill={`url(#${id})`} />
			</svg>
		</div>
	);
}

function Glow() {
	let id = useId();

	return (
		<div className="absolute inset-0 -z-10 overflow-hidden dark:bg-gray-950 lg:right-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-[32rem]">
			<svg
				className="absolute -bottom-48 left-[-40%] h-[80rem] w-[180%] lg:-right-40 lg:bottom-auto lg:left-auto lg:top-[-40%] lg:h-[180%] lg:w-[80rem]"
				aria-hidden="true"
			>
				<defs>
					<radialGradient id={`${id}-desktop`} cx="100%">
						<stop offset="0%" stopColor="rgba(56, 189, 248, 0.3)" />
						<stop offset="53.95%" stopColor="rgba(0, 71, 255, 0.09)" />
						<stop offset="100%" stopColor="rgba(10, 14, 23, 0)" />
					</radialGradient>
					<radialGradient id={`${id}-mobile`} cy="100%">
						<stop offset="0%" stopColor="rgba(56, 189, 248, 0.3)" />
						<stop offset="53.95%" stopColor="rgba(0, 71, 255, 0.09)" />
						<stop offset="100%" stopColor="rgba(10, 14, 23, 0)" />
					</radialGradient>
				</defs>
				<rect
					width="100%"
					height="100%"
					fill={`url(#${id}-desktop)`}
					className="hidden lg:block"
				/>
				<rect
					width="100%"
					height="100%"
					fill={`url(#${id}-mobile)`}
					className="lg:hidden"
				/>
			</svg>
			<div className="absolute inset-x-0 bottom-0 right-0 h-px bg-white mix-blend-overlay lg:left-auto lg:top-0 lg:h-auto lg:w-px" />
		</div>
	);
}

function FixedSidebar({ main, footer }) {
	return (
		<div className="relative flex-none overflow-hidden px-6 lg:pointer-events-none lg:fixed lg:inset-0 lg:z-40 lg:flex lg:px-0">
			<Glow />
			<div className="relative flex w-full lg:pointer-events-auto lg:mr-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-[32rem] lg:overflow-y-auto lg:overflow-x-hidden lg:pl-[max(4rem,calc(50%-38rem))]">
				<div className="mx-auto max-w-lg lg:mx-0 lg:flex lg:w-96 lg:max-w-none lg:flex-col lg:before:flex-1 lg:before:pt-6">
					<div className="pb-16 pt-20 lg:pt-0 sm:pb-20  ">
						<div className="absolute top-3 left-4">
							<Link href="/" className="flex gap-2 items-center">
								<Logo id="logo" />
								<span className=" dark:text-slate-200 font-sans text-lg font-semibold dark:font-black">
									Lite Queen
								</span>
							</Link>
						</div>

						<div className="relative">
							{/* <StarField className="-right-44 top-14" /> */}
							{main}
						</div>
					</div>
					<div className="flex flex-1 items-end justify-center pb-4 lg:justify-start lg:pb-6">
						{footer}
					</div>
				</div>
			</div>
		</div>
	);
}

export function Layout({ children }) {
	return (
		<>
			{/* <Script
				src="https://platform.twitter.com/widgets.js"
				strategy="afterInteractive"
			/> */}
			<FixedSidebar main={<Intro />} footer={<IntroFooter />} />
			<div className="absolute top-4 right-4 z-50">
				<ThemeToggle className="" />
			</div>

			<ul className="flex  mr-14 z-50 mt-4 text-sm p-[2px] justify-end">
				<li>
					<Link
						href="/guides"
						className="hover:underline items-center hover:text-landing-accent-light flex gap-2"
					>
						<BookIcon className="size-4" />
						Guides
					</Link>
				</li>
			</ul>

			<p className="lg:w-1/2 z-10 lg:ml-auto opacity-60 text-sm mt-8 -mb-11 lg:-mb-20  text-center font-semibold dark:font-extrabold">
				What's new?
			</p>

			<div className="relative flex-auto bg-white dark:bg-gray-950">
				<Timeline />
				<main className="space-y-20 py-20 sm:space-y-32 sm:py-32">
					{children}
				</main>
			</div>
		</>
	);
}
