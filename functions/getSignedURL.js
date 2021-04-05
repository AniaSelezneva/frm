var admin = require("firebase-admin");
var serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);

const { Storage } = require("@google-cloud/storage");

exports.handler = async (event, context) => {
  const { filename } = JSON.parse(event.body);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.REACT_APP_BUCKET,
  });

  const storage = new Storage();

  // CONFIGURE BUCKET CORS
  const configureBucketCors = async () => {
    await storage.bucket(process.env.REACT_APP_BUCKET).setCorsConfiguration([
      {
        maxAgeSeconds: 3600,
        method: ["PUT"],
        origin: [`http://localhost:8888/`, `https://p6b.netlify.app/`],
        responseHeader: ["Content-Type", "Access-Control-Allow-Origin"],
      },
    ]);
  };

  await configureBucketCors();

  const [url] = await storage
    .bucket(process.env.REACT_APP_BUCKET)
    .file(filename)
    .getSignedUrl({
      action: "write",
      contentType: "image/jpeg",
      expires: "01-01-2500",
    });

  // // Check current CORS of the bucket
  // const [metadata] = await storage
  //   .bucket(process.env.REACT_APP_BUCKET)
  //   .getMetadata();

  // for (const [key, value] of Object.entries(metadata)) {
  //   console.log(`${key}: ${value}`);
  // }

  return {
    statusCode: 200,
    body: JSON.stringify(url),
  };
};
