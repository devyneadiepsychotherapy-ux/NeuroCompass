#!/bin/bash
# Run this once to clear stale git locks and push the NeuroCompass changes
cd "/Volumes/Seagate/ND Compass"
rm -f .git/index.lock .git/HEAD.lock
git add -A
git commit -m "Burnout recovery two phases + sensory contingency plan tool"
git push origin main
