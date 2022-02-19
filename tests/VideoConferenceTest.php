<?php

namespace tests;

use Codenidus\VideoConference\VideoConferenceServiceProvider;
use Orchestra\Testbench\TestCase;

class VideoConferenceTest extends TestCase
{
    /** @test  */
    public function it_is_working(){
        $this->assertEquals(2, 2);
    }
}
