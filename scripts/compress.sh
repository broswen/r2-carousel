#!/bin/bash

# usage
# compress.sh /path/to/images/directory /path/to/output/directory

for file in $1/*; do
	echo "compressing $file"
	filename=$(basename "$file")
	filename="${filename%.*}"
	convert "$file" -strip -interlace Plane -quality 60% "$2"/"$filename".webp
done
