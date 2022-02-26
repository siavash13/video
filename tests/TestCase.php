<?php

namespace tests;

use Orchestra\Testbench\TestCase;
use Codenidus\VideoConference\VideoConferenceServiceProvider;

class BaseTestCase extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
//        $this->withFactories(__DIR__.'/../database/factories');
    }

    public function getPackageProviders($app)
    {
        return [
            VideoConferenceServiceProvider::class,
        ];
    }

    public function getEnvironmentSetup($app)
    {
        $app['config']->set('database.default', 'testdb');
        $app['config']->set('database.connections.testdb', [
            'driver' => 'sqlite',
            'database' => ':memory:',
        ]);
        include_once __DIR__ . '/../database/migrations/2022_02_19_214914_create_room_table.php';

        (new \CreateRoomTable)->up();
    }
}
