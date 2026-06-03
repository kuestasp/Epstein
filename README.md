# Epstein

## AutoSpin (`auto_spin.lua`)

A small Roblox LocalScript that repeatedly triggers a game's "spin" remote
until a target item/style is obtained, a spin cap is reached, or it's stopped.

### Configuration

Edit the `CONFIG` table at the top of `auto_spin.lua`:

| Key | Default | Description |
| --- | --- | --- |
| `SPIN_DELAY` | `0.5` | Seconds to wait between spins. |
| `MAX_SPINS` | `0` | Stop after this many spins (`0` = unlimited). |
| `TARGET_STYLES` | `{}` | Names to watch for in your inventory; auto-stops when one appears. Empty = no auto-stop. |
| `MANUAL_REMOTE` | `nil` | Set a specific `RemoteEvent`/`RemoteFunction` to skip auto-detection. |
| `REMOTE_KEYWORDS` | `{ "luckyspin", "spin", "roll", "gacha", "wheel" }` | Name keywords used to auto-detect the spin remote (earlier = higher priority). |
| `INV_CONTAINERS` | `{ "Inventory", "Styles" }` | Child names under the player to search for owned styles. |

### Notes

Client-side automation like this generally violates the
[Roblox Terms of Use](https://en.help.roblox.com/hc/en-us/articles/115004647846)
and can result in account moderation. Only use it on a game/account where you
have permission to automate.
