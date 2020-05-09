#!/bin/sh

export AWS_ACCESS_KEY_ID=aaa
export AWS_SECRET_ACCESS_KEY=bbb
export AWS_DEFAULT_REGION=us-west-2

case $1 in

  cp_file)
    aws --endpoint-url=http://localhost:4572 s3 cp ./README.md s3://import-bucket
    ;;

  get_tag)
    aws s3api --endpoint-url=http://localhost:4572 get-object-tagging --bucket import-bucket --key README.md
    ;;

  get_file)
    aws s3api --endpoint-url=http://localhost:4572 get-object --bucket import-bucket --key README.md ./test_file
    ;;

  *)
    echo "Allowed commands: cp_file, get_tag, get_file"
    ;;
esac

