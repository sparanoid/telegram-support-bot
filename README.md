# Telegram Support Bot (Ticketing system for Telegram)

Fork of the original [bostrot/telegram-support-bot](https://github.com/bostrot/telegram-support-bot) with additional features:

- `compact_reply`: Only send reply message without `dear` and `regards` template
- `slient_mode`: Avoid sending `contactMessage` when user sends a message

It's recommended to run this bot in a container:

- [Docker Hub](https://hub.docker.com/r/sparanoid/telegram-support-bot)
- [ghcr.io](https://github.com/users/sparanoid/packages/container/package/telegram-support-bot)

## Usage

```bash
# Docker Hub
docker run -p 8080:8080 -v ${pwd}/config:/app/config sparanoid/telegram-support-bot:latest

# GitHub Container Registry
docker run -p 8080:8080 - ${pwd}/config:/app/config ghcr.io/sparanoid/telegram-support-bot:latest
```

## License

GPL-3.0
