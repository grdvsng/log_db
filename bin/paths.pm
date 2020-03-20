#
# Серверная логика
#


package paths;
{
    use File::Spec::Functions 'catfile';
    use fso;
    use LogParser;
    use Data::Dumper;
    use JSON;

    my $parser_config =
    {
        message => 
        {
            created => "\\d{4}\\-\\d{2}-\\d{2} \\d{2}\:\\d{2}\\:\\d{2}",    
            id      => "(?<=id=)[^ ]+\$",       
            int_id  => "[^ ]{6}\-[^ ]{6}\-[^ ]+",  
            str     => "(?<=\=\= |<= |-> |=> |\\*\\* ).{0,}"
        },

        log =>
        {
            created => "\\d{4}\\-\\d{2}-\\d{2} \\d{2}\:\\d{2}\\:\\d{2}",    
            address => '[^ <]+@[^ >]+',       
            int_id  => "[^ ]{6}\-[^ ]{6}\-[^ ]+", 
            str     => "(?<=\=\= |<= |-> |=> |\\*\\* ).{0,}"
        }
    };

    sub new
    {
        $class = shift;
        $self  = 
        {
            map => [{
                paths  => ['/', '/index', '/home'],
                method => \&index,
            }, {
                 paths  => ['/rest/update_db'],
                 method => \&update_db,
            }, {
                 paths  => ['/rest/get_base'],
                 method => \&get_base,
            }],
        };

        bless($self, $class);

        return $self;
    }
    
    sub DB_Response
    {
        my $resp    = HTTP::Response->new(shift);
        my $data    = shift;
        my $on_json = shift;
        
        $resp->header('Content-Type' => 'application/json');
        if ($on_json) { $resp->content($data);              }
        else          { $resp->content(encode_json($data)); }

        return $resp;
    }
    
    sub get_base
    {
        my $master  = shift;
        my $request = shift;
        
        return DB_Response(200, $master->{db}->bd_to_json(), 1);
    }

    # Добавление распарсеной записи в таблицу
    sub _update_db
    {
        my $master  = shift;
        my $line    = shift;
        my $r       = shift;
        my ($resp, $data, $table);

        if ($line =~ m/<=/gi)                 { $table = 'message'; } 
        elsif($line =~ m'==|<=|->|=>|\*\*'gi) { $table = 'log';     }
        else                                  { return push(@{$result-> {rejected}}, {data => $line, cause => "Can't parse line."}); }
        
        @data = LogParser->parse($line, $parser_config->{$table});
        $resp = $master->{db}->insert($table, $data[0], $data[1]);

        if ($resp == 1) { push(@{$r-> {resolved}}, {table=> $table, data => $data[2]}); }
        else            { push(@{$r-> {rejected}}, {table=> $table, data => $data[2], cause => $resp}); }

        return $r; 
    }

    sub update_db
    {
        my $master  = shift;
        my $request = shift;
        my @content = split("\n", $request->{'_content'});
        my $r  = {cout => 0, resolved => [], rejected=> []};

        if (@content > 3)
        {
            for (my $i=3; $i < @content-2; $i++)
            {
                my $line   = $content[$i];
                $r         = _update_db($master, $line, $result);
                $r->{cout}++;
            }

            $r->{cout}++;
        }
        
        $master->{db}->write();

        if ($r->{cout} == 0) { return DB_Response(404, $r); } 
        else                 { return DB_Response(200, $r); }
    }

    sub index
    {
        my $master  = shift;
        my $request = shift;
        my $res     = HTTP::Response->new(200);
        my $file    = 'web_application/index.html';

        if ($request)
        {
            my $ctx = fso->read_content_from_file($file); 
            
            $res->header('Content-Type' => 'text/html');
            $res->content($ctx || '<div>Page not found...</div>');

            return $res; 
        }

        return 0;
    }
}

1;