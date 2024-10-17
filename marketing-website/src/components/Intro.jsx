import Link from "next/link";

import { IconLink } from "@/components/IconLink";
import { Logo } from "@/components/Logo";
import { SignUpForm } from "@/components/SignUpForm";
import { Button } from "./Button";
import Script from "next/script";
import BuyCard from "./buy-card";
import FeaturesCarousel from "./features-carousel";
import { BookIcon, DrumstickIcon, IconSlash, X } from "./icons";

export function Intro() {
	return (
		<>
			<h1 className="mt-14 font-display text-4xl/none font-extrabold dark:text-white text-center">
				Manage <span className="text-landing-accent-light ">SQLite</span>{" "}
				databases on your server with{" "}
				<span className="text-landing-accent-light">ease</span>
			</h1>

			<div className="mt-8">
				<p className="font-medium py-4 text-lg/6 dark:text-gray-300 text-pretty text-center">
					Lite Queen is an open-source SQLite database management software that
					runs on your server.
				</p>
				<div className="flex flex-col   gap-2">
					<a
						target="_blank"
						rel="noreferrer"
						href="https://github.com/kivS/lite-queen"
						className="flex bg-slate-800 text-gray-200 mt-4 border  items-center gap-2  p-1 justify-center w-2/4 mx-auto hover:scale-105   dark:border-gray-900  rounded-lg font-medium "
					>
						<GitHubIcon className="size-6" />
						<span className="md:text-lg">kivS/lite-queen</span>
					</a>
					<a
						target="_blank"
						rel="noreferrer"
						href="https://github.com/sponsors/kivS"
						className="flex mt-4 bg-pink-700 text-gray-200 border items-center gap-2  p-1 justify-center w-2/4 mx-auto hover:scale-105 dark:border-gray-900 rounded-lg font-medium "
					>
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
							className="size-5"
						>
							<title>Sponsor the project</title>
							<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
						</svg>

						<span className="md:text-lg">Sponsor</span>
					</a>

					<hr className="my-8 dark:opacity-20  w-2/3 mx-auto" />

					<a
						href="https://demo.litequeen.com"
						target="_blank"
						rel="noreferrer"
						data-umami-event="Demo button"
						className="flex mt-4 border bg-sky-700 text-gray-200  items-center gap-2  p-2 justify-center w-2/4 mx-auto hover:scale-105 dark:border-gray-900  rounded-lg font-medium "
					>
						<DrumstickIcon className="size-5" />
						<span>Demo</span>
					</a>
				</div>
			</div>
		</>
	);
}

export function IntroFooter() {
	return (
		<p className="flex items-baseline  gap-x-2 text-[0.8125rem]/6 text-gray-500">
			<IconLink href="/guides" icon={BookIcon} className="flex-none">
				Guides
			</IconLink>
			<span>/</span>

			<IconLink href="/faq" icon={FaqIcon} className="flex-none">
				FAQ
			</IconLink>
			<span>/</span>
			<IconLink
				href="https://github.com/kivS/lite-queen/discussions/new?category=q-a"
				icon={SupportIcon}
				data-umami-event="Support link"
				className="flex-none"
				external
			>
				Support
			</IconLink>
			{/* <span>/</span>
			<IconLink
				data-umami-event="RSS link"
				href="/feed.xml"
				icon={FeedIcon}
				className="flex-none"
			>
				RSS
			</IconLink> */}
			<span>/</span>
			<IconLink
				href="https://twitter.com/kivsegrob"
				data-umami-event="X - Vik link"
				className="text-xs "
				icon={XIcon}
				iconClassName="size-3 self-baseline"
				title="Created by Vik"
				external
			/>
		</p>
	);
}

function SupportIcon(props) {
	return (
		// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={16}
			height={16}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			className="lucide lucide-mail-question"
		>
			<path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12.5" />
			<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
			<path d="M18 15.28c.2-.4.5-.8.9-1a2.1 2.1 0 0 1 2.6.4c.3.4.5.8.5 1.3 0 1.3-2 2-2 2" />
			<path d="M20 22v.01" />
		</svg>
	);
}

