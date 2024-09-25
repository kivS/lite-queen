import { cn } from "@/lib/utils";
import Image from "next/image";

export function Logo({ className, ...props }) {
	return (
		<Image
			alt="logo image"
			width={35}
			height={35}
			src="/logo.webp"
			className={cn("", className)}
			{...props}
		/>
	);
}
