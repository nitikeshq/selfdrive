import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { readFileSync } from "fs";
import { join } from "path";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const images = [
  { file: "tata_altroz_cng_hatc_6c1b38ab.jpg", vehicleId: "21b76e3c-088b-47c5-8cc4-cc8c71c7c0d9" },
  { file: "maruti_suzuki_baleno_98313b86.jpg", vehicleId: "b7393856-6111-4760-9fdf-d11c2168a905" },
  { file: "ford_ecosport_white__5fd7a040.jpg", vehicleId: "154f8db7-04ee-47bb-83db-815208fe3540" },
  { file: "ford_aspire_sedan_bl_5114e8cd.jpg", vehicleId: "9f489d13-fbed-4708-b2d1-fd9bd7c77c30" },
  { file: "hyundai_creta_2022_s_60bb4b7e.jpg", vehicleId: "80958879-236c-46b1-8cce-34f3f60f498b" },
];

async function uploadImages() {
  for (const img of images) {
    const filePath = join(process.cwd(), "attached_assets", "stock_images", img.file);
    const fileContent = readFileSync(filePath);
    const key = `vehicles/${img.vehicleId}/${img.file}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: fileContent,
      ContentType: "image/jpeg",
    });

    await s3Client.send(command);
    const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    console.log(`Uploaded ${img.file} -> ${url}`);
    console.log(`UPDATE vehicles SET image_url = '${url}' WHERE id = '${img.vehicleId}';`);
  }
}

uploadImages().catch(console.error);
