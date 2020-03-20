#
# Конфигурация приложения
#


package config;
{
    use File::Spec::Functions 'catfile';
    use File::Spec            'rel2abs';
    use lib File::Spec->rel2abs(catfile('bd'));
    use lib File::Spec->rel2abs(catfile('bin'));
    use strict;
    use VirtualBD;
    use paths;

    sub new
    {
        my $class = shift;  
        my $self  =
        {
            server =>
            {
                port   => '8081',
                host   => 'localhost',
                paths  => paths->new(),
                static => 'web_application',
            },

            keys =>
            {
                'static' => 'web_application',
            },

            db     => VirtualBD->new("TestBD", catfile("bd", "data", "vdb.json"))
        };

        bless($self, $class);

        return $self;
    }
}

1;