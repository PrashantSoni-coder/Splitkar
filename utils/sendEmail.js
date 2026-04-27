const transporter = require('../config/mailer');

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"SplitKar" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: wrapTemplate(html)
    });
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

const wrapTemplate = (body) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 40px auto; background: #fff;
                 border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header  { background: #4f46e5; padding: 24px 32px; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; }
    .body    { padding: 32px; color: #333; line-height: 1.6; }
    .footer  { padding: 16px 32px; background: #f9f9f9; font-size: 12px; color: #999; }
    .btn     { display: inline-block; padding: 12px 24px; background: #4f46e5;
               color: #fff; border-radius: 6px; text-decoration: none; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>SplitKar</h1></div>
    <div class="body">${body}</div>
    <div class="footer">You received this email because you have a SplitKar account.</div>
  </div>
</body>
</html>`;

// Named email senders
sendEmail.welcome = (user) => sendEmail({
  to: user.email,
  subject: 'Welcome to SplitKar!',
  html: `<h2>Hi ${user.name},</h2>
         <p>Welcome to <strong>SplitKar</strong>! You can now create groups, add expenses, and split bills effortlessly.</p>
         <a href="${process.env.APP_URL || '#'}/dashboard" class="btn">Go to Dashboard</a>`
});

sendEmail.groupInvite = (invitee, group, invitedBy) => sendEmail({
  to: invitee.email,
  subject: `You were added to "${group.name}" on SplitKar`,
  html: `<h2>Hi ${invitee.name},</h2>
         <p><strong>${invitedBy}</strong> added you to the group <strong>${group.name}</strong> on SplitKar.</p>
         <a href="${process.env.APP_URL || '#'}/groups/${group._id}" class="btn">View Group</a>`
});

sendEmail.newExpense = (member, expense, group, paidBy) => sendEmail({
  to: member.email,
  subject: `New expense in "${group.name}": ${expense.title}`,
  html: `<h2>Hi ${member.name},</h2>
         <p><strong>${paidBy}</strong> added a new expense <strong>${expense.title}</strong>
            of <strong>₹${expense.amount.toFixed(2)}</strong> in <strong>${group.name}</strong>.</p>
         <p>Your share has been recorded.</p>
         <a href="${process.env.APP_URL || '#'}/groups/${group._id}" class="btn">View Expense</a>`
});

module.exports = sendEmail;
