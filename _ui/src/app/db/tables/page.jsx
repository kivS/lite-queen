"use client";

import {
	cn,
	isDbColumnLikelyOfTypeDateTime,
	isValidDateTimeString,
	ROOT_URL,
	timeAgo,
	updatePageTitle,
} from "@/lib/utils";
import {
	Check,
	ChevronRight,
	ChevronsUpDown,
	Database,
	Delete,
	Edit2Icon,
	Expand,
	Loader2,
	LucideArrowUpRightSquare,
	SaveIcon,
	SearchIcon,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { mutate } from "swr";

import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";

import ErrorAlert from "@/components/error-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	addRowToTable,
	deleteTableRow,
	executeRawSqlQuery,
	getDatabaseInfo,
	getTableInfo,
	getTableRow,
	getTableRows,
	updateTableRowData,
} from "@/lib/data";
import RowCount from "../row-count";

import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";

import { useGlobal } from "@/app/global-context";
import ToastActionWithCopyToClipboard from "@/components/toast-action-with-copy-to-clipboard";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast, useToast } from "@/components/ui/use-toast";
import useIsTouchScreen from "@/lib/hooks/use_is_touch_screen";
import TableHeaderItem from "./table-header-item";

export default function DbTablePage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathName = usePathname();
	const { setGodModeOpen, setGodModeCurrentScreen } = useGlobal();

	const db_id = searchParams.get("db_id");
	const table_name = searchParams.get("table");
	const search = searchParams.get("search") || "";
	const search_by = searchParams.get("search_by") || "";

	const isTouchScreen = useIsTouchScreen();

	if (!db_id || !table_name)
		return (
			<div className="w-full justify-center flex mt-10">
				<ErrorAlert error="Missing db_id or table name" />
			</div>
		);

	const [selectedRowIndex, setSelectedRowIndex] = useState(null);
	const [selectedRowData, setSelectedRowData] = useState({});

	const [editTableRowIsActive, setEditTableRowIsActive] = useState(false);
	const [addTableRowIsActive, setAddTableRowIsActive] = useState(false);

	useEffect(() => {
		/**
		 *
		 * @param {KeyboardEvent} event
		 */
		const handleKeyDown = (event) => {
			// shortcut to open the sheet to add a new record
			// Check if 'n' is pressed and the target is not an input or textarea
			// console.log("Pressed key in:", event.target, event);
			// debugger;
			if (
				event.key === "n" &&
				!addTableRowIsActive &&
				!(
					event.target.tagName === "INPUT" ||
					event.target.tagName === "TEXTAREA"
				)
			) {
				event.preventDefault(); // prevent 'n' from being inputed
				event.stopImmediatePropagation();
				setAddTableRowIsActive(true);
			}

			// shortcut to open search in god mod box
			if (
				event.key === "s" &&
				!(
					event.target.tagName === "INPUT" ||
					event.target.tagName === "TEXTAREA"
				)
			) {
				event.preventDefault(); // prevent 's' from being inputed
				event.stopImmediatePropagation();
				setGodModeCurrentScreen("search");
				setGodModeOpen(true);
			}
		};

		// Add event listener
		window.addEventListener("keydown", handleKeyDown);

		// Cleanup function to remove the event listener
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	const {
		rows,
		error,
		isLoading,
		isLoadingMore,
		isEmpty,
		isReachingEnd,
		size,
		setSize,
		mutate,
	} = getTableRows(db_id, table_name, search, search_by);

	console.debug({ rows });

	const { data: tableInfoData } = getTableInfo(db_id, table_name);

	console.debug({ tableInfoData });

	const db_info = getDatabaseInfo(db_id);

	useEffect(() => {
		const page_title =
			`${db_info.data?.db_alias || ""} - ${table_name || ""}` || "";
		updatePageTitle(page_title);
	}, [db_info.data, table_name]);

	const columns = useMemo(() => {
		if (!tableInfoData) {
			return [];
		}
		return tableInfoData?.table_info?.map((table) => {
			// console.debug({ table });

			// If the row field is a foreign key, let's load info on foreign keys
			const foreign_keys = db_info?.data?.foreign_keys[table_name];
			console.debug({ foreign_keys });

			return {
				id: table.name,
				accessorKey: table.name,
				// header: table.name,
				header: <TableHeaderItem table={table} foreignKeys={foreign_keys} />,
				cell: ({ row }) => {
					const value = row.getValue(table.name);

					if (foreign_keys?.some((fk) => fk.from === table.name)) {
						let fk_item;
						for (const fk of foreign_keys) {
							if (fk.from === table.name) {
								fk_item = fk;
								break;
							}
						}

						// console.log({fk_item})

						function ForeignKeyData({ db_id, table, field, value }) {
							const { data, error, isLoading } = getTableRow(
								db_id,
								table,
								field,
								value,
							);

							// console.log({ data, table, db_id, field, value });

							const link_to_foreign_item_record = `/db/tables/?db_id=${db_id}&table=${table}&search=${value}&search_by=${field}`;

							if (isLoading) return <div>Loading...</div>;

							if (data?.ok) {
								return (
									<div>
										<div className="flex justify-end">
											<Link href={link_to_foreign_item_record} title="Open">
												<LucideArrowUpRightSquare className="size-4 text-blue-500" />
											</Link>
										</div>
										<pre>{JSON.stringify(data.data, null, 2)}</pre>
									</div>
								);
							}

							return <pre>{JSON.stringify(data.message, null, 2)}</pre>;
						}

						console.log({ isTouchScreen });
						if (isTouchScreen) {
							return (
								<Popover>
									<PopoverTrigger asChild>
										<Button variant="ghost" className="text-blue-500 underline">
											{value}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="overflow-auto max-h-72 w-auto max-w-lg">
										<ForeignKeyData
											db_id={db_id}
											table={fk_item.table}
											field={fk_item.to}
											value={value}
										/>
									</PopoverContent>
								</Popover>
							);
						}

						return (
							<HoverCard openDelay={400}>
								<HoverCardTrigger asChild>
									<Button
										variant="ghost"
										className="hover:cursor-default text-blue-500 underline"
									>
										{value}
									</Button>
								</HoverCardTrigger>
								<HoverCardContent className="overflow-auto max-h-72 w-auto max-w-lg">
									<ForeignKeyData
										db_id={db_id}
										table={fk_item.table}
										field={fk_item.to}
										value={value}
									/>
								</HoverCardContent>
							</HoverCard>
						);
					}

					// let's make sure that long text is truncated and
					// on hover we can see the full text
					const char_limit = 75;
					if (value && value.length > char_limit) {
						const truncated_value = `${value.slice(0, char_limit)}...`;

						if (isTouchScreen) {
							return (
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="ghost"
											className="hover:cursor-default text-blue-500 underline truncate"
										>
											{truncated_value}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="overflow-auto max-h-72 w-auto max-w-lg">
										<div className="">{value}</div>
									</PopoverContent>
								</Popover>
							);
						}

						return (
							<HoverCard openDelay={400}>
								<HoverCardTrigger asChild>
									<Button
										variant="ghost"
										className="hover:cursor-default text-blue-500 underline truncate"
									>
										{truncated_value}
									</Button>
								</HoverCardTrigger>
								<HoverCardContent className="overflow-auto max-h-72 w-auto max-w-lg">
									<div className="">{value}</div>
								</HoverCardContent>
							</HoverCard>
						);
					}

					// If we detect that a field is a datetime let's put a relative
					// time ago in a tooltip
					if (
						table.dflt_value === "CURRENT_TIMESTAMP" ||
						isValidDateTimeString(value)
					) {
						const time_ago = timeAgo(value);
						if (time_ago != null) {
							return (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger>{value}</TooltipTrigger>
										<TooltipContent>
											<span>{time_ago}</span>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							);
						}
					}

					return <div>{value}</div>;
				},
			};
		});
	}, [tableInfoData, isTouchScreen, db_info, db_id, table_name]);

	console.debug({ columns });

	const table = useReactTable({
		data: rows,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	if (error)
		return (
			<div className="w-full justify-center flex mt-10">
				<ErrorAlert error={error} />
			</div>
		);

	return (
		<div className="mx-2 my-4 md:m-8 flex flex-col gap-10 max-w-screen-xl flex-grow">
			<h1 className="text-3xl text-center flex justify-center items-center gap-2">
				<Link href={`/db?db_id=${db_id}`} title="Go back">
					<Database width={24} height={24} />
				</Link>

				<ChevronRight width={24} height={24} />

				<p className="inline text-2xl">{table_name}</p>
			</h1>

			{addTableRowIsActive ? (
				<AddTableRow
					isActive={addTableRowIsActive}
					setIsActive={setAddTableRowIsActive}
					dbId={db_id}
					dbInfo={db_info?.data}
					tableName={table_name}
					tableInfo={tableInfoData?.table_info}
					refreshTableData={mutate}
				/>
			) : null}

			{editTableRowIsActive ? (
				<EditTableRow
					dbId={db_id}
					dbInfo={db_info?.data}
					tableName={table_name}
					tableInfo={tableInfoData?.table_info}
					rowIndex={selectedRowIndex}
					rowData={selectedRowData}
					setRowData={setSelectedRowData}
					isActive={editTableRowIsActive}
					setIsActive={setEditTableRowIsActive}
					refreshTableData={mutate}
				/>
			) : null}

			<div className="flex flex-col mt-8 max-h-[60dvh] rounded-xl border bg-card text-card-foreground shadow p-4 overflow-y-auto">
				<div className="flex justify-end">
					{search && search_by && (
						<Button
							className="justify-start flex gap-1"
							variant="link"
							onClick={() => {
								const params = new URLSearchParams(searchParams);
								params.delete("search");
								params.delete("search_by");

								router.push(`${pathName}?${params.toString()}`);
							}}
						>
							<Delete className="size-5" /> <span>clear search</span>
						</Button>
					)}

					<Button
						variant="icon"
						title="Search(s)"
						className="w-[50px] "
						onClick={(e) => {
							console.log("let's go to search");
							setGodModeCurrentScreen("search");
							setGodModeOpen(true);
						}}
					>
						<SearchIcon />
					</Button>
				</div>
				<Table className="">
					<TableHeader className="">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								<TableHead
									key="actions"
									className="sticky top-0 z-10 bg-card"
								/>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead
											key={header.id}
											className="sticky top-0 z-10 bg-card"
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					{isLoading ? (
						<TableBody>
							<TableRow>
								<TableCell colSpan={columns.length} className="text-center">
									<Skeleton className="h-36" />
								</TableCell>
							</TableRow>
						</TableBody>
					) : (
						<TableBody>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
									>
										<TableCell className="w-4">
											<Button
												variant="icon"
												className=""
												data-index={row.id}
												onClick={(e) => {
													// debugger;
													const index = e.currentTarget.dataset.index;
													setSelectedRowIndex(index);
													setSelectedRowData(rows[index] ?? null);
													setEditTableRowIsActive(true);
												}}
											>
												<Edit2Icon width={24} height={24} className="w-4 h-4" />
											</Button>
										</TableCell>

										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center"
									>
										No results.
									</TableCell>
								</TableRow>
							)}

							{!isReachingEnd && !isLoading && (
								<div className="py-4 w-52">
									<Button
										onClick={() => setSize(size + 1)}
										disabled={isLoadingMore || isReachingEnd}
										className="text-xs"
									>
										{isLoadingMore
											? "Loading..."
											: isReachingEnd
												? "No more data"
												: "Load more"}
									</Button>
								</div>
							)}
						</TableBody>
					)}
				</Table>

				<Separator />

				<div>
					<Button
						variant="link"
						onClick={(e) => {
							setAddTableRowIsActive(true);
						}}
						className="text-sm"
					>
						Add new(n)
					</Button>
				</div>

				<div className="flex-1 text-sm text-muted-foreground m-2 text-center">
					<RowCount
						isSearch={
							searchParams.has("search") && searchParams.has("search_by")
						}
						dbId={db_id}
						table={table_name}
						suffix={"rows"}
					/>
				</div>
			</div>
		</div>
	);
}

function AddTableRow({
	isActive,
	setIsActive,
	dbInfo,
	tableInfo,
	refreshTableData,
	dbId,
	tableName,
}) {
	const [isSaving, setIsSaving] = useState(false);
	const { toast } = useToast();

	// used to reset the foreignKey custom elements after a submit
	const [resetKey, setResetKey] = useState(0);

	const foreign_keys = dbInfo?.foreign_keys[tableName] || [];

	// console.log({tableInfo})
	// console.log({foreign_keys})

	return (
		<Sheet open={isActive} onOpenChange={setIsActive}>
			<SheetContent className="flex w-full sm:w-3/4 flex-col gap-4">
				<SheetHeader>
					<SheetTitle>New Record</SheetTitle>
					{/* <SheetDescription>
                    test
                    </SheetDescription> */}
				</SheetHeader>

				<form
					id="addTableRowForm"
					action="#"
					method="post"
					onSubmit={(e) => handleSubmit(e)}
					className="overflow-auto px-2 flex-grow border-b-2 border-muted mb-2"
				>
					<div className="flex flex-col gap-5 mb-4">
						{tableInfo?.map((col) => (
							<div key={col.cid}>
								<Label htmlFor={col.cid} className="mb-2">
									{col.name}
								</Label>

								{foreign_keys.some((fk) => fk.from === col.name) ? (
									<ForeignKeyRecords
										key={`fk-${resetKey}`}
										dbId={dbId}
										foreignKeys={foreign_keys}
										column={col}
									/>
								) : (
									<Input
										type="text"
										id={col.cid}
										placeholder={
											col.pk === 1
												? `${col.name}(PRIMARY KEY)`
												: `${col.name}...`
										}
										name={col.name}
										tabIndex={col.pk === 1 ? -1 : 0}
										className={cn(
											"mt-1",
											col.pk === 1 ? "bg-muted" : undefined,
										)}
									/>
								)}
								{isDbColumnLikelyOfTypeDateTime(col.type, col.dflt_value) ? (
									<Button
										type="button"
										variant="link"
										className="text-xs"
										data-testing={`${col.cid}`}
										onClick={(e) => handleDateNow(e, col.cid)}
									>
										now
									</Button>
								) : null}
							</div>
						))}
					</div>
				</form>

				<SheetFooter>
					{isSaving ? (
						<Button
							disabled
							variant="outline"
							className="w-full  border border-foreground"
						>
							<Loader2
								width={24}
								height={24}
								className="mr-2 h-4 w-4 animate-spin"
							/>
							Please wait
						</Button>
					) : (
						<Button
							type="submit"
							form="addTableRowForm"
							variant="outline"
							className="w-full border border-foreground"
						>
							<SaveIcon width={24} height={24} className="mr-1 size-3" />
							Save
						</Button>
					)}
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);

	/**
	 * @param {Event} e - The event object
	 */
	function handleDateNow(e, inputID) {
		const inputElement = document.querySelector(`input[id="${inputID}"]`);
		if (inputElement) {
			inputElement.value = new Date().toISOString();
		}
	}

	function handleSubmit(e) {
		e.preventDefault();

		setIsSaving(true);

		const form = e.target;
		const formData = new FormData(form);

		for (const [key, value] of formData.entries()) {
			if (!value) {
				formData.delete(key);
			}
		}

		addRowToTable(dbId, tableName, formData)
			.catch((err) => {
				console.log("failed to add row: ", err);

				toast({
					title: "Failed to add record",
					description: err,
					variant: "destructive",
					action: <ToastActionWithCopyToClipboard text={err} />,
				});
			})
			.then((res) => {
				// console.log(res)
				if (res.ok) {
					refreshTableData();

					// update count element
					mutate(
						`${ROOT_URL}/api/get-table-row-count?db_id=${dbId}&table=${tableName}`,
					);

					// show a success toast that the item was added sucessfully
					toast({
						description: "Row added sucessfully!",
						// duration: 10_000,
					});

					setTimeout(() => {
						setResetKey((prevKey) => prevKey + 1);
						e?.target?.reset();
					}, 200);
				} else {
					res.json().then((err) => {
						toast({
							title: "Failed to add record",
							description: err?.message,
							variant: "destructive",
							action: <ToastActionWithCopyToClipboard text={err?.message} />,
						});
					});
				}
			})
			.finally(() => {
				setIsSaving(false);
			});
	}
}

function EditTableRow({
	dbId,
	dbInfo,
	tableName,
	tableInfo,
	rowIndex,
	setRowData,
	rowData,
	isActive,
	setIsActive,
	refreshTableData,
}) {
	const [isLoading, setIsLoading] = useState(false);

	const [inputValues, setInputValues] = useState({});

	const rowDataRef = useRef(rowData);

	const [isDeletionPending, startDeletionTransition] = useTransition();

	const foreign_keys = dbInfo?.foreign_keys[tableName] || [];
	// console.log({foreign_keys})

	// Update the local state when rowData changes
	useEffect(() => {
		setInputValues(rowData);
	}, [rowData]);

	return (
		<Sheet open={isActive} onOpenChange={setIsActive}>
			<SheetContent
				className="flex flex-col w-full sm:w-3/4  gap-4"
				onOpenAutoFocus={(e) => e.preventDefault()}
			>
				<SheetHeader>
					<SheetTitle>Edit Record</SheetTitle>
					{/* <SheetDescription>
                    test
                    </SheetDescription> */}
				</SheetHeader>

				<form
					id="editRowForm"
					action="#"
					method="post"
					onSubmit={async (e) => handleSubmit(e, rowData)}
					className="overflow-auto px-2 flex-grow border-b-2 border-muted mb-2"
				>
					<div className="flex flex-col gap-5 mb-4">
						{tableInfo?.map((item) => (
							<div key={item.cid}>
								<p className="flex gap-1">
									{item.name}

									{inputValues[item.name]?.length > 50 && (
										<ExpandedTextArea
											field_name={item.name}
											field_value={inputValues[item.name] ?? ""}
											onChange={handleInputChange}
										/>
									)}
								</p>

								{foreign_keys.some((fk) => fk.from === item.name) ? (
									<ForeignKeyRecords
										selectedItem={inputValues[item.name] ?? null}
										dbId={dbId}
										foreignKeys={foreign_keys}
										column={item}
									/>
								) : (
									<Input
										type="text"
										value={inputValues[item.name] ?? ""}
										name={item.name}
										onChange={handleInputChange}
										tabIndex={item.pk === 1 ? -1 : 0}
										className="mt-2"
									/>
								)}
								{isDbColumnLikelyOfTypeDateTime(item.type, item.dflt_value) ||
								isValidDateTimeString(inputValues[item.name]) ? (
									<Button
										type="button"
										variant="link"
										className="text-xs"
										onClick={(e) => handleDateNow(e, item.name)}
									>
										now
									</Button>
								) : null}
							</div>
						))}
					</div>
				</form>

				{/* <Separator className="w-[50%] m-auto" /> */}

				<SheetFooter>
					<div className="w-full flex flex-row items-end gap-10 justify-between ">
						<Button
							form="editRowForm"
							type="button"
							variant="icon"
							onClick={handleDeleteBtn}
							className="p-0 flex gap-1 mt-6 hover:text-red-600"
						>
							<Trash2 width={24} height={24} className="w-4 h-4" />
							{isDeletionPending ? "Deleting..." : "Delete"}
						</Button>

						{/* // to check if any fields changed we can compute the hash of all the fields and compare if it changed. if it did we activate the save button */}
						{/* dont complicate: onchange on each field compare if new value is different than defaultValue is so activate save button */}
						{isLoading ? (
							<Button
								disabled
								variant="outline"
								className=" border border-foreground"
							>
								<Loader2
									width={24}
									height={24}
									className="mr-2 h-4 w-4 animate-spin"
								/>
								Please wait
							</Button>
						) : (
							<Button
								type="submit"
								form="editRowForm"
								variant="outline"
								className=" border border-foreground"
							>
								<Edit2Icon width={24} height={24} className="mr-1 size-3" />
								Save
							</Button>
						)}
					</div>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);

	function handleDateNow(e, inputName) {
		setInputValues({
			...inputValues,
			[inputName]: new Date().toISOString(),
		});
	}

	function handleDeleteBtn(e) {
		if (confirm("Are you sure you want to delete the item?")) {
			if (tableInfo[0]?.pk !== 1)
				return alert(
					"The table doesn't have a primary key so we can't delete the item reliably...",
				);

			const field_id = tableInfo[0]?.name;
			const field_val = rowData[field_id];
			const table_name = tableName;

			startDeletionTransition(async () => {
				try {
					const result = await deleteTableRow(
						dbId,
						table_name,
						field_id,
						field_val,
					);

					console.debug({ result });

					if (!result.ok) {
						toast({
							title: "Failed to delete item",
							description: result?.message,
							variant: "destructive",
							action: <ToastActionWithCopyToClipboard text={result?.message} />,
						});
						return;
					}

					refreshTableData();

					toast({
						description: "Item deleted!",
					});

					setIsActive(false);
				} catch (error) {
					console.error("Failed to delete item: ", error);
					toast({
						title: "Failed to delete item",
						description: error,
						variant: "destructive",
						action: <ToastActionWithCopyToClipboard text={error} />,
					});
					return;
				}
			});
		}
	}

	// Handle input change
	function handleInputChange(e) {
		setInputValues({
			...inputValues,
			[e.target.name]: e.target.value,
		});
	}

	function handleSubmit(e, rowData) {
		e.preventDefault();

		setIsLoading(true);

		const form = e.target;
		const formData = new FormData(form);

		const payload = {};

		const fields_to_update = {};
		for (const [key, value] of formData.entries()) {
			// null when converted from formData as string comes to "" we want to avoid that
			// so we don't get false positives
			if (rowData[key] == null && value === "") continue;

			if (value !== rowData[key]?.toString()) {
				fields_to_update[key] = value;
			}
		}
		payload["fields_to_update"] =
			Object.keys(fields_to_update).length > 0 ? fields_to_update : null;

		payload["db_id"] = dbId;
		payload["table_name"] = tableName;
		payload["original_row_data"] = rowData;
		payload["table_info"] = tableInfo;

		if (!payload.fields_to_update) {
			toast({
				title: "Nothing to update",
				variant: "destructive",
			});
			setIsLoading(false);
			return;
		}

		updateTableRowData(payload)
			.catch((err) => {
				console.log("failed to update row: ", err);
			})
			.then((res) => {
				return res.json();
			})
			.then((res) => {
				console.log(res);

				if (res.ok) {
					refreshTableData();
					toast({
						description: "Row updated sucessfully!",
						// duration: 10_000,
					});

					setTimeout(() => {
						setIsLoading(false);
						setIsActive(false);
					}, 200);
				} else {
					toast({
						title: "Failed to update row",
						description: res?.message,
						variant: "destructive",
						action: <ToastActionWithCopyToClipboard text={res?.message} />,
					});

					setTimeout(() => {
						setIsLoading(false);
					}, 200);
				}
			})
			.finally(() => {
				setTimeout(() => {
					setIsLoading(false);
				}, 200);
			});
	}
}

function ForeignKeyRecords({ column, foreignKeys, dbId, selectedItem = null }) {
	const [fkData, setFkData] = useState([]);
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState("");

	console.log({ selectedItem });
	// console.log({ column })
	// console.log({ value })
	// console.log({ onChange })

	let fk_item;
	for (const fk of foreignKeys) {
		if (fk.from === column.name) {
			fk_item = fk;
			break;
		}
	}
	console.log({ fk_item });

	useEffect(() => {
		const queryFormData1 = new FormData();
		queryFormData1.append("db_id", dbId);
		queryFormData1.append(
			"query",
			`SELECT * from pragma_table_info('${fk_item.table}')`,
		);

		const queryFormData2 = new FormData();
		queryFormData2.append("db_id", dbId);
		queryFormData2.append("query", `SELECT * from ${fk_item.table} LIMIT 100`);

		Promise.all([
			executeRawSqlQuery(queryFormData1),

			executeRawSqlQuery(queryFormData2),
		]).then(([tableInfo, tableData]) => {
			console.log({ tableInfo });
			console.log({ tableData });
			if (tableData.ok) {
				if (tableInfo.ok) {
					const orderedData = tableData.data.map((item) => {
						const orderedItem = {};
						for (const field of tableInfo.data) {
							orderedItem[field.name] = item[field.name];
						}
						return orderedItem;
					});
					setFkData(orderedData);
				} else {
					setFkData(tableData.data);
				}
			}
		});
	}, [dbId, fk_item.table]);

	useEffect(() => {
		if (value === "" && selectedItem) setValue(selectedItem);
	}, [selectedItem, value]);

	return (
		<Popover open={open} onOpenChange={setOpen} modal={true}>
			<input type="hidden" name={column.name} value={value} />
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-full justify-between truncate"
				>
					{/* Show the json object that's selected */}
					{value !== "" ? (
						JSON.stringify(
							fkData.find(
								(item) => item[fk_item.to].toString() === value?.toString(),
							),
						)
					) : (
						<span className="text-muted-foreground">Select item...</span>
					)}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="m-2 p-0 ">
				<Command
					className="w-full"
					loop
					filter={(value, search) => {
						/**
						 * the filter runs on each item in the command group
						 */

						if (!search) return true;
						if (!fkData) return true;

						// TODO: this is computed every time. it can be expensive. duplicated of button text as well
						// find the item corresponding to the index value
						const item_data = fkData.find(
							(item) => item[fk_item.to].toString() === value,
						);

						const searchLowerCase = search.toLowerCase();

						// Function to perform fuzzy search
						const fuzzyMatch = (text, search) => {
							let searchIndex = 0;
							const text_lower = text.toLowerCase();
							for (const char of search) {
								searchIndex = text_lower.indexOf(char, searchIndex) + 1;
								if (searchIndex === 0) return false; // Character not found in text
							}
							return true; // All characters found in text
						};

						if (item_data) {
							return Object.values(item_data).some((value) =>
								// value.toString().toLowerCase().includes(searchLowerCase),
								fuzzyMatch(value.toString(), searchLowerCase),
							);
						}
						return false;
					}}
				>
					<CommandInput placeholder="Search..." />
					<CommandEmpty>No item found.</CommandEmpty>
					<CommandGroup className="h-[400px] w-full overflow-auto">
						{fkData.map((item) => (
							<CommandItem
								// this should be the value of the foreign key item, eg: ID
								key={item[fk_item.to].toString()}
								value={item[fk_item.to].toString()}
								onSelect={(currentValue) => {
									setValue(currentValue === value ? "" : currentValue);
									setOpen(false);
								}}
								className="w-full"
							>
								<Check
									className={cn(
										"mr-2 h-4 w-4",
										value?.toString() === item[fk_item.to].toString()
											? "opacity-100"
											: "opacity-0",
									)}
								/>

								<div>
									<pre className="">{JSON.stringify(item, "", 2)}</pre>
								</div>
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

function ExpandedTextArea({ field_name, field_value, onChange }) {
	return (
		<Dialog>
			<DialogTrigger>
				<Expand className="size-4" title="Expand textarea" />
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{field_name}</DialogTitle>
					<DialogDescription>
						<textarea
							value={field_value}
							onChange={onChange}
							name={field_name}
							cols="30"
							rows="20"
							className="w-full"
						/>
					</DialogDescription>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
