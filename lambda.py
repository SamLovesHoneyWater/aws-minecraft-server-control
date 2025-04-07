import boto3
import json
import hashlib
import datetime
import time

# Hardcoded EC2 instance ID
INSTANCE_ID = ""
REGION = ""

# Initialize clients
ec2 = boto3.client("ec2", region_name=REGION)
ssm = boto3.client("ssm", region_name=REGION)

# Function to hash a string
def hash_string(input_string):
    hash_object = hashlib.sha256()
    hash_object.update(input_string.encode('utf-8'))
    hashed_string = hash_object.hexdigest()
    return hashed_string

def verify_auth(request, claim):
    users = {
        # Hardcoded user credentials
        "admin": hash_string("admin"),
        "guest": hash_string("guest")
    }
    user_id = request["body"]["username"]
    claim_hash = request["body"]["hash"]
    if user_id not in users.keys():
        return False
    base_string = f"{user_id}_{claim}_{users[user_id]}"
    real_hash = hash_string(base_string)
    return real_hash == claim_hash

def login(request):
    return {"statusCode": 200, "message": "Login successful"}

def instance_status_func():
    response = ec2.describe_instance_status(InstanceIds=[INSTANCE_ID], IncludeAllInstances=True)
    state = response["InstanceStatuses"][0]["InstanceState"]["Name"]
    return state

def get_ip_func():
    response = ec2.describe_instances(InstanceIds=[INSTANCE_ID])
    reservations = response.get("Reservations", [])
    if reservations:
        public_ip = reservations[0]["Instances"][0].get("PublicIpAddress", "Remote not started")
        return public_ip
    return None

def stop_service_func():
    try:
        ssm.send_command(
            InstanceIds=[INSTANCE_ID],
            DocumentName="AWS-RunShellScript",
            Parameters={"commands": ["sudo bash -c \"/root/stop.sh\""]}
        )
        return True
    except:
        return False

def get_ip(request):
    try:
        public_ip = get_ip_func()
        if public_ip is not None:
            return {"statusCode": 200, "body": json.dumps({"status": "success", "public_ip": public_ip})}
        return {"statusCode": 404, "body": json.dumps({"error": "Instance not found"})}
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": "Error obtaining ip"})}

def start_instance(request):
    state = instance_status_func()
    if state != "stopped":
        return {"statusCode": 400, "body": json.dumps({"error": "Cannot start instance because it is not stopped"})}
    try:
        response = ec2.start_instances(InstanceIds=[INSTANCE_ID])
        return {"statusCode": 200, "body": json.dumps({"status": "success", "message": "Instance started"})}
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": f"Error starting instance: {e}"})}

def start_service(request):
    state = instance_status_func()
    if state != "running":
        return {"statusCode": 400, "body": json.dumps({"error": "Cannot start service because instance is not running"})}
    try:
        response = ssm.send_command(
            InstanceIds=[INSTANCE_ID],
            DocumentName="AWS-RunShellScript",
            Parameters={"commands": ["sudo bash -c \"/root/robust_start.sh\""]}
        )
        return {"statusCode": 200, "body": json.dumps({"status": "success", "message": "Service started"})}
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": f"Error starting service, got {e}"})}

def stop_instance(request):
    state = instance_status_func()
    if state != "running":
        return {"statusCode": 400, "body": json.dumps({"error": "Cannot shut down because instance is not running"})}
    # First gracefully end game
    res_1 = stop_service_func()
    if not res_1:
        return {"statusCode": 500, "body": json.dumps({"error": "Error stopping service"})}
    # Wait for 1 seconds for world file to save
    time.sleep(1)
    # Now, shut down instance
    try:
        response = ec2.stop_instances(InstanceIds=[INSTANCE_ID])
        return {"statusCode": 200, "body": json.dumps({"status": "success", "message": "Instance stopped"})}
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": "Error stopping instance"})}

def instance_status(request):
    state = instance_status_func()
    public_ip = get_ip_func()
    if public_ip is None:
        # Even when instance is stopped, public_ip will be a string
        # When it's None, we have encountered a more serious problem
        return {"statusCode": 404, "body": json.dumps({"error": "Remote Instance is Unreachable"})}
    return {"statusCode": 200, "body": json.dumps({"status": "success", "state": state, "ip_address": public_ip})}

def lambda_handler(event, context):
    if event["requestContext"]["http"]["method"] == "OPTIONS":
        return {"statusCode": 200, "body": json.dumps({"status": "success"})}
    
    try:
        event["body"] = json.loads(event["body"])
    except json.JSONDecodeError:
        return {"statusCode": 400, "body": json.dumps({"error": "Invalid request"})}

    if event["rawPath"] == "/login" and event["requestContext"]["http"]["method"] == "POST":
        auth = verify_auth(event, "login")
        if not auth:
            return {"statusCode": 401, "body": json.dumps({"error": "Invalid credentials"})}
        return login(event)

    if event["rawPath"] == "/ip_addr" and event["requestContext"]["http"]["method"] == "POST":
        auth = verify_auth(event, "ip_addr")
        if not auth:
            return {"statusCode": 401, "body": json.dumps({"error": "Invalid credentials"})}
        return get_ip(event)
    
    if event["rawPath"] == "/start_instance" and event["requestContext"]["http"]["method"] == "POST":
        try:
            auth = verify_auth(event, "start_instance")
        except:
            return {"statusCode": 500, "body": json.dumps({"error": "Error verifying auth"})}
        if not auth:
            return {"statusCode": 401, "body": json.dumps({"error": "Invalid credentials"})}
        return start_instance(event)

    if event["rawPath"] == "/stop_instance" and event["requestContext"]["http"]["method"] == "POST":
        try:
            auth = verify_auth(event, "stop_instance")
            if not auth:
                return {"statusCode": 401, "body": json.dumps({"error": "Invalid credentials"})}
            return stop_instance(event)
        except:
            return {"statusCode": 500, "body": json.dumps({"error": "Error stopping instance"})}
    
    if event["rawPath"] == "/start_service" and event["requestContext"]["http"]["method"] == "POST":
        auth = verify_auth(event, "start_service")
        if not auth:
            return {"statusCode": 401, "body": json.dumps({"error": "Invalid credentials"})}
        return start_service(event)
    
    if event["rawPath"] == "/instance_status" and event["requestContext"]["http"]["method"] == "POST":
        auth = verify_auth(event, "instance_status")
        if not auth:
            return {"statusCode": 401, "body": json.dumps({"error": "Invalid credentials"})}
        return instance_status(event)

    return {"statusCode": 404, "body": json.dumps({f"error": "Not found {event}"})}

