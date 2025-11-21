// A comment to force redeployment
// A comment to force redeployment
// A comment to force redeployment
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { defineString } = require("firebase-functions/params");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();

// Define email config parameters
const emailHost = defineString("EMAIL_HOST");
const emailPort = defineString("EMAIL_PORT");
const emailUser = defineString("EMAIL_USER");
const emailPass = defineString("EMAIL_PASS");

// Helper function to create mail transporter
function createMailTransport() {
  return nodemailer.createTransport({
    host: emailHost.value(),
    port: parseInt(emailPort.value()),
    secure: false, // Use STARTTLS
    auth: {
      user: emailUser.value(),
      pass: emailPass.value(),
    },
  });
}

// Hardcoded ASSIGNABLE_USERS for Cloud Functions. In a real app, this might be fetched from Firestore or a config.
const ASSIGNABLE_USERS = [
  { name: 'Ravichandar N', email: 'n.ravi@biocliq.com' },
  { name: 'Syed Furqan Azeez', email: 'Furqan.azeez@biocliq.com' },
  { name: 'B Rengarajan', email: 'renga@biocliq.com' },
  { name: 'Apeksha Sakegaonkar', email: 'apeksha@biocliq.com' },
  { name: 'Shivam Gaikwad', email: 'shivam@biocliq.com' },
  { name: 'Aamir Mohammed Shariff', email: 'aamir@biocliq.com' },
  { name: 'Shashi kiran km', email: 'shashikiran@biocliq.com' },
  { name: 'Yogesh Jadhav', email: 'yogesh@biocliq.com' },
  { name: 'Nayab Fathima', email: 'nayab@biocliq.com' },
  { name: 'Swapnil Patil', email: 'swapnil@biocliq.com' },
  { name: 'Akhila KR', email: 'akhila@biocliq.com' },
  { name: 'Mohammed Faisal Jamal Sabri', email: 'faisal@biocliq.com' },
  { name: 'Sanket Dhumal', email: 'sanket@biocliq.com' },
  { name: 'Mohd Irfanullah Khatib I', email: 'irfan@biocliq.com' },
  { name: 'Joyshree Debbarma', email: 'joyshree@biocliq.com' },
  { name: 'Hari Om Swarup S A', email: 'hariomswarup@biocliq.com' },
  { name: 'Amit Kumar', email: 'amit@biocliq.com' },
];

// Helper function to get user email by name
function getUserEmail(userName) {
  const user = ASSIGNABLE_USERS.find(u => u.name === userName);
  return user ? user.email : null;
}

// Cloud Function to send email on new issue creation
exports.sendEmailOnNewIssue = onDocumentCreated(
  "issues/{issueId}",
  async (event) => {
    const mailTransport = createMailTransport();

    const snap = event.data;
    if (!snap) {
      return;
    }
    const issue = snap.data();
    const issueId = event.params.issueId;
    const issueLink = `https://issuetracker-87429.web.app/dashboard?issueId=${issueId}`; // Replace with your actual app URL

    const assigneeEmail = getUserEmail(issue.assignee);
    const reporterEmail = getUserEmail(issue.reporter);

    const mailOptions = {
      from: emailUser.value(), // Sender address
      subject: `New Issue Created: ${issue.description.substring(0, 50)}...`,
      html: `
        <p>A new issue has been created:</p>
        <p><strong>Description:</strong> ${issue.description}</p>
        <p><strong>Category:</strong> ${issue.category}</p>
        <p><strong>Priority:</strong> ${issue.priority}</p>
        <p><strong>Status:</strong> ${issue.status}</p>
        <p><strong>Assignee:</strong> ${issue.assignee || 'Unassigned'}</p>
        <p><strong>Reporter:</strong> ${issue.reporter}</p>
        <p>View issue: <a href="${issueLink}">${issueLink}</a></p>
      `,
    };

    const recipientEmails = [];
    if (assigneeEmail) {
      recipientEmails.push(assigneeEmail);
    }
    if (reporterEmail && reporterEmail !== assigneeEmail) { // Avoid sending duplicate to assignee if also reporter
      recipientEmails.push(reporterEmail);
    }

    if (recipientEmails.length > 0) {
      try {
        await mailTransport.sendMail({
          ...mailOptions,
          to: recipientEmails.join(', '),
        });
        console.log(`Email sent for new issue ${issueId} to ${recipientEmails.join(', ')}`);
      } catch (error) {
        console.error(`Error sending email for new issue ${issueId}:`, error);
      }
    } else {
      console.log(`No valid recipients for new issue ${issueId}`);
    }

    return null;
  });

