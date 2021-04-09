var admin = require("firebase-admin");

const { Storage } = require("@google-cloud/storage");

const serviceCredential = {
  type: "service_account",
  project_id: "watch-forum",
  private_key_id: "2c67332a158ac63ec3b56ee7a2f836537287d71a",
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.CLIENT_EMAIL,
  client_id: "105901087120085464802",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-f6jmj%40watch-forum.iam.gserviceaccount.com",
};

exports.handler = async (event, context) => {
  const { filename } = JSON.parse(event.body);

  // If app is not initialized yet.
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceCredential),
      storageBucket: process.env.REACT_APP_BUCKET,
    });
  }

  const storage = admin.storage();

  //const storage = new Storage();

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

  console.log(url);

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
