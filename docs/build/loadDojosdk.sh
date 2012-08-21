#!/bin/sh

SRHOME=../../

mkdir $SRHOME/data/temp
cd $SRHOME/data/temp

wget http://download.dojotoolkit.org/release-1.7.3/dojo-release-1.7.3-src.tar.gz

#wget http://www.sitrep.org/downloads/dojo-release-1.7.3.tar.gz
tar -zxvf dojo-release-1.7.3-src.tar.gz
mv dojo-release-1.7.3-src/* $SRHOME/public/lib_src/.
echo -e "*\n!.gitignore\n" >$SRHOME/public/lib_src/dojo/.gitignore
echo -e "*\n!.gitignore\n" >$SRHOME/public/lib_src/dijit/.gitignore
echo -e "*\n!.gitignore\n" >$SRHOME/public/lib_src/dojox/.gitignore
echo -e "*\n!.gitignore\n" >$SRHOME/public/lib_src/util/.gitignore

cd .. 

#rm -rf temp





