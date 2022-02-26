<?php

namespace Codenidus\VideoConference\Console;

use Illuminate\Console\Command;

class ProcessCommand extends Command
{
    protected $signature = 'videoconference:publish';

    protected $description = 'Publish Video Conference';

    public function handle()
    {
        include_once __DIR__ . '/../../database/migrations/2022_02_19_214914_create_room_table.php';

        (new \CreateRoomTable)->up();
    }
}
