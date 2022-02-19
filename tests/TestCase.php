<?php

namespace tests;

use Codenidus\VideoConference\VideoConferenceServiceProvider;

class TestCase extends Orchestra\Testbench\TestCase
{
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

    }
}
