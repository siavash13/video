<?php

namespace Codenidus\VideoConference\Console;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class ProcessCommand extends Command
{
    protected $signature = 'videoconference:install';

    protected $description = 'Install Video Conference Package';

    public function handle()
    {
        $this->publishConfigFile();
        $this->createDatabaseTable();
        $this->publishVueAssets();
        $this->writeCommentOnScreen();
    }

    protected function createDatabaseTable()
    {
        $this->info('Create Database Tables...');
        include_once __DIR__ . '/../../database/migrations/2022_02_19_214914_create_room_table.php';
        (new \CreateRoomTable)->up();
    }

    protected function publishVueAssets()
    {
        $this->info('Publishing Video Conference Vue Assets...');
        $this->callSilent('vendor:publish', ['--tag' => 'videoconference-vue']);
    }

    protected function publishConfigFile()
    {
        if (!file_exists(config_path('video-conference.php'))) {
            $this->info('Create Video Conference Configs...');
            $this->callSilent('vendor:publish', ['--tag' => 'videoconference-config']);
        }
    }

    protected function writeCommentOnScreen()
    {
      $this->warn('Please install dependencies packages by running \'npm install vue vue-loader peerjs socketio@^4.1.2\' ');
    }
}
