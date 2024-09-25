import * as React from "react";

export default function useIsTouchScreen() {
	const [value, setValue] = React.useState(false);

	React.useEffect(() => {
		if (window.matchMedia("(pointer: coarse)").matches) {
			setValue(true);
			console.log("user is using a device with touchscreen!");
		}
	}, []);

	return value;
}
