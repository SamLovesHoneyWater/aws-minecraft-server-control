#!/bin/bash

# Path to the server directory
SERVER_DIR="/opt/minecraft/server"
JAR_NAME="server.jar"
JAVA_ARGS="-Xmx900M -Xms900M"
LOG_FILE="server.log"

# Require root
if [ "$(id -u)" -ne 0 ]; then
  echo "This script must be run as root."
  exit 1
fi

# Navigate to server directory
cd "$SERVER_DIR" || { echo "Directory $SERVER_DIR not found!"; exit 1; }

# Check if server is already running
PID=$(ps aux | grep "java $JAVA_ARGS -jar $JAR_NAME" | grep -v grep | awk '{print $2}')

if [ -n "$PID" ]; then
  echo "Minecraft server is currently running with PID $PID. Attempting to stop it..."
  kill "$PID"

  # Wait for the process to exit
  echo -n "Waiting for server to shut down"
  while kill -0 "$PID" 2>/dev/null; do
    echo -n "."
    sleep 1
  done
  echo -e "\nServer stopped."
else
  echo "No running Minecraft server found. Starting a new one..."
fi

# Start the server
echo "Starting Minecraft server..."
nohup java $JAVA_ARGS -jar "$JAR_NAME" nogui > "$LOG_FILE" 2>&1 &

echo "Minecraft server started."
