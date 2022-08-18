<?php


namespace Codenidus\VideoConference\Http\Controllers;


use Illuminate\Support\Facades\Auth;
use Codenidus\VideoConference\Http\Resources\UserTokenResource;

class UserTokenController
{
    public function index()
    {
        $user   = Auth::user();
        $client = new \GuzzleHttp\Client();

        $url = config('video-conference.app_url') . '/api/connected/user-check';
        $username = $user->{config('video-conference.user.username_field', 'email')} ?? null;

        if($username == null) {
            abort(403, 'The user unique field is invalid.');
        }

        try {
            $response = $client->request('GET', $url, [
                'headers' => [
                    'app-id' => config('video-conference.app_id'),
                    'app-secret' => config('video-conference.app_secret'),
                ],
                'query' => [
                    'username' => $username,
                    'register' => 'true',
                ],
            ]);
        } catch(\Exception $error) {
            abort(500, 'Failed to connect to server.');
        }

        $info = json_decode($response->getBody());

        return new UserTokenResource($info);
    }
}