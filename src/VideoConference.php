<?php

namespace Codenidus\VideoConference;

class VideoConference
{
    // Build wonderful things
    public function test()
    {
        return 'it works!';
    }

    public function configNotPublished(){
        return is_null(config('video-conference'));
    }
}
