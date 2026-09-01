import time
import subprocess
import os

# Function to take screenshot using scrot or similar
def take_screenshot(filename):
    subprocess.run(['scrot', filename])
    print(f"Screenshot saved: {filename}")

# Retriever test
print("Clicking retriever...")
# We'll use xdotool to click at the dog's position
subprocess.run(['xdotool', 'mousemove', '640', '400', 'click', '1'])
time.sleep(0.25)
take_screenshot('/tmp/retriever-midjump-0.25s.png')
time.sleep(0.8)
take_screenshot('/tmp/retriever-landing-1.05s.png')

print("All screenshots captured!")
