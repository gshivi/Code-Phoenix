const { Octokit } = require('@octokit/rest');
const core = require('@actions/core');

async function main() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  
  core.info(process.env);
  core.info("hello");
  
  // Fetch the issue information
  const issue = await octokit.issues.get({
    owner: process.env.GITHUB_REPOSITORY_OWNER,
    repo: process.env.GITHUB_REPOSITORY_NAME,
    issue_number: process.env.GITHUB_ISSUE_NUMBER
  });

  core.info(issue);
  core.info("hello");
  
  const label = ['label1', 'label2', 'label3'] ;

  //Add the label to the issue
  // await octokit.issue.update({
  //   owner: process.env.GITHUB_REPOSITORY_OWNER,
  //   repo: process.env.GITHUB_REPOSITORY_NAME,
  //   issue_number: process.env.GITHUB_ISSUE_NUMBER,
  //   labels: label,
  // });

    // await octokit.issues.addLabels({
    //   owner: 'gshivi',
    //   repo: 'Code-Phoenix',
    //   issue_number: process.env.GITHUB_ISSUE_NUMBER,
    //   labels: ['label1'],
    // });
  
const response = await octokit.request(
      "POST /repos/{process.env.GITHUB_REPOSITORY_OWNER}/{process.env.GITHUB_REPOSITORY_NAME}/issues/{process.env.GITHUB_ISSUE_NUMBER}/labels",
      {
      owner: 'process.env.GITHUB_REPOSITORY_OWNER',
      repo: 'process.env.GITHUB_REPOSITORY_NAME',
      issue_number: 'process.env.GITHUB_ISSUE_NUMBER',
      labels: label,
      }
    );
    core.info("Label added to the issue:", response.data);
  
//   const xyz = await octokit.request('PATCH /repos/{process.env.GITHUB_REPOSITORY_OWNER}/{process.env.GITHUB_REPOSITORY_NAME}/issues/{process.env.GITHUB_ISSUE_NUMBER}/labels', {
//     owner: 'process.env.GITHUB_REPOSITORY_OWNER',
//     repo: 'process.env.GITHUB_REPOSITORY_NAME',
//     issue_number: 'process.env.GITHUB_ISSUE_NUMBER',
//     labels: [
//       'bug',
//       'enhancement'
//     ]
//   })
//   console.log("xyz starts");
//   console.log(xyz);
  
  main().catch((error) => {
    core.error('Error:', error);
    process.exit(1);
  });
}
