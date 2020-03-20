use File::Spec::Functions 'catfile';
use File::Spec            'rel2abs';
use lib File::Spec->rel2abs(catfile('bd'));
use lib File::Spec->rel2abs(catfile('bin'));
use lib File::Spec->rel2abs('.');
use core;
use config;
use strict;

my $cfg = config->new();
my $App = core->new($cfg);
