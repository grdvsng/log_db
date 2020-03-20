#
# Псевдо база данных для выполнения задания
#


package VirtualBD; 
{
    use strict;
    use warnings NONFATAL => 'all';
    use JSON;
    use Data::Dumper;
    use List::MoreUtils qw(first_index);
    use List::MoreUtils qw( zip );

    sub new
    {
        my $class = shift;
        my $self  =
        {
            name   => shift,
            file   => shift,
            tables => [],
        };
        
        if (-e $self->{file})
        { 
            $self = $class->load($self->{file});
        }

        bless($self, $class);
        $self->write();

        return $self;
    }

    sub load_db_from_json
    {
        my $self      = shift;
        my $file_path = shift;
        my $str       = "";

        open(FILE, $file_path);

        while (my $record = <FILE>)
        {
            $str .= $record;
        }
        
        close FILE;

        return decode_json($str);
    }

    sub load
    {
        my $self      = shift;
        my $file      = shift;
        my $db        = $self->load_db_from_json($file);
        $db->{file}   = $file;

        return $db;
    }

    sub get_table
    {
        my $self       = shift;
        my $table_name = shift;
        my @tables     = @{$self->{tables}};

        foreach (@tables)
        {
            if ($_->{'name'} eq $table_name)
            {
                return $_;
            }
        } 
        
        warn("Table with name '$table_name' not exists");
        
        return undef;
    }

    sub check_fields
    {
        my $self     = shift;
        my $fields   = shift;
        my $table    = shift;
        my $values   = shift;
        my $t_fields = $table->{'fields'};

        if (@{$fields} != @{$values})
        {
            warn("Fields len '@{$fields}', but value in '@{$values}'");
            
            return 0;
        }

        foreach my $i (0..@{$fields}-1)
        {
            if ((grep { ${$t_fields}[$_] eq ${$fields}[$i] } (0..@{$t_fields}-1)) == 0)
            {
                warn("Field '${$fields}[$i]' is not exists in '$table->{name}'");
                
                return 0;
            }
        }

        return 1;
    }

    sub make_record
    {
        my $self    = shift;
        my @fields  = shift;
        my @values  = shift;

        return zip(@fields, @values);
    }
    
    sub exists
    {
        my $self  = shift;
        my $table = shift;
        my $rec   = shift;
        
        if ($table)
        {
            my @records = @{$table->{records}};

            foreach my $record (@records)
            {
               my $eq = 1;

               for my $key (keys(%{$record}))
               {
                    if ($rec->{$key} && $rec->{$key} ne $record->{$key})
                    {
                        $eq = 0;
                        last;
                    }
               }

               if ($eq) { return 1 };
            }
        }
        
        return 0;
    }

    sub validate
    {
        my $self       = shift;
        my $table_name = shift;
        my $fields     = shift;
        my $values     = shift;
        my $result     = 1;
        my $table      = $self->get_table($table_name);
        my %rec        = zip(@{$fields}, @{$values});

        if (!$table)
        {
            return "Table with name '$table_name'";
        } elsif (!$self->check_fields($fields, $table, $values)) {
            return "Incorect fields: ".encode_json($fields);
        }# elsif ($self->exists($table, \%rec)) {
        #    return "Record exists: ".encode_json(\%rec);
        #}

        return 1;
    }

    sub _insert
    {
        my $self     = shift;
        my $table    = shift;
        my $fields   = shift;
        my $values   = shift;
        my $record   = {};
        my $t_fields = $table->{'fields'};
        
        foreach my $i (0..@{$t_fields}-1)
        {
            my $field_name  = ${$t_fields}[$i];
            my $value_index = first_index{ $_ eq $field_name } @{$fields};
            
            if ($value_index == -1)
            {
                $record->{$field_name} = undef;
            } else {
                
                $record->{$field_name} = $values->[$value_index];
            }
        }
        
        push(@{$table->{records}}, $record);
    }

    sub insert
    {
        my $self       = shift;
        my $table_name = shift;
        my $fields     = shift;
        my $values     = shift;
        my $valid      = $self->validate($table_name, $fields, $values); # Вернет таблицу если все корректно

        if ($valid."" eq "1")
        {
            $self->_insert($self->get_table($table_name), $fields, $values);
            
            return 1;
        } else { return $valid; }
    }

    sub create_table
    {
        my $self  = shift;
        my $table = 
        {
            name    => shift,
            fields  => shift,
            records => []
        };

        push(@{$self->{tables}}, $table);
    }

    sub get_name
    {
        return shift->{name};
    }

    sub bd_to_json
    {
        my $self   = shift;
        my @tables = @{$self->{tables}};
        my %obj    = 
        (
            name   => $self->{name},
            tables => [],
        );

        foreach (@tables)
        {
            push(@{$obj{'tables'}}, $_);
        } 

        return encode_json(\%obj);
    }
    
    sub select
    {
        my $self       = shift;
        my $table      = $self->get_table(shift);
        my $lambda     = shift;
        my @results    = [];

        if ($table)
        {
            my @records = @{$table->{records}};

            foreach my $record (@records)
            {
                if ($lambda->($record))
                {
                    push(@results, $record) if ($record);
                }
            }
        }

        return @results;
    }

    sub write
    {
        my $self = shift;
        
        open(FILE, ">", $self->{file});
        print(FILE $self->bd_to_json());
        
        close(FILE);
    }
}

1;