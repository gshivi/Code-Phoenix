const { Octokit } = require("@octokit/rest");
const axios = require("axios");
const nodemailer = require("nodemailer");

async function main() {
  const octokit = new Octokit({ auth: process.env.PAT_TOKEN });
  console.log(process.env.GITHUB_REPOSITORY_OWNER, process.env.GITHUB_REPOSITORY_NAME, process.env.GITHUB_ISSUE_NUMBER, 'hello');
  
  // Fetch the issue information
  const issue = await octokit.issues.get({
    owner: process.env.GITHUB_REPOSITORY_OWNER,
    repo: process.env.GITHUB_REPOSITORY_NAME,
    issue_number: process.env.GITHUB_ISSUE_NUMBER,
  });

  console.log('Issue here...', issue);

  const issueTitle = issue.data.title;
  const issueBody = issue.data.body;
  const categoryMap = new Map();
  categoryMap.set('paportal', {owner: 'shivikagupta', contact: 'shivikagupta@microsoft.com'});
  categoryMap.set('pcf', {owner: 'shivikagupta', contact: 'shivikagupta@microsoft.com'});
  categoryMap.set('solution', {owner: 'shivikagupta', contact: 'shivikagupta@microsoft.com'});
  categoryMap.set('canvas-app', {owner: 'shivikagupta', contact: 'shivikagupta@microsoft.com'});
  categoryMap.set('unknown', {owner: 'shivikagupta', contact: 'shivikagupta@microsoft.com'});

  const categoryArray = [...categoryMap.keys()];

  const prompt = `You are a classification tool and your primary purpose is to classify based on the issue title & issue description. Output must be one word only. Output must be one of the entries in this array: ${categoryArray}. Issue title: ${issueTitle}.  Issue description: ${issueBody}. Refer to the following examples to determine the response. If the issue's title or body contains paportal, it should be labelled as paportal. If it contains pcf, label issue as pcf. If the issue can't be classified, label it as unknown.`;

  let data = JSON.stringify({
    prompt: prompt,
    temperature: 0,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 60,
    best_of: 1,
    stop: null,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://nikhilhackathonjune.openai.azure.com/openai/deployments/NikhilDavinci003/completions?api-version=2022-12-01",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.API_KEY,
    },
    data: data,
  };

  axios
    .request(config)
    .then(async (response) => {
      const gptResponse = response.data.choices[0].text;

      // Add the label to the issue
      const categoryKey = gptResponse.toLowerCase();
      const label = categoryKey.trim().replace(/\n/g, "");

      octokit.issues.addLabels({
        owner: process.env.GITHUB_REPOSITORY_OWNER,
        repo: process.env.GITHUB_REPOSITORY_NAME,
        issue_number: process.env.GITHUB_ISSUE_NUMBER,
        labels: [label],
      });
      console.log('Labels added...');
      const categoryRecord =
        categoryMap.get(categoryKey ?? "unknown") ?? categoryMap.get("unknown");

      // Assign the issue to the owner
      octokit.issues.addAssignees({
        owner: process.env.GITHUB_REPOSITORY_OWNER,
        repo: process.env.GITHUB_REPOSITORY_NAME,
        issue_number: process.env.GITHUB_ISSUE_NUMBER,
        assignees: [categoryRecord.owner],
      });
      console.log('Issue assigned...');
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "shivikagupta.995@gmail.com",
          pass: process.env.MAIL_APP_PASSWORD,
        },
        port: 465,
      });

      const mailBody = `
        <!DOCTYPE html>
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
          <p>Dear ${categoryRecord.owner},</p>
          
          <p>An issue has been assigned to you on GitHub:</p>
          
          <h3>${issueTitle}</h3>
          <p>${issueBody}</p>
          
          <p>Please take appropriate action and provide necessary updates as needed.</p>
          
          <p>Thank you!</p>
          
          <p>Sincerely,</p>
          <p>Your Team</p>
        </body>
        </html>
      `;
      const mailOptions = {
        from: "shivikagupta.995@gmail.com",
        to: categoryRecord.contact,
        subject: `Assignment Notification: [${issue.data.title}] assigned to your ownership`,
        html: mailBody,
      };

      send();

      async function send() {
        const result = await transporter.sendMail(mailOptions);
        console.log(JSON.stringify(result, null, 4));
      }
    })
    .catch((error) => {
      console.log(error);
      console.log('error in axios');
    });
}

main().catch((error) => {
  console.error("Error:", error);
  console.log('Error in main');
  process.exit(1);
});
