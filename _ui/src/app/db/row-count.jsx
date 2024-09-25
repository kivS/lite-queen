import useSWR from "swr";
import {
	wait,
	ROOT_URL,
	updatePageTitle,
	fetcher,
	NumberToHuman,
} from "@/lib/utils";
import { useGetTableRowCount } from "@/lib/data";
import { useSearchParams } from "next/navigation";

function dumbRemovePlural(word) {
	if (!word || typeof word != "string") return "";
	if (word.endsWith("s")) {
		return word.slice(0, -1);
	} else {
		return word;
	}
}

function HumanCount({ count, isSearch, suffix = null }) {
	console.log({ isSearch });
	return (
		<div title={count}>
			{isSearch && "Found "} {NumberToHuman(count)} {suffix ? suffix : ""}
		</div>
	);
}

export default function RowCount({ table, dbId, suffix, isSearch }) {
	const searchParams = useSearchParams();
	const search = searchParams.get("search") || "";
	const search_by = searchParams.get("search_by") || "";

	const { data, isLoading, error } = useGetTableRowCount(
		dbId,
		table,
		search,
		search_by,
	);

	if (isLoading) return "...";

	if (!suffix) return <HumanCount isSearch={isSearch} count={data?.count} />;

	if (data?.count === 1) {
		suffix = dumbRemovePlural(suffix);
	}

	return <HumanCount isSearch={isSearch} count={data?.count} suffix={suffix} />;
}
