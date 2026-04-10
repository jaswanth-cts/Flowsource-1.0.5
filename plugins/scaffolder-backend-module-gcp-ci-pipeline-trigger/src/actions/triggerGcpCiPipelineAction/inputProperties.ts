const githubConnectionName = {
  type: 'string',
  title: 'GitHub Connection Name',
  description: 'The name of the GitHub connection.',
};

const githubRepositoryOwner = {
  type: 'string',
  title: 'GitHub Repository Owner',
  description: 'The owner of the GitHub repository.',
};

const githubRepositoryName = {
  type: 'string',
  title: 'GitHub Repository Name',
  description: 'The name of the GitHub repository.',
};

const branchName = {
  type: 'string',
  title: 'Branch Name',
  description: 'The name of the branch to be triggered.',
};

const triggerName = {
  type: 'string',
  title: 'Cloud Build YAML Path',
  description: 'The path to the Cloud Build YAML file.',
};

export { githubConnectionName };
export { githubRepositoryOwner };
export { githubRepositoryName };
export { branchName };
export { triggerName };
