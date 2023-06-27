const { Octokit } = require('@octokit/rest');
const core = require('@actions/core');

async function main() {

  const octokit = new Octokit({ auth: process.env.PAT_TOKEN });

  // Fetch the issue information
  const issue = await octokit.issues.get({
    owner: process.env.GITHUB_REPOSITORY_OWNER,
    repo: process.env.GITHUB_REPOSITORY_NAME,
    issue_number: process.env.GITHUB_ISSUE_NUMBER
  });

  const label = ['label1', 'label2', 'label3'] ;

  //Add the label to the issue
   const response = await octokit.issues.addLabels({
      owner: 'gshivi',
      repo: 'Code-Phoenix',
      issue_number: process.env.GITHUB_ISSUE_NUMBER,
      labels: label,
    });
  
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

