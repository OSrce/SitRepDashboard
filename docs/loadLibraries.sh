#!/bin/sh

mkdir ../data/temp
cd ../data/temp

wget http://download.dojotoolkit.org/release-1.7.3/dojo-release-1.7.3.tar.gz
#wget http://www.sitrep.org/downloads/dojo-release-1.7.3.tar.gz
tar -zxvf dojo-release-1.7.3.tar.gz
mv dojo-release-1.7.3/* ../../public/lib/.
rm ../../public/lib/build-report.txt
echo -e "*\n!.gitignore\n" >../../public/lib/dojo/.gitignore
echo -e "*\n!.gitignore\n" >../../public/lib/dijit/.gitignore
echo -e "*\n!.gitignore\n" >../../public/lib/dojox/.gitignore

wget http://www.openlayers.org/download/OpenLayers-2.12.tar.gz
tar -zxvf OpenLayers-2.12.tar.gz
mv OpenLayers-2.12 ../../public/lib/OpenLayers
echo -e "*\n!.gitignore\n" >../../public/lib/OpenLayers/.gitignore

cd .. 
rm -rf temp





