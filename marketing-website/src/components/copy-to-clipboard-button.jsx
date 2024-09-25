"use client";

import { cn } from "@/lib/utils";

export default function CopyToClipboardButton({ data, className }) {
	return (
		<button
			type="button"
			size="icon"
			variant="ghost"
			title="Copy"
			data-copy_text={data}
			className={cn(
				"group hover:scale-110 hover:shadow-lg hover:bg-black",
				className,
			)}
			onClick={async (e) => {
				const copy_btn = e.currentTarget;
				const command_to_copy = copy_btn.dataset.copy_text;
				console.log({ command_to_copy });

				if (typeof window === "undefined" || !navigator.clipboard?.writeText) {
					return;
				}

				if (!command_to_copy) {
					return;
				}

				navigator.clipboard.writeText(command_to_copy).then(() => {
					copy_btn.dataset.copied = true;
					setTimeout(() => {
						delete copy_btn.dataset.copied;
					}, 2000);
				});
			}}
		>
			<CopyIcon className="w-4 h-4 group-data-[copied]:hidden" />
			<CheckIcon className="hidden w-4 text-green-500 h-4 group-data-[copied]:block" />
		</button>
	);
}

export function CopyIcon({ className }) {
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
			className={className}
		>
			<rect width={14} height={14} x={8} y={8} rx={2} ry={2} />
			<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />{" "}
		</svg>
	);
}

export function CheckIcon({ className }) {
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
			className={className}
		>
			<path d="M20 6 9 17l-5-5" />
		</svg>
	);
}
