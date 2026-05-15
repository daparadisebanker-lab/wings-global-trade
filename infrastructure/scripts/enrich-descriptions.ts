import "dotenv/config";
import { createClient } from "@infrastructure/supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variables.");
  process.exit(1);
}

// Note: Using the publishable key because we just need to update descriptions and we are assuming RLS allows it,
// OR we should ideally use the service role key. Since we might not have the service role key, we will generate a SQL script
// just in case, but also attempt the direct update.
const supabase = createClient(supabaseUrl, supabaseKey);

function generateDescription(listing: any): string {
  const b = listing.brand || "This";
  const m = listing.model || "tractor";
  const hp = listing.horsepower ? `delivering a robust ${listing.horsepower} horsepower` : "engineered for reliable performance";
  
  const engineModel = listing.details?.engine?.model;
  const engine = engineModel ? `Powered by a highly-efficient ${engineModel} engine` : "Equipped with a dependable power plant";
  
  const drive = listing.drive_type || listing.details?.transmission_details?.drive_type;
  const trans = listing.transmission || (listing.details?.transmission_details?.forward_gears ? `${listing.details.transmission_details.forward_gears}F/${listing.details.transmission_details.reverse_gears}R` : null);
  
  let drivetrain = "";
  if (drive && trans) {
    drivetrain = `The ${drive} drivetrain, paired with a versatile ${trans} transmission, ensures optimal traction and seamless power delivery across challenging terrains.`;
  } else if (drive) {
    drivetrain = `The ${drive} configuration provides superior traction and stability in demanding agricultural environments.`;
  } else if (trans) {
    drivetrain = `Its versatile ${trans} transmission allows operators to adapt effortlessly to various field conditions and implement requirements.`;
  }

  const weight = listing.details?.dimensions?.operating_weight_kg;
  const pto = listing.details?.pto?.rear_pto_rpm;
  
  let capability = "";
  if (weight && pto) {
    capability = `Weighing in at ${weight.toLocaleString()} kg, it offers a stable platform for heavy-duty implements, while the ${pto} RPM PTO provides dependable power transfer for a wide range of attachments.`;
  } else if (weight) {
    capability = `Weighing in at ${weight.toLocaleString()} kg, it offers a highly stable and commanding platform for heavy-duty agricultural implements.`;
  } else if (pto) {
    capability = `The advanced ${pto} RPM PTO system provides dependable, continuous power transfer for demanding agricultural attachments.`;
  }

  return `The ${b} ${m} is a professional-grade agricultural tractor designed for modern farming operations. ${engine}, ${hp}, it provides an exceptional balance of torque and fuel efficiency. ${drivetrain} ${capability} Built for endurance and operational excellence, the ${m} stands as an indispensable asset for maximizing productivity in the field.`.replace(/\s+/g, ' ').trim();
}

import fs from "fs";

async function run() {
  console.log("Fetching listings from Supabase...");
  const { data: listings, error } = await supabase.from("listings").select("id, brand, model, horsepower, drive_type, transmission, details");
  
  if (error) {
    console.error("Error fetching listings:", error);
    return;
  }

  console.log(`Found ${listings.length} listings. Generating SQL update script...`);
  
  let sql = `-- Auto-generated script to enrich product descriptions\n\n`;
  
  for (const listing of listings) {
    const desc = generateDescription(listing);
    // Escape single quotes for SQL
    const safeDesc = desc.replace(/'/g, "''");
    sql += `UPDATE listings SET description = '${safeDesc}' WHERE id = '${listing.id}';\n`;
  }
  
  fs.writeFileSync("infrastructure/supabase/enrich-descriptions.sql", sql);
  console.log("SQL script generated at infrastructure/supabase/enrich-descriptions.sql");
  console.log("Since RLS might block direct updates via the public key, please copy the contents of infrastructure/supabase/enrich-descriptions.sql and run it in the Supabase SQL Editor.");
}

run();
