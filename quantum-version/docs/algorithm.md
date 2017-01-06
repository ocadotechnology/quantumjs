# How does version process files?
1. Check if there is a @versionedPage entity at the top level of the page. If not, skip processing this file
2. Get the target versions from the options or from @versionedPage
3. Clone and process the page for each of the target versions.
4. Optionally output the latest version without the filename modification

# How is a single version processed?

## Processing @added, @removed, @updated and @deprecated tags
Not necessarily in this order

1. Remove the @added **tag** where the version doesn't match the @added version
2. Remove the @update **tag** where the version doesn't match the @updated version
3. Remove any @deprecated **tag** for elements also tagged with @deprecated for the current version or an earlier version
4. Remove the @removed **tag** where the version doesn't match the @removed version
5. Remove the @deprecated **tag** when there is also a @removed tag for a version
6. Remove the **elements** tagged with @added where the version is less than the current version
7. Remove the **elements** tagged with @removed where the version is greater than the current version

## Processing @versioned tags
1. Select all @versioned entities. No need to sort
2. Select the highest @version within the @versioned content that is less than or equal to the target version (if one exists)
3. Replace the @versioned tag with the contents of the @version tag found in step 2.

## Processing @versionList tags
1. Select all @versionList tags
2. Replace the contents with the @current version, and a @version for each targetVersion
