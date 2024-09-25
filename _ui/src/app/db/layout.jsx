"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { DatabaseSwitcher } from "@/components/database-switcher";
import React, { Suspense } from "react";
import GodMode from "./god-mode";
import { AddDatabaseModal } from "@/components/add-database-modal";
import { Loader2Icon, LoaderIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DbTemplate({ children }) {
	const [db_switcher_open, set_db_switcher_open] = React.useState(false);
	const [add_db_modal_open, set_add_db_modal_open] = React.useState(false);

	return (
		<>
			<header className="border-b w-full top-0">
				<div className="container h-16 flex items-center  justify-between">
					<Suspense
						fallback={
							<div>
								<Skeleton className="w-[300px] h-10" />
							</div>
						}
					>
						<DatabaseSwitcher
							setAddDbModalOpen={set_add_db_modal_open}
							open={db_switcher_open}
							setOpen={set_db_switcher_open}
						/>
					</Suspense>

					<Suspense>
						<AddDatabaseModal
							setDbSwitcherOpen={set_db_switcher_open}
							open={add_db_modal_open}
							setOpen={set_add_db_modal_open}
						/>
					</Suspense>

					<Suspense
						fallback={
							<div>
								<Skeleton className="w-[200px] h-10" />
							</div>
						}
					>
						<GodMode />
					</Suspense>

					{/* <ThemeToggle /> */}
				</div>
			</header>
			<Suspense
				fallback={
					<div className="w-full opacity-10 h-dvh flex justify-center items-center ">
						<Loader2Icon className=" size-24 animate-spin" />
					</div>
				}
			>
				{children}
			</Suspense>
		</>
	);
}
