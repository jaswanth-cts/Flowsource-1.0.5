import React from 'react';
import { Table } from '@material-ui/core';

const StoriesWithoutTestCasesTable = ({ storiesWithoutTestCases, classes }) => {
	const renderTableContent = () => {
		return storiesWithoutTestCases.map((story, index) => (
			<tr key={story.key}>
				<td className={`${classes.tableBodyCell}`} />
				<td className={`${classes.tableBodyCell}`}>
					{story.link ? (
						<a href={story.link} target="_blank" className={`${classes.linkStyleHoverUnderline}`}>
							{story.key}
						</a>
					) : (
						story.key
					)}
				</td>
				<td className={`${classes.tableBodyCell}`}>{story.summary}</td>
				<td className={`${classes.tableBodyCell}`}>{story.status}</td>
				<td className={`${classes.tableBodyCell}`}>{story.sprint}</td>
			</tr>
		));
	};

	return (
		<Table className={`table ${classes.tableBorders}`}>
			<thead>
				<tr className={`${classes.tableHead}`}>
					<th className={`${classes.tableHeadCell}`} />
					<th className={`${classes.tableHeadCell}`}>ID</th>
					<th className={`${classes.tableHeadCell}`}>Story</th>
					<th className={`${classes.tableHeadCell}`}>Status</th>
					<th className={`${classes.tableHeadCell}`}>Sprint</th>
				</tr>
			</thead>
			<tbody>
				{renderTableContent()}
			</tbody>
		</Table>
	);
};

export default StoriesWithoutTestCasesTable;
