<?php

namespace Codenidus\Videoconference\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class BaseVideoConferenceAuthorize
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|null  $guard
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $guard = null)
    {
        // check middleware file exists in user project
        // if exists then run middleware for authorizing request
        if(file_exists(app_path('Http\Middleware\VideoConferenceAuthorize.php'))) {
          return app(\App\Http\Middleware\VideoConferenceAuthorize::class)->handle($request, function ($request) use ($next) {
            return $next($request);
          });
        }

        return $next($request);
    }
}
