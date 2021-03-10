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
- parse nonplain files
- transform nonplain file data
- export nonplain file data

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
