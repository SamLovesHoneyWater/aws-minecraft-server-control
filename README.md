# Control your Minecraft server with a website!

This is the front end of a remote control for a small personal minecraft server hosted on AWS EC2.

The user can start the instance, stop the instance, and start/restart the server on this website, as well as check instance status and IP.

Prerequisites:

- Have a Minecraft server on EC2, see instructions here: **https://aws.amazon.com/blogs/gametech/setting-up-a-minecraft-java-server-on-amazon-ec2/**
- Upload a script for starting/stopping the minecraft server on the EC2, in the root directory; sample scripts are provided as robust_start.sh and stop.sh, assuming the server path on EC2 is /opt/minecraft/server
- Set up a backend to process requests. I'm using AWS Lambda to control the EC2, some code is provided in lambda.py for your reference
- Set up API using AWS API Gateway and attach them to the Lambda function and configure CORS policy, APIs: /login, /instance_status, /start_instance, /start_service, /stop_instance
- Set up AWS IAM roles to allow the Lambda to control the EC2 server so that the Lambda has a role with AmazonEC2FullAccess and AmazonSSMFullAccess while the EC2 has a role with AmazonSSMManagedInstanceCore
- Further enable SSM for your EC2, see: **https://docs.aws.amazon.com/systems-manager/latest/userguide/ssm-agent-status-and-restart.html**
Important notes:
- Everything in this repo is provided as-is, with no guarantees whatsover. The code might not be functional, secure, or free of bugs. Use the code at your own risk.
- The authentication method is quite insecure and does not follow best practices. It is recommended to use this only for a small server among close friends, and only in cases where a failure or security breach is not of significant concern.
- This code hasn't been fully tested against save file safety, even though EC2 seems to provide ample safeguards, see: **https://repost.aws/questions/QUuLxiawKFQ3WmQWZ-axINWg/does-an-ec2-gracefully-shut-down-when-i-terminate-it**. Nevertheless, inproper usage might result in world file corruption.

Made with Lovable
