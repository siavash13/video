<?php

namespace Codenidus\VideoConference;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;
use Codenidus\VideoConference\VideoConference;

class VideoConferenceServiceProvider extends ServiceProvider
{
    /**
     * Perform post-registration booting of services.
     *
     * @return void
     */
    public function boot(): void
    {
        $this->registerRoutes();
        $this->registerResources();
        $this->registerVueAssetsPublish();
        $this->registerConfigFilePublish();

        // Publishing is only necessary when using the CLI.
        if ($this->app->runningInConsole()) {
            $this->bootForConsole();
        }
    }

    public function registerResources()
    {
        $this->loadMigrationsFrom(__DIR__.'/../database/migrations');
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'videoconference');
    }

    public function registerVueAssetsPublish()
    {
        $this->publishes([
            __DIR__.'/../resources/js/app-video-conference.js' => resource_path('js/app-video-conference.js'),
            __DIR__.'/../resources/js/App-video-conference.vue' => resource_path('js/App-video-conference.vue'),
            __DIR__.'/../resources/js/components/webrtc/VideoConference.vue' => resource_path('js/components/webrtc/VideoConference.vue'),
            __DIR__.'/../resources/js/configs/socket.js' => resource_path('js/configs/socket.js'),
            __DIR__.'/../resources/js/utils/socket/Socket.js' => resource_path('js/utils/socket/Socket.js'),
            __DIR__.'/../resources/js/utils/socket/webRtcSocket.js' => resource_path('js/utils/socket/webRtcSocket.js'),
        ], 'videoconference-vue');
    }

    public function registerConfigFilePublish()
    {
      $this->publishes([
        __DIR__.'/../config/video-conference.php' => config_path('video-conference.php'),
      ], 'videoconference-config');
    }

    public function registerRoutes()
    {
        Route::group($this->routeConfiguration(), function () {
           $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
        });
    }

    /**
     * Register any package services.
     *
     * @return void
     */
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/video-conference.php', 'video-conference');

        $this->commands([
            Console\ProcessCommand::class
        ]);
        // Register the service the package provides.
        $this->app->singleton('video-conference', function ($app) {
            return new VideoConference;
        });
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function provides()
    {
        return ['video-conference'];
    }

    /**
     * Console-specific booting.
     *
     * @return void
     */
    protected function bootForConsole(): void
    {
        // Publishing the views.
        /*$this->publishes([
            __DIR__.'/../resources/views' => base_path('resources/views/vendor/codenidus'),
        ], 'video-conference.views');*/

        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');

        // Publishing assets.
        /*$this->publishes([
            __DIR__.'/../resources/assets' => public_path('vendor/codenidus'),
        ], 'video-conference.views');*/

        // Publishing the translation files.
        /*$this->publishes([
            __DIR__.'/../resources/lang' => resource_path('lang/vendor/codenidus'),
        ], 'video-conference.views');*/

        // Registering package commands.
        // $this->commands([]);
    }

    protected function routeConfiguration()
    {
        return [
            'prefix' => config('video-conference.prefix'),
        ];
    }
}
