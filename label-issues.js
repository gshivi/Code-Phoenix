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
  const prompt1 = `You are a classification tool and your primary purpose is to classify based on the issue title & issue description. Output must be one word only. Output must be one of the entries in this array: ${categoryArray}. Issue title: ${issueTitle}.  Issue description: ${issueBody}. Refer to the following examples to determine the response. If the issue's title or body contains paportal, it should be labelled as paportal. If it contains pcf, label issue as pcf. If the issue can't be classified, label it as unknown.`;
  
  
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
  .then(async (response) => {
    const gptResponse = response.data.choices[0].text;
    console.log(gptResponse);
   
    // Add the label to the issue
    const categoryKey = gptResponse.toLowerCase();
    console.log(categoryKey);
    console.log([categoryKey]);
    const label = categoryKey.trim().replace(/\n/g, '');
    console.log([label]);
    const resLabel =  octokit.issues.addLabels({
      owner: process.env.GITHUB_REPOSITORY_OWNER,
      repo: process.env.GITHUB_REPOSITORY_NAME,
      issue_number: process.env.GITHUB_ISSUE_NUMBER,
      labels: [label],
    });
    console.log(resLabel);
    
    console.log(categoryMap);
    const categoryRecord = categoryMap.get(categoryKey??'unknown')??categoryMap.get('unknown');
    console.log(categoryRecord);
    // Assign the issue to the owner
    const resAssignee =  octokit.issues.addAssignees({
      owner: process.env.GITHUB_REPOSITORY_OWNER,
      repo: process.env.GITHUB_REPOSITORY_NAME,
      issue_number: process.env.GITHUB_ISSUE_NUMBER,
      assignees: [categoryRecord.owner],
    });
    console.log(resAssignee);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "shivikagupta.995@gmail.com",
        pass: "gpdpydxdgfeeyyty",
      },
      port: 465,
    });

    const mailOptions = {
      from: "shivikagupta.995@gmail.com",
      to: categoryRecord.contact,
      subject: `Assignment Notification: [${issue.data.title}] assigned to your ownership`,
      html: `
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GitHub Issue Assigned</title>
        <style>
          /* GitHub Fonts */
          @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap');
          
          /* GitHub Styles */
          body {
            font-family: 'Roboto Mono', monospace;
            font-size: 16px;
            line-height: 1.6;
            color: #333333;
          }
          h2 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
          }
          h3 {
            color: #0366d6;
            font-size: 20px;
            font-weight: bold;
            margin-top: 30px;
            margin-bottom: 15px;
          }
          p {
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <h2>GitHub Issue Assigned</h2>
        <p>Dear [User],</p>
        
        <p>An issue has been assigned to you on GitHub:</p>
        
        <h3>[Issue Title]</h3>
        <p>[Issue Description]</p>
        
        <p>Please take appropriate action and provide necessary updates as needed.</p>
        
        <p>Thank you!</p>
        
        <p>Sincerely,</p>
        <p>Your Team</p>
      </body>
      </html>
      `,
    };

    send();
    
   async function send() {
    const result = await transporter.sendMail(mailOptions);
    console.log(JSON.stringify(result, null, 4));
  }


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