function FaqIcon(props) {
	return (
		// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={16}
			height={16}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			className="lucide lucide-life-buoy"
		>
			<circle cx={12} cy={12} r={10} />
			<path d="m4.93 4.93 4.24 4.24" />
			<path d="m14.83 9.17 4.24-4.24" />
			<path d="m14.83 14.83 4.24 4.24" />
			<path d="m9.17 14.83-4.24 4.24" />
			<circle cx={12} cy={12} r={4} />
		</svg>
	);
}

// function BookIcon(props) {
// 	return (
// 		<svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor" {...props}>
// 			<path d="M7 3.41a1 1 0 0 0-.668-.943L2.275 1.039a.987.987 0 0 0-.877.166c-.25.192-.398.493-.398.812V12.2c0 .454.296.853.725.977l3.948 1.365A1 1 0 0 0 7 13.596V3.41ZM9 13.596a1 1 0 0 0 1.327.946l3.948-1.365c.429-.124.725-.523.725-.977V2.017c0-.32-.147-.62-.398-.812a.987.987 0 0 0-.877-.166L9.668 2.467A1 1 0 0 0 9 3.41v10.186Z" />
// 		</svg>
// 	);
// }

export function GitHubIcon(props) {
	return (
		<svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor" {...props}>
			<path d="M8 .198a8 8 0 0 0-8 8 7.999 7.999 0 0 0 5.47 7.59c.4.076.547-.172.547-.384 0-.19-.007-.694-.01-1.36-2.226.482-2.695-1.074-2.695-1.074-.364-.923-.89-1.17-.89-1.17-.725-.496.056-.486.056-.486.803.056 1.225.824 1.225.824.714 1.224 1.873.87 2.33.666.072-.518.278-.87.507-1.07-1.777-.2-3.644-.888-3.644-3.954 0-.873.31-1.586.823-2.146-.09-.202-.36-1.016.07-2.118 0 0 .67-.214 2.2.82a7.67 7.67 0 0 1 2-.27 7.67 7.67 0 0 1 2 .27c1.52-1.034 2.19-.82 2.19-.82.43 1.102.16 1.916.08 2.118.51.56.82 1.273.82 2.146 0 3.074-1.87 3.75-3.65 3.947.28.24.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.14.46.55.38A7.972 7.972 0 0 0 16 8.199a8 8 0 0 0-8-8Z" />
		</svg>
	);
}

function FeedIcon(props) {
	return (
		<svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor" {...props}>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M2.5 3a.5.5 0 0 1 .5-.5h.5c5.523 0 10 4.477 10 10v.5a.5.5 0 0 1-.5.5h-.5a.5.5 0 0 1-.5-.5v-.5A8.5 8.5 0 0 0 3.5 4H3a.5.5 0 0 1-.5-.5V3Zm0 4.5A.5.5 0 0 1 3 7h.5A5.5 5.5 0 0 1 9 12.5v.5a.5.5 0 0 1-.5.5H8a.5.5 0 0 1-.5-.5v-.5a4 4 0 0 0-4-4H3a.5.5 0 0 1-.5-.5v-.5Zm0 5a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
			/>
		</svg>
	);
}

function XIcon(props) {
	return (
		<svg
			width={16}
			height={16}
			viewBox="0 0 16 16"
			aria-hidden="true"
			fill="currentColor"
			{...props}
		>
			<path d="M9.51762 6.77491L15.3459 0H13.9648L8.90409 5.88256L4.86212 0H0.200195L6.31244 8.89547L0.200195 16H1.58139L6.92562 9.78782L11.1942 16H15.8562L9.51728 6.77491H9.51762ZM7.62588 8.97384L7.00658 8.08805L2.07905 1.03974H4.20049L8.17706 6.72795L8.79636 7.61374L13.9654 15.0075H11.844L7.62588 8.97418V8.97384Z" />
		</svg>
	);
}
