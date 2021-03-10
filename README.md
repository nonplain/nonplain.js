\---<br />
**title:** nonplain<br />
**description:** Plaintext files, with metadata<br />
**long-description:** This is a library for parsing, manipulating, and exporting plaintext files with metadata stored as YAML or JSON frontmatter.<br />
\---<br />

# nonplain

Plaintext files are commonly used for notes, code, and documentation. Plaintext files are nondescript by definition: only their content and their filenames describe them. Jekyll popularized [YAML frontmatter](https://jekyllrb.com/docs/front-matter/) to enrich plaintext files for static site generation. These "nonplain" files have proven useful in other contexts requiring metadata, such as notetaking.

One primary drawback of using frontmatter in plaintext files is that there are few general-purpose tools for parsing and operating on these files' metadata and body content separately. The goal of nonplain is to make plaintext files with metadata easier.

## Contents

- [What this library does](#what-this-library-does)
- [What a nonplain file is](#what-a-nonplain-file-is)
- [Parsing nonplain files](#parsing-nonplain-files)
- [Transforming nonplain file data](#transforming-nonplain-file-data)
- [Exporting nonplain file data](#exporting-nonplain-file-data)
  - [File.prototype.write()](#fileprototypewrite)
  - [export2JSON](#export2json)
- [Other useful methods](#other-useful-methods)
  - [Files.prototype.clear()](#filesprototypeclear)
  - [Files.prototype.collect()](#filesprototypecollect)
  - [Files.prototype.map()](#filesprototypemap)
  - [Files.prototype.reduce()](#filesprototypereduce)
  - [Files.prototype.collectInstances()](#filesprototypecollectinstances)
  - [File.prototype.getData()](#filegetdata)
- [Related work](#related-work)
- [Contributing](#contributing)

## What this library does

[[link to toc](#contents)]

The concept is simple: define the difference between metadata and body content and parse the file accordingly.

Once the file is parsed, the metadata and body can be read, transformed, and exported together or separately to accomplish various goals such as:

- analyzing files according to metadata
- compiling relevant files for pagination
- converting files to some other, less plain format
- whatever else you want to do ... the goal is composability

In order to get there, we need to:

- [define what a nonplain file is](#what-a-nonplain-file-is)
- [parse nonplain files](#parsing-nonplain-files)
- [transform nonplain file data](#transforming-nonplain-file-data)
- [export nonplain file data](#exporting-nonplain-file-data)

## What a nonplain file is

[[link to toc](#contents)]

A "nonplain" file is any plaintext file that contains metadata as frontmatter. It's not really a file format, but rather a way to think about files of any plaintext format that begin with frontmatter.

### What frontmatter is (the metadata)

In the future, this may be more customizable. For our purposes, frontmatter is a "fence" of 3 dashes `---` on the first line of the file, followed by valid JSON or YAML beginning on the next line, followed by a final fence of 3 dashes `---` on the line after the last line of JSON or YAML data.

It looks like this:

```
---
{
    "what is this?": "it's JSON frontmatter"
}
---
```

or this:

```
---
syke: now it's YAML
---
```

### What the body is (the content)

The body is everything after the metadata.

When the file is put together, it looks like this:

```
---
{
    "what is this?": "it's called JSON"
}
---

This is the body of
the first file
```

or this:

```
---
syke: now it's YAML
---

This is the body of
the second file
```

## Parsing nonplain files

[[link to toc](#contents)]

To parse a nonplain file, load it using the `Files` class. If you only want to operate on a single file, you can still use the `Files` class or you can use `File` instead.

Using `Files`:

```js
const { Files } = require("nonplain");

(async () => {
  // you can use a glob or a filepath
  const files = await new Files().load('/path/to/dir/**/*.md');

  console.log(files.collect());
})()

// Output:
//
// [
//     {
//         "body": "This is the body of\nthe first file",
//         "metadata": {
//             "file": {
//                 "root": "/",
//                 "dir": "/path/to/dir",
//                 "base": "file1.md",
//                 "ext": ".md",
//                 "name": "file1"
//             },
//             "what is this?": "it's JSON frontmatter",
//         }
//     },
//     {
//         "body": "This is the body of\nthe second file",
//         "metadata": {
//             "file": {
//                 "root": "/",
//                 "dir": "/path/to/dir",
//                 "base": "file2.md",
//                 "ext": ".md",
//                 "name": "file2"
//             },
//             "syke": "now it's YAML",
//         }
//     }
// ]
```

Using `File`:

```js
const { File } = require("nonplain");

(async () => {
  const file = await new File().load('/path/to/file.md');

  console.log(file.getData());
})()

// Output:
//
// {
//     "body": "This is the body of\nthe current file",
//     "metadata": {
//         "file": {
//             "root": "/",
//             "dir": "/path/to/dir",
//             "base": "file.md",
//             "ext": ".md",
//             "name": "file"
//         },
//         "course number": "CS231n",
//         "description": "Convolutional Neural Networks for Visual Recognition",
//         "semester": "Spring 2020"
//     }
// }
```

Notice that the metadata of each file includes a `file` property. This property is included by default to denote the original source file. This property can be changed or removed by transforming the data using `transform()`.

## Transforming nonplain file data

[[link to toc](#contents)]

You may want to transform nonplain file data in place once it's loaded into an instance of `File` or `Files`. That's what the `transform()` method is for.

`transform()` receives a callback argument which is called with the current file data (for `file.transform()`) or iteratively through each loaded file (`files.transform()`). There are two options for this callback argument:

1. Traditional callback function:
    ```js
    files.transform((file) => {
        const { body: oldBody, metadata: oldMetadata } = file;
        
        const newBody = oldBody.replace('this', 'that');
        
        const newMetadata = Object.assign(oldMetadata, {
          newKey: 'My new value for the file called ' + oldMetadata.file.name,
        });
        
        return {
            body: newBody,
            metadata: newMetadata,
        };
    });
    ```
2. Callback map:
    ```js
    files.transform({
        body: (oldBody) => {
            const newBody = oldBody.replace('this', 'that');
            
            return newBody;
        },
        metadata: (oldMetadata) => {
            const newMetadata = Object.assign(oldMetadata, {
              newKey: 'My new value for the file called ' + oldMetadata.file.name,
            });
            
            return newMetadata;
        },
    });
    ```
    
`transform()` works the same way on both `File` and `Files`. The `transform()` method makes these changes "in place", meaning that your instance of `File` or `Files` will reflect the new file data after the transformation.

Possible uses for `transform()` might be converting content from markdown to HTML, calculating and injecting helpful metadata (such as VimWiki backlinks), and more.

## Exporting nonplain file data

[[link to toc](#contents)]

Once file data is transformed to your liking, it needs to be exported and used elsewhere. That's where the `file.write()` and `export2JSON()` methods come in.

### File.prototype.write()

Every instance of `File` has a `write()` method. This is the `File.prototype.write()` API:

```js
file.write(file [, options])
```

- `file`: string, Buffer, URL, or integer file descriptor - Destination where the file will be written. Using a file descriptor behaves similarly to Node.js' `fs.write()` method.
- options:
    - `body` _(default: true)_: boolean - Whether to write the body to the destination file.
    - `metadata` _(default: true)_: boolean - Whether to write the metadata to the destination file.
    - `fmFormat` _(default: 'yaml')_: 'yaml', 'json', or config object - The format to use when writing the destination file's frontmatter.
        - `fmFormat` config object API:
            - `format` _(default: 'yaml')_: 'yaml' or 'json' - The format to use when writing the destination file's frontmatter.
            - `space` _(default: `4`)_: integer - The indentation to use, in spaces.
    - `transform`: function ((file) => newFile) - A callback function to transform file data before stringification.
    - `replace`: function ((content) => newContent) - A callback function to transform file content after stringification and before the new file is written.
    - `encoding` _(default: 'utf8')_: string - The encoding in which to write the destination file. [More on this...](https://nodejs.org/api/fs.html#fs_fs_writefilesync_file_data_options)
    - `mode` _(default: `0o666`)_: integer - The file mode when writing the destination file. [More on this...](https://nodejs.org/api/fs.html#fs_fs_writefilesync_file_data_options)
    - `flag` _(default: 'w')_: string - The flag used when writing the destination file. [More on this...](https://nodejs.org/api/fs.html#fs_fs_writefilesync_file_data_options)

### export2JSON()

Files can also be exported to JSON using the `export2JSON()` method. The `export2JSON()` method exists on instances of both `File` and `Files`. `file.export2JSON()` will export the current file data to JSON and `files.export2JSON()` will export an array containing all of the currently loaded files' data to JSON. This is the `export2JSON()` API:

```js
files.export2JSON(file [, options])
```

```js
file.export2JSON(file [, options])
```

- `file`: string, Buffer, URL, or integer file descriptor - Destination where the file will be written. Using a file descriptor behaves similarly to Node.js' `fs.write()` method.
- options:
    - `space` _(default: `4`)_: integer - The indentation to use, in spaces.
    - `transform`: function ((file) => newFile) - A callback function to transform file data before stringification.
    - `encoding` _(default: 'utf8')_: string - The encoding in which to write the destination file. [More on this...](https://nodejs.org/api/fs.html#fs_fs_writefilesync_file_data_options)
    - `mode` _(default: `0o666`)_: integer - The file mode when writing the destination file. [More on this...](https://nodejs.org/api/fs.html#fs_fs_writefilesync_file_data_options)
    - `flag` _(default: 'w')_: string - The flag used when writing the destination file. [More on this...](https://nodejs.org/api/fs.html#fs_fs_writefilesync_file_data_options)

## Other useful methods

[[link to toc](#contents)]

### Files.prototype.clear()

Clears all currently loaded files from the `Files` instance.

### Files.prototype.collect()

Returns all currently loaded files as an array of file data:

```js
(async () => {
  const files = await new Files().load('/path/to/dir/**/*.md');

  console.log(files.collect());
})()

// Output:
//
// [
//     {
//         "body": "This is the body of\nthe first file",
//         "metadata": {
//             "file": {
//                 "root": "/",
//                 "dir": "/path/to/dir",
//                 "base": "file1.md",
//                 "ext": ".md",
//                 "name": "file1"
//             },
//             "what is this?": "it's JSON frontmatter",
//         }
//     },
//     {
//         "body": "This is the body of\nthe second file",
//         "metadata": {
//             "file": {
//                 "root": "/",
//                 "dir": "/path/to/dir",
//                 "base": "file2.md",
//                 "ext": ".md",
//                 "name": "file2"
//             },
//             "syke": "now it's yaml",
//         }
//     }
// ]
```

### Files.prototype.map()

```js
files.map(callback(currentValue[, index[, array]]) {
  // return element for newArray, after executing something
}[, thisArg])
```

Returns a new array generated by iteratively calling the given callback function on each element of file data. The same as running [`Array.prototype.map()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) on `files.collect()` (AKA `files.collect().map()`).

### Files.prototype.reduce()

```js
files.reduce(callback( accumulator, currentValue, [, index[, array]] )[, initialValue])
```

Returns a single output generated by iteratively calling the given reducer function on each element of file data. The same as running [`Array.prototype.reduce()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce) on `files.collect()` (AKA `files.collect().reduce()`).

### Files.prototype.collectInstances()

Returns all currently loaded files as an array of `File` instances. Primarily used to iteratively call `File` methods, such as `file.write()`.

### File.prototype.getData()

Returns the currently loaded file data:

```js
(async () => {
  const file = await new File().load('/path/to/file1.md');

  console.log(file.getData());
})()

// Output:
//
// {
//     "body": "This is the body of\nthe current file",
//     "metadata": {
//         "file": {
//             "root": "/",
//             "dir": "/path/to/dir",
//             "base": "file.md",
//             "ext": ".md",
//             "name": "file"
//         },
//         "course number": "CS231n",
//         "description": "Convolutional Neural Networks for Visual Recognition",
//         "semester": "Spring 2020"
//     }
// }
```

## Related work

[[link to toc](#contents)]

Other libraries providing simple, composable tools for working with stuff like VimWiki notes are in the works. Stay tuned for more.

## Contributing

[[link to toc](#contents)]

Nothing is set in stone right now; this concept is very much a work in progress. Please feel free to contact me with suggestions or ideas. Thanks!
