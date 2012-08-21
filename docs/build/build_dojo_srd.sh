#!/bin/sh

SRHOME=../..
SRSRC=$SRHOME/public/lib_src/srd
DESTDIR=$SRHOME/public/lib

rm -rf $DESTDIR/dojo
rm -rf $DESTDIR/dijit
rm -rf $DESTDIR/dojox
rm -rf $DESTDIR/srd


$SRHOME/public/lib_src/util/buildscripts/build.sh --require "$SRSRC/run.js" --profile "$SRSRC/srd.profile.js" --releaseDir "$DESTDIR"



