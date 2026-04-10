interface GithubPullRequest {
    number: number;
    state: string;
    url: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    isDraft: boolean;
    reviewDecision?: string;
    assignees?: { login: string }[];
    author: { login: string };
    closed: boolean;
    labels?: { name: string }[];
    unresolvedReviewThreadsCount: number;
    comments: { totalCount: number };
    totalCommentsCount: number;
    reviews: { author: { login: string }; state: string }[];
    reviewRequests: { requestedReviewer: { login: string } }[];
}
export default GithubPullRequest;