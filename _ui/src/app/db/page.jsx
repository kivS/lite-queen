"use client";

import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { wait, ROOT_URL, updatePageTitle, fetcher } from "@/lib/utils";
import Link from "next/link";
import { FileStack, Database, HardDrive, FileCode } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from "@/components/ui/sheet";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import ErrorAlert from "@/components/error-alert";
import RowCount from "./row-count";
import { Skeleton } from "@/components/ui/skeleton";
import TableRelationships from "./tables-relationships";
import { DbSettingsModal } from "./db-settings-modal";
import { Button } from "@/components/ui/button";
import { getDatabaseInfo } from "@/lib/data";

export default function DbPage() {
	const searchParams = useSearchParams();

	const db_id = searchParams.get("db_id");

	const { data, error, isLoading } = getDatabaseInfo(db_id);

	const [isShowTableSchemaActive, setShowTableSchemaActive] = useState(false);
	const [showTableSchemaData, setShowTableSchemaData] = useState([]);

	console.log(data);

	useEffect(() => {
		const page_title = data?.db_alias || "";

		updatePageTitle(page_title);
	}, [data]);

	console.log(data);
	if (data?.ok === false || error) {
		return (
			<div className="flex-grow flex flex-col items-center  justify-center w-full">
				<div>
					<DbSettingsModal db_id={db_id}>
						<Button className="m-4" variant="">
							{" "}
							Update settings or delete DB{" "}
						</Button>
					</DbSettingsModal>
				</div>

				{data.context ? (
					<ErrorAlert error={`${data.message}, ${data.context}`} />
				) : (
					<ErrorAlert error={data.message} />
				)}
			</div>
		);
	}

	return (
		<div className="my-4 md:m-8 flex flex-col gap-10 max-w-screen-xl flex-grow">
			<h1 className="sm:text-3xl inline-flex justify-center items-center">
				<DbSettingsModal db_id={db_id}>
					<Database
						width={24}
						height={24}
						className="inline mr-2 cursor-pointer"
					/>
				</DbSettingsModal>

				{isLoading ? (
					<Skeleton className="h-7 w-1/3" />
				) : (
					<span className="truncate max-w-lg">{data?.db_alias}</span>
				)}
			</h1>

			{/* <div className="m-4">
                <h2 className="text-2xl m-4">Pragmas</h2>

                <div className="flex flex-col rounded-xl border bg-card text-card-foreground shadow p-4">
                    {isLoading ? <Skeleton className="w-full h-36" /> : (
                        <ScrollArea orientation="horizontal">
                            <ul className="flex gap-10 mb-4">
                                {data && Object.entries(data?.db?.pragmas).map(([name, value]) => (
                                    <li key={name}>
                                        <Card className="w-[250px]">
                                            <CardHeader>
                                                <CardTitle className="text-xl">{name}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p>{value}</p>
                                            </CardContent>
                                        </Card>
                                    </li>
                                ))}



                            </ul>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    )}
                </div>
            </div> */}

			<div className="m-4">
				<h3 className="text-2xl m-4 flex gap-1 items-center">
					Tables
					{Object.values(data?.foreign_keys || {}).some(
						(fk) => fk.length > 0,
					) && <TableRelationships dbInfo={data} className="" />}
				</h3>

				<div className="rounded-xl border bg-card text-card-foreground shadow p-4">
					<Table>
						{isLoading ? null : (
							<TableCaption>
								{data?.tables.length}{" "}
								{data?.tables.length === 1 ? "Table" : "Tables"}
							</TableCaption>
						)}
						<TableHeader>
							<TableRow>
								<TableHead />
								<TableHead className="">Name</TableHead>
								<TableHead>Rows</TableHead>
								{/* <TableHead>Method</TableHead> */}
								{/* <TableHead className="text-right">Amount</TableHead> */}
							</TableRow>
						</TableHeader>
						{isLoading ? (
							<TableBody>
								<TableRow>
									<TableCell colSpan={3} className="text-center">
										<Skeleton className="w-full h-44" />
									</TableCell>
								</TableRow>
							</TableBody>
						) : (
							<TableBody>
								{data?.tables.map((name) => (
									<TableRow key={name}>
										<TableCell className="w-4">
											<div className="flex">
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<Button variant="icon" asChild>
																<Link
																	href={`/db/tables?db_id=${db_id}&table=${name}`}
																>
																	{/* <HardDrive className="size-5" /> */}
																	<FileCode className="size-5" />
																</Link>
															</Button>
														</TooltipTrigger>
														<TooltipContent>
															<p>Table records</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>

												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<Button
																variant="icon"
																onClick={() => {
																	setShowTableSchemaData(data?.schemas[name]);
																	setShowTableSchemaActive(true);
																}}
															>
																<HardDrive className="size-5" />
																{/* <FileCode className="size-5" /> */}
															</Button>
														</TooltipTrigger>
														<TooltipContent>
															<p>Table schema info</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</div>
										</TableCell>

										<TableCell className="font-medium">{name}</TableCell>
										<TableCell>
											<RowCount dbId={db_id} table={name} />
										</TableCell>
										{/* <TableCell>{invoice.paymentMethod}</TableCell> */}
										{/* <TableCell className="text-right">{invoice.totalAmount}</TableCell> */}
									</TableRow>
								))}
							</TableBody>
						)}
					</Table>
				</div>
			</div>
			<ShowTableSchema
				isActive={isShowTableSchemaActive}
				setActive={setShowTableSchemaActive}
				data={showTableSchemaData}
			/>
		</div>
	);
}

function ShowTableSchema({ isActive, setActive, data }) {
	const table_name = data?.table?.[0].type === "table" && data?.table?.[0].name;
	return (
		<Sheet open={isActive} onOpenChange={setActive}>
			<SheetContent className="flex w-full sm:w-3/4 flex-col gap-4">
				<SheetHeader>
					<SheetTitle className="truncate text-2xl">
						{table_name} table
					</SheetTitle>
				</SheetHeader>

				<div className="overflow-y-auto overflow-x-hidden pb-10">
					<div className="flex flex-col gap-10 ">
						<div>
							<p className="text-lg py-2">Schema</p>

							<div className="border rounded p-4 overflow-x-auto max-h-96">
								<pre className="">
									<code>{data?.table?.[0].sql}</code>
								</pre>
							</div>
						</div>

						{data?.index && (
							<div className="">
								<p className="text-lg py-2">Indexes</p>

								<div className="flex flex-col gap-5">
									{data?.index?.map((item) => (
										<div
											key={item.name}
											className="border rounded p-4 overflow-x-auto flex flex-col gap-4"
										>
											<div>
												<p className="font-medium text-md text-center">
													{item.name}
												</p>
											</div>

											<div className="border  rounded p-2 w-max">
												<pre className="">
													<code>{item.sql}</code>
												</pre>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
				{/* <SheetFooter>ggdxg</SheetFooter> */}
			</SheetContent>
		</Sheet>
	);
}
