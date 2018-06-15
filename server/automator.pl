#!/usr/bin/env perl

use Dancer2 qw(get, set, start, request);
use YAML::XS qw(LoadFile);
use Encode qw(encode_utf8);
use Encode qw(decode_utf8);
use JSON qw();    # include nothing to avoid conflicts with Dancer
use Date::Parse;
#use Data::Dumper;
use Cwd qw(cwd);
use File::Spec;
use 5.010;
use utf8;

binmode( STDOUT, ":utf8" );

sub get_config_file {
    my $default = 'readStatus.yml';
    if ( $ARGV[1] && -e $ARGV[1] ) {
        return $ARGV[1];
    }

    my @dirs = File::Spec->splitdir( cwd() );
    while (@dirs) {
        my $newdir = File::Spec->catdir( @dirs, $default );
        return $newdir if -e $newdir;
        pop @dirs;
    }
    say "Config file not found";
    return undef;
}

my $config = LoadFile get_config_file();

my ( $base, $files ) = ( $config->{base_url}, $config->{files} );

$_->{date} = defined $_->{date} ? str2time( $_->{date} ) : -1
  for values %$files;

set port => 3001;

get '/' => sub { return "Hi, world!" };

get '/status' => sub {
    header( 'Content-Type' => 'text/json' );
    return to_json $config->{files};
};

# lipsum dictionary
get '/showdict' => sub {
    print "Showing dict for ", request->params->{word}, "\n";
    return request->params->{word}
      . " means: <br><p> Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>";
};

get '/text' => sub {
    my $lineWanted = request->params->{chunkId} || 1;

    my $filePath = request->params->{file}
      or return to_json( { text => "File not given" } );

    $filePath = "$base/$filePath";
    open my $fh, '<:encoding(UTF-8)', $filePath
      or return to_json( { text => "$filePath: $!" } );

    my $line;
    my $i = 0;
    while (<$fh>) {
        ++$i;
        if ( $. >= $lineWanted ) {
            chomp( $line = $_ );
            next if $line eq "";

            return JSON->new->utf8(0)->encode( { text => $line, chunkId => $i } );
        }
    }

    status 'not_found';
    return to_json( { error => "The wanted line is past the end of the file." } )
};

start;
