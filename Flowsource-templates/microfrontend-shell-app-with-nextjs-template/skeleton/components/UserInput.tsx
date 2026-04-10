import React, { useState } from "react";

interface UserInputFormProps {
	onSubmit: (userId: string, region: string) => void;
}

export default function UserInputForm({ onSubmit }: UserInputFormProps) {
	const [userId, setUserId] = useState<string>("");
	const [region, setRegion] = useState<string>("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (userId && region) {
			onSubmit(userId, region);
		} else {
			alert("Please fill in both User ID and Region.");
		}
	};

	return (
		<div
			className="modal show d-block"
			tabIndex={-1}
			style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
		>
			<div className="modal-dialog modal-sm modal-dialog-centered">
				<div className="modal-content">
					<div className="modal-body">
						<form onSubmit={handleSubmit}>
							<div className="row mb-3 align-items-center">
								<label htmlFor="userId" className="col-4 col-form-label">
									User ID:
								</label>
								<div className="col-8">
									<input
										type="text"
										id="userId"
										className="form-control"
										value={userId}
										onChange={(e) => setUserId(e.target.value)}
										placeholder="Enter User ID"
									/>
								</div>
							</div>
							<div className="row mb-3 align-items-center">
								<label htmlFor="region" className="col-4 col-form-label">
									Region:
								</label>
								<div className="col-8">
									<input
										type="text"
										id="region"
										className="form-control"
										value={region}
										onChange={(e) => setRegion(e.target.value)}
										placeholder="Enter Region"
									/>
								</div>
							</div>
							<div className="d-flex justify-content-end">
								<button type="submit" className="btn btn-primary">
									Submit
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
