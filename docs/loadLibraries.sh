#!/bin/sh

mkdir ../data/temp
cd ../data/temp

wget http://download.dojotoolkit.org/release-1.7.3/dojo-release-1.7.3.tar.gz
#wget http://www.sitrep.org/downloads/dojo-release-1.7.3.tar.gz
tar -zxvf dojo-release-1.7.3.tar.gz
mv dojo-release-1.7.3/* ../../public/lib/.

#wget http://www.openlayers.org/download/OpenLayers-2.12.tar.gz

cd .. 
#rm -rf temp_files





