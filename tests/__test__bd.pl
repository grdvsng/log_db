use File::Spec::Functions 'catfile';
use File::Spec            'rel2abs';
use lib File::Spec->rel2abs(catfile('bd'));

use VirtualBD;


sub case_1
{
    $db = VirtualBD->new("TestBD", catfile("tests", "temp", "test.json"));
    $db->create_table("message", ["created", "id", "int_id", "str", "status"]);
    $db->create_table("log", ["created", "int_id", "str", "address"]);
    $db->insert("message", ['created', 'id'], ['12.12.12', '1000']);
    $db->insert("message", ['created', 'id'], ['12.11.10', '999']);
    $db->insert("message", ['created', 'id'], ['19.11.10', '222']);
    $db->insert("message", ['created', 'id'], ['19.11.10', '777']);
    $db->select("message", sub {shift->{id} >= 999;});
    $db->write();
}
