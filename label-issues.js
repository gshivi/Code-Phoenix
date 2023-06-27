const { Octokit } = require('@octokit/rest');

async function main() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  
  console.log(process.env);
  console.log("hello");
  
  // Fetch the issue information
  const issue = await octokit.issues.get({
    owner: process.env.GITHUB_REPOSITORY_OWNER,
    repo: process.env.GITHUB_REPOSITORY_NAME,
    issue_number: process.env.GITHUB_ISSUE_NUMBER
  });

  console.log(issue);
  console.log("hello");
  
  const label = ['label1', 'label2', 'label3'] ;

  // Add the label to the issue
//   await octokit.issues.update({
//     owner: process.env.GITHUB_REPOSITORY_OWNER,
//     repo: process.env.GITHUB_REPOSITORY_NAME,
//     issue_number: process.env.GITHUB_ISSUE_NUMBER,
//     labels: label,
//   });
// }

await octokit.request('POST /repos/{process.env.GITHUB_REPOSITORY_OWNER}/{process.env.GITHUB_REPOSITORY_NAME}/issues/{process.env.GITHUB_ISSUE_NUMBER}/labels', {
  owner: 'process.env.GITHUB_REPOSITORY_OWNER',
  repo: 'process.env.GITHUB_REPOSITORY_NAME',
  issue_number: 'process.env.GITHUB_ISSUE_NUMBER',
  labels: [
    'bug',
    'enhancement'
  ],
  headers: {
    'X-GitHub-Api-Version': '2022-11-28'
  }
})

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
