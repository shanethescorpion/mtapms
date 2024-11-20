'use server'

import Student from "@app/models/Student";
import { z } from "zod";
import mongodbConnect from "./db";

const EmailAddress = z.object({
  to: z.string().email({ message: 'Not a valid email.' }).trim(),
  code: z.string()
    .min(6, { message: 'Code must be at least 6 characters long.' })
    .max(6, { message: 'Code must be at most 6 characters long.' })
    .regex(/^[0-9]{6}$/, { message: 'Not a valid code.' })
    .trim()
    .optional()
})

export async function sendEmailNotification(toEmail: string, fullName: string) {
  const zTo = EmailAddress.safeParse({
    to: toEmail
  })
  try {
    if (!zTo.success) {
      throw new Error(zTo.error.message)
    }
    await mongodbConnect();
    const { to } = zTo.data;
    const u = await Student.findOne({ email: to });
    if (!u) {
      throw new Error('No Account Found / Email is not registered')
    }
    const url = new URL('/v3/mail/send', 'https://api.sendgrid.com')
    return fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: {
          email: process.env.SENDGRID_FROM_EMAIL_NO_REPLY || process.env.SENDGRID_FROM_EMAIL,
          name: process.env.SENDGRID_FROM_NAME_NO_REPLY || process.env.SENDGRID_FROM_NAME,
        },
        personalizations: [
          {
            to: [
              {
                email: to,
                name: fullName,
              }
            ],
            dynamic_template_data: {
              // balobp_domain_origin: process.env.DOMAIN_ORIGIN || 'localhost:3000',
              // balobp_user_role: role,
              // balobp_application_no: applicationNo,
              // balobp_notification_messages: `<ul>${messages.map(({name, messages}) => '<li><span style="font-weight: bold;">' + name + ' - </span>' + messages +'</li>')}</ul>`,
            },
            reply_to: {
              email: process.env.SENDGRID_FROM_EMAIL,
              name: process.env.SENDGRID_FROM_NAME,
            }
          }
      ],
      template_id: process.env.SENDGRID_TEMPLATE_ID
      })
    })
  } catch (e: any) {
    return { error: e.message }
  }
}