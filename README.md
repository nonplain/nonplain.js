\---<br />
**title:** nonplain<br />
**description:** Plaintext files, with metadata<br />
**long-description:** This is a library for parsing, manipulating, and exporting plaintext files with metadata stored as YAML or JSON frontmatter.<br />
\---<br />

# nonplain

Plaintext files are commonly used for notes, code, and documentation. Plaintext files are nondescript by definition: only their content and their filenames describe them. Jekyll popularized [YAML frontmatter](https://jekyllrb.com/docs/front-matter/) to enrich plaintext files for static site generation. These "nonplain" files have proven useful in other contexts requiring metadata, such as notetaking.

One primary drawback of using frontmatter in plaintext files is that there are few general-purpose tools for parsing and operating on these files' metadata and body content separately. The goal of nonplain is to make plaintext files with metadata easier.

## How it helps

The concept is rather simple: define the difference between metadata and body content and parse the file accordingly.

Once the file is parsed, the metadata and body can be read, transformed, and exported together or separately to accomplish various goals such as:

- analyzing files according to metadata
- compiling relevant files for pagination
- converting files to some other, less plain format
- whatever else you want to do ... the goal is composability

In practice, this means we need to:

- [define what frontmatter is](#what-frontmatter-is)
- [parse nonplain files](#parsing-nonplain-files)
- [transform nonplain file data](#transforming-nonplain-file-data)
- [export nonplain file data](#exporting-nonplain-file-data)

## What frontmatter is

In the future, this may be more customizable. For our purposes, frontmatter is a "fence" of 3 dashes `---` on the first line of the file, followed by valid JSON or YAML beginning on the next line, followed by a final fence of 3 dashes `---` on the line after the last line of JSON or YAML data.

It looks like this:

```
---
{
    "what is this?": "it's called JSON"
}
---

... contents of file ...
```

```
---
syke: now it's YAML
---

... contents of file ...
```

## Parsing nonplain files

To parse a nonplain file, load it using the `Files` class. If you only want to operate on a single file, you can still use the `Files` class or you can use `File` instead.

Using `Files`:

```js
const { Files } = require("nonplain");

const files = Files.load('/path/to/dir/**/*.md'); // you can use a glob or a filepath

console.log(files.collect());

// Output:
//
// [
//     {
//         "body": "This is the body of the\nfirst loaded file",
//         "metadata": {
//             "file": {
//                 "root": "/",
//                 "dir": "/path/to/dir",
//                 "base": "file1.md",
//                 "ext": ".md",
//                 "name": "file1",
//             },
//             "key 1": "value 1",
//             "key 2": "value 2"
//         }
//     },
//     {
//         "body": "This is the body of the\nsecond loaded file",
//         "metadata": {
//             "file": {
//                 "root": "/",
//                 "dir": "/path/to/dir",
//                 "base": "file2.md",
//                 "ext": ".md",
//                 "name": "file2",
//             },
//             "key 1": "value 1",
//             "key 2": "value 2"
//             "key 3": "value 3"
//         }
//     }
// ]
```

Using `File`:

```js
const { File } = require("nonplain");

const file = File.load('/path/to/file1.md');

console.log(file.getData());

// Output:
//
// {
//     "body": "This is the body of the\nfirst loaded file",
//     "metadata": {
//         "file": {
//             "root": "/",
//             "dir": "/path/to/dir",
//             "base": "file1.md",
//             "ext": ".md",
//             "name": "file1",
//         },
//         "key 1": "value 1",
//         "key 2": "value 2"
//     }
// }
```

Notice that the metadata of each file includes a `file` property. This property is included by default to denote the original source file. This property can be changed or removed by transforming the data using `transform()`.

## Transforming nonplain file data

You may want to transform nonplain file data in place once it's loaded into an instance of `File` or `Files`. That's what the `transform()` method is for.

`transform()` receives a callback argument which is called with the current file data (for `File.transform()`) or iteratively through each loaded file (`Files.transform()`). There are two options for this callback argument:

1. Traditional callback function:
    ```js
    files.transform((file) => {
        const { body: oldBody, metadata: oldMetadata } = file;
        
        const newBody = oldBody.replace('this', 'that');
        
        const newMetadata = Object.assign({}, oldMetadata);
        newMetadata.newKey = 'My new value for the file called ' + oldMetadata.file.name;
        
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
            const newMetadata = Object.assign({}, oldMetadata);
            
            newMetadata.newKey = 'My new value for the file called ' + oldMetadata.file.name;
            
            return newMetadata;
        },
    });
    ```
    
`transform()` works the same way on both `File` and `Files`. The `transform()` method makes these changes "in place", meaning that your instance of `File` or `Files` will reflect the new file data after the transformation.

Possible uses for `transform()` might be converting content from markdown to HTML, calculating and injecting helpful metadata (such as VimWiki backlinks), and more.

## Exporting nonplain file data

Once file data is transformed to your liking, it needs to be exported and used elsewhere. That's where the `File.write()` and the `export2JSON()` methods come in.
