# VideoConference

[![Latest Version on Packagist][ico-version]][link-packagist]
[![Total Downloads][ico-downloads]][link-downloads]
[![Build Status][ico-travis]][link-travis]
[![StyleCI][ico-styleci]][link-styleci]

This is where your description should go. Take a look at [contributing.md](contributing.md) to see a to do list.

## Installation

Via Composer

``` bash
$ composer require codenidus/video-conference
php artisan videoconference:install
```

## Usage

#### .env variables
```
SYSTEM_BASE_ADDRESS="client app address"

MIX_VUE_APP_NAME="Project Name"
MIX_VUE_APP_API_URL="http://${SYSTEM_BASE_ADDRESS}/api/"
MIX_WEBRTC_THEME="Canvasface"
MIX_WEBRTC_BASE_URL="http://${SYSTEM_BASE_ADDRESS}"
MIX_WEBRTC_SOCKET_CONNECTION="http://${SYSTEM_BASE_ADDRESS}:5000"
MIX_PEERJS_HOST="${SYSTEM_BASE_ADDRESS}"
MIX_PEERJS_PORT=3003

VIDEOCONFERENCE_APP_ID="Project id"
VIDEOCONFERENCE_APP_SECRET="App Secret Token"
VIDEOCONFERENCE_APP_CLIENT="App Client Token"
```

## Change log

Please see the [changelog](changelog.md) for more information on what has changed recently.

## Testing

``` bash
$ composer test
```

## Contributing

Please see [contributing.md](contributing.md) for details and a todolist.

## Security

If you discover any security related issues, please email author@email.com instead of using the issue tracker.

## Credits

- [Author Name][link-author]
- [All Contributors][link-contributors]

## License

MIT. Please see the [license file](license.md) for more information.

[ico-version]: https://img.shields.io/packagist/v/codenidus/video-conference.svg?style=flat-square
[ico-downloads]: https://img.shields.io/packagist/dt/codenidus/video-conference.svg?style=flat-square
[ico-travis]: https://img.shields.io/travis/codenidus/video-conference/master.svg?style=flat-square
[ico-styleci]: https://styleci.io/repos/12345678/shield

[link-packagist]: https://packagist.org/packages/codenidus/video-conference
[link-downloads]: https://packagist.org/packages/codenidus/video-conference
[link-travis]: https://travis-ci.org/codenidus/video-conference
[link-styleci]: https://styleci.io/repos/12345678
[link-author]: https://github.com/codenidus
[link-contributors]: ../../contributors
