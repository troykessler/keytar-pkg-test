# Challenge: Use keytar together with pkg

Keytar: https://www.npmjs.com/package/keytar (OS Password manager)
Pkg: https://www.npmjs.com/package/pkg (JS binary compiler)

## Steps to reproduce

Install deps

```bash
yarn install
```

Build binaries

```bash
yarn build
```

## 1. Run the program with nodejs

```bash
yarn start
```

This should output the following result:

```bash
$node src/index.js
my_secret
```

-> Running with nodejs works

## 2. Run the program with binaries

```bash
./out/kyve-macos
```

This should output the following error:

```bash
pkg/prelude/bootstrap.js:1876
      throw error;
      ^

Error: dlopen(/var/folders/87/v4ybr8dd4s94yc2w_d9_nxr80000gn/T/pkg/6c32c41c0e5a9e546616607b0383eada5bb646d0164324f20baab59d5b7963fa/keytar/build/Release/keytar.node, 0x0001): tried: '/var/folders/87/v4ybr8dd4s94yc2w_d9_nxr80000gn/T/pkg/6c32c41c0e5a9e546616607b0383eada5bb646d0164324f20baab59d5b7963fa/keytar/build/Release/keytar.node' (mach-o file, but is an incompatible architecture (have 'arm64', need 'x86_64')), '/private/var/folders/87/v4ybr8dd4s94yc2w_d9_nxr80000gn/T/pkg/6c32c41c0e5a9e546616607b0383eada5bb646d0164324f20baab59d5b7963fa/keytar/build/Release/keytar.node' (mach-o file, but is an incompatible architecture (have 'arm64', need 'x86_64'))
    at process.dlopen (pkg/prelude/bootstrap.js:2255:28)
    at Module._extensions..node (node:internal/modules/cjs/loader:1196:18)
    at Module.load (node:internal/modules/cjs/loader:988:32)
    at Module._load (node:internal/modules/cjs/loader:834:12)
    at Module.require (node:internal/modules/cjs/loader:1012:19)
    at Module.require (pkg/prelude/bootstrap.js:1855:31)
    at require (node:internal/modules/cjs/helpers:102:18)
    at Object.<anonymous> (/snapshot/keytar-pkg-test/node_modules/keytar/lib/keytar.js:1:14)
    at Module._compile (node:internal/modules/cjs/loader:1112:14)
    at Module._compile (pkg/prelude/bootstrap.js:1937:32) {
  code: 'ERR_DLOPEN_FAILED'
}
```

-> running with binaries fails

## Solution to that problem?
