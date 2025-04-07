# stop.sh
# Find the PID of the Minecraft server process
PID=$(ps aux | grep 'java -Xmx900M -Xms900M -jar server.jar' | grep -v grep | awk '{print $2}')

# Send the stop command
if [ -n "$PID" ]; then
  kill "$PID"
  echo "Minecraft server shutting down gracefully."
else
  echo "Minecraft server not running."
fi
