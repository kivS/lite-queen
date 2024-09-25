"use client";

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./Button";

export default function FeaturesCarousel() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<button
					type="button"
					className="dark:text-white font-medium hover:text-landing-accent-light hover:scale-105"
				>
					Why Lite Queen?
				</button>
			</DialogTrigger>
			<DialogContent
				className="flex justify-center"
				onOpenAutoFocus={(e) => {
					e.preventDefault();
				}}
			>
				<Carousel
					className="text-white border w-full max-w-xs relative"
					opts={{
						align: "start",
						loop: true,
					}}
					plugins={[
						Autoplay({
							delay: 5000,
							stopOnMouseEnter: true,
							stopOnFocusIn: true,
						}),
					]}
				>
					<CarouselContent>
						<CarouselItem>
							<p>Testing</p>
							<p>testing a test</p>
						</CarouselItem>
						<CarouselItem>2</CarouselItem>
						<CarouselItem>3</CarouselItem>
					</CarouselContent>

					<CarouselPrevious />

					<CarouselNext />
				</Carousel>
			</DialogContent>
		</Dialog>
	);
}
