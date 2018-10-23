# Allow Require Me

**Adds package self reference into node_modules**

[![NPM version](https://badge.fury.io/js/allow-require-me.png)](http://badge.fury.io/js/allow-require-me)

Stability: Stable, used by [toubkal](https://github.com/ReactiveSets/toubkal).

## Why
To allow testing by providing a symbolic link reference
to the current package that can be used in tests using
```require( 'foobar' )```.

Whithout this link you cannot require your package in
tests and have to use relative paths to require your
package which is unpractical, error prone, #ugly, and
makes it hard to move your tests around to different
directories.

It's any wonder why **node** does not allow this by
default. Until then we need to do it either manually
or with the use of tools like this.

One reason it is hard to automate is that creating
symbolic links is different on different platforms,
Linux and Windows. Also it has to work for Continuous
Integration tools such as Travis.ci.

Also because ```npm install``` renoves links in
the **node_modules**, directory, you have to set the
link again each time you install or uninstall a package
or run ```npm link```.

This tool allows to reset the link after each install
or uninstall by creating a **postinstall** script
in **package.json**.

## Installation

For this to work, the current directory must contain a
valid **package.json** file with its **name** attribute
set.

You also need to run this in a console as administraor
on Windows and Cygwin.

Assuming that the current package name is **foobar**:

```bash
$ npm install allow-require-me --save

> allow-require-me@1.0.0 postinstall /allow/require/me/path
> node allow-require-me.js install

allow-require-me.js, package: foobar, action: install, created self link: ../foobar
allow-require-me.js, package: foobar, action: install, configuration saved to package.json
+ allow-require-me@0.1.0
added 1 package from 1 contributor in 12.492s
```

Adds a symbolic link in ```node_modules/foobar -> ..```
to the current working package directory.

## Details

The **postinstall** script is automatically saved into the
current **package.json** if **npm_config_save** environement
variable is set to true:

```json
{
  "scripts": {
    "postinstall": "node node_modules/allow-require-me/allow-require-me.js add"
  }
}
```

If the **postinstall** script already has something, the
command is added after previous commands and if they
succeed, e.g.:

```json
{
  "scripts": {
    "postinstall": "previous_command && node node_modules/allow-require-me/allow-require-me.js add"
  }
}
```

This works on Linux, Windows, and Cygwin and is compatible ```npm link```
on these platforms.

For this to work on Windows and Cygwin you need to run
your shell "as administrator", otherwise you will get a permission
error (EPERM) that could look like this:

```bash
  { [Error: EPERM: operation not permitted, symlink '..' -> 'node_modules/foobar']
    errno: -4048,
    code: 'EPERM',
    syscall: 'symlink',
    path: '..',
    dest: 'node_modules/foobar' }
```

Or while running npm link:

```bash
  npm ERR! Error: EPERM: operation not permitted, symlink '/your/cwd' -> '/your/module/path'
  npm ERR!     at Error (native)
  npm ERR!  { [Error: EPERM: operation not permitted, symlink '/your/cwd' -> '/your/module/path'
  npm ERR!   errno: -4048,
  npm ERR!   code: 'EPERM',
  npm ERR!   syscall: 'symlink',
  npm ERR!   path: '/your/cwd',
  npm ERR!   dest: '/your/module/path' }
  npm ERR!
  npm ERR! Please try running this command again as root/Administrator.
```

## Additional CLI commands

To see if the self-reference link is active on Linux:

```bash
$ ls -l node_modules/foobar
lrwxrwxrwx 1 User None 2 Oct 24 15:34 node_modules/foobar -> ..
```

To remove the self-referemce link on Linux:

```bash
$ rm node_modules/foobar
```

To check is the link is active on all platforms:

```bash
$ ./node_modules/.bin/allow-require-me
allow-require-me.js, package: foobar, action: show, self link is a symbolic link: node_modules/foobar
```

To recreate the self-referemce link, same on all platforms:

```bash
$ ./node_modules/.bin/allow-require-me add
allow-require-me.js, package: foobar, action: add, created self link: node_modules/foobar
```

To remove the self-referemce link, sane on all platforms:

```bash
$ ./node_modules/.bin/allow-require-me remove
allow-require-me.js, package: foobar, action: remove, removed self link: node_modules/foobar which was a synlink
```

To reinstall the **postinstall** script into **package.json**:

```bash
$ ./node_modules/.bin/allow-require-me install
allow-require-me.js, package: foobar, action: install, created self link: node_modules/foobar
allow-require-me.js, package: foobar, action: install, configuration saved to package.json
```

## Licence

  The MIT License (MIT)

  Copyright (c) 2018, Reactive Sets

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
