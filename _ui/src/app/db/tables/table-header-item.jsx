"use client";

import { Button } from "@/components/ui/button";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";

export default function TableHeaderItem({ table, foreignKeys }) {
	console.debug({ table });
	console.debug({ foreignKeys });

	let fk_item;

	if (foreignKeys) {
		for (const fk of foreignKeys) {
			if (fk.from === table.name) {
				fk_item = fk;
				break;
			}
		}
	}

	return (
		<HoverCard openDelay={400}>
			<HoverCardTrigger asChild>
				<button type="button">{table.name}</button>
			</HoverCardTrigger>
			<HoverCardContent className="overflow-auto max-h-72 w-auto max-w-lg">
				<table className="w-60">
					<tbody>
						<tr>
							<th>Type:</th>
							<td>{table.type}</td>
						</tr>

						<tr>
							<th>Primary Key:</th>
							<td>{String(table.pk === 1)}</td>
						</tr>

						<tr>
							<th>Nullable:</th>
							<td>{String(table.notnull === 0)}</td>
						</tr>

						<tr>
							<th>Default:</th>
							<td>{table.dflt_value}</td>
						</tr>

						{fk_item ? (
							<>
								<tr>
									<th className="h-5">{"  "}</th>
									<td className="h-5">{"  "}</td>
								</tr>

								<tr className="">
									<th>Foreign Key</th>
									<td>
										{fk_item.table} &gt; {fk_item.to}
									</td>
								</tr>

								<tr>
									<th>match</th>
									<td>{fk_item.match}</td>
								</tr>

								<tr>
									<th>on_update</th>
									<td>{fk_item.on_update}</td>
								</tr>

								<tr>
									<th>on_delete</th>
									<td>{fk_item.on_delete}</td>
								</tr>
							</>
						) : null}
					</tbody>
				</table>
			</HoverCardContent>
		</HoverCard>
	);
}
