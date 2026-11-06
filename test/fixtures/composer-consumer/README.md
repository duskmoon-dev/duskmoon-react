# Packaged Composer and Phoenix extension proof

Run after the components build and tarball are complete:

```sh
bun scripts/check-composer-package.ts \
  --artifact /absolute/path/duskmoon-dev-components-0.5.6.tgz \
  --phoenix /home/gao/Workspace/duskmoon-dev/phoenix-duskmoon-ui/apps/phoenix_duskmoon \
  --temp /tmp
```

`--artifact` also accepts a completed package directory; the checker packs it with
scripts disabled into the temporary directory. `--phoenix` accepts a local or
unpacked distributed `phoenix_duskmoon` package. Install, typecheck and runtime
outputs stay outside this repository. The checker removes its own temporary
directory on success or failure; add `--keep` to inspect it. It does not build,
release, modify, or install into either source checkout.

The plain consumer installs with optional peers omitted, checks strict types
with `skipLibCheck: false` and
root/chat server rendering, then scans the complete emitted root/chat import
closure for editor dependencies. The rich consumer additionally checks its lazy
editor chunk and a single resolved Lexical runtime. Both consumers mount the real
Phoenix hook factory with the supplied `Composer` slot and exercise its actual
bridge with a fake LiveView transport. This is package/extension evidence, not a
live Phoenix server, browser hydration, native IME, or backend admission proof.

For distribution evidence, use the actual published Hex package instead of a
source checkout. Download
[`phoenix_duskmoon-10.0.11.tar`](https://repo.hex.pm/tarballs/phoenix_duskmoon-10.0.11.tar),
verify its SHA-256 against the `checksum` from the
[Hex release metadata](https://hex.pm/api/packages/phoenix_duskmoon/releases/10.0.11),
then unpack the archive's `contents.tar.gz` and pass that directory to `--phoenix`.
The verified 10.0.11 archive checksum is
`32013db0d8487f33cd58e7b60280e0645cf440076462e9e862a60710a0d3da37`.

## Verified upstream source

Phoenix checkout HEAD: `b76de4a83a49435e715e18114778b2c2c730862f`.
Package version: `phoenix_duskmoon@10.0.11`.

- [`package.json`](https://github.com/duskmoon-dev/phoenix-duskmoon-ui/blob/b76de4a83a49435e715e18114778b2c2c730862f/apps/phoenix_duskmoon/package.json)
  exports `phoenix_duskmoon/react-chat` from `assets/js/react_chat/index.js`.
- [`react_chat/index.js`](https://github.com/duskmoon-dev/phoenix-duskmoon-ui/blob/b76de4a83a49435e715e18114778b2c2c730862f/apps/phoenix_duskmoon/assets/js/react_chat/index.js)
  provides `createDuskmoonReactChat(options)`, forwards the complete payload and
  successful acknowledgment, preserves rejection data in `error.response`, and
  rejects pending requests on disconnect/destruction.
- [`react_chat/chat.js`](https://github.com/duskmoon-dev/phoenix-duskmoon-ui/blob/b76de4a83a49435e715e18114778b2c2c730862f/apps/phoenix_duskmoon/assets/js/react_chat/chat.js)
  mounts `options.Composer` with conversation state, bridge, connection/runtime,
  and admission context. The fixture's declaration file types this JavaScript
  extension; it contains no copied implementation.

The checker copies those actual distributed entry files with their original
manifest into each isolated consumer. Their component imports consequently
resolve to the tested tarball, rather than an older dependency in the Phoenix
checkout. The fake application's explicit `composer_submission` /
`composer_receipt` fields demonstrate the extension's opaque-payload boundary;
they do not claim that Phoenix's default backend implements Composer v1.
The published Phoenix manifest's dependency pins are preserved, but the checker
does not install its older component/React dependency tree. The fixture explicitly
models an application's bundler resolving the extension against the new Composer
artifact and one React runtime; it does not claim to upgrade Phoenix itself.

`phoenix-composer.tsx` supplies only application glue. The package owns editing,
snapshots, admission and recovery. The adapter validates the explicit receipt
against the exact captured submission. A generic `{status:"ok"}`, malformed
identity, timeout, or disconnect remains uncertain and preserves the draft. It
never derives acceptance, delivery, persistence, or message IDs from transport
success.
