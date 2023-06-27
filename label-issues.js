const { Octokit } = require('@octokit/rest');
const axios = require('axios');
const SMTPClient= 'emailjs';

async function main() {

  const octokit = new Octokit({ auth: process.env.PAT_TOKEN });
console.log("Bidisha check");
  // Fetch the issue information
  const issue = await octokit.issues.get({
    owner: process.env.GITHUB_REPOSITORY_OWNER,
    repo: process.env.GITHUB_REPOSITORY_NAME,
    issue_number: process.env.GITHUB_ISSUE_NUMBER
  });

  const issueTitle = issue.data.title;
  const prompt1 = `You are a GitHub automation tool and your primary purpose is to generate labels based on the issue title. Issue title:${issueTitle}. Return a label in the JSON format {label: labelName} refer to the following examples to determine the response format. If the label is paportal return {label: paportal}. If the label is pcf return {label: pcf}. If the label is canvasApps return {label: canvasApps}.`;
  
  let data = JSON.stringify({
    "prompt": prompt1,
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
      'api-key': process.env.API_KEY
    },
    data : data
  };

  axios.request(config)
  .then((response) => {
    const gptResponse = response.data.choices[0].text;
    const labelIndex = gptResponse.indexOf('label: ');
    const labelValueStartIndex = labelIndex + 7;
    const labelValueEndIndex = gptResponse.indexOf('}', labelValueStartIndex);
    const labelValue = gptResponse.substring(labelValueStartIndex, labelValueEndIndex).trim();
    console.log([labelValue])
    console.log(gptResponse);
    // Add the label to the issue
    const res = octokit.issues.addLabels({
      owner: process.env.GITHUB_REPOSITORY_OWNER,
      repo: process.env.GITHUB_REPOSITORY_NAME,
      issue_number: process.env.GITHUB_ISSUE_NUMBER,
      labels: [labelValue],
    });  

    const client = new SMTPClient({
      user: 'das.bidisha08@gmail.com',
      password: '@Mphasis05',
      host: 'smtp.your-email.com',
      ssl: true,
    });

    client.send(
      {
        text: 'i hope this works',
        from: 'das.bidisha08@gmail.com',
        to: 'biddas@microsoft.com',
        subject: 'testing emailjs',
      },
      (err, message) => {
        console.log(err || message);
      }
    );
  })
  .catch((error) => {
    console.log(error);
  }); 
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

