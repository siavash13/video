<?php

namespace Codenidus\VideoConference;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Room extends Model
{
    use HasFactory;

    protected $table = "room";

    protected $guarded = ['name'];
}
