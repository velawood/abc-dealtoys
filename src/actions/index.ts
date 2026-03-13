import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { Resend } from 'resend';

export const server = {
  submitInquiry: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Valid email is required'),
      company: z.string().optional(),
      phone: z.string().optional(),
      dealType: z.string().min(1, 'Deal type is required'),
      quantity: z.string().min(1, 'Quantity is required'),
      deadline: z.string().optional(),
      message: z.string().min(10, 'Message must be at least 10 characters'),
    }),
    handler: async (input) => {
      const resend = new Resend(import.meta.env.RESEND_API_KEY);
      const toEmail = import.meta.env.CONTACT_EMAIL_TO || 'delivered@resend.dev';

      const { error } = await resend.emails.send({
        from: 'ABC Deal Toys <onboarding@resend.dev>',
        to: [toEmail],
        subject: `New Quote Request: ${input.dealType} (${input.quantity} units)`,
        html: `
          <h2>New Deal Toy Inquiry</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 8px; font-weight: bold;">Name</td><td style="padding: 8px;">${input.name}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Email</td><td style="padding: 8px;">${input.email}</td></tr>
            ${input.company ? `<tr><td style="padding: 8px; font-weight: bold;">Company</td><td style="padding: 8px;">${input.company}</td></tr>` : ''}
            ${input.phone ? `<tr><td style="padding: 8px; font-weight: bold;">Phone</td><td style="padding: 8px;">${input.phone}</td></tr>` : ''}
            <tr><td style="padding: 8px; font-weight: bold;">Deal Type</td><td style="padding: 8px;">${input.dealType}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Quantity</td><td style="padding: 8px;">${input.quantity}</td></tr>
            ${input.deadline ? `<tr><td style="padding: 8px; font-weight: bold;">Deadline</td><td style="padding: 8px;">${input.deadline}</td></tr>` : ''}
            <tr><td style="padding: 8px; font-weight: bold;">Message</td><td style="padding: 8px;">${input.message}</td></tr>
          </table>
        `,
        replyTo: input.email,
      });

      if (error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }

      return { success: true };
    },
  }),
};
