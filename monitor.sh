#!/bin/bash

LOG_FILE="/opt/app/system_monitor.log"

echo "=== System Check: $(date) ===" >> $LOG_FILE

# CPU Check
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
echo "CPU Usage: $CPU_USAGE%" >> $LOG_FILE

# Memory Check
MEM_USAGE=$(free -m | awk 'NR==2{printf "%.2f", $3*100/$2 }')
echo "Memory Usage: $MEM_USAGE%" >> $LOG_FILE

if awk "BEGIN {exit !($CPU_USAGE > 90)}"; then
    echo "ALERT: High CPU Usage! ($CPU_USAGE%)" >> $LOG_FILE
fi

if awk "BEGIN {exit !($MEM_USAGE > 90)}"; then
    echo "ALERT: High Memory Usage! ($MEM_USAGE%)" >> $LOG_FILE
fi

echo "--------------------------------" >> $LOG_FILE
