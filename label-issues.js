const { Octokit } = require('@octokit/rest');
const axios = require('axios');

async function main() {

  const octokit = new Octokit({ auth: process.env.PAT_TOKEN });

  // Fetch the issue information
  const issue = await octokit.issues.get({
    owner: process.env.GITHUB_REPOSITORY_OWNER,
    repo: process.env.GITHUB_REPOSITORY_NAME,
    issue_number: process.env.GITHUB_ISSUE_NUMBER
  });

  const issueTitle = issue.data.title;
  const issueBody = issue.data.body;

let data = JSON.stringify({
  "prompt": "Classify the following news headline into 1 of the following categories: Business, Tech, Politics, Sport, Entertainment\n\nHeadline 1: Donna Steffensen Is Cooking Up a New Kind of Perfection. The Internet's most beloved cooking guru has a buzzy new book and a fresh new perspective\nCategory: Entertainment\n\nHeadline 2: Major Retailer Announces Plans to Close Over 100 Stores\nCategory:",
  "temperature": 0,
  "top_p": 1,
  "frequency_penalty": 0,
  "presence_penalty": 0,
  "max_tokens": 60,
  "best_of": 1,
  "stop": null
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://nikhilhackathonjune.openai.azure.com/openai/deployments/NikhilDavinci003/completions?api-version=2022-12-01',
  headers: { 
    'Content-Type': 'application/json', 
    'api-key': '75d09d96a7324669a179ff4a549ddd3c'
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});

  // const client = axios.create({
  //   headers:{
  //     authorization: "Bearer " + key,
  //   },
  // });

  // const params = {
  //   "prompt": "essay on delhi\n",
  //   "temperature": 1,
  //   "top_p": 0.5,
  //   "frequency_penalty": 0,
  //   "presence_penalty": 0,
  //   "max_tokens": 100,
  //   "best_of": 1,
  //   "stop": null
  // };

  // client.post("https://nikhilhackathonjune.openai.azure.com/openai/deployments/NikhilDavinci003/completions?api-version=2022-12-01", params)
  //   .then((response)=>{console.log(response)})
  //   .catch((err)=>{console.error(err)});

  
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

