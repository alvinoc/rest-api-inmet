const AWS = require('aws-sdk');

const S3 = new AWS.S3();

module.exports.handler = async () => {
  try {
    const ContentType = await S3.getObject({
      Bucket: process.env.bucket,
      Key: 'refData/ref-data.json',
    }).promise();

    const refData = JSON.parse(ContentType.Body.toString('utf-8'));

    const tempMedia = refData[0].TEMP_INST;

    const result = {
      "tempMedia": tempMedia
    };

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      message: JSON.stringify(error),
    };
  }
};