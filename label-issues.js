const { Octokit } = require('@octokit/rest');
const axios = require('axios');
const {SMTPClient}= 'emailjs';
const nodemailer = require("nodemailer");

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
  const categoryMap = new Map();
  categoryMap.set('paportal', {owner: 'gshivi', contact: 'shivikagupta.599@gmail.com'});
  categoryMap.set('pcf', {owner: 'gshivi', contact: 'shivikagupta.599@gmail.com'});
  categoryMap.set('solution', {owner: 'gshivi', contact: 'shivikagupta.599@gmail.com'});
  categoryMap.set('canvas-app', {owner: 'gshivi', contact: 'shivikagupta.599@gmail.com'});
  categoryMap.set('unknown', {owner: 'gshivi', contact: 'shivikagupta.599@gmail.com'});

  const categoryArray = [...categoryMap.keys()];
  console.log(categoryArray);
  const prompt1 = `You are a GitHub automation tool and your primary purpose is to generate labels based on the issue title & issue description. Issue title:${issueTitle}. Issue description: ${issueBody}. Use this array ${categoryArray} to assign labels. Refer to the following examples to determine the response. If the issue's title or body has paportal, it should be labelled as paportal. If it has pcf, label issue as pcf. If the issue can't be classified, label it as unknown.`;
  
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
    console.log(gptResponse);
    // const labelIndex = gptResponse.indexOf('label: ');
    // const labelValueStartIndex = labelIndex + 7;
    // const labelValueEndIndex = gptResponse.indexOf('}', labelValueStartIndex);
    // const labelValue = gptResponse.substring(labelValueStartIndex, labelValueEndIndex).trim();
    // console.log([labelValue])
    // console.log(gptResponse);
    // Add the label to the issue
    const res = octokit.issues.addLabels({
      owner: process.env.GITHUB_REPOSITORY_OWNER,
      repo: process.env.GITHUB_REPOSITORY_NAME,
      issue_number: process.env.GITHUB_ISSUE_NUMBER,
      labels: [gptResponse],
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: shivikagupta.995@gmail.com,
        pass: gpdpydxdgfeeyyty,
      },
      port: 465,
    });

    const mailOptions = {
      from: "shivikagupta.995@gmail.com",
      to: "shivikagupta@microsoft.com",
      subject: "Test Subject",
      html: "Test message",
    };

    await transporter.sendMail(mailOptions);


    // const client = new SMTPClient({
    //   user: 'das.bidisha08@gmail.com',
    //   password: '@Mphasis05',
    //   host: 'smtp.your-email.com',
    //   ssl: true,
    // });

    // client.send(
    //   {
    //     text: 'i hope this works',
    //     from: 'das.bidisha08@gmail.com',
    //     to: 'biddas@microsoft.com',
    //     subject: 'testing emailjs',
    //   },
    //   (err, message) => {
    //     console.log(err || message);
    //   }
    // );
  })
  .catch((error) => {
    console.log(error);
  }); 
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

