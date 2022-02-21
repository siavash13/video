<?php

namespace Database\Factories;

use Codenidus\VideoConference\Room;
use Illuminate\Database\Eloquent\Factories\Factory;;

class RoomFactory extends Factory
{
    protected $model = Room::class;
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'name' => $this->faker->word(),
        ];
    }
}
