<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class VideoConferenceAuthorize
{
    public function handle(Request $request, Closure $next, $guard = null)
    {
		// check user request is authorized
        // Perform action
		
		// error sample
		// abort(401, 'Only authenticated users can access to this section.');

        return $next($request);
    }
}