// Cloud Function to send email on assignee change
exports.sendEmailOnAssigneeChange = onDocumentUpdated(
  "issues/{issueId}",
  async (event) => {
    console.log("onDocumentUpdated triggered");
    const mailTransport = createMailTransport();

    const oldIssue = event.data.before.data();
    const newIssue = event.data.after.data();
    console.log("Old issue:", oldIssue);
    console.log("New issue:", newIssue);
    const issueId = event.params.issueId;
    const issueLink = `https://issuetracker-87429.web.app/dashboard?issueId=${issueId}`; // Replace with your actual app URL

    // Check if assignee has changed
    if (oldIssue.assignee !== newIssue.assignee) {
      console.log("Assignee has changed");
      const newAssigneeEmail = getUserEmail(newIssue.assignee);
      console.log("New assignee email:", newAssigneeEmail);

      if (newAssigneeEmail) {
        const mailOptions = {
          from: emailUser.value(), // Sender address
          to: newAssigneeEmail,
          subject: `Issue Assignment Changed: ${newIssue.description.substring(0, 50)}...`,
          html: `
            <p>The assignee for an issue has been changed:</p>
            <p><strong>Issue:</strong> ${newIssue.description}</p>
            <p><strong>Old Assignee:</strong> ${oldIssue.assignee || 'Unassigned'}</p>
            <p><strong>New Assignee:</strong> ${newIssue.assignee || 'Unassigned'}</p>
            <p>View issue: <a href="${issueLink}">${issueLink}</a></p>
          `,
        };

        try {
          await mailTransport.sendMail(mailOptions);
          console.log(`Email sent for assignee change on issue ${issueId} to ${newAssigneeEmail}`);
        } catch (error) {
          console.error(`Error sending email for assignee change on issue ${issueId}:`, error);
        }
      } else {
        console.log(`New assignee ${newIssue.assignee} for issue ${issueId} has no valid email.`);
      }
    } else {
      console.log("Assignee has not changed");
    }

    return null;
  });

// Cloud Function to send email on status change
exports.sendEmailOnStatusChange = onDocumentUpdated(
  "issues/{issueId}",
  async (event) => {
    console.log("Status change function triggered");
    const mailTransport = createMailTransport();

    const oldIssue = event.data.before.data();
    const newIssue = event.data.after.data();
    const issueId = event.params.issueId;
    const issueLink = `https://issuetracker-87429.web.app/dashboard?issueId=${issueId}`;

    // Check if status has changed (and not assignee to avoid duplicate emails)
    if (oldIssue.status !== newIssue.status && oldIssue.assignee === newIssue.assignee) {
      console.log(`Status changed from ${oldIssue.status} to ${newIssue.status}`);

      const assigneeEmail = getUserEmail(newIssue.assignee);
      const reporterEmail = getUserEmail(newIssue.reporter);

      const recipientEmails = [];
      if (assigneeEmail) recipientEmails.push(assigneeEmail);
      if (reporterEmail && reporterEmail !== assigneeEmail) {
        recipientEmails.push(reporterEmail);
      }

      if (recipientEmails.length > 0) {
        const mailOptions = {
          from: emailUser.value(),
          to: recipientEmails.join(', '),
          subject: `Issue Status Changed: ${newIssue.description.substring(0, 50)}...`,
          html: `
            <p><strong>Issue Status Update</strong></p>
            <p><strong>Description:</strong> ${newIssue.description}</p>
            <p><strong>Old Status:</strong> ${oldIssue.status}</p>
            <p><strong>New Status:</strong> ${newIssue.status}</p>
            <p><strong>Priority:</strong> ${newIssue.priority}</p>
            <p><strong>Assignee:</strong> ${newIssue.assignee || 'Unassigned'}</p>
            <p><strong>Reporter:</strong> ${newIssue.reporter}</p>
            <p>View issue: <a href="${issueLink}">${issueLink}</a></p>
          `,
        };

        try {
          await mailTransport.sendMail(mailOptions);
          console.log(`Status change email sent for issue ${issueId} to ${recipientEmails.join(', ')}`);
        } catch (error) {
          console.error(`Error sending status change email for issue ${issueId}:`, error);
        }
      } else {
        console.log(`No valid recipients for status change on issue ${issueId}`);
      }
    } else if (oldIssue.status === newIssue.status) {
      console.log("Status has not changed");
    } else {
      console.log("Status and assignee both changed, only assignee email will be sent");
    }

    return null;
  });