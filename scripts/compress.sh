#!/bin/bash

for filename in $1/*; do
	echo "compressing $filename"
	convert "$filename" -strip -interlace Plane -quality 75% "$filename"
done
