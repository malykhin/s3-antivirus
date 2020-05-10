terraform {
  required_version = "> 0.12.0"
  backend "local" {}
}

provider "aws" {
  access_key                  = "mock_access_key"
  region                      = "us-east-1"
  secret_key                  = "mock_secret_key"
  s3_force_path_style         = true
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    sqs = "http://localstack:4576"
    iam = "http://localstack:4593"
    s3  = "http://localstack:4572"
  }
}

resource "aws_s3_bucket" "import_bucket" {
  bucket = "import-bucket"
}

resource "aws_s3_bucket" "safe_bucket" {
  bucket = "safe-bucket"
}

resource "aws_s3_bucket_policy" "import_bucket_policy" {
  bucket = aws_s3_bucket.import_bucket.id

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": ["s3:GetObject", "s3:PutObjectTagging"],
      "Resource": ["arn:aws:s3:::import-bucket/*"],
      "Condition": {
         "StringEquals": {
           "s3:ExistingObjectTag/AV_STATUS": "INFECTED"
         }
       }
    },
    {
       "Effect": "Deny",
       "Action": ["s3:GetObject"],
       "Principal": "*",
       "Resource": ["arn:aws:s3:::import-bucket/*"],
       "Condition": {
         "StringEquals": {
           "s3:ExistingObjectTag/AV_STATUS": "CLEAN"
         }
       }
     }
  ]
}
POLICY
}

resource "aws_sqs_queue" "av_queue" {
  name = "av-queue"

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "sqs:SendMessage",
      "Resource": "arn:aws:sqs:*:*:av-queue",
      "Condition": {
        "ArnEquals": { "aws:SourceArn": "${aws_s3_bucket.import_bucket.arn}" }
      }
    }
  ]
}
POLICY
}

resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = aws_s3_bucket.import_bucket.id

  queue {
    queue_arn = aws_sqs_queue.av_queue.arn
    events    = ["s3:ObjectCreated:*"]
  }
}

