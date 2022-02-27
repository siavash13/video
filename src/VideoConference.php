<?php

namespace Codenidus\VideoConference;

class VideoConference
{
    // Build wonderful things
    public static function test()
    {
        return 'it works!';
    }

    public static function configNotPublished(){
        return is_null(config('video-conference'));
    }
}
