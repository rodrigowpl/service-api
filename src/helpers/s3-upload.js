const aws = require('aws-sdk')

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_KEY,
  AWS_BUCKET_NAME
} = require('../config/settings')

aws.config.update({
  region: 'us-east-1',
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_KEY
})

module.exports = {
  getS3SignedUrl: ({ fileName, fileType = 'application/pdf' }) => {
    const s3 = new aws.S3()
    const bucketPath = `${AWS_BUCKET_NAME}`
    const s3Params = {
      Bucket: bucketPath,
      Key: fileName,
      Expires: 120000,
      ContentType: fileType,
      ACL: 'public-read'
    }

    return new Promise((resolve, reject) => {
      s3.getSignedUrl('putObject', s3Params, (err, data) => {
        if(err){
          reject(err)
        }
        const returnData = {
          signedRequest: data,
          url: `https://${bucketPath}.s3.amazonaws.com/${fileName}`
        }
        resolve(returnData)
      })
    })
  }
}
