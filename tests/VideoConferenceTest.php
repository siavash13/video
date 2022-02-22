<?php

namespace tests;

use Codenidus\VideoConference\Room;
use Codenidus\VideoConference\VideoConferenceServiceProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;

class VideoConferenceTest extends BaseTestCase
{
    use RefreshDatabase;
    /** @test  */
    public function it_is_working(){
        $this->assertEquals(2, 2);
    }

    /** @test  */
    public function a_room_can_be_created_with_factory()
    {
        $room = Room::factory()->create([
            'name' => 'Room-1',
        ]);

        $this->assertCount(1, Room::all());
    }
}
