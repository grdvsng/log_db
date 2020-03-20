#
# Ядро приложения
#


package core;
{
    use strict;
    use warnings;
    use HTTP::Daemon;
    use HTTP::Status;
    use List::MoreUtils qw(first_index);
    use fso;
    use File::Find;
    use Data::Dumper;

    sub new
    {
        my $class = shift;
        my $cfg   = shift;
        my $self  =
        {
            db            => $cfg->{db},
            port          => $cfg->{server}->{port},
            host          => $cfg->{server}->{host},
            paths         => $cfg->{server}->{paths},
            static        => $cfg->{server}->{static},
            keys          => $cfg->{keys},
        };

        bless($self, $class);
        $self->connect_static();
        print("Start at http://".$self->{host}.":".$self->{port}."/", "\n");
        $self->run();
    }

    # Загружаем в оперативку все статические файлы
    sub connect_static
    {
        my $self  = shift;
        my $dir   = shift || $self->{static};

        opendir DIR, $dir;
        my @dir = readdir(DIR);
        close DIR;
        
        foreach(@dir) 
        {
            if (-f $dir . "/" . $_ )
            {
                push(@{$self->{paths}->{map}}, {paths => ["/$dir/$_"], method => $self->read_static(substr("/$dir/$_", 1))});
            } elsif(-d $dir . "\\" . $_ && "." ne $_ && ".." ne $_) {
                $self->connect_static($dir."/".$_);
            }
        }
    }

    sub run
    {
        my $self          = shift;
        my ($port, $host) = ($self->{port}, $self->{host});
        $self->{main}     = $self->{main} || new HTTP::Daemon(LocalAddr => $host, LocalPort => $port);
        my $main          = $self->{main};
        my $connection    = $main->accept() if $main;
        my $request       = $connection->get_request() if $connection;
        
        if ($main && $connection  && $connection)
        {
            $self->handler($connection, $request);    
            $connection->close;
            undef($connection);
        }
        
        $self->run();
    }

    # Получаем обработчика для path
    sub get_handler
    {
        my $self = shift;
        my $url  = shift;

        foreach my $n (0..@{$self->{paths}->{map}})
        {
            my $path   = $self->{paths}->{map}[$n];
            my $paths  = $path->{paths};
            my $index = first_index{ $_ eq $url } @{$paths};

            if ($index != -1)
            {
                return $path;
            }
        }

        return 0;
    }

    # Чтение статического файла и генерация метода для возврата контента
    sub read_static
    {
        my $self      = shift;
        my $file_path = shift;
        my $res       = HTTP::Response->new(200);
        my $ctx       = fso->read_content_from_file($file_path, 1);

        if ($ctx)
        {
            $res->header('Content-Type' => fso->get_content_type_by_file_name($file_path) || 'text/plan');
            $res->content($ctx);
            
            return sub {return $res};
        }
        
        return 0;
    }
    
    # Замена ключевых слов в контенте
    sub replace_keys
    {
        my $self = shift;
        my $ctx  = shift;
        my %keys = %{$self->{keys}};

        foreach my $key (keys %keys)
        {
            my $rep  = '\{\{'.$key.'\}\}';
            my $data = '/'.$keys{$key};

            $ctx =~ s/$rep/$data/g;
        }
        
        return $ctx;
    }

    # Обработка запросов.
    sub handler
    {
        my $self       = shift;
        my $connection = shift;
        my $request    = shift;
        my $handler    = $self->get_handler($request->url->path) if $request;

        if ($request)
        {
            if ($handler) 
            {
                my $resp = %{$handler}{method}->($self, $request);

                if ($resp && $resp->{'_headers'}->{'content-type'} eq 'text/html')
                {
                    $resp->content($self->replace_keys($resp->{'_content'}));
                }

                $connection->send_response($resp);
            } else {
                print $request->url->path, "\n";
                $connection->send_error(RC_FORBIDDEN);
            }
        }
    }
}

1;