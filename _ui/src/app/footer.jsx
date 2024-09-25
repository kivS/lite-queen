"use client";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
	CogIcon,
	HomeIcon,
	MessageCircleIcon,
	RefreshCcwDot,
	Settings,
} from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/hooks/use_media_query";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import AppSettings from "./app-settings";
import React, { useTransition } from "react";
import { useGlobal } from "./global-context";

export default function Footer() {
	const [settingsDialogOpen, setSettingsDialongOpen] = React.useState(false);
	return (
		<>
			<div className="mb-4 w-full">
				<Separator />

				<div className="flex gap-5 mt-4 items-center justify-start">
					{/* Home link */}
					<TooltipProvider delayDuration={300}>
						<Tooltip>
							<TooltipTrigger asChild>
								<Link className="ml-4" href="/">
									<HomeIcon width={24} height={24} className="size-4" />
								</Link>
							</TooltipTrigger>
							<TooltipContent>
								<p>Home</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					{/* Settings */}
					<TooltipProvider delayDuration={300}>
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									type="button"
									onClick={() => setSettingsDialongOpen(true)}
								>
									<Settings width={24} height={24} className="size-4" />
								</button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Settings</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					{/* feedback */}
					<TooltipProvider delayDuration={300}>
						<Tooltip>
							<TooltipTrigger asChild>
								<a href="https://github.com/kivS/lite-queen/issues">
									<MessageCircleIcon
										width={24}
										height={24}
										className="size-4"
									/>
								</a>
							</TooltipTrigger>
							<TooltipContent>
								<p>Have feedback?</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					{/* reload page */}
					<TooltipProvider delayDuration={300}>
						<Tooltip>
							<TooltipTrigger asChild>
								<button type="button" onClick={() => window.location.reload()}>
									<RefreshCcwDot width={24} height={24} className="size-4" />
								</button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Reload app</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>

			<SettingsDialog
				open={settingsDialogOpen}
				setOpen={setSettingsDialongOpen}
			/>
		</>
	);
}

function SettingsDialog({ open, setOpen }) {
	// const isDesktop = useMediaQuery("(min-width: 768px)")

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent
				className="max-w-[95%] lg:max-w-4xl overflow-y-auto "
				onOpenAutoFocus={(e) => e.preventDefault()}
			>
				<DialogHeader>
					<DialogTitle className="font-semibold text-3xl">Settings</DialogTitle>
					<DialogDescription>
						Make changes to the app global settings here. Click save when you're
						done.
					</DialogDescription>
				</DialogHeader>

				<AppSettings />
			</DialogContent>
		</Dialog>
	);
}
