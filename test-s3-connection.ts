import { S3Client, ListBucketsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.AWS_REGION || 'us-east-1';
const bucket = process.env.AWS_S3_BUCKET;

console.log('Testing AWS S3 Connection...');
console.log('Region:', region);
console.log('Bucket:', bucket);

const client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

async function testS3() {
  try {
    // Test 1: List buckets
    console.log('\n1. Testing AWS credentials...');
    const listCommand = new ListBucketsCommand({});
    const listResult = await client.send(listCommand);
    console.log('✓ AWS credentials are valid');
    console.log('Available buckets:', listResult.Buckets?.map(b => b.Name).join(', '));

    // Test 2: Generate presigned URL
    console.log('\n2. Testing presigned URL generation...');
    const uniqueKey = `test/${Date.now()}.txt`;
    const putCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: uniqueKey,
    });
    
    const uploadURL = await getSignedUrl(client, putCommand, { expiresIn: 900 });
    console.log('✓ Successfully generated presigned URL');
    console.log('Upload URL length:', uploadURL.length);
    
    console.log('\n✓ All tests passed! AWS S3 is properly configured.');
  } catch (error: any) {
    console.error('\n✗ Error:', error.message);
    if (error.Code) console.error('Error Code:', error.Code);
    if (error.$metadata) console.error('Metadata:', error.$metadata);
    process.exit(1);
  }
}

testS3();
