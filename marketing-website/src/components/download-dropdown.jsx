import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BuyModal from "./buy-modal";
import { Suspense } from "react";

const executables = [
	{
		name: "Linux arm64",
		link: "https://github.com/kivS/lite-queen/releases",
	},
	{
		name: "Linux x64",
		link: "https://github.com/kivS/lite-queen/releases",
	},
	{
		name: "Apple Silicon",
		link: "https://github.com/kivS/lite-queen/releases",
	},
	{
		name: "Apple Intel x64",
		link: "https://github.com/kivS/lite-queen/releases",
	},
	{
		name: "Docker",
		link: "https://hub.docker.com/r/kivsegrob/lite-queen",
	},
];

export default async function DownloadDropdown() {
	return (
		<div>
			<div className="flex justify-center">
				<DropdownMenu>
					<DropdownMenuTrigger
						data-umami-event="Download executable button"
						className="rounded border p-3 w-80 bg-starryBlue-light font-bold  dark:bg-starryBlue-dark"
					>
						Download
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-80 bg-starryBlue-light dark:bg-starryBlue-dark ">
						{executables.map((item) => (
							<DropdownMenuItem key={item.name} className="hover:opacity-60">
								<a
									href={item.link}
									className="w-full"
									data-umami-event={`${item.name} executable link`}
								>
									{item.name}
								</a>
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
