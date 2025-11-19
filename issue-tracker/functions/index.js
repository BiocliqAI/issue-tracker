// A comment to force redeployment
// A comment to force redeployment
// A comment to force redeployment
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();

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
    const mailTransport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // Use 'true' if your SMTP server uses SSL/TLS (e.g., 465), 'false' for STARTTLS (e.g., 587)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

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
      from: process.env.EMAIL_USER, // Sender address
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
    const mailTransport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // Use 'true' if your SMTP server uses SSL/TLS (e.g., 465), 'false' for STARTTLS (e.g., 587)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

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
          from: process.env.EMAIL_USER, // Sender address
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