<?php


namespace Codenidus\VideoConference\Http\Controllers;


use Codenidus\VideoConference\Http\Requests\UserTokenIndexRequest;
use Codenidus\VideoConference\Http\Resources\UserTokenResource;

class UserTokenController
{
    public function index(UserTokenIndexRequest $request)
    {
        $client = new \GuzzleHttp\Client();

        $url = config('video-conference.app_url') . '/api/connected/user-check';

        $response = $client->request('GET', $url, [
            'headers' => [
                'app-id' => config('video-conference.app_id'),
                'app-secret' => config('video-conference.app_secret'),
            ],
            'query' => [
                'username' => $request->username,
                'register' => 'true',
            ],
        ]);

        $info = json_decode($response->getBody());

        return new UserTokenResource($info);
    }
}