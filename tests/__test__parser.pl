use File::Spec::Functions 'catfile';
use File::Spec            'rel2abs';
use lib File::Spec->rel2abs(catfile('bin'));
use LogParser;
use Data::Dumper;
use JSON;


sub case_1
{
    my $ctx     = shift;
    my $map     = shift;
    my $results = shift;
    my $record  = {};

    foreach my $key(keys %{$map})
    {
        my $re           = $map->{$key};
        my ($str) = $ctx =~ m/$re/gi;
        my $true_result  = $results->{$key};

        if ($true_result ne $str)
        {
            warn "'$true_result' != '$str'"; 
            
            return 0;
        }

        $record->{$key} = $str;
    }

    return $record;
}

sub case_2
{
    $res1 = LogParser->parse(shift, shift);
    $res2 = shift;

    if (''.keys(%{$res1}) ne ''.keys(%{$res2}) && ''.values(%{$res1}) ne ''.values(%{$res2}))
    {
        warn("$res1 != $res2");
        
        return 0;
    }

    return $res1;
}

sub case_3
{
    my $ctx = "";

    open(FILE, "<", shift);

    while (my $line = <FILE>)
    {
        $ctx .= $line;
    }

    return decode_json($ctx);
}


my $ctx = '2012-02-13 14:39:22 1RwtJa-0009RI-2d <= tpxmuwr@somehost.ru H=mail.somehost.com [84.154.134.45] P=esmtp S=1289 id=120213143629.COM_FM_END.205359@whois.somehost.ru';
my $message_map = 
{
    created => "\\d{4}\\-\\d{2}-\\d{2} \\d{2}\:\\d{2}\\:\\d{2}",    
    id      => "(?<=id=)[^ ]+\$",       
    int_id  => "[^ ]{6}\-[^ ]{6}\-[^ ]+",  
    status  => "==|<=|->|=>|\\*\\*",
    str     => "(?<=\=\= |<= |-> |=> |\\*\\* ).{0,}"
};

my $log_map = 
{
    created => "\\d{4}\\-\\d{2}-\\d{2} \\d{2}\:\\d{2}\\:\\d{2}",    
    address => '[^ <]+@[^ >]+',       
    int_id  => "[^ ]{6}\-[^ ]{6}\-[^ ]+",  
    status  => "==|<=|->|=>|\\*\\*",
    str     => "(?<=\=\= |<= |-> |=> |\\*\\* ).{0,}"
};

my $message =
{
    created => "2012-02-13 14:39:22",    
    id      => '120213143629.COM_FM_END.205359@whois.somehost.ru',       
    int_id  => "1RwtJa-0009RI-2d",  
    status  => "<=",
    str     => 'tpxmuwr@somehost.ru H=mail.somehost.com [84.154.134.45] P=esmtp S=1289 id=120213143629.COM_FM_END.205359@whois.somehost.ru'
};
my $log =
{
    created => "2012-02-13 14:39:22",    
    address => 'tpxmuwr@somehost.ru',       
    int_id  => "1RwtJa-000AFB-07",
    status  => "=>",
    str     => ':blackhole: <tpxmuwr@somehost.ru> R=blackhole_router'
};

my $test1 = case_1($ctx, $message_map, $message);
my $test2 = case_2($ctx, $message_map, $test1) if $test1;

my $ctx = '2012-02-13 14:39:22 1RwtJa-000AFB-07 => :blackhole: <tpxmuwr@somehost.ru> R=blackhole_router';

my $test3 = case_1($ctx, $log_map,     $log);
my $test4 = case_2($ctx, $log_map, $test3) if $test3;