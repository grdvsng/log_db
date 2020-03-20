#
# Работа с файлами
#

package fso
{

    use File::Basename;

    sub read_content_from_file
    {
        my $self                = shift;
        my $file_path           = shift;
        my $ctx                 = "";

        if (-e $file_path)
        {
            open(FILE, '<', $file_path);
            
            while (my $line = <FILE>)
            {
                $ctx .= $line;
            }

            close(FILE);

            return $ctx;
        } else {
            return 0;
        }
    }

    sub get_content_type_by_file_name
    {
        my $self      = shift;
        my $file_path = shift;
        my ($r)       = $file_path =~ m/\.[^\.]+$/gi;
        my $map       = {
            '.js'   => 'text/javascript',
            '.html' => 'text/html',
            '.css'  => 'text/css'
        };

        return $map->{$r};
    }
}

1;