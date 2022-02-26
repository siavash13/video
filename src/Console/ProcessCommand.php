<?php


namespace Codenidus\VideoConference\Console;


use Illuminate\Console\Command;

class ProcessCommand extends Command
{
    protected $signature = 'videoconference:publish';

    protected $description = 'Publish Video Conference';

    public function handle()
    {
        (new \CreateRoomTable)->up();
    }
}
