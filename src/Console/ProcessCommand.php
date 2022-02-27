<?php

namespace Codenidus\VideoConference\Console;

use Codenidus\VideoConference\VideoConference;
use Illuminate\Console\Command;

class ProcessCommand extends Command
{
    protected $signature = 'videoconference:publish';

    protected $description = 'Publish Video Conference';

    public function handle()
    {
        if (VideoConference::configNotPublished()) {
            return $this->warn('Please publish the config file by running \'php artisan vendor:publish --tag=video-conference\' ');
        }

        include_once __DIR__ . '/../../database/migrations/2022_02_19_214914_create_room_table.php';

        (new \CreateRoomTable)->up();
    }
}
