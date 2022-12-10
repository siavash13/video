<?php

namespace Codenidus\VideoConference;

use Illuminate\Routing\Router;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;
use Illuminate\Contracts\Http\Kernel;
use Codenidus\VideoConference\Http\Middleware\BaseVideoConferenceAuthorize;


class VideoConferenceServiceProvider extends ServiceProvider
{
    /**
     * Perform post-registration booting of services.
     *
     * @return void
     */
    public function boot(Kernel $kernel): void
    {
        // set middleware in router
        $router = $this->app->make(Router::class);
        $router->aliasMiddleware('videoconferenceAuthorize', BaseVideoConferenceAuthorize::class);

        $this->registerRoutes();
        $this->registerResources();
        $this->registerVueAssetsPublish();
        $this->registerVue2AssetsPublish();
        $this->registerVue3AssetsPublish();
        $this->registerConfigFilePublish();
        $this->registerMiddlewareFilePublish();

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
            __DIR__.'/../resources/js/App-video-conference.vue' => resource_path('js/App-video-conference.vue'),
            __DIR__.'/../resources/js/components/webrtc/Rooms.vue' => resource_path('js/components/webrtc/Rooms.vue'),
            __DIR__.'/../resources/js/components/webrtc/RoomCreate.vue' => resource_path('js/components/webrtc/RoomCreate.vue'),
            __DIR__.'/../resources/js/components/webrtc/RoomsList.vue' => resource_path('js/components/webrtc/RoomsList.vue'),
            __DIR__.'/../resources/js/components/webrtc/RoomJoin.vue' => resource_path('js/components/webrtc/RoomJoin.vue'),
            __DIR__.'/../resources/js/components/webrtc/actions/AlertAction.vue' => resource_path('js/components/webrtc/actions/AlertAction.vue'),
            __DIR__.'/../resources/js/components/webrtc/actions/BanAction.vue' => resource_path('js/components/webrtc/actions/BanAction.vue'),
            __DIR__.'/../resources/js/components/webrtc/actions/InfoAction.vue' => resource_path('js/components/webrtc/actions/InfoAction.vue'),
            __DIR__.'/../resources/js/components/webrtc/actions/MultiAction.vue' => resource_path('js/components/webrtc/actions/MultiAction.vue'),
            __DIR__.'/../resources/js/components/webrtc/actions/TerminateAction.vue' => resource_path('js/components/webrtc/actions/TerminateAction.vue'),
            __DIR__.'/../resources/js/components/webrtc/themes/DefaultVideoConference.vue' => resource_path('js/components/webrtc/themes/DefaultVideoConference.vue'),
            __DIR__.'/../resources/js/configs/webRTCsocket.js' => resource_path('js/configs/webRTCsocket.js'),
            __DIR__.'/../resources/js/router/webrtc.js' => resource_path('js/router/webrtc.js'),
            __DIR__.'/../resources/js/utils/WebRTC/actions/AlertAction.js' => resource_path('js/utils/WebRTC/actions/AlertAction.js'),
            __DIR__.'/../resources/js/utils/WebRTC/actions/BanAction.js' => resource_path('js/utils/WebRTC/actions/BanAction.js'),
            __DIR__.'/../resources/js/utils/WebRTC/actions/InfoAction.js' => resource_path('js/utils/WebRTC/actions/InfoAction.js'),
            __DIR__.'/../resources/js/utils/WebRTC/actions/TerminateAction.js' => resource_path('js/utils/WebRTC/actions/TerminateAction.js'),
            __DIR__.'/../resources/js/utils/WebRTC/modules/Events.js' => resource_path('js/utils/WebRTC/modules/Events.js'),
            __DIR__.'/../resources/js/utils/WebRTC/modules/Media.js' => resource_path('js/utils/WebRTC/modules/Media.js'),
            __DIR__.'/../resources/js/utils/WebRTC/modules/People.js' => resource_path('js/utils/WebRTC/modules/People.js'),
            __DIR__.'/../resources/js/utils/WebRTC/modules/Room.js' => resource_path('js/utils/WebRTC/modules/Room.js'),
            __DIR__.'/../resources/js/utils/WebRTC/PeerJs.js' => resource_path('js/utils/WebRTC/PeerJs.js'),
            __DIR__.'/../resources/js/utils/WebRTC/Socket.js' => resource_path('js/utils/WebRTC/Socket.js'),
            __DIR__.'/../resources/js/utils/WebRTC/WebRTC.js' => resource_path('js/utils/WebRTC/WebRTC.js'),
            __DIR__.'/../resources/js/utils/WebRTC/webRTCHelper.js' => resource_path('js/utils/WebRTC/webRTCHelper.js'),
        ], 'videoconference-vue');
    }

    public function registerVue2AssetsPublish()
    {
        $this->publishes([
            __DIR__.'/../resources/js/vue2/app-video-conference.js' => resource_path('js/app-video-conference.js'),
            __DIR__.'/../resources/js/vue2/router-video-conference.js' => resource_path('js/router/router-video-conference.js'),
            __DIR__.'/../resources/js/vue2/VideoConference.vue' => resource_path('js/components/webrtc/VideoConference.vue'),
            __DIR__.'/../resources/js/vue2/webRTCIndex.js' => resource_path('js/utils/WebRTC/index.js'),
        ], 'videoconference-vue2');
    }

    public function registerVue3AssetsPublish()
    {
        $this->publishes([
            __DIR__.'/../resources/js/vue3/app-video-conference.js' => resource_path('js/app-video-conference.js'),
            __DIR__.'/../resources/js/vue3/router-video-conference.js' => resource_path('js/router/router-video-conference.js'),
            __DIR__.'/../resources/js/vue3/VideoConference.vue' => resource_path('js/components/webrtc/VideoConference.vue'),
        ], 'videoconference-vue3');
    }

    public function registerConfigFilePublish()
    {
      $this->publishes([
        __DIR__.'/../config/video-conference.php' => config_path('video-conference.php'),
      ], 'videoconference-config');
    }

    public function registerMiddlewareFilePublish()
    {
        $this->publishes([
            __DIR__.'/Http/Middleware/VideoConferenceAuthorize.php' => app_path('Http/Middleware/VideoConferenceAuthorize.php'),
        ], 'videoconference-middleware');
    }

    public function registerRoutes()
    {
        Route::group($this->webRouteConfiguration(), function () {
           $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
        });


        Route::group($this->apiRouteConfiguration(), function () {
            $this->loadRoutesFrom(__DIR__.'/../routes/api.php');
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

        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');

    }

    protected function webRouteConfiguration()
    {
        $middlewareList = array_merge( ['web', 'videoconferenceAuthorize'],
            config('video-conference.routes.api.middleware', []));

        return [
            'prefix' => config('video-conference.prefix'),
            'middleware' => $middlewareList,
        ];
    }

    protected function apiRouteConfiguration()
    {
        $middlewareList = array_merge( ['api', 'videoconferenceAuthorize'],
            config('video-conference.routes.api.middleware', []));

        return [
            'prefix' => 'api/'. config('video-conference.prefix'),
            'middleware' => $middlewareList,
        ];
    }
}
