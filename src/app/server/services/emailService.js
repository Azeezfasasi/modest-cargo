import { sendEmailViaBrevo } from '../utils/brevoEmailService';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@modestcargo.com';
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'noreply@modestcargo.com';
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Modest Cargo';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * HTML Email Template Wrapper
 * @param {string} content - Main email content
 * @param {string} title - Email title/heading
 * @returns {string} Complete HTML email
 */
const getEmailTemplate = (content, title) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .email-header {
          background: linear-gradient(135deg, #dc6420 0%, #ea580c 100%);
          padding: 30px;
          text-align: center;
          color: white;
        }
        .email-header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .email-header p {
          margin: 10px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .email-content {
          padding: 30px;
        }
        .quote-details {
          background-color: #f9f9f9;
          border-left: 4px solid #dc6420;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: bold;
          color: #555;
          min-width: 150px;
        }
        .detail-value {
          color: #333;
          word-break: break-word;
        }
        .tracking-box {
          background-color: #dc6420;
          color: white;
          padding: 15px;
          border-radius: 4px;
          text-align: center;
          margin: 20px 0;
          font-family: 'Courier New', monospace;
        }
        .tracking-label {
          font-size: 12px;
          opacity: 0.9;
        }
        .tracking-number {
          font-size: 24px;
          font-weight: bold;
          margin-top: 5px;
          letter-spacing: 2px;
        }
        .action-button {
          display: inline-block;
          background-color: #dc6420;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 4px;
          margin: 15px 0;
          font-weight: bold;
          transition: background-color 0.3s;
        }
        .action-button:hover {
          background-color: #b84d15;
        }
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          margin: 10px 0;
        }
        .status-pending {
          background-color: #fef3c7;
          color: #92400e;
        }
        .status-processing {
          background-color: #dbeafe;
          color: #1e40af;
        }
        .status-shipped {
          background-color: #e9d5ff;
          color: #6b21a8;
        }
        .status-delivered {
          background-color: #dcfce7;
          color: #166534;
        }
        .email-footer {
          background-color: #f5f5f5;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
        }
        .email-footer a {
          color: #dc6420;
          text-decoration: none;
        }
        .divider {
          border: none;
          border-top: 2px solid #eee;
          margin: 20px 0;
        }
        .message-box {
          background-color: #f0f9ff;
          border-left: 4px solid #0284c7;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .note {
          font-style: italic;
          color: #666;
          font-size: 12px;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>${title}</h1>
          <p>Modest Cargo Shipping & Logistics</p>
        </div>
        <div class="email-content">
          ${content}
        </div>
        <div class="email-footer">
          <p>© 2026 Modest Cargo. All rights reserved.</p>
          <p>
            <a href="${APP_URL}">Visit Our Website</a> | 
            <a href="mailto:${ADMIN_EMAIL}">Contact Support</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Format quote details for email display
 */
const formatQuoteDetails = (quote) => {
  return `
    <div class="quote-details">
      <div class="detail-row">
        <span class="detail-label">Tracking Number:</span>
        <span class="detail-value"><strong>${quote.trackingNumber || 'PENDING'}</strong></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Customer Name:</span>
        <span class="detail-value">${quote.fullName || quote.name}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Email:</span>
        <span class="detail-value">${quote.email}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Company:</span>
        <span class="detail-value">${quote.company || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Service Type:</span>
        <span class="detail-value">${quote.serviceType || quote.service}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">From:</span>
        <span class="detail-value">${quote.pickupLocation}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">To:</span>
        <span class="detail-value">${quote.deliveryLocation}</span>
      </div>
    </div>
  `;
};

/**
 * 1. Send email when quote is created
 */
export const sendQuoteCreatedEmail = async (quote) => {
  try {
    const clientContent = `
      <p>Dear ${quote.fullName},</p>
      
      <p>Thank you for submitting your quote request to Modest Cargo! We have received your shipment details and assigned a tracking number for your reference.</p>
      
      <div class="tracking-box">
        <div class="tracking-label">Your Tracking Number</div>
        <div class="tracking-number">${quote.trackingNumber}</div>
      </div>
      
      <p>Below are the details of your quote request:</p>
      
      ${formatQuoteDetails(quote)}
      
      <p><strong>Shipment Description:</strong></p>
      <p>${quote.description || quote.cargoType || 'N/A'}</p>
      
      <p><strong>Weight:</strong> ${quote.weight || 'N/A'} kg</p>
      <p><strong>Quantity:</strong> ${quote.quantity || 'N/A'} unit(s)</p>
      
      ${quote.preferredDeliveryDate ? `<p><strong>Preferred Delivery Date:</strong> ${new Date(quote.preferredDeliveryDate).toLocaleDateString()}</p>` : ''}
      
      <p>Our team will review your request and get back to you with a competitive quote shortly. You can track your shipment at any time using your tracking number.</p>
      
      <a href="${APP_URL}/track-shipment?tracking=${quote.trackingNumber}" class="action-button">Track Your Shipment</a>
      
      <p>If you have any questions, please don't hesitate to contact us.</p>
      
      <p>Best regards,<br>
      <strong>Modest Cargo Team</strong><br>
      International Shipping & Logistics</p>
    `;

    const adminContent = `
      <p>A new quote request has been submitted:</p>
      
      ${formatQuoteDetails(quote)}
      
      <p><strong>Shipment Description:</strong></p>
      <p>${quote.description || quote.cargoType || 'N/A'}</p>
      
      <p><strong>Weight:</strong> ${quote.weight || 'N/A'} kg</p>
      <p><strong>Quantity:</strong> ${quote.quantity || 'N/A'} unit(s)</p>
      
      ${quote.preferredDeliveryDate ? `<p><strong>Preferred Delivery Date:</strong> ${new Date(quote.preferredDeliveryDate).toLocaleDateString()}</p>` : ''}
      
      <p><strong>Status:</strong> <span class="status-badge status-pending">${quote.status.toUpperCase()}</span></p>
      
      <a href="${APP_URL}/dashboard/quote-requests" class="action-button">View in Dashboard</a>
      
      <p>Please review and assign this quote request to an available staff member.</p>
    `;

    // Send to client
    await sendEmailViaBrevo({
      to: quote.email,
      subject: `Quote Request Received - Tracking: ${quote.trackingNumber}`,
      htmlContent: getEmailTemplate(clientContent, 'Quote Request Received'),
      senderEmail: SENDER_EMAIL,
      senderName: SENDER_NAME,
    });

    // Send to admin
    await sendEmailViaBrevo({
      to: ADMIN_EMAIL,
      subject: `New Quote Request - ${quote.fullName} (${quote.trackingNumber})`,
      htmlContent: getEmailTemplate(adminContent, 'New Quote Request'),
      senderEmail: SENDER_EMAIL,
      senderName: SENDER_NAME,
    });

    console.log('✓ Quote created emails sent successfully');
  } catch (error) {
    console.error('Error sending quote created email:', error);
  }
};

/**
 * 2. Send email when quote is updated
 */
export const sendQuoteUpdatedEmail = async (quote, changedFields = {}) => {
  try {
    const clientContent = `
      <p>Dear ${quote.fullName},</p>
      
      <p>Your quote request (Tracking: <strong>${quote.trackingNumber}</strong>) has been updated.</p>
      
      ${formatQuoteDetails(quote)}
      
      ${Object.keys(changedFields).length > 0 ? `
        <p><strong>Changes Made:</strong></p>
        <div class="message-box">
          ${Object.entries(changedFields).map(([key, value]) => `
            <p><strong>${key}:</strong> ${value}</p>
          `).join('')}
        </div>
      ` : ''}
      
      <a href="${APP_URL}/track-shipment?tracking=${quote.trackingNumber}" class="action-button">View Updated Details</a>
      
      <p>If you have any questions about the changes, please contact us.</p>
      
      <p>Best regards,<br>
      <strong>Modest Cargo Team</strong></p>
    `;

    const adminContent = `
      <p>Quote request has been updated:</p>
      
      ${formatQuoteDetails(quote)}
      
      ${Object.keys(changedFields).length > 0 ? `
        <p><strong>Fields Changed:</strong></p>
        <div class="message-box">
          ${Object.entries(changedFields).map(([key, value]) => `
            <p><strong>${key}:</strong> ${value}</p>
          `).join('')}
        </div>
      ` : ''}
      
      <a href="${APP_URL}/dashboard/quote-requests" class="action-button">View in Dashboard</a>
    `;

    // Send to client
    await sendEmailViaBrevo({
      to: quote.email,
      subject: `Quote Updated - ${quote.trackingNumber}`,
      htmlContent: getEmailTemplate(clientContent, 'Quote Request Updated'),
      senderEmail: SENDER_EMAIL,
      senderName: SENDER_NAME,
    });

    // Send to admin
    await sendEmailViaBrevo({
      to: ADMIN_EMAIL,
      subject: `Quote Updated - ${quote.fullName} (${quote.trackingNumber})`,
      htmlContent: getEmailTemplate(adminContent, 'Quote Updated'),
      senderEmail: SENDER_EMAIL,
      senderName: SENDER_NAME,
    });

    console.log('✓ Quote updated emails sent successfully');
  } catch (error) {
    console.error('Error sending quote updated email:', error);
  }
};

/**
 * 3. Send email when quote is deleted
 */
export const sendQuoteDeletedEmail = async (quote) => {
  try {
    const clientContent = `
      <p>Dear ${quote.fullName},</p>
      
      <p>Your quote request (Tracking: <strong>${quote.trackingNumber}</strong>) has been removed from our system.</p>
      
      <div class="quote-details">
        <div class="detail-row">
          <span class="detail-label">Tracking Number:</span>
          <span class="detail-value"><strong>${quote.trackingNumber}</strong></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Service Type:</span>
          <span class="detail-value">${quote.serviceType || quote.service}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Deleted Date:</span>
          <span class="detail-value">${new Date().toLocaleDateString()}</span>
        </div>
      </div>
      
      <p>If this was done in error or you would like to resubmit your request, please don't hesitate to contact us.</p>
      
      <a href="${APP_URL}#request-quote" class="action-button">Submit New Quote Request</a>
      
      <p>Best regards,<br>
      <strong>Modest Cargo Team</strong></p>
    `;

    const adminContent = `
      <p>A quote request has been deleted from the system:</p>
      
      ${formatQuoteDetails(quote)}
      
      <p><strong>Deleted At:</strong> ${new Date().toLocaleString()}</p>
    `;

    // Send to client
    await sendEmailViaBrevo({
      to: quote.email,
      subject: `Quote Request Deleted - ${quote.trackingNumber}`,
      htmlContent: getEmailTemplate(clientContent, 'Quote Request Deleted'),
      senderEmail: SENDER_EMAIL,
      senderName: SENDER_NAME,
    });

    // Send to admin
    await sendEmailViaBrevo({
      to: ADMIN_EMAIL,
      subject: `Quote Deleted - ${quote.fullName} (${quote.trackingNumber})`,
      htmlContent: getEmailTemplate(adminContent, 'Quote Deleted'),
      senderEmail: SENDER_EMAIL,
      senderName: SENDER_NAME,
    });

    console.log('✓ Quote deleted emails sent successfully');
  } catch (error) {
    console.error('Error sending quote deleted email:', error);
  }
};

/**
 * 4. Send email when quote status is changed
 */
export const sendQuoteStatusChangedEmail = async (quote, oldStatus, newStatus) => {
  try {
    const statusMessages = {
      pending: 'Your request is pending review',
      processing: 'We are processing your quote',
      quoted: 'A quote has been prepared for you',
      approved: 'Your quote has been approved',
      shipped: 'Your shipment is on the way',
      delivered: 'Your shipment has been delivered',
      cancelled: 'Your quote has been cancelled',
    };

    const clientContent = `
      <p>Dear ${quote.fullName},</p>
      
      <p>The status of your quote request has been updated.</p>
      
      <div class="quote-details">
        <div class="detail-row">
          <span class="detail-label">Tracking Number:</span>
          <span class="detail-value"><strong>${quote.trackingNumber}</strong></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Previous Status:</span>
          <span class="detail-value"><span class="status-badge status-${oldStatus}">${oldStatus.toUpperCase()}</span></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">New Status:</span>
          <span class="detail-value"><span class="status-badge status-${newStatus}">${newStatus.toUpperCase()}</span></span>
        </div>
      </div>
      
      <p>${statusMessages[newStatus] || 'Your quote status has been updated'}</p>
      
      <a href="${APP_URL}/track-shipment?tracking=${quote.trackingNumber}" class="action-button">Track Your Shipment</a>
      
      <p>For more information, please visit your tracking page or contact us.</p>
      
      <p>Best regards,<br>
      <strong>Modest Cargo Team</strong></p>
    `;

    const adminContent = `
      <p>Quote status has been changed:</p>
      
      ${formatQuoteDetails(quote)}
      
      <div class="message-box">
        <p><strong>Status Change</strong></p>
        <p>From: <strong>${oldStatus.toUpperCase()}</strong></p>
        <p>To: <strong>${newStatus.toUpperCase()}</strong></p>
        <p>Changed At: ${new Date().toLocaleString()}</p>
      </div>
      
      <a href="${APP_URL}/dashboard/quote-requests" class="action-button">View in Dashboard</a>
    `;

    // Send to client
    await sendEmailViaBrevo({
      to: quote.email,
      subject: `Quote Status Updated - ${newStatus.toUpperCase()} (${quote.trackingNumber})`,
      htmlContent: getEmailTemplate(clientContent, `Status Updated: ${newStatus.toUpperCase()}`),
      senderEmail: SENDER_EMAIL,
      senderName: SENDER_NAME,
    });

    // Send to admin
    await sendEmailViaBrevo({
      to: ADMIN_EMAIL,
      subject: `Quote Status Changed - ${quote.fullName} (${quote.trackingNumber})`,
      htmlContent: getEmailTemplate(adminContent, 'Quote Status Changed'),
      senderEmail: SENDER_EMAIL,
      senderName: SENDER_NAME,
    });

    console.log('✓ Quote status changed emails sent successfully');
  } catch (error) {
    console.error('Error sending quote status changed email:', error);
  }
};

/**
 * 5. Send email when reply is added to quote
 */
export const sendQuoteReplyEmail = async (quote, reply, senderName) => {
  try {
    const clientContent = `
      <p>Dear ${quote.fullName},</p>
      
      <p>We have a response to your quote request (Tracking: <strong>${quote.trackingNumber}</strong>).</p>
      
      ${formatQuoteDetails(quote)}
      
      <p><strong>Our Response:</strong></p>
      <div class="message-box">
        <p>${reply.message || 'Please see attached quote details'}</p>
      </div>
      
      <p>Please review the information above and let us know if you have any questions or need clarification on any points.</p>
      
      <a href="${APP_URL}/track-shipment?tracking=${quote.trackingNumber}" class="action-button">View Full Details</a>
      
      <p>We look forward to working with you!</p>
      
      <p>Best regards,<br>
      <strong>${senderName || 'Modest Cargo Team'}</strong><br>
      Modest Cargo Shipping & Logistics</p>
    `;

    const adminContent = `
      <p>A reply has been sent to a quote request:</p>
      
      ${formatQuoteDetails(quote)}
      
      <p><strong>Reply From:</strong> ${senderName}</p>
      <p><strong>Reply Message:</strong></p>
      <div class="message-box">
        <p>${reply.message || 'No message provided'}</p>
      </div>
      
      <p><strong>Sent At:</strong> ${new Date().toLocaleString()}</p>
      
      <a href="${APP_URL}/dashboard/quote-requests" class="action-button">View in Dashboard</a>
    `;

    // Send to client
    await sendEmailViaBrevo({
      to: quote.email,
      subject: `Quote Response Received - ${quote.trackingNumber}`,
      htmlContent: getEmailTemplate(clientContent, 'Quote Response Received'),
      senderEmail: SENDER_EMAIL,
      senderName: SENDER_NAME,
    });

    // Send to admin
    await sendEmailViaBrevo({
      to: ADMIN_EMAIL,
      subject: `Quote Reply Sent - ${quote.fullName} (${quote.trackingNumber})`,
      htmlContent: getEmailTemplate(adminContent, 'Quote Reply Sent'),
      senderEmail: SENDER_EMAIL,
      senderName: SENDER_NAME,
    });

    console.log('✓ Quote reply emails sent successfully');
  } catch (error) {
    console.error('Error sending quote reply email:', error);
  }
};

/**
 * 6. Send email when quote is assigned to staff member
 */
export const sendQuoteAssignedEmail = async (quote, staffMember) => {
  try {
    const staffContent = `
      <p>Dear ${staffMember.firstName},</p>
      
      <p>A new quote request has been assigned to you for handling.</p>
      
      ${formatQuoteDetails(quote)}
      
      <p><strong>Description:</strong></p>
      <p>${quote.description || quote.cargoType || 'N/A'}</p>
      
      <p><strong>Assigned Date:</strong> ${new Date().toLocaleDateString()}</p>
      
      <p>Please review the quote details and prepare a response for the customer as soon as possible.</p>
      
      <a href="${APP_URL}/dashboard/my-assigned-quotes" class="action-button">View Assigned Quotes</a>
      
      <p>Best regards,<br>
      <strong>Modest Cargo Management</strong></p>
    `;

    const adminContent = `
      <p>Quote request has been assigned to a staff member:</p>
      
      ${formatQuoteDetails(quote)}
      
      <p><strong>Assigned To:</strong> ${staffMember.firstName} ${staffMember.lastName} (${staffMember.email})</p>
      <p><strong>Assigned At:</strong> ${new Date().toLocaleString()}</p>
      
      <a href="${APP_URL}/dashboard/quote-requests" class="action-button">View in Dashboard</a>
    `;

    // Send to staff member
    await sendEmailViaBrevo({
      to: staffMember.email,
      subject: `New Quote Assigned - ${quote.trackingNumber}`,
      htmlContent: getEmailTemplate(staffContent, 'Quote Assigned to You'),
      senderEmail: SENDER_EMAIL,
      senderName: SENDER_NAME,
    });

    // Send to admin
    await sendEmailViaBrevo({
      to: ADMIN_EMAIL,
      subject: `Quote Assigned - ${quote.fullName} to ${staffMember.firstName} ${staffMember.lastName}`,
      htmlContent: getEmailTemplate(adminContent, 'Quote Assigned'),
      senderEmail: SENDER_EMAIL,
      senderName: SENDER_NAME,
    });

    console.log('✓ Quote assigned emails sent successfully');
  } catch (error) {
    console.error('Error sending quote assigned email:', error);
  }
};

/**
 * 7. Send email when quote is edited
 */
export const sendQuoteEditedEmail = async (quote, changedFields = {}) => {
  try {
    const clientContent = `
      <p>Dear ${quote.fullName},</p>
      
      <p>Your quote request has been updated with new information.</p>
      
      ${formatQuoteDetails(quote)}
      
      ${Object.keys(changedFields).length > 0 ? `
        <p><strong>Updated Fields:</strong></p>
        <div class="message-box">
          ${Object.entries(changedFields).map(([key, value]) => `
            <p><strong>${key}:</strong> ${value}</p>
          `).join('')}
        </div>
      ` : ''}
      
      <a href="${APP_URL}/track-shipment?tracking=${quote.trackingNumber}" class="action-button">View Updated Information</a>
      
      <p>If you have any questions about the changes, please don't hesitate to contact us.</p>
      
      <p>Best regards,<br>
      <strong>Modest Cargo Team</strong></p>
    `;

    const adminContent = `
      <p>Quote request has been edited:</p>
      
      ${formatQuoteDetails(quote)}
      
      ${Object.keys(changedFields).length > 0 ? `
        <p><strong>Changes Made:</strong></p>
        <div class="message-box">
          ${Object.entries(changedFields).map(([key, value]) => `
            <p><strong>${key}:</strong> ${value}</p>
          `).join('')}
        </div>
      ` : ''}
      
      <p><strong>Edited At:</strong> ${new Date().toLocaleString()}</p>
      
      <a href="${APP_URL}/dashboard/quote-requests" class="action-button">View in Dashboard</a>
    `;

    // Send to client
    await sendEmailViaBrevo({
      to: quote.email,
      subject: `Quote Information Updated - ${quote.trackingNumber}`,
      htmlContent: getEmailTemplate(clientContent, 'Quote Information Updated'),
      senderEmail: SENDER_EMAIL,
      senderName: SENDER_NAME,
    });

    // Send to admin
    await sendEmailViaBrevo({
      to: ADMIN_EMAIL,
      subject: `Quote Edited - ${quote.fullName} (${quote.trackingNumber})`,
      htmlContent: getEmailTemplate(adminContent, 'Quote Edited'),
      senderEmail: SENDER_EMAIL,
      senderName: SENDER_NAME,
    });

    console.log('✓ Quote edited emails sent successfully');
  } catch (error) {
    console.error('Error sending quote edited email:', error);
  }
};
