[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/intel/intel-carbon-theme/badge)](https://scorecard.dev/viewer/?uri=github.com/intel/intel-carbon-theme)
[![CodeQL](https://github.com/intel/intel-carbon-theme/workflows/CodeQL/badge.svg)](https://github.com/intel/intel-carbon-theme/security/code-scanning)

# Intel® Carbon Theme

Intel® Carbon Theme, Intel's brand theme for IBM Carbon Design System.

## Package installation

Download the dist.zip or code.

## Using spark island theme

Import it to your css bundle (most likely into global `styles.scss`) like
the following:

```scss
@use 'intel-carbon-theme';
```

Use the themes:

```html
<html lang="en" data-theme="tb-g-100"></html>
```

Where `data-theme` could be:

-   `white`: for Intel blue lighter theme
-   `g-10`: for Intel blue light theme
-   `g-90`: for Intel blue dark theme
-   `g-100`: for Intel blue darker theme
-   `tb-white`: for Tiber lighter theme
-   `tb-g-10`: for Tiber light theme
-   `tb-g-100`: for Tiber dark theme

It is also recommended to download `intel-ui-icons`.
