<?php

namespace Codenidus\VideoConference\Facades;

use Illuminate\Support\Facades\Facade;

class VideoConference extends Facade
{
    /**
     * Get the registered name of the component.
     *
     * @return string
     */
    protected static function getFacadeAccessor(): string
    {
        return 'video-conference';
    }
}
