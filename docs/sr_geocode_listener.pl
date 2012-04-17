#!/usr/bin/perl
use strict;
use warnings;
use DBI;
use IO::Select;

my $dbName = "sr_data";
my $dbHost = "localhost";
my $dbPort = "5432";
my $dbUser = "sitrepadmin";

my $dbh = DBI->connect("DBI:Pg:dbname=$dbName;
		host=$dbHost","$dbUser","" )
		or die "Could not connect to DB!\n";

$dbh->do("LISTEN sr_location_workqueue");







$dbh->disconnect();



