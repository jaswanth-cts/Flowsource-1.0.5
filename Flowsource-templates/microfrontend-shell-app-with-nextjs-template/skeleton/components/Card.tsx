import React from "react";
import { useVariant } from "@unleash/nextjs";

export default function Card() {
	const variant = useVariant("newUI");

	let backgroundColor = "bg-success";

	if (variant.feature_enabled) {
		switch (variant.name) {
			case "A":
				backgroundColor = "bg-danger"; // Red background
				break;
			case "B":
			default:
				backgroundColor = "bg-success"; // Green background
				break;
		}
		return (
			<div
				className="d-flex justify-content-center align-items-center"
				style={{ height: "200px" }}
			>
				<div
					className={`card text-center text-white ${backgroundColor}`}
					style={{ width: "500px" }}
				>
					<div className="card-body">
						<h5 className="card-title">Variant: {variant.name}</h5>
						<p className="card-text">
							This card is rendered based on the feature flag variant.
						</p>
					</div>
				</div>
			</div>
		);
	}
}
