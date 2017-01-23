# Changelog

## Processing @changelogList > @process

1. Select all the tags in the @process section (@info, @added, @updated, @deprecated, @removed, @bugfix)
2. Group the tags by version
3. Duplicate the @deprecated tags until a @removed tag is found for a version
4. For each version build a @changelog from the tags
5. Replace the contents of the @changelogList with the built @changelog sections

## Building a @changelog from tags

1. Convert each tag into a changelog entry (by delegating to the appropriate language to build the header)
2. Optionally group the entries by api
3. Sort into a sensible order
4. Create the @changelog entry
