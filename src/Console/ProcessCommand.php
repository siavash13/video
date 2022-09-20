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
        $version = $this->choice(
            'Which vue version would you like to use?',
            ['Vue2', 'Vue3']
        );

        $this->publishConfigFile();
        $this->createDatabaseTable();
        $this->publishMiddlewareFile();
        $this->publishVueAssets($version);
        $this->writeCommentOnScreen($version);
    }

    protected function createDatabaseTable()
    {
        $this->info('Create Database Tables...');
        include_once __DIR__ . '/../../database/migrations/2022_02_19_214914_create_room_table.php';
        (new \CreateRoomTable)->up();
    }

    protected function publishVueAssets($version)
    {
        $this->info('Publishing Video Conference Vue Assets...');
        $this->callSilent('vendor:publish', ['--tag' => 'videoconference-vue']);

        if ($version == 'Vue2') {
            $this->callSilent('vendor:publish', ['--tag' => 'videoconference-vue2']);
        } else {
            $this->callSilent('vendor:publish', ['--tag' => 'videoconference-vue3']);
        }
    }

    protected function publishConfigFile()
    {
        if (!file_exists(config_path('video-conference.php'))) {
            $this->info('Create Video Conference Configs...');
            $this->callSilent('vendor:publish', ['--tag' => 'videoconference-config']);
        }
    }

    protected function publishMiddlewareFile()
    {
        if (!file_exists(app_path('Http/Middleware/VideoConferenceAuthorize.php'))) {
            $this->info('Create Video Conference Middleware...');
            $this->callSilent('vendor:publish', ['--tag' => 'videoconference-middleware']);
        }
    }

    protected function writeCommentOnScreen($version)
    {
        $vueVersion = ($version == 'Vue2') ? 'vue2' : 'vue';

        $this->warn('Please install dependencies packages by running \'npm install '.$vueVersion.' vue-loader peerjs socket.io-client@^4.1.2\' ');
    }
}
