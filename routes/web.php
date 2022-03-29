<?php

use Illuminate\Support\Facades\Route;
use Codenidus\VideoConference\Facades\VideoConference;
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
    return VideoConference::test();
});

Route::get('/room', function () {
   return view('videoconference::room');
});

Route::get('spa', function () {
  return view('videoconference::spa');
});


Route::resource('/rooms', \Codenidus\VideoConference\Http\Controllers\RoomController::class);
