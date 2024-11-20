import mongodbConnect from "@app/lib/db";
import seed from "@app/lib/seed";

export  async function register() {
  await mongodbConnect()
  await seed()
}