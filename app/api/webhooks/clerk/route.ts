import prisma from "@/lib/prisma";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);
    const { type, data } = evt;

    if (type === "user.created" || type === "user.updated") {
      const { id, email_addresses, primary_email_address_id, first_name, last_name, image_url } = data;

      const email =
        email_addresses?.find((e) => e.id === primary_email_address_id)?.email_address ??
        email_addresses?.[0]?.email_address ??
        "";
      const name = [first_name, last_name].filter(Boolean).join(" ") || email;

      await prisma.user.upsert({
        where: { clerkId: id },
        update: { name, email, avatar: image_url },
        create: { clerkId: id, name, email, avatar: image_url },
      });
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
