"use server";

import nodemailer from "nodemailer";

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  projectDetails: string;
}

export async function sendContactEmail(formData: ContactFormData) {
  try {
    // Parse EMAIL_TO to support multiple recipients
    const emailToRaw = process.env.EMAIL_TO || "";
    const emailRecipients = emailToRaw
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (emailRecipients.length === 0) {
      throw new Error(
        "No valid email recipients found in EMAIL_TO environment variable"
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    }); // Email content for the business owners
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: emailRecipients.join(", "), // Send to all recipients
      subject: `New Contact Form Submission from ${formData.firstName} ${formData.lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #ea580c; margin-bottom: 30px; text-align: center;">New Contact Form Submission</h2>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #374151; margin-bottom: 10px;">Contact Information:</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${formData.email}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #374151; margin-bottom: 10px;">Project Details:</h3>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; border-left: 4px solid #ea580c;">
                <p style="margin: 0; line-height: 1.6;">${formData.projectDetails}</p>
              </div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                This email was sent from the GTD Media Production contact form.
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">
                Please respond directly to: ${formData.email}
              </p>
            </div>
          </div>
        </div>
      `,
    }; // Send email to business owners
    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: `Email sent successfully to ${emailRecipients.length} recipient(s)! We'll get back to you soon.`,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      message: "Failed to send email. Please try again or contact us directly.",
    };
  }
}
