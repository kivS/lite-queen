export function Image({ src, alt = "" }) {
	return (
		<div className="overflow-hidden  min-h-40">
			<img
				src={src}
				alt={alt}
				loading="lazy"
				sizes="(min-width: 1280px) 36rem, (min-width: 1024px) 45vw, (min-width: 640px) 32rem, 95vw"
				className="rounded-lg"
			/>
		</div>
	);
}
