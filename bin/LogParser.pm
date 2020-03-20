#
# Парсер для лога
#


package LogParser;
{
    use strict;
    use warnings;
    use Data::Dumper;

    sub new
    {
        my @class = shift;
        my $self  = {};

        bless($self, @class);

        return $self;
    }
    
    sub parse
    {
        my $self    = shift;
        my $ctx     = shift;
        my $map     = shift;
        my $keys    = [];
        my $values  = [];
        my $record  = {};

        foreach my $key(keys %{$map})
        {
            my $re          = $map->{$key};
            my ($str)       = $ctx =~ m/$re/gi;
            $record->{$key} = $str;

            push(@{$keys}, $key);
            push(@{$values}, $str);
            
        }

        return ($keys, $values, $record);
    }
}

1;