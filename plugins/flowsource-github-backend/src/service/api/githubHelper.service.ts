import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';
import { LoggerService } from '@backstage/backend-plugin-api';

class GithubHelper {
  octokit: any;
  logger: LoggerService;
  constructor(logger: LoggerService) {
    this.logger = logger;
  }

  // Fetches the installation ID for a GitHub App using the app's credentials.
  async fetchInstallationId(githubApp: any) {
    const appOctokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: githubApp.appId,
        privateKey: githubApp.privateKey,
        clientId: githubApp.clientId,
        clientSecret: githubApp.clientSecret,
      },
    });

    const { data: installations } = await appOctokit.apps.listInstallations();
    if (installations.length === 0) {
      throw new Error('No installations found for this app.');
    }
    // Assuming you want the first installation ID
    return installations[0].id;
  }

  // Authenticates with GitHub as an app installation and initializes the Octokit client.
  async fetchGithubAppTokenFromConfig(githubApp: any) {
    const installationId = await this.fetchInstallationId(githubApp);
    this.logger.info('Installation ID:', installationId as any);
    this.octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        type: 'installation',
        installationId: installationId,
        appId: githubApp.appId,
        privateKey: githubApp.privateKey,
        clientId: githubApp.clientId,
        clientSecret: githubApp.clientSecret,
      },
    });
  }

  // Authenticates with GitHub using a personal access token and initializes the Octokit client.
  async fetchGithubTokenFromConfig(githubToken: any) {
    this.octokit = new Octokit({
      auth: githubToken,
    });
  }

  // Fetches a list of pull requests for a given repository, filtered by creation date.
  async fetchGithubPRList(
    owner: string,
    repo: string,
    githubToken: any,
    states: string[],
    useLastSixMonths: boolean = false,
    durationDate?: Date | undefined
  ) {
    let response;
    let nextPage: string | undefined = undefined;
    const pullRequests: any[] = [];
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const durationDateParsed = durationDate ? new Date(durationDate) : null;

    // Determines the authentication method based on the type of the provided token.
    await (typeof githubToken === 'string'
      ? this.fetchGithubTokenFromConfig(githubToken)
      : this.fetchGithubAppTokenFromConfig(githubToken));

    // Function to fetch a page of pull requests
    const fetchPage = async (nextPage: string | undefined) => {
      const response = await this.octokit.graphql(
        `
        query ($owner: String!, $repo: String!, $nextPage: String, $states: [PullRequestState!]) {
          repository(owner: $owner, name: $repo) {
            pullRequests(first: 100, orderBy: {field: CREATED_AT, direction: DESC}, after: $nextPage, states: $states) {
              edges {
                node {
                  number
                  state
                  url
                  title
                  createdAt
                  updatedAt
                  mergedAt
                  isDraft
                  reviewDecision
                  assignees(first: 10) {
                    nodes {
                      login
                    }
                  }
                  author {
                    login
                  }
                  closed
                  labels(first: 5) {
                    nodes {
                      name
                    }
                  }
                reviewThreads(first: 50) {
                totalCount
                nodes {
                  isResolved
                  comments(first: 10) {
                    nodes {
                      body
                      path
                      position
                    }
                  }
                }
              } 
                  totalCommentsCount
                  reviews(last: 50) {
                    nodes {
                      author {
                        login
                      }
                      state
                      submittedAt
                    }
                  }
                  reviewRequests(first: 10) {
                    nodes {
                      requestedReviewer {
                        ... on User {
                          login
                        }
                      }
                    }
                  }
                }
              }
              pageInfo {
                endCursor
                hasNextPage
              }
            }
          }
        }`,
        {
          owner: owner,
          repo: repo,
          nextPage: nextPage,
          states: states,
        },
      );
      
      return response;
    };

    // Fetch all pages of pull requests
    while (true) {
      try {
        response = await fetchPage(nextPage);
        const filteredData = response.repository.pullRequests.edges
          .map((edge: any) => {
            const pr = edge.node;
            const unresolvedReviewThreadsCount = pr.reviewThreads.nodes.filter((thread: any) => !thread.isResolved).length;
            const uniqueReviews = pr.reviews.nodes.reduce((acc: any, review: any) => {
              if (!acc.find((r: any) => r.author.login === review.author.login)) {
                acc.push(review);
              }
              return acc;
            }, []);
            return {
              number: pr.number,
              state: pr.state,
              url: pr.url,
              title: pr.title,
              createdAt: new Date(pr.createdAt),
              updatedAt: new Date(pr.updatedAt),
              mergedAt: pr.mergedAt ? new Date(pr.mergedAt) : null,
              isDraft: pr.isDraft,
              reviewDecision: pr.reviewDecision,
              assignees: pr.assignees.nodes.map((assignee: any) => assignee.login).join(', '),
              author: pr.author ? pr.author.login : null,
              closed: pr.closed,
              labels: pr.labels.nodes.length > 0 ? pr.labels.nodes.map((label: any) => label.name) : null,
              unresolvedReviewThreadsCount: unresolvedReviewThreadsCount, // Add unresolved review threads count
              totalCommentsCount: pr.totalCommentsCount,
              reviews: uniqueReviews.map((review: any) => ({
                author: review.author.login,
                state: review.state,
                submittedAt: review.submittedAt ? new Date(review.submittedAt) : null,
              })),
              reviewRequests: pr.reviewRequests.nodes.length > 0 ? pr.reviewRequests.nodes.map(
                (reviewRequest: any) => reviewRequest.requestedReviewer.login,
              ) : null,
            };
          })
          .filter((pr: any) => {
            if (useLastSixMonths) {
              return pr.createdAt > sixMonthsAgo;
            } else if (durationDateParsed) {
              return pr.createdAt > durationDateParsed;
            }
            return true;
          });

        pullRequests.push(...filteredData);

        if (
          response.repository.pullRequests.edges.length === 0 ||
          new Date(response.repository.pullRequests.edges[response.repository.pullRequests.edges.length - 1].node.createdAt) < (durationDateParsed || new Date(0))
        )
          break;

        if (!response.repository.pullRequests.pageInfo.hasNextPage) {
          break;
        }
        nextPage = response.repository.pullRequests.pageInfo.endCursor;
      } catch (error) {
        throw error;
      }
    }
    return pullRequests;
  }
  // fetch all pull requests for Graph
  async fetchGithubPRListforGraph(
    owner: string,
    repo: string,
    githubToken: any,
    states: string[],
    useLastSixMonths: boolean = false,
  ) {
    let response;
    let nextPage: string | undefined = undefined;
    const pullRequests: any[] = [];
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Determines the authentication method based on the type of the provided token.
    await (typeof githubToken === 'string'
      ? this.fetchGithubTokenFromConfig(githubToken)
      : this.fetchGithubAppTokenFromConfig(githubToken));

    // Function to fetch a page of pull requests
    const fetchPage = async (nextPage: string | undefined) => {
      const response = await this.octokit.graphql(
        `
        query ($owner: String!, $repo: String!, $nextPage: String, $states: [PullRequestState!]) {
          repository(owner: $owner, name: $repo) {
            pullRequests(first: 100, orderBy: {field: CREATED_AT, direction: DESC}, after: $nextPage, states: $states) {
              edges {
                node {
                  number
                  state
                  url
                  title
                  createdAt
                  updatedAt
                  author {
                    login
                  }
                  assignees(first: 1) {
                    nodes {
                      login
                    }
                  }
                }
              }
              pageInfo {
                endCursor
                hasNextPage
              }
            }
          }
        }
      `,
        {
          owner: owner,
          repo: repo,
          nextPage: nextPage,
          states: states,
        },
      );
      
      return response;
    };

    // Fetch all pages of pull requests
    while (true) {
      try {
        response = await fetchPage(nextPage);
        const filteredData = response.repository.pullRequests.edges
          .map((edge: any) => {
            const pr = edge.node;
            return {
              number: pr.number,
              state: pr.state,
              url: pr.url,
              title: pr.title,
              createdAt: new Date(pr.createdAt),
              updatedAt: new Date(pr.updatedAt),
              user: pr.author ? pr.author.login : null,
              assignee:
                pr.assignees.nodes.length > 0
                  ? pr.assignees.nodes[0].login
                  : null,
            };
          })
          .filter((pr: any) => {
            if (useLastSixMonths) {
              return pr.createdAt > sixMonthsAgo;
            }
            return true;
          });

        pullRequests.push(...filteredData);

        if (
          response.repository.pullRequests.edges.length === 0 ||
          new Date(
            response.repository.pullRequests.edges[
              response.repository.pullRequests.edges.length - 1
            ].node.createdAt,
          ) < sixMonthsAgo
        ) {
          break;
        }

        if (!response.repository.pullRequests.pageInfo.hasNextPage) {
          break;
        }
        nextPage = response.repository.pullRequests.pageInfo.endCursor;
      } catch (error) {
        throw error;
      }
    }
    return pullRequests;
  }

  async fetchAllPRs(
    owner: string,
    repo: string,
    githubToken: any,
    states: string[],
    durationDate?: Date | undefined
  ) {
    let response: any;
    let nextPage: string | undefined = undefined;
    const pullRequests: any[] = [];
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const durationDateParsed = durationDate ? new Date(durationDate) : null;
    // Determines the authentication method based on the type of the provided token.
    await (typeof githubToken === 'string'
      ? this.fetchGithubTokenFromConfig(githubToken)
      : this.fetchGithubAppTokenFromConfig(githubToken));

    // Function to fetch a page of pull requests
    const fetchPage = async (nextPage: string | undefined) => {
      const response = await this.octokit.graphql(
        `
      query ($owner: String!, $repo: String!, $nextPage: String, $states: [PullRequestState!]) {
        repository(owner: $owner, name: $repo) {
          pullRequests(first: 100, orderBy: {field: CREATED_AT, direction: DESC}, after: $nextPage, states: $states) {
            edges {
                node {
                  number
                  state
                  createdAt
                  mergedAt
                  reviews(last: 50) {
                    nodes {
                      state
                      submittedAt
                    }
                  }
                }
              }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      }
    `,
        {
          owner: owner,
          repo: repo,
          nextPage: nextPage,
          states: states,
        },
      );
      
      return response;
    };

    // Fetch all pages of pull requests
    while (true) {
      try {
        response = await fetchPage(nextPage);
        
        const filteredData = response.repository.pullRequests.edges
          .map((edge: any) => {
            const pr = edge.node;
            const uniqueReviews = pr.reviews.nodes.reduce((acc: any, review: any) => {
              if (!acc.find((r: any) => r.state === 'APPROVED')) {
                acc.push(review);
              }
              return acc;
            }, []);
            let mergedPRs = {};
            // if (pr.state === "MERGED") {
              mergedPRs = {
                number: pr.number,
                state: pr.state,
                createdAt: new Date(pr.createdAt),
                mergedAt: pr.mergedAt ? new Date(pr.mergedAt) : null,
                reviews: uniqueReviews.map((review: any) => ({
                  state: review.state,
                  submittedAt: review.submittedAt ? new Date(review.submittedAt) : null,
                })),
              }
            // }

            return mergedPRs;
          })
          .filter((pr: any) => {
            if (sixMonthsAgo) {
              return pr.createdAt > sixMonthsAgo;
            }else if(durationDateParsed){
              return pr.createdAt > durationDateParsed;
            }
            return true;
          });
        pullRequests.push(...filteredData);
        if (!response.repository.pullRequests.pageInfo.hasNextPage) {
          break;
        }
        nextPage = response.repository.pullRequests.pageInfo.endCursor;
      } catch (error) {
        this.logger.error('Error fetching pull requests:', error as Error);
        break;
      }
    }
   
    return pullRequests;
  }

}

export default GithubHelper;
