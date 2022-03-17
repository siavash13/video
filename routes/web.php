<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return \Codenidus\VideoConference\VideoConference::test();
});

Route::get('/room', function () {
   return view('videoconference::room');
});

Route::resource('/rooms', \Codenidus\VideoConference\Http\Controllers\RoomController::class);
